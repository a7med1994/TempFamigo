// Playful, kid-friendly font styles
export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

// Playful text styles
export const PlayfulText = {
  // Headers - Big and bold
  hero: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    color: '#0C3B2E',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    color: '#0C3B2E',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    color: '#0C3B2E',
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#0C3B2E',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#0C3B2E',
    lineHeight: 20,
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  
  // Labels
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: '#6D9773',
  },
};

// Color palette
export const Colors = {
  primary: '#6D9773',      // Buttons
  text: '#0C3B2E',         // Fonts
  icon: '#BB8A52',         // Icons
  accent: '#FFBA00',       // Stars, highlights
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  background: '#F9FAFB',
};
