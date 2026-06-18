import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useApp } from './src/context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager, View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors, text, bg } from './src/constants/colors';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import './src/i18n';

// Enable RTL layout support at module scope (required before any UI renders)
I18nManager.allowRTL(true);

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('🚨 Navigation Error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: bg.primary }]}>
          <Text style={styles.errorTitle}>⚠️ خطأ في التطبيق</Text>
          <Text style={styles.errorMessage}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Professional Material Design 3 Theme
const getTheme = (isDark: boolean) => {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary[500],
      primaryContainer: colors.primary[100],
      onPrimaryContainer: colors.primary[900],
      secondary: colors.secondary[500],
      secondaryContainer: colors.secondary[100],
      onSecondaryContainer: colors.secondary[900],
      tertiary: colors.neutral[700],
      tertiaryContainer: colors.neutral[200],
      onTertiaryContainer: colors.neutral[900],
      background: isDark ? colors.neutral[900] : colors.background.primary,
      surface: isDark ? colors.neutral[800] : colors.background.primary,
      surfaceVariant: isDark ? colors.neutral[700] : colors.background.secondary,
      surfaceDisabled: isDark ? colors.neutral[700] + '80' : colors.neutral[200] + '80',
      error: colors.error,
      errorContainer: '#fee2e2',
      onErrorContainer: '#991b1b',
      warning: colors.warning,
      warningContainer: '#fef3c7',
      onWarningContainer: '#92400e',
      success: colors.success,
      successContainer: '#dcfce7',
      onSuccessContainer: '#166534',
      info: colors.info,
      infoContainer: '#dbeafe',
      onInfoContainer: '#1e40af',
      outline: colors.border.default,
      outlineVariant: colors.border.light,
      scrim: 'rgba(0, 0, 0, 0.4)',
    },
    fonts: {
      ...baseTheme.fonts,
      regular: {
        fontFamily: 'sans-serif',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '500' as const,
      },
      light: {
        fontFamily: 'sans-serif-light',
        fontWeight: '300' as const,
      },
      thin: {
        fontFamily: 'sans-serif-thin',
        fontWeight: '100' as const,
      },
    },
    roundness: 12,
    animation: {
      scale: 1.0,
    },
  };
};

const AppContent = () => {
  const { isDarkMode } = useApp();

  return (
    <PaperProvider theme={getTheme(isDarkMode)}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: text.primary,
    textAlign: 'center',
  },
});
