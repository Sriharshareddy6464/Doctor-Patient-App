import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="doctor/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
