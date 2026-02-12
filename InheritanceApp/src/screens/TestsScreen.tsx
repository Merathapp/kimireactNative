import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Surface,
  ActivityIndicator,
  Divider,
  Menu
} from 'react-native-paper'; // REMOVED Chip
import { useApp } from '../context/AppContext';
import { testSuite, TestSuiteResults } from '../utils/TestSuite'; // REMOVED TestResult
import { MadhabType, FIQH_DATABASE } from '../constants/FiqhDatabase';

const categories = [
  { key: 'basic', label: 'الحالات الأساسية' },
  { key: 'umariyyah', label: 'العُمَريَّتان' },
  { key: 'awl', label: 'العول' },
  { key: 'radd', label: 'الرد' },
  { key: 'hijab', label: 'الحجب' },
  { key: 'asabaWithGhayr', label: 'عصبة مع الغير' },
  { key: 'musharraka', label: 'المسألة المشتركة' },
  { key: 'akdariyya', label: 'الأكدرية' },
  { key: 'grandfatherWithSiblings', label: 'الجد مع الإخوة' },
  { key: 'complex', label: 'حالات معقدة' },
  { key: 'bloodRelatives', label: 'ذوو الأرحام' }
];

const TestsScreen: React.FC = () => {
  const { addAuditLog } = useApp();
  const [selectedMadhab, setSelectedMadhab] = useState<MadhabType>('shafii');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestSuiteResults | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const runAllTests = async () => {
    setLoading(true);
    const testResults = await testSuite.runAllTests(selectedMadhab);
    setResults(testResults);
    setLoading(false);
    addAuditLog('الاختبارات', testResults.failed === 0 ? 'success' : 'warning',
      `${testResults.passed}/${testResults.total} ناجح (${testResults.coverage}%)`
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // REMOVED unused getStatusColor function

  const getStatusBg = (passed: boolean) => passed ? '#dcfce7' : '#fee2e2';

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          ✅ اختبارات النظام
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          اختبار دقة الحسابات عبر 50+ حالة
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.controls}>
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
                  {FIQH_DATABASE.madhabs[selectedMadhab].name}
                </Button>
              }
            >
              {(Object.keys(FIQH_DATABASE.madhabs) as MadhabType[]).map(madhab => (
                <Menu.Item
                  key={madhab}
                  onPress={() => {
                    setSelectedMadhab(madhab);
                    setMenuVisible(false);
                  }}
                  title={FIQH_DATABASE.madhabs[madhab].name}
                />
              ))}
            </Menu>

            <Button
              mode="contained"
              onPress={runAllTests}
              loading={loading}
              disabled={loading}
              icon="play"
              style={styles.runButton}
            >
              تشغيل الاختبارات
            </Button>
          </View>
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>جاري تشغيل الاختبارات...</Text>
        </View>
      )}

      {results && !loading && (
        <>
          {/* Statistics */}
          <Card style={styles.card}>
            <Card.Title title="إحصائيات الاختبارات" />
            <Card.Content>
              <View style={styles.statsGrid}>
                <Surface style={[styles.statItem, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.statValue, { color: '#16a34a' }]}>
                    {results.passed}
                  </Text>
                  <Text style={styles.statLabel}>ناجحة</Text>
                </Surface>
                <Surface style={[styles.statItem, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.statValue, { color: '#dc2626' }]}>
                    {results.failed}
                  </Text>
                  <Text style={styles.statLabel}>فاشلة</Text>
                </Surface>
                <Surface style={[styles.statItem, { backgroundColor: '#dbeafe' }]}>
                  <Text style={[styles.statValue, { color: '#2563eb' }]}>
                    {results.total}
                  </Text>
                  <Text style={styles.statLabel}>إجمالي</Text>
                </Surface>
                <Surface style={[styles.statItem, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={[styles.statValue, { color: '#7c3aed' }]}>
                    {results.coverage}%
                  </Text>
                  <Text style={styles.statLabel}>التغطية</Text>
                </Surface>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(results.passed / results.total) * 100}%`,
                        backgroundColor: results.failed === 0 ? '#10b981' : '#f59e0b'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {((results.passed / results.total) * 100).toFixed(1)}% نجاح
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Test Results by Category */}
          <Card style={styles.card}>
            <Card.Title title="نتائج الاختبارات حسب الفئة" />
            <Card.Content>
              {categories.map(category => {
                const categoryTests = results.results.filter(r => r.category === category.key);
                if (categoryTests.length === 0) return null;

                const passed = categoryTests.filter(t => t.passed).length;
                const total = categoryTests.length;
                const isExpanded = expandedCategories.includes(category.key);

                return (
                  <View key={category.key}>
                    <Button
                      mode="text"
                      onPress={() => toggleCategory(category.key)}
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      style={styles.categoryButton}
                      labelStyle={styles.categoryButtonLabel}
                    >
                      {category.label}
                      <Text style={[styles.categoryStats, { color: passed === total ? '#16a34a' : '#dc2626' }]}>
                        {' '}({passed}/{total})
                      </Text>
                    </Button>

                    {isExpanded && (
                      <View style={styles.testsList}>
                        {categoryTests.map((test, idx) => (
                          <Surface
                            key={idx}
                            style={[
                              styles.testItem,
                              { backgroundColor: getStatusBg(test.passed) }
                            ]}
                          >
                            <View style={styles.testHeader}>
                              <Text style={styles.testIcon}>
                                {test.passed ? '✅' : '❌'}
                              </Text>
                              <Text style={styles.testName}>{test.name}</Text>
                            </View>
                            {!test.passed && test.discrepancies && (
                              <Text style={styles.testError}>
                                {test.discrepancies.join(' | ')}
                              </Text>
                            )}
                            {!test.passed && test.error && (
                              <Text style={styles.testError}>{test.error}</Text>
                            )}
                          </Surface>
                        ))}
                      </View>
                    )}
                    <Divider style={styles.divider} />
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b'
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  headerSubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4
  },
  card: {
    margin: 12,
    borderRadius: 12
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  madhabButton: {
    flex: 1
  },
  runButton: {
    flex: 1,
    backgroundColor: '#4f46e5'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  statItem: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  progressContainer: {
    marginTop: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748b',
    fontSize: 12
  },
  categoryButton: {
    justifyContent: 'flex-start'
  },
  categoryButtonLabel: {
    fontSize: 14
  },
  categoryStats: {
    fontWeight: 'bold'
  },
  testsList: {
    gap: 8,
    marginVertical: 8
  },
  testItem: {
    padding: 12,
    borderRadius: 8
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  testIcon: {
    fontSize: 16
  },
  testName: {
    flex: 1,
    fontWeight: '500'
  },
  testError: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginRight: 24
  },
  divider: {
    marginVertical: 8
  },
  bottomPadding: {
    height: 40
  }
});

export default TestsScreen;