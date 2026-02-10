import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  DataTable,
  Chip,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { InheritanceEngine } from '../utils/InheritanceEngine';
import { FIQH_DATABASE, MadhabType } from '../constants/FiqhDatabase';

const madhabs: MadhabType[] = ['shafii', 'hanafi', 'maliki', 'hanbali'];

const madhabColors: Record<MadhabType, string> = {
  shafii: '#10b981',
  hanafi: '#ef4444',
  maliki: '#8b5cf6',
  hanbali: '#3b82f6'
};

const CompareScreen: React.FC = () => {
  const { estate, heirs, addAuditLog } = useApp();
  const [results, setResults] = useState<Record<MadhabType, ReturnType<InheritanceEngine['calculate']> | null>>({
    shafii: null,
    hanafi: null,
    maliki: null,
    hanbali: null
  });
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    setLoading(true);
    const newResults: Record<MadhabType, ReturnType<InheritanceEngine['calculate']> | null> = {
      shafii: null,
      hanafi: null,
      maliki: null,
      hanbali: null
    };

    for (const madhab of madhabs) {
      try {
        const engine = new InheritanceEngine(madhab, estate, { ...heirs });
        newResults[madhab] = engine.calculate();
      } catch (e: any) {
        newResults[madhab] = { success: false, errors: [e.message], madhab, madhhabName: madhab };
      }
    }

    setResults(newResults);
    setLoading(false);
    addAuditLog('مقارنة المذاهب', 'success', 'تم إجراء المقارنة');
  };

  // Collect all heirs from all results
  const allHeirs = new Set<string>();
  Object.values(results).forEach(r => {
    if (r?.success && r.shares) {
      r.shares.forEach(s => allHeirs.add(s.key));
    }
  });

  const hasData = estate.total > 0 && Object.values(heirs).some(v => v > 0);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          📊 مقارنة المذاهب الأربعة
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          قارن النتائج بين المذاهب الفقهية
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.infoText}>
            سيتم مقارنة حساب الميراث للبيانات المدخلة في الحاسبة الرئيسية عبر المذاهب الأربعة.
          </Text>

          <Button
            mode="contained"
            onPress={runComparison}
            loading={loading}
            disabled={loading || !hasData}
            icon="compare"
            style={styles.compareButton}
          >
            تشغيل المقارنة
          </Button>

          {!hasData && (
            <Text style={styles.warningText}>
              ⚠️ أدخل بيانات التركة والورثة في الحاسبة أولاً
            </Text>
          )}
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>جاري المقارنة...</Text>
        </View>
      )}

      {results.shafii && !loading && (
        <Card style={styles.card}>
          <Card.Title title="نتائج المقارنة" />
          <Card.Content>
            <ScrollView horizontal>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={styles.heirColumn}>الوارث</DataTable.Title>
                  {madhabs.map(madhab => (
                    <DataTable.Title
                      key={madhab}
                      style={[styles.madhabColumn, { backgroundColor: `${madhabColors[madhab]}15` }]}
                    >
                      <Text style={{ color: madhabColors[madhab], fontWeight: 'bold' }}>
                        {FIQH_DATABASE.madhabs[madhab].icon} {FIQH_DATABASE.madhabs[madhab].name}
                      </Text>
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                {Array.from(allHeirs).map(heirKey => (
                  <DataTable.Row key={heirKey}>
                    <DataTable.Cell style={styles.heirColumn}>
                      {FIQH_DATABASE.heirNames[heirKey] || heirKey}
                    </DataTable.Cell>
                    {madhabs.map(madhab => {
                      const result = results[madhab];
                      const share = result?.success && result.shares
                        ? result.shares.find(s => s.key === heirKey)
                        : null;

                      return (
                        <DataTable.Cell
                          key={madhab}
                          style={[styles.madhabColumn, { backgroundColor: `${madhabColors[madhab]}08` }]}
                        >
                          {share ? (
                            <View>
                              <Text style={styles.fraction}>{share.fraction.toArabic()}</Text>
                              <Text style={styles.amount}>{share.amount.toLocaleString()}</Text>
                            </View>
                          ) : (
                            <Text style={styles.dash}>-</Text>
                          )}
                        </DataTable.Cell>
                      );
                    })}
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              {madhabs.map(madhab => {
                const result = results[madhab];
                if (!result?.success) return null;

                return (
                  <Surface
                    key={madhab}
                    style={[styles.summaryItem, { borderColor: madhabColors[madhab] }]}
                  >
                    <Text style={[styles.summaryTitle, { color: madhabColors[madhab] }]}>
                      {FIQH_DATABASE.madhabs[madhab].name}
                    </Text>
                    {result.awlApplied && (
                      <Chip style={styles.summaryChip} textStyle={{ fontSize: 10 }}>
                        عائلة
                      </Chip>
                    )}
                    {result.raddApplied && (
                      <Chip style={styles.summaryChip} textStyle={{ fontSize: 10 }}>
                        رادّة
                      </Chip>
                    )}
                    {result.bloodRelativesApplied && (
                      <Chip style={styles.summaryChip} textStyle={{ fontSize: 10 }}>
                        ذوو أرحام
                      </Chip>
                    )}
                  </Surface>
                );
              })}
            </View>

            {/* Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>ملاحظات:</Text>
              {madhabs.map(madhab => {
                const result = results[madhab];
                if (!result?.success || !result.madhhabNotes?.length) return null;

                return result.madhhabNotes.map((note, idx) => (
                  <Text key={`${madhab}-${idx}`} style={styles.noteText}>
                    • {note}
                  </Text>
                ));
              })}
            </View>
          </Card.Content>
        </Card>
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
  infoText: {
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center'
  },
  compareButton: {
    backgroundColor: '#4f46e5'
  },
  warningText: {
    color: '#92400e',
    textAlign: 'center',
    marginTop: 12
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b'
  },
  heirColumn: {
    minWidth: 120
  },
  madhabColumn: {
    minWidth: 100,
    justifyContent: 'center'
  },
  fraction: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  amount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  dash: {
    textAlign: 'center',
    color: '#cbd5e1'
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  summaryChip: {
    marginTop: 4,
    backgroundColor: '#fef3c7'
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b'
  },
  noteText: {
    color: '#64748b',
    fontSize: 12,
    marginVertical: 2
  },
  bottomPadding: {
    height: 40
  }
});

export default CompareScreen;
