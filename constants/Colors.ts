/**
 * Complete Design System Colors for Mobile Streaming App
 * Professional color palette with dark theme optimization
 */

// Brand Colors
export const BrandColors = {
  primary: '#7ED321',
  primaryDark: '#6BC01E',
  secondary: '#FF0000',
  accent: '#1877F2',
};

// Background Colors
export const BackgroundColors = {
  primary: '#0f0f23',
  secondary: '#1a1a2e',
  tertiary: '#2a2a3e',
  overlay: 'rgba(0,0,0,0.7)',
  modal: 'rgba(0,0,0,0.9)',
};

// Text Colors
export const TextColors = {
  primary: '#ffffff',
  secondary: '#888888',
  disabled: '#666666',
  accent: '#7ED321',
  error: '#FF0000',
  warning: '#FFA500',
  success: '#00FF00',
};

// Platform Colors
export const PlatformColors = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitch: '#9146FF',
  rtmp: '#7ED321',
  srt: '#7ED321',
};

// Original Colors (for compatibility)
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Animation Configs
export const AnimationConfig = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timing: {
    duration: 300,
    useNativeDriver: true,
  },
  fade: {
    duration: 200,
    useNativeDriver: true,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography System
export const Typography = {
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 10,
    fontWeight: 'normal' as const,
    lineHeight: 14,
  },
};

// Shadow System
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};
