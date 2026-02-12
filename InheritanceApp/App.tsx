import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useApp } from './src/context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, DarkTheme } from 'react-native-paper';
import { I18nManager, View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Custom theme with proper typography
const getTheme = (isDark: boolean) => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
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
    colors: {
      ...baseTheme.colors,
      primary: '#4f46e5',
      accent: '#818cf8',
    },
  };
};

// Error Fallback Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>⚠️ خطأ في التطبيق</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <Text style={styles.errorStack}>{error.stack}</Text>
  </View>
);

const AppContent = () => {
  const { isDarkMode, language } = useApp();
  
  // Force RTL for Arabic
  I18nManager.allowRTL(language === 'ar');
  I18nManager.forceRTL(language === 'ar');

  try {
    return (
      <PaperProvider theme={getTheme(isDarkMode)}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    );
  } catch (error) {
    console.error('🚨 Navigation Error:', error);
    return <ErrorFallback error={error as Error} />;
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
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
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorStack: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
});