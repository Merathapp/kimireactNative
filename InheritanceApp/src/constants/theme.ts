// ============================================
// PROFESSIONAL TYPOGRAPHY SYSTEM
// Google Play Material Design 3 compliant
// Android System Fonts - No custom fonts needed
// ============================================

export const fonts = {
  // Android native fonts - 100% Play Store compliant
  regular: {
    fontFamily: 'sans-serif',
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: 'sans-serif-medium',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'sans-serif',
    fontWeight: '700' as const,
  },
  light: {
    fontFamily: 'sans-serif-light',
    fontWeight: '300' as const,
  },
  // iOS/Web fallback
  fallback: {
    fontFamily: 'System',
  },
};

// Material Design 3 Typography Scale
export const typography = {
  // Display (Large headers)
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    ...fonts.bold,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    ...fonts.bold,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    ...fonts.bold,
  },

  // Headlines
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    ...fonts.bold,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    ...fonts.bold,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    ...fonts.bold,
  },

  // Titles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    ...fonts.medium,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    ...fonts.medium,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    ...fonts.medium,
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    ...fonts.regular,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    ...fonts.regular,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    ...fonts.regular,
  },

  // Labels (buttons, chips)
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    ...fonts.medium,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    ...fonts.medium,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    ...fonts.medium,
  },
};

// App-specific semantic typography
export const appTypography = {
  // Original semantic names (KEEP ALL OF THESE)
  screenTitle: typography.headlineMedium,
  sectionTitle: typography.titleLarge,
  cardTitle: typography.titleMedium,
  cardSubtitle: typography.bodyMedium,
  heirName: typography.bodyLarge,
  shareValue: typography.headlineSmall,
  shareFraction: typography.bodyLarge,
  buttonText: typography.labelLarge,
  helperText: typography.bodySmall,
  errorText: {
    ...typography.bodySmall,
    color: '#B00020',
  },
  
  // ===== ADDED ALIASES FOR DIRECT STYLE ACCESS =====
  // These match what components are trying to use
  headlineMedium: typography.headlineMedium,
  bodyMedium: typography.bodyMedium,
  titleLarge: typography.titleLarge,
  titleMedium: typography.titleMedium,
  bodyLarge: typography.bodyLarge,
  labelLarge: typography.labelLarge,
  bodySmall: typography.bodySmall,
};

export default {
  fonts,
  typography,
  appTypography,
};