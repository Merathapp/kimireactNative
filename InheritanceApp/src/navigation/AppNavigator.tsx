import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import MainTabNavigator from './MainTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import { colors } from '../constants/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { language } = useApp();
  const isRTL = language === 'ar';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.neutral[800],
          elevation: 4,
          shadowColor: colors.shadow.md,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontFamily: 'sans-serif-medium',
          fontSize: 18,
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
        headerTitleAlign: isRTL ? 'right' : 'left',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          title: isRTL ? 'نتائج الحساب' : 'Results',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
