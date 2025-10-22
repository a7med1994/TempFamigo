import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { loadUser } from '../store/useStore';
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }} 
        />
        <Stack.Screen 
          name="venue/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Venue Details',
            headerStyle: {
              backgroundColor: '#0C3B2E',
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
            headerShown: true, 
            title: 'Event Details',
            headerStyle: {
              backgroundColor: '#0C3B2E',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }} 
        />
        <Stack.Screen 
          name="create-event" 
          options={{ 
            headerShown: true, 
            title: 'Create Event',
            headerStyle: {
              backgroundColor: '#0C3B2E',
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
            headerShown: true, 
            title: 'Near Me',
            headerStyle: {
              backgroundColor: '#0C3B2E',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}