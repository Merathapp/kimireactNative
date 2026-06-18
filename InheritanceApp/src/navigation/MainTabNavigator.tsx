import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { fonts } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CalculatorScreen from '../screens/CalculatorScreen';
import ResultsScreen from '../screens/ResultsScreen';
import RulesScreen from '../screens/RulesScreen';
import CompareScreen from '../screens/CompareScreen';
import AuditScreen from '../screens/AuditScreen';
import TestsScreen from '../screens/TestsScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type RootTabParamList = {
  Calculator: undefined;
  Results: undefined;
  Rules: undefined;
  Compare: undefined;
  History: undefined;
  Audit: undefined;
  Tests: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
      case 'History':
        return focused ? 'time' : 'time-outline';
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
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
          elevation: 8,
          shadowColor: colors.shadow.md,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          ...fonts.medium,
          fontSize: 11,
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Calculator" 
        component={CalculatorScreen} 
        options={{ 
          tabBarLabel: t('navCalculator'),
          tabBarAccessibilityLabel: t('navCalculatorA11y')
        }}
      />
      <Tab.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          tabBarLabel: t('navResults'),
          tabBarAccessibilityLabel: t('navResultsA11y')
        }}
      />
      <Tab.Screen 
        name="Rules" 
        component={RulesScreen} 
        options={{ 
          tabBarLabel: t('navRules'),
          tabBarAccessibilityLabel: t('navRulesA11y')
        }}
      />
      <Tab.Screen 
        name="Compare" 
        component={CompareScreen} 
        options={{ 
          tabBarLabel: t('navCompare'),
          tabBarAccessibilityLabel: t('navCompareA11y')
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          tabBarLabel: t('navHistory'),
          tabBarAccessibilityLabel: t('navHistoryA11y')
        }}
      />
      <Tab.Screen 
        name="Audit" 
        component={AuditScreen} 
        options={{ 
          tabBarLabel: t('navAudit'),
          tabBarAccessibilityLabel: t('navAuditA11y')
        }}
      />
      <Tab.Screen 
        name="Tests" 
        component={TestsScreen} 
        options={{ 
          tabBarLabel: t('navTests'),
          tabBarAccessibilityLabel: t('navTestsA11y')
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
