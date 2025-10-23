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

interface Favorite {
  id: string;
  item_id: string;
  item_type: string;
  item_data: any;
  created_at: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  favorites: Favorite[];
  setFavorites: (favorites: Favorite[]) => void;
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('famigo_user', JSON.stringify(user));
  },
  clearUser: () => {
    set({ user: null });
    AsyncStorage.removeItem('famigo_user');
  },
  favorites: [],
  setFavorites: (favorites) => {
    set({ favorites });
    AsyncStorage.setItem('famigo_favorites', JSON.stringify(favorites));
  },
  addFavorite: (favorite) => {
    const newFavorites = [...get().favorites, favorite];
    set({ favorites: newFavorites });
    AsyncStorage.setItem('famigo_favorites', JSON.stringify(newFavorites));
  },
  removeFavorite: (itemId) => {
    const newFavorites = get().favorites.filter(f => f.item_id !== itemId);
    set({ favorites: newFavorites });
    AsyncStorage.setItem('famigo_favorites', JSON.stringify(newFavorites));
  },
  isFavorite: (itemId) => {
    return get().favorites.some(f => f.item_id === itemId);
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