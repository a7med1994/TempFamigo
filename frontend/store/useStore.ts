import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;  // base64 image
  bio?: string;
  kidsAges: number[];
  location: {
    city: string;
    coordinates: { lat: number; lng: number };
  };
}

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('famigo_user', JSON.stringify(user));
  },
  clearUser: () => {
    set({ user: null });
    AsyncStorage.removeItem('famigo_user');
  },
}));

// Load user on app start
export const loadUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('famigo_user');
    if (userData) {
      const user = JSON.parse(userData);
      useStore.getState().setUser(user);
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
};