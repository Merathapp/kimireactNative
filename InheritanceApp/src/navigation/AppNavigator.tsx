import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import MainTabNavigator from './MainTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { language } = useApp();
  const isRTL = language === 'ar';
  const navigation = useNavigation<any>();

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
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          headerShown: true,
          title: isRTL ? 'حاسبة المواريث الإسلامية' : 'Islamic Inheritance Calculator',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: isRTL ? 'نتائج الحساب' : 'Results',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: isRTL ? 'الإعدادات' : 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
