// TOTSU Brand Theme - Parents made for families

export const Colors = {
  primary: '#1D4B5A',           // Dark Teal/Blue (TOTSU brand color)
  secondary: '#F5D04E',         // Bright Yellow/Gold (TOTSU accent)
  accent1: '#FF6B6B',           // Coral red for highlights
  accent2: '#4ECDC4',           // Light teal for success
  textDark: '#222222',          // Almost Black
  textMedium: '#484848',        // Dark Gray
  textLight: '#717171',         // Medium Gray
  background: '#F7F7F7',        // Light Gray Background
  backgroundCard: '#FFFFFF',    // Pure White Cards
  border: '#DDDDDD',            // Light Border
  success: '#4ECDC4',           // Light Teal
  error: '#FF6B6B',             // Coral Red
  warning: '#F5D04E',           // Yellow
  overlay: 'rgba(29, 75, 90, 0.6)',
  reactionBg: 'rgba(255, 255, 255, 0.98)',
  loadingBg: '#244863',         // Loading screen background
  loadingDot: '#F5D04E',        // Loading dots yellow
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textDark,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textDark,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textDark,
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textDark,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textDark,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textLight,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.backgroundCard,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Reaction types for Facebook-style reactions
export const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like', color: '#4ECDC4' },
  { id: 'love', emoji: '❤️', label: 'Love', color: '#FF6B6B' },
  { id: 'haha', emoji: '😂', label: 'Haha', color: '#F5D04E' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: '#4ECDC4' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#717171' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#FF6B6B' },
];

// Search Animation Phrases
export const SEARCH_PHRASES = [
  'Are you looking for Zoos?',
  'Are you looking for Playdates?',
  'Are you looking for Playgrounds?',
  'Are you looking for Childcare?',
  'Are you looking for Activities?',
];