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
    } else {
      switch (user.role) {
        case 'DOCTOR':
          router.replace('/(doctor)/(tabs)/dashboard');
          break;
        case 'ADMIN':
          router.replace('/(admin)/(tabs)/dashboard');
          break;
        case 'PATIENT':
        default:
          router.replace('/(patient)/(tabs)/home');
          break;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingScreen message="Starting Docco360..." />;
}
