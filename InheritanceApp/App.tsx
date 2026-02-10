import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';

// Screens
import CalculatorScreen from './src/screens/CalculatorScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import CompareScreen from './src/screens/CompareScreen';
import TestsScreen from './src/screens/TestsScreen';
import RulesScreen from './src/screens/RulesScreen';
import AuditScreen from './src/screens/AuditScreen';

// Theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4f46e5',
    accent: '#10b981',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    placeholder: '#94a3b8',
    disabled: '#cbd5e1'
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Cairo-Regular',
      fontWeight: 'normal'
    },
    medium: {
      fontFamily: 'Cairo-SemiBold',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'Cairo-Bold',
      fontWeight: '700'
    }
  }
};

// Tab Navigator
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <AppProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#4f46e5',
              tabBarInactiveTintColor: '#64748b',
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#e2e8f0',
                paddingBottom: 8,
                paddingTop: 8,
                height: 64
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500'
              }
            }}
          >
            <Tab.Screen
              name="Calculator"
              component={CalculatorScreen}
              options={{
                tabBarLabel: 'الحاسبة',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="calculator" color={color} size={size} />
                )
              }}
            />
            <Tab.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                tabBarLabel: 'النتائج',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="file-document" color={color} size={size} />
                )
              }}
            />
            <Tab.Screen
              name="Compare"
              component={CompareScreen}
              options={{
                tabBarLabel: 'مقارنة',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="compare" color={color} size={size} />
                )
              }}
            />
            <Tab.Screen
              name="Tests"
              component={TestsScreen}
              options={{
                tabBarLabel: 'اختبارات',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="check-circle" color={color} size={size} />
                )
              }}
            />
            <Tab.Screen
              name="Rules"
              component={RulesScreen}
              options={{
                tabBarLabel: 'قواعد',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="book-open" color={color} size={size} />
                )
              }}
            />
            <Tab.Screen
              name="Audit"
              component={AuditScreen}
              options={{
                tabBarLabel: 'السجل',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="clipboard-text" color={color} size={size} />
                )
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" backgroundColor="#1e293b" />
      </PaperProvider>
    </AppProvider>
  );
};

export default App;
