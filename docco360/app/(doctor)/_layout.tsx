import { Stack } from 'expo-router';

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="submit-details" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="verification-pending" options={{ animation: 'fade' }} />
      <Stack.Screen name="contact-admin" options={{ animation: 'fade' }} />
      <Stack.Screen name="appointment/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
