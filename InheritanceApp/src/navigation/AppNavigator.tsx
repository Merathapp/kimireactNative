import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import MainTabNavigator from './MainTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ScenariosScreen from '../screens/ScenariosScreen';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: undefined;
  Settings: undefined;
  Scenarios: undefined;
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Scenarios')}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="folder-outline" size={22} color={colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={{ marginRight: 16 }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.text.inverse} />
              </TouchableOpacity>
            </View>
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
      <Stack.Screen
        name="Scenarios"
        component={ScenariosScreen}
        options={{
          title: isRTL ? 'السيناريوهات' : 'Scenarios',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
