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
import { useApp } from '../context/AppContext';
import { InheritanceEngine } from '../utils/InheritanceEngine';
import { validateAll } from '../utils/Validation';
import { getMadhabConfig } from '../constants/FiqhDatabase';
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
  const navigation = useNavigation();
  const {
    currentMadhab,
    setCurrentMadhab,
    estate,
    updateEstateField,
    heirs,
    updateHeir,
    resetHeirs,
    setLastResult,
    addAuditLog
  } = useApp();

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['الأزواج', 'الأصول (الآباء والأجداد)']);
  const [menuVisible, setMenuVisible] = useState(false);

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
      Alert.alert('أخطاء في البيانات', validation.errors.join('\n'));
      addAuditLog('حساب الميراث', 'error', validation.errors.join(', '));
      return;
    }

    if (validation.warnings.length > 0) {
      Alert.alert('تحذيرات', validation.warnings.join('\n') + '\n\nسيتم المتابعة مع التصحيح التلقائي.');
    }

    try {
      const engine = new InheritanceEngine(currentMadhab, estate, heirs);
      const result = engine.calculate();

      if (result.success) {
        setLastResult(result);
        addAuditLog('حساب الميراث', 'success',
          `تم الحساب بنجاح - التركة: ${estate.total.toLocaleString('en-US')} - المذهب: ${result.madhhabName}`
        );
        navigation.navigate('Results' as never);
      } else {
        Alert.alert('خطأ في الحساب', result.errors?.join('\n') || 'حدث خطأ غير معروف');
        addAuditLog('حساب الميراث', 'error', result.errors?.join(', ') || 'خطأ غير معروف');
      }
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
      addAuditLog('حساب الميراث', 'error', error.message);
    }
  }, [estate, heirs, currentMadhab, navigation, setLastResult, addAuditLog]);

  const handleValidate = useCallback(() => {
    const validation = validateAll(estate, heirs);

    if (validation.isValid && validation.warnings.length === 0) {
      Alert.alert('✅ التحقق', 'جميع البيانات صحيحة!');
      addAuditLog('التحقق', 'success', 'البيانات صحيحة');
    } else if (validation.isValid) {
      Alert.alert('⚠️ تحذيرات', validation.warnings.join('\n') + '\n\nيمكنك المتابعة مع التصحيح التلقائي.');
      addAuditLog('التحقق', 'warning', validation.warnings.join(', '));
    } else {
      Alert.alert('❌ أخطاء', validation.errors.join('\n'));
      addAuditLog('التحقق', 'error', validation.errors.join(', '));
    }
  }, [estate, heirs, addAuditLog]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'إعادة تعيين',
      'هل أنت متأكد من إعادة تعيين جميع البيانات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
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
    addAuditLog('اختبار سريع', 'info', 'تم تحميل حالة اختبار');
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
            ⚖️ حاسبة المواريث
          </Text>
          <Text style={[appTypography.bodyMedium, styles.headerSubtitle]}>
            النظام الاحترافي المتكامل - الإصدار 5.0
          </Text>
        </Surface>

        {/* Madhab Selection - UPDATED WITH DROPDOWN */}
        <Card style={styles.card}>
          <Card.Title
            title="المذهب الفقهي"
            subtitle="اختر المذهب المناسب"
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
                {madhabConfig.icon} المذهب {madhabConfig.name}
              </Text>
              <Text style={[appTypography.bodyMedium, styles.madhabInfoDesc]}>
                {madhabConfig.description}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Estate Data */}
        <Card style={styles.card}>
          <Card.Title
            title="بيانات التركة والخصومات"
            subtitle="أدخل قيمة التركة والخصومات"
            left={props => <Text {...props} style={styles.cardIcon}>💰</Text>}
            titleStyle={appTypography.titleLarge}
            subtitleStyle={appTypography.bodyMedium}
          />
          <Card.Content>
            <TextInput
              label="إجمالي التركة *"
              value={estate.total.toString()}
              onChangeText={text => updateEstateField('total', parseFloat(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="ر.س" />}
            />
            <HelperText type="info" style={appTypography.bodySmall}>قيمة جميع الممتلكات</HelperText>

            <View style={styles.rowInputs}>
              <TextInput
                label="تكاليف التجهيز"
                value={estate.funeral.toString()}
                onChangeText={text => updateEstateField('funeral', parseFloat(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.flex1]}
              />
              <TextInput
                label="الديون المستحقة"
                value={estate.debts.toString()}
                onChangeText={text => updateEstateField('debts', parseFloat(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.flex1]}
              />
            </View>

            <TextInput
              label="الوصية الشرعية"
              value={estate.will.toString()}
              onChangeText={text => updateEstateField('will', parseFloat(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="≤ ⅓" />}
            />
            <HelperText type="info" style={appTypography.bodySmall}>≤ ثلث الباقي</HelperText>

            <Surface style={styles.notice}>
              <Text style={[appTypography.bodySmall, styles.noticeText]}>
                ⚠️ ترتيب الحقوق الشرعي: ١. تكاليف التجهيز ← ٢. سداد الديون ← ٣. الوصية (≤ ⅓) ← ٤. الإرث
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Quick Preview */}
        <QuickPreview estate={estate} heirs={heirs} madhabName={madhabConfig.name} />

        {/* Heirs Section */}
        <Card style={styles.card}>
          <Card.Title
            title="تحديد الورثة"
            subtitle="أدخل عدد الورثة في كل فئة"
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
                  حالات اختبار سريعة
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
            {heirCategories.map(category => (
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
                    {category.heirs.map(heir => (
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
            ))}
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
          >
            احسب المواريث
          </Button>

          <View style={styles.secondaryButtons}>
            <Button
              mode="outlined"
              onPress={handleValidate}
              icon="check-circle"
              style={[styles.button, styles.secondaryButton]}
              labelStyle={appTypography.labelLarge}
            >
              تحقق
            </Button>
            <Button
              mode="outlined"
              onPress={handleReset}
              icon="refresh"
              style={[styles.button, styles.secondaryButton]}
              textColor="#ef4444"
              labelStyle={appTypography.labelLarge}
            >
              إعادة
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
  }
});

export default CalculatorScreen;