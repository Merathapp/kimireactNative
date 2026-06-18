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
import { useApp } from '../context/AppContext';
import { FIQH_DATABASE, MadhabType } from '../constants/FiqhDatabase';
import { colors } from '../constants/colors';
import { useState } from 'react';

const SettingsScreen: React.FC = () => {
  const {
    isDarkMode,
    toggleTheme,
    language,
    setLanguage,
    currentMadhab,
    setCurrentMadhab,
    resetHeirs,
  } = useApp();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleReset = () => {
    Alert.alert(
      language === 'ar' ? 'إعادة تعيين' : 'Reset',
      language === 'ar'
        ? 'هل أنت متأكد من إعادة تعيين جميع البيانات؟'
        : 'Are you sure you want to reset all data?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'تأكيد' : 'Confirm',
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
          {language === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings'}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {language === 'ar' ? 'تخصيص التطبيق حسب تفضيلاتك' : 'Customize your app preferences'}
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Title
          title={language === 'ar' ? 'المظهر' : 'Appearance'}
          left={(props) => <Text {...props}>🎨</Text>}
        />
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="titleMedium">
                {language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
              </Text>
              <Text variant="bodySmall" style={styles.settingDesc}>
                {language === 'ar'
                  ? 'تبديل بين الوضع الفاتح والداكن'
                  : 'Toggle between light and dark mode'}
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
          title={language === 'ar' ? 'اللغة' : 'Language'}
          left={(props) => <Text {...props}>🌐</Text>}
        />
        <Card.Content>
          <SegmentedButtons
            value={language}
            onValueChange={(value) => setLanguage(value as 'ar' | 'en')}
            buttons={[
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={language === 'ar' ? 'المذهب الافتراضي' : 'Default Madhab'}
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
            {language === 'ar'
              ? 'المذهب المستخدم افتراضياً في الحاسبة'
              : 'Default school of jurisprudence used in the calculator'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={language === 'ar' ? 'البيانات' : 'Data'}
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
            {language === 'ar' ? 'إعادة تعيين جميع البيانات' : 'Reset All Data'}
          </Button>
          <Text variant="bodySmall" style={styles.settingDesc}>
            {language === 'ar'
              ? 'مسح جميع البيانات المدخلة وإعادة التعيين إلى القيم الافتراضية'
              : 'Clear all entered data and reset to default values'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={language === 'ar' ? 'حول التطبيق' : 'About'}
          left={(props) => <Text {...props}>ℹ️</Text>}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            {language === 'ar' ? 'حاسبة المواريث الإسلامية' : 'Islamic Inheritance Calculator'}
          </Text>
          <Text variant="bodySmall" style={styles.settingDesc}>
            {language === 'ar' ? 'الإصدار 5.0.0' : 'Version 5.0.0'}
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
