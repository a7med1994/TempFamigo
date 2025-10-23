// Rearranged Color Palette - Better Visual Hierarchy

export const Colors = {
  primary: '#E97C6F',           // Coral - Main accent (was secondary)
  secondary: '#2E7D6F',         // Deep Teal - Secondary actions
  accent1: '#CBA53A',           // Mustard Yellow - highlights, stars
  accent2: '#E2A8A6',           // Dusty Rose - favorites, love
  textDark: '#2E7D6F',          // Deep Teal for headings
  textMedium: '#6B7280',        // Medium gray
  textLight: '#A6B9C2',         // Muted Blue-Gray
  background: '#EDE9E3',        // Off-White - main background
  backgroundCard: '#FFFFFF',    // Pure white for cards
  supporting: '#B6A3D1',        // Lavender - tags, chips
  border: '#D1D5DB',            // Light border
  error: '#E97C6F',             // Coral for errors
  success: '#2E7D6F',           // Teal for success
  overlay: 'rgba(46, 125, 111, 0.5)',
  reactionBg: 'rgba(255, 255, 255, 0.95)',
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
    color: Colors.background,
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Reaction types for Facebook-style reactions
export const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like', color: '#2E7D6F' },
  { id: 'love', emoji: '❤️', label: 'Love', color: '#E2A8A6' },
  { id: 'haha', emoji: '😂', label: 'Haha', color: '#CBA53A' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: '#E97C6F' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#A6B9C2' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#E97C6F' },
];