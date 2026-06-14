import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/(auth)/login');
      return;
    }

    switch (user.role) {
      case 'DOCTOR': {
        const status = user.doctorProfile?.approvalStatus;

        // NEEDS_DETAILS / REJECTED / !status -> submit-details
        if (!status || status === 'NEEDS_DETAILS' || status === 'REJECTED') {
          router.replace('/(doctor)/submit-details' as any);
          return;
        }

        // PENDING -> verification-pending
        if (status === 'PENDING') {
          router.replace('/(doctor)/verification-pending' as any);
          return;
        }

        // APPROVED -> check appointment toggle
        if (status === 'APPROVED') {
          if (!user.doctorProfile?.canTakeAppointments) {
            router.replace('/(doctor)/contact-admin' as any);
            return;
          }
          // Fully unlocked — go to main app
          router.replace('/(doctor)/(tabs)/dashboard');
          return;
        }

        // Fallback
        router.replace('/(doctor)/(tabs)/dashboard');
        break;
      }

      case 'ADMIN':
        router.replace('/(admin)/(tabs)/dashboard');
        break;

      case 'PATIENT':
      default: {
        // Check if patient has filled their health profile
        const hasProfile = !!user.patientProfile?.id;
        if (!hasProfile) {
          router.replace('/(patient)/complete-profile' as any);
        } else {
          router.replace('/(patient)/(tabs)/home');
        }
        break;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingScreen message="Starting Docco360..." />;
}
