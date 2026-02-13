/**
 * Professional Color System
 * Material Design 3 compliant
 * Optimized for Islamic Inheritance Calculator
 */

export const colors = {
  // Primary - Professional Indigo
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#4f46e5', // Primary brand color
    600: '#4338ca',
    700: '#3730a3',
    800: '#312e81',
    900: '#1e1b4b',
  },
  
  // Secondary - Teal (for accents)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Neutral - Professional Gray
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    inverse: '#0f172a',
  },

  // Text
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    tertiary: '#64748b',
    inverse: '#ffffff',
    disabled: '#94a3b8',
  },

  // Border
  border: {
    light: '#e2e8f0',
    default: '#cbd5e1',
    dark: '#94a3b8',
  },

  // Card
  card: {
    background: '#ffffff',
    elevated: '#ffffff',
    pressed: '#f1f5f9',
  },

  // Shadow
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
  },
};

// Madhab-specific colors (using the palette)
export const madhabColors = {
  shafii: colors.primary[500],   // Indigo
  hanafi: colors.error,          // Red
  maliki: colors.secondary[500], // Teal
  hanbali: colors.warning,       // Amber
};

// Export individual color groups
export const bg = colors.background;
export const text = colors.text;
export const border = colors.border;

export default colors;
