import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import CalculatorScreen from '../screens/CalculatorScreen';
import ResultsScreen from '../screens/ResultsScreen';
import RulesScreen from '../screens/RulesScreen';
import CompareScreen from '../screens/CompareScreen';
import AuditScreen from '../screens/AuditScreen';
import TestsScreen from '../screens/TestsScreen';

export type RootStackParamList = {
  Calculator: undefined;
  Results: undefined;
  Rules: undefined;
  Compare: undefined;
  Audit: undefined;
  Tests: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { language } = useApp();
  const isRTL = language === 'ar';

  return (
    <Stack.Navigator
      initialRouteName="Calculator"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'sans-serif-medium',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        headerTitleAlign: isRTL ? 'right' : 'left',
      }}
    >
      <Stack.Screen 
        name="Calculator" 
        component={CalculatorScreen} 
        options={{ 
          title: isRTL ? 'حاسبة المواريث' : 'Inheritance Calculator',
          headerLeft: () => null
        }}
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          title: isRTL ? 'نتائج الحساب' : 'Results'
        }}
      />
      <Stack.Screen 
        name="Rules" 
        component={RulesScreen} 
        options={{ 
          title: isRTL ? 'قواعد المواريث' : 'Rules'
        }}
      />
      <Stack.Screen 
        name="Compare" 
        component={CompareScreen} 
        options={{ 
          title: isRTL ? 'مقارنة المذاهب' : 'Compare Madhabs'
        }}
      />
      <Stack.Screen 
        name="Audit" 
        component={AuditScreen} 
        options={{ 
          title: isRTL ? 'سجل المراجعة' : 'Audit Log'
        }}
      />
      <Stack.Screen 
        name="Tests" 
        component={TestsScreen} 
        options={{ 
          title: isRTL ? 'اختبارات النظام' : 'Test Suite'
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
