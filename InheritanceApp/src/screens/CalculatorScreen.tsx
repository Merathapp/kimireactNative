import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Divider,
  Menu,
  HelperText,
  Surface
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useApp, currencySymbols } from '../context/AppContext';
import { InheritanceEngine } from '../utils/InheritanceEngine';
import { validateAll } from '../utils/Validation';
import { getMadhabConfig } from '../constants/FiqhDatabase';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;
import { HeirInput } from '../components/HeirInput';
import { MadhabDropdown } from '../components/MadhabDropdown';
import { QuickPreview } from '../components/QuickPreview';
import { appTypography } from '../constants/theme';

const heirCategories = [
  {
    title: 'الأزواج',
    icon: 'heart',
    heirs: [
      { key: 'husband', label: 'الزوج', max: 1, description: '½ بدون فرع، ¼ مع فرع' },
      { key: 'wife', label: 'الزوجة', max: 4, description: '¼ بدون فرع، ⅛ مع فرع' }
    ]
  },
  {
    title: 'الأصول (الآباء والأجداد)',
    icon: 'account-supervisor',
    heirs: [
      { key: 'father', label: 'الأب', max: 1, description: '⅙ + تعصيب أو تعصيب فقط' },
      { key: 'mother', label: 'الأم', max: 1, description: '⅙ أو ⅓ أو ثلث الباقي' },
      { key: 'grandfather', label: 'الجد الصحيح', max: 1, description: 'أبو الأب وإن علا' },
      { key: 'grandmother_mother', label: 'الجدة لأم', max: 1, description: '⅙ عند عدم الأم' },
      { key: 'grandmother_father', label: 'الجدة لأب', max: 1, description: '⅙ عند عدم الأم والأب' }
    ]
  },
  {
    title: 'الفروع (الأبناء والأحفاد)',
    icon: 'account-child',
    heirs: [
      { key: 'son', label: 'الابن', max: 50, description: 'عصبة بالنفس' },
      { key: 'daughter', label: 'البنت', max: 50, description: '½ أو ⅔ أو عصبة بالغير' },
      { key: 'grandson', label: 'ابن الابن', max: 50, description: 'عصبة وإن نزل' },
      { key: 'granddaughter', label: 'بنت الابن', max: 50, description: '⅙ تكملة أو ⅔' }
    ]
  },
  {
    title: 'الحواشي (الإخوة والأخوات)',
    icon: 'account-group',
    heirs: [
      { key: 'full_brother', label: 'الأخ الشقيق', max: 50, description: 'عصبة بالنفس' },
      { key: 'full_sister', label: 'الأخت الشقيقة', max: 50, description: '½ أو ⅔ أو عصبة' },
      { key: 'paternal_brother', label: 'الأخ لأب', max: 50, description: 'عصبة' },
      { key: 'paternal_sister', label: 'الأخت لأب', max: 50, description: '⅙ تكملة أو عصبة' },
      { key: 'maternal_brother', label: 'الأخ لأم', max: 50, description: '⅙ أو ⅓ بالتساوي' },
      { key: 'maternal_sister', label: 'الأخت لأم', max: 50, description: '⅙ أو ⅓ بالتساوي' }
    ]
  },
  {
    title: 'أبناء الإخوة والأعمام',
    icon: 'account-network',
    heirs: [
      { key: 'full_nephew', label: 'ابن الأخ الشقيق', max: 50, description: 'عصبة' },
      { key: 'paternal_nephew', label: 'ابن الأخ لأب', max: 50, description: 'عصبة' },
      { key: 'full_uncle', label: 'العم الشقيق', max: 50, description: 'عصبة' },
      { key: 'paternal_uncle', label: 'العم لأب', max: 50, description: 'عصبة' },
      { key: 'full_cousin', label: 'ابن العم الشقيق', max: 50, description: 'عصبة' },
      { key: 'paternal_cousin', label: 'ابن العم لأب', max: 50, description: 'عصبة' }
    ]
  },
  {
    title: 'ذوو الأرحام',
    icon: 'account-heart',
    heirs: [
      { key: 'daughter_son', label: 'ابن البنت', max: 50, description: 'ذو رحم - صنف 1' },
      { key: 'daughter_daughter', label: 'بنت البنت', max: 50, description: 'ذو رحم - صنف 1' },
      { key: 'sister_children', label: 'أولاد الأخت', max: 50, description: 'ذو رحم - صنف 2' },
      { key: 'maternal_uncle', label: 'الخال', max: 50, description: 'ذو رحم - صنف 3' },
      { key: 'maternal_aunt', label: 'الخالة', max: 50, description: 'ذو رحم - صنف 3' },
      { key: 'paternal_aunt', label: 'العمة', max: 50, description: 'ذو رحم - صنف 4' }
    ]
  }
];

// FIXED: Added proper TypeScript type for quickTests
const quickTests: { key: string; label: string; heirs: Record<string, number> }[] = [
  { key: 'basic', label: 'زوج + بنت', heirs: { husband: 1, daughter: 1 } },
  { key: 'awl', label: 'عول: زوج + أختان + أم', heirs: { husband: 1, full_sister: 2, mother: 1 } },
  { key: 'radd', label: 'رد: أم + بنت', heirs: { mother: 1, daughter: 1 } },
  { key: 'umariyyah1', label: 'العمرية الأولى', heirs: { husband: 1, father: 1, mother: 1 } },
  { key: 'umariyyah2', label: 'العمرية الثانية', heirs: { wife: 1, father: 1, mother: 1 } },
  { key: 'musharraka', label: 'المشتركة', heirs: { husband: 1, mother: 1, maternal_brother: 2, full_brother: 1 } },
  { key: 'akdariyya', label: 'الأكدرية', heirs: { husband: 1, mother: 1, grandfather: 1, full_sister: 1 } }
];

const CalculatorScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const {
    currentMadhab,
    setCurrentMadhab,
    estate,
    updateEstateField,
    heirs,
    updateHeir,
    resetHeirs,
    setLastResult,
    addAuditLog,
    deceasedGender,
    setDeceasedGender,
    hasPregnancy,
    setHasPregnancy,
    hasMissingHeir,
    setHasMissingHeir,
    currency
  } = useApp();

  const currencySymbol = currencySymbols[currency];
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['الأزواج', 'الأصول (الآباء والأجداد)']);
  const [menuVisible, setMenuVisible] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleCalculate = useCallback(() => {
    const validation = validateAll(estate, heirs);

    if (!validation.isValid) {
      Alert.alert(t('calculatorAlertDataErrors'), validation.errors.join('\n'));
      addAuditLog(t('auditLogCalculate'), 'error', validation.errors.join(', '));
      return;
    }

    if (validation.warnings.length > 0) {
      Alert.alert(t('calculatorAlertWarnings'), validation.warnings.join('\n') + '\n\n' + t('calculatorContinueNote'));
    }

    setCalculating(true);
    try {
      const engine = new InheritanceEngine(currentMadhab, estate, heirs);
      const result = engine.calculate({ hasPregnancy, hasMissingHeir });

      if (result.success) {
        setLastResult(result);
        addAuditLog(t('auditLogCalculate'), 'success',
          t('auditLogCalculateSuccess', { estate: estate.total.toLocaleString('en-US'), madhab: result.madhhabName })
        );
        navigation.navigate('Results');
      } else {
        Alert.alert(t('calculatorAlertCalcError'), result.errors?.join('\n') || t('calculatorAlertUnknownError'));
        addAuditLog(t('auditLogCalculate'), 'error', result.errors?.join(', ') || t('calculatorAlertUnknownError'));
      }
    } catch (error: any) {
      Alert.alert(t('calculatorAlertError'), error.message);
      addAuditLog(t('auditLogCalculate'), 'error', error.message);
    } finally {
      setCalculating(false);
    }
  }, [estate, heirs, currentMadhab, navigation, setLastResult, addAuditLog]);

  const handleValidate = useCallback(() => {
    const validation = validateAll(estate, heirs);

    if (validation.isValid && validation.warnings.length === 0) {
      Alert.alert(t('calculatorAlertSuccess'), t('calculatorAlertValid'));
      addAuditLog(t('auditLogValidate'), 'success', t('auditLogValidateSuccess'));
    } else if (validation.isValid) {
      Alert.alert(t('calculatorAlertWarnings'), validation.warnings.join('\n') + '\n\n' + t('calculatorAutoCorrectNote'));
      addAuditLog(t('auditLogValidate'), 'warning', validation.warnings.join(', '));
    } else {
      Alert.alert(t('calculatorAlertErrors'), validation.errors.join('\n'));
      addAuditLog(t('auditLogValidate'), 'error', validation.errors.join(', '));
    }
  }, [estate, heirs, addAuditLog]);

  const handleReset = useCallback(() => {
    Alert.alert(
      t('calculatorResetAlertTitle'),
      t('calculatorResetAlertMessage'),
      [
        { text: t('calculatorAlertCancel'), style: 'cancel' },
        {
          text: t('calculatorAlertConfirm'),
          style: 'destructive',
          onPress: () => {
            resetHeirs();
            updateEstateField('total', 100000);
            updateEstateField('funeral', 0);
            updateEstateField('debts', 0);
            updateEstateField('will', 0);
          }
        }
      ]
    );
  }, [resetHeirs, updateEstateField]);

  const loadQuickTest = useCallback((testHeirs: Record<string, number>) => {
    resetHeirs();
    Object.entries(testHeirs).forEach(([key, value]) => {
      updateHeir(key, value);
    });
    addAuditLog(t('auditLogQuickTest'), 'info', t('auditLogQuickTestLoaded'));
  }, [resetHeirs, updateHeir, addAuditLog]);

  const madhabConfig = getMadhabConfig(currentMadhab);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <Text style={[appTypography.headlineMedium, styles.headerTitle]}>
            {t('calculatorTitle')}
          </Text>
          <Text style={[appTypography.bodyMedium, styles.headerSubtitle]}>
            {t('calculatorSubtitle')}
          </Text>
        </Surface>

        {/* Madhab Selection - UPDATED WITH DROPDOWN */}
        <Card style={styles.card}>
          <Card.Title
            title={t('calculatorMadhabCardTitle')}
            subtitle={t('calculatorMadhabCardSubtitle')}
            left={props => <Text {...props} style={styles.cardIcon}>🕌</Text>}
            titleStyle={appTypography.titleLarge}
            subtitleStyle={appTypography.bodyMedium}
          />
          <Card.Content>
            <MadhabDropdown
              selectedMadhab={currentMadhab}
              onSelect={setCurrentMadhab}
            />
            
            <Surface style={[styles.madhabInfo, { backgroundColor: `${madhabConfig.color}15` }]}>
              <Text style={[appTypography.titleMedium, styles.madhabInfoTitle, { color: madhabConfig.color }]}>
                {madhabConfig.icon} {t('calculatorMadhabDisplay', { name: madhabConfig.name })}
              </Text>
              <Text style={[appTypography.bodyMedium, styles.madhabInfoDesc]}>
                {madhabConfig.description}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Deceased Info */}
        <Card style={styles.card}>
          <Card.Title
            title={t('calculatorDeceasedCardTitle')}
            left={props => <Text {...props} style={styles.cardIcon}>👤</Text>}
            titleStyle={appTypography.titleLarge}
          />
          <Card.Content>
            <View style={styles.genderSelector}>
              <Button
                mode={deceasedGender === 'male' ? 'contained' : 'outlined'}
                onPress={() => setDeceasedGender('male')}
                icon="gender-male"
                style={[styles.genderButton, deceasedGender === 'male' && styles.genderSelected]}
                labelStyle={appTypography.labelLarge}
                accessibilityLabel={t('calculatorGenderMaleA11y')}
              >
                {t('calculatorGenderMale')}
              </Button>
              <Button
                mode={deceasedGender === 'female' ? 'contained' : 'outlined'}
                onPress={() => setDeceasedGender('female')}
                icon="gender-female"
                style={[styles.genderButton, deceasedGender === 'female' && styles.genderSelectedFemale]}
                labelStyle={appTypography.labelLarge}
                accessibilityLabel={t('calculatorGenderFemaleA11y')}
              >
                {t('calculatorGenderFemale')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Estate Data */}
        <Card style={styles.card}>
          <Card.Title
            title={t('calculatorEstateCardTitle')}
            subtitle={t('calculatorEstateCardSubtitle')}
            left={props => <Text {...props} style={styles.cardIcon}>💰</Text>}
            titleStyle={appTypography.titleLarge}
            subtitleStyle={appTypography.bodyMedium}
          />
          <Card.Content>
            <TextInput
              label={t('calculatorEstateTotalLabel')}
              value={estate.total.toString()}
              onChangeText={text => updateEstateField('total', parseFloat(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text={currencySymbol} />}
            />
            <HelperText type="info" style={appTypography.bodySmall}>{t('calculatorEstateTotalHelper')}</HelperText>

            <View style={styles.rowInputs}>
              <TextInput
                label={t('calculatorFuneralLabel')}
                value={estate.funeral.toString()}
                onChangeText={text => updateEstateField('funeral', parseFloat(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.flex1]}
              />
              <TextInput
                label={t('calculatorDebtsLabel')}
                value={estate.debts.toString()}
                onChangeText={text => updateEstateField('debts', parseFloat(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.flex1]}
              />
            </View>

            <TextInput
              label={t('calculatorWillLabel')}
              value={estate.will.toString()}
              onChangeText={text => updateEstateField('will', parseFloat(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="≤ ⅓" />}
            />
            <HelperText type="info" style={appTypography.bodySmall}>{t('calculatorWillHelper')}</HelperText>

            <Surface style={styles.notice}>
              <Text style={[appTypography.bodySmall, styles.noticeText]}>
                {t('calculatorNoticeText')}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Special Cases: Pregnancy / Missing Heir */}
        <Card style={styles.card}>
          <Card.Title
            title={t('calculatorSpecialCasesCardTitle')}
            left={props => <Text {...props} style={styles.cardIcon}>⚠️</Text>}
            titleStyle={appTypography.titleLarge}
          />
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={[appTypography.bodyLarge, styles.switchLabel]}>{t('calculatorPregnancyLabel')}</Text>
              <Button
                mode={hasPregnancy ? 'contained' : 'outlined'}
                onPress={() => setHasPregnancy(!hasPregnancy)}
                style={[styles.switchButton, hasPregnancy && { backgroundColor: '#f59e0b' }]}
                labelStyle={appTypography.labelLarge}
              >
                {hasPregnancy ? t('calculatorYes') : t('calculatorNo')}
              </Button>
            </View>
            <View style={styles.switchRow}>
              <Text style={[appTypography.bodyLarge, styles.switchLabel]}>{t('calculatorMissingHeirLabel')}</Text>
              <Button
                mode={hasMissingHeir ? 'contained' : 'outlined'}
                onPress={() => setHasMissingHeir(!hasMissingHeir)}
                style={[styles.switchButton, hasMissingHeir && { backgroundColor: '#f59e0b' }]}
                labelStyle={appTypography.labelLarge}
              >
                {hasMissingHeir ? t('calculatorYes') : t('calculatorNo')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Preview */}
        <QuickPreview estate={estate} heirs={heirs} madhabName={madhabConfig.name} />

        {/* Heirs Section */}
        <Card style={styles.card}>
          <Card.Title
            title={t('calculatorHeirsCardTitle')}
            subtitle={t('calculatorHeirsCardSubtitle')}
            left={props => <Text {...props} style={styles.cardIcon}>👥</Text>}
            titleStyle={appTypography.titleLarge}
            subtitleStyle={appTypography.bodyMedium}
          />
          <Card.Content>
            {/* Quick Tests Menu */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  icon="lightning-bolt"
                  style={styles.quickTestButton}
                  labelStyle={appTypography.labelLarge}
                >
                  {t('calculatorQuickTestsButton')}
                </Button>
              }
            >
              {quickTests.map(test => (
                <Menu.Item
                  key={test.key}
                  onPress={() => {
                    loadQuickTest(test.heirs);
                    setMenuVisible(false);
                  }}
                  title={test.label}
                  titleStyle={appTypography.bodyLarge}
                />
              ))}
            </Menu>

            {/* Heir Categories */}
            {heirCategories.map(category => {
              const isSpouses = category.title === 'الأزواج';
              const filteredHeirs = isSpouses
                ? category.heirs.filter(h =>
                    deceasedGender === 'female' ? h.key === 'husband' : h.key === 'wife'
                  )
                : category.heirs;

              return (
                <View key={category.title} style={styles.categoryContainer}>
                  <Button
                    mode="text"
                    onPress={() => toggleCategory(category.title)}
                    icon={expandedCategories.includes(category.title) ? 'chevron-up' : 'chevron-down'}
                    style={styles.categoryButton}
                    labelStyle={appTypography.bodyLarge}
                  >
                    {category.title}
                  </Button>

                  {expandedCategories.includes(category.title) && (
                    <View style={styles.heirsGrid}>
                      {filteredHeirs.map(heir => (
                        <HeirInput
                          key={heir.key}
                          heirKey={heir.key}
                          label={heir.label}
                          description={heir.description}
                          max={heir.max}
                          value={heirs[heir.key] || 0}
                          onChange={value => updateHeir(heir.key, value)}
                        />
                      ))}
                    </View>
                  )}
                  <Divider style={styles.divider} />
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleCalculate}
            icon="calculator"
            style={[styles.button, styles.calculateButton]}
            labelStyle={[appTypography.labelLarge, styles.buttonLabel]}
            accessibilityLabel={t('calculatorCalculateA11y')}
            loading={calculating}
            disabled={calculating}
          >
            {t('calculatorCalculateButton')}
          </Button>

          <View style={styles.secondaryButtons}>
            <Button
              mode="outlined"
              onPress={handleValidate}
              icon="check-circle"
              style={[styles.button, styles.secondaryButton]}
              labelStyle={appTypography.labelLarge}
              accessibilityLabel={t('calculatorValidateA11y')}
            >
              {t('calculatorValidateButton')}
            </Button>
            <Button
              mode="outlined"
              onPress={handleReset}
              icon="refresh"
              style={[styles.button, styles.secondaryButton]}
              textColor="#ef4444"
              labelStyle={appTypography.labelLarge}
            >
              {t('calculatorResetButton')}
            </Button>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#fff',
    textAlign: 'center'
  },
  headerSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    margin: 12,
    borderRadius: 12
  },
  cardIcon: {
    fontSize: 24
  },
  madhabInfo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12
  },
  madhabInfoTitle: {
    marginBottom: 4
  },
  madhabInfoDesc: {
    color: '#64748b'
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 8
  },
  genderButton: {
    flex: 1,
    borderRadius: 8
  },
  genderSelected: {
    backgroundColor: '#3b82f6'
  },
  genderSelectedFemale: {
    backgroundColor: '#ec4899'
  },
  input: {
    marginVertical: 4,
    backgroundColor: '#fff'
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8
  },
  flex1: {
    flex: 1
  },
  notice: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginTop: 8
  },
  noticeText: {
    color: '#92400e'
  },
  quickTestButton: {
    marginBottom: 12
  },
  categoryContainer: {
    marginVertical: 4
  },
  categoryButton: {
    justifyContent: 'flex-start'
  },
  heirsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8
  },
  divider: {
    marginVertical: 8
  },
  actionButtons: {
    padding: 12,
    gap: 12
  },
  button: {
    borderRadius: 8
  },
  buttonLabel: {
    fontWeight: 'bold'
  },
  calculateButton: {
    paddingVertical: 8,
    backgroundColor: '#4f46e5'
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 8
  },
  secondaryButton: {
    flex: 1
  },
  bottomPadding: {
    height: 40
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },
  switchLabel: {
    flex: 1,
    marginRight: 12
  },
  switchButton: {
    borderRadius: 8,
    minWidth: 80
  }
});

export default CalculatorScreen;