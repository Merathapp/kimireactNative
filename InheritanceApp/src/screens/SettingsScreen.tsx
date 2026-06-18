import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Surface,
  Switch,
  Button,
  Menu,
  SegmentedButtons,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { FIQH_DATABASE, MadhabType } from '../constants/FiqhDatabase';
import { colors } from '../constants/colors';
import { useState } from 'react';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    isDarkMode,
    toggleTheme,
    language,
    setLanguage,
    currentMadhab,
    setCurrentMadhab,
    currency,
    setCurrency,
    resetHeirs,
  } = useApp();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleReset = () => {
    Alert.alert(
      t('settingsResetAlertTitle'),
      t('settingsResetAlertMessage'),
      [
        { text: t('calculatorAlertCancel'), style: 'cancel' },
        {
          text: t('calculatorAlertConfirm'),
          style: 'destructive',
          onPress: resetHeirs,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t('settingsTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {t('settingsSubtitle')}
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsAppearanceCard')}
          left={(props) => <Text {...props}>🎨</Text>}
        />
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="titleMedium">
                {t('settingsDarkMode')}
              </Text>
              <Text variant="bodySmall" style={styles.settingDesc}>
                {t('settingsDarkModeDesc')}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              color={colors.primary[500]}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsLanguageCard')}
          left={(props) => <Text {...props}>🌐</Text>}
        />
        <Card.Content>
          <SegmentedButtons
            value={language}
            onValueChange={(value) => setLanguage(value as 'ar' | 'en')}
            buttons={[
              { value: 'ar', label: t('settingsLanguageArabic') },
              { value: 'en', label: t('settingsLanguageEnglish') },
            ]}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsMadhabCard')}
          left={(props) => <Text {...props}>🕌</Text>}
        />
        <Card.Content>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                icon="mosque"
                style={styles.madhabButton}
              >
                {FIQH_DATABASE.madhabs[currentMadhab].name}
              </Button>
            }
          >
            {(Object.keys(FIQH_DATABASE.madhabs) as MadhabType[]).map((madhab) => (
              <Menu.Item
                key={madhab}
                onPress={() => {
                  setCurrentMadhab(madhab);
                  setMenuVisible(false);
                }}
                title={FIQH_DATABASE.madhabs[madhab].name}
                leadingIcon={FIQH_DATABASE.madhabs[madhab].icon}
              />
            ))}
          </Menu>
          <Text variant="bodySmall" style={styles.settingDesc}>
            {t('settingsMadhabDesc')}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsCurrencyCard')}
          left={(props) => <Text {...props}>💵</Text>}
        />
        <Card.Content>
          <SegmentedButtons
            value={currency}
            onValueChange={(value) => setCurrency(value as 'SAR' | 'USD' | 'EUR')}
            buttons={[
              { value: 'SAR', label: t('settingsCurrencySAR') },
              { value: 'USD', label: t('settingsCurrencyUSD') },
              { value: 'EUR', label: t('settingsCurrencyEUR') },
            ]}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsDataCard')}
          left={(props) => <Text {...props}>💾</Text>}
        />
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleReset}
            icon="delete"
            buttonColor="#dc2626"
            textColor="#fff"
          >
            {t('settingsResetButton')}
          </Button>
          <Text variant="bodySmall" style={styles.settingDesc}>
            {t('settingsResetDesc')}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('settingsAboutCard')}
          left={(props) => <Text {...props}>ℹ️</Text>}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            {t('appName')}
          </Text>
          <Text variant="bodySmall" style={styles.settingDesc}>
            {t('appVersion')}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    margin: 12,
    borderRadius: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingDesc: {
    color: '#64748b',
    marginTop: 4,
  },
  madhabButton: {
    alignSelf: 'flex-start',
  },
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;
