import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { loadUser } from '../store/useStore';
import { DrawerProvider } from '../contexts/DrawerContext';
import { Colors } from '../constants/TotsuTheme';
import TotsuLoadingScreen from '../components/TotsuLoadingScreen';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };
    initialize();
  }, []);

  if (isLoading) {
    return <TotsuLoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="favorites" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
          <Stack.Screen 
            name="bookings" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
          <Stack.Screen 
            name="venue/[id]" 
            options={{ 
              headerShown: true, 
              title: 'Venue Details',
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }} 
          />
          <Stack.Screen 
            name="event/[id]" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="create-event" 
            options={{ 
              headerShown: true, 
              title: 'Create Event',
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }} 
          />
          <Stack.Screen 
            name="map-view" 
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack>
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}