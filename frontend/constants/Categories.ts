import { Ionicons } from '@expo/vector-icons';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'playgrounds', label: 'Playgrounds', icon: 'play' },
  { id: 'softplay', label: 'Soft Play', icon: 'cube' },
  { id: 'animals', label: 'Animals & Nature', icon: 'leaf' },
  { id: 'arts', label: 'Arts & Crafts', icon: 'color-palette' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'birthday', label: 'Birthday Venues', icon: 'gift' },
  { id: 'sports', label: 'Sports', icon: 'football' },
  { id: 'shopping', label: 'Shopping', icon: 'cart' },
  { id: 'creative', label: 'Creative', icon: 'brush' },
  { id: 'community', label: 'Community', icon: 'people' },
  { id: 'childcare', label: 'Childcare & Daycares', icon: 'home' },
];

export const AGE_RANGES = [
  { id: '0-2', label: '0-2 years', min: 0, max: 2 },
  { id: '3-5', label: '3-5 years', min: 3, max: 5 },
  { id: '6-8', label: '6-8 years', min: 6, max: 8 },
  { id: '9-12', label: '9-12 years', min: 9, max: 12 },
  { id: '13+', label: '13+ years', min: 13, max: 18 },
];

export const PRICE_TYPES = [
  { id: 'all', label: 'Any Price' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

export const QUICK_FILTERS = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'weekend', label: 'This weekend', icon: 'calendar' },
  { id: 'free', label: 'Free', icon: 'pricetag-outline' },
  { id: 'indoor', label: 'Indoors', icon: 'home-outline' },
  { id: 'outdoor', label: 'Outdoors', icon: 'sunny-outline' },
];
