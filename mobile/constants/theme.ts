/**
 * CampusTrust AI - Design Tokens
 * Matching the Stitch dark-mode design system
 */

import { Platform } from 'react-native';

// Primary colors from stitch designs
export const COLORS = {
  // Core brand
  primary: '#13c1ec',
  primaryDark: '#0e8cae',
  primaryLight: '#13c1ec20',

  // Backgrounds  
  bgDark: '#101e22',
  surfaceDark: '#182b31',
  surfaceCard: '#1a3038',

  // Text
  textPrimary: '#f0f4f5',
  textSecondary: '#8ca3ad',
  textMuted: '#5a7a85',

  // Borders
  borderDark: '#243c44',
  borderLight: '#2d4d57',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',

  // Module accent colors
  voting: '#13c1ec',
  attendance: '#10B981',
  credentials: '#A855F7',
  compute: '#F472B6',
  research: '#3B82F6',
  governance: '#F97316',
  permissions: '#64748B',
  grants: '#10B981',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// Legacy Colors export for compatibility
export const Colors = {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.bgDark,
    tint: COLORS.primary,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: COLORS.textPrimary,
    background: COLORS.bgDark,
    tint: COLORS.primary,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.primary,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 36,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
