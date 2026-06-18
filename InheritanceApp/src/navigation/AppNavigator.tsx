import { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { LinkingOptions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import MainTabNavigator from './MainTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ScenariosScreen from '../screens/ScenariosScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { colors } from '../constants/colors';
import { fonts } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Results: undefined;
  Calculator: undefined;
  Settings: undefined;
  Scenarios: undefined;
};

type AppNavProp = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['merath://'],
  config: {
    screens: {
      MainTabs: '',
      Results: 'results',
      Calculator: 'calculator',
      Settings: 'settings',
      Scenarios: 'scenarios',
    },
  },
};

const AppNavigator = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AppNavProp>();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem('merath_onboarding_done');
        setIsFirstLaunch(done !== 'true');
      } catch {
        setIsFirstLaunch(false);
      }
    })();
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

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
          ...fonts.medium,
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
      }}
    >
      {isFirstLaunch && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          headerShown: true,
          title: t('appName'),
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
          title: t('resultsTitle'),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settingsTitle'),
        }}
      />
      <Stack.Screen
        name="Scenarios"
        component={ScenariosScreen}
        options={{
          title: t('scenariosTitle'),
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
