import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { loadUser } from '../store/useStore';

export default function RootLayout() {
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="venue/[id]" options={{ headerShown: true, title: 'Venue Details' }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Event Details' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}