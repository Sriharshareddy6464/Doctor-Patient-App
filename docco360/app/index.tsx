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

        // Phase 1: still awaiting basic approval — shouldn't normally happen
        // (login is blocked at this stage) but handle defensively
        if (!status || status === 'PHASE1_PENDING' || status === 'REJECTED') {
          router.replace('/(auth)/pending-approval');
          return;
        }

        // Phase 1 approved — doctor needs to submit professional details
        if (status === 'PHASE1_APPROVED') {
          router.replace('/(doctor)/submit-details' as any);
          return;
        }

        // Phase 2: submitted, waiting for admin verification
        if (status === 'PHASE2_PENDING') {
          router.replace('/(doctor)/verification-pending' as any);
          return;
        }

        // Phase 2 rejected — doctor needs to re-submit
        if (status === 'PHASE2_REJECTED') {
          router.replace('/(doctor)/submit-details' as any);
          return;
        }

        // Phase 2 approved — check Phase 3 appointment toggle
        if (status === 'PHASE2_APPROVED') {
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
