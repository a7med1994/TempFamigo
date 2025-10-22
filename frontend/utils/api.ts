import axios from 'axios';
import Constants from 'expo-constants';

const EXPO_PUBLIC_BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${EXPO_PUBLIC_BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;