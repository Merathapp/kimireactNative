import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import CalculatorScreen from '../screens/CalculatorScreen';
import ResultsScreen from '../screens/ResultsScreen';
import RulesScreen from '../screens/RulesScreen';
import CompareScreen from '../screens/CompareScreen';
import AuditScreen from '../screens/AuditScreen';
import TestsScreen from '../screens/TestsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { language } = useApp();
  const isRTL = language === 'ar';

  const getIconName = (routeName: string, focused: boolean) => {
    switch (routeName) {
      case 'Calculator':
        return focused ? 'calculator' : 'calculator-outline';
      case 'Results':
        return focused ? 'bar-chart' : 'bar-chart-outline';
      case 'Rules':
        return focused ? 'book' : 'book-outline';
      case 'Compare':
        return focused ? 'git-compare' : 'git-compare-outline';
      case 'Audit':
        return focused ? 'document-text' : 'document-text-outline';
      case 'Tests':
        return focused ? 'flask' : 'flask-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getIconName(route.name, focused)}
            size={size}
            color={color}
          />
        ),
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          elevation: 8,
          shadowColor: colors.shadow.md,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          fontFamily: 'sans-serif-medium',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Calculator" 
        component={CalculatorScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'الحاسبة' : 'Calculator',
          tabBarAccessibilityLabel: isRTL ? 'حاسبة المواريث' : 'Inheritance Calculator'
        }}
      />
      <Tab.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'النتائج' : 'Results',
          tabBarAccessibilityLabel: isRTL ? 'نتائج الحساب' : 'Calculation Results'
        }}
      />
      <Tab.Screen 
        name="Rules" 
        component={RulesScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'القواعد' : 'Rules',
          tabBarAccessibilityLabel: isRTL ? 'قواعد المواريث' : 'Inheritance Rules'
        }}
      />
      <Tab.Screen 
        name="Compare" 
        component={CompareScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'مقارنة' : 'Compare',
          tabBarAccessibilityLabel: isRTL ? 'مقارنة المذاهب' : 'Compare Madhabs'
        }}
      />
      <Tab.Screen 
        name="Audit" 
        component={AuditScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'السجل' : 'Audit',
          tabBarAccessibilityLabel: isRTL ? 'سجل المراجعة' : 'Audit Log'
        }}
      />
      <Tab.Screen 
        name="Tests" 
        component={TestsScreen} 
        options={{ 
          tabBarLabel: isRTL ? 'اختبارات' : 'Tests',
          tabBarAccessibilityLabel: isRTL ? 'اختبارات النظام' : 'System Tests'
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
