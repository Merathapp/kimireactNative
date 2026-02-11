import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useApp } from './src/context/AppContext';
import { typography } from './src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, DarkTheme } from 'react-native-paper';
import { I18nManager } from 'react-native';
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

const AppContent = () => {
  const { isDarkMode } = useApp();
  
  // Force RTL for Arabic
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

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
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
