import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="doctor/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="appointment/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
