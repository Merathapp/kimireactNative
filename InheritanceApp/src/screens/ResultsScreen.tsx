import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  DataTable,
  Surface,
  IconButton
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import PieChart from '../components/PieChart';
import { appTypography } from '../constants/theme';
import { HeirShare } from '../utils/HeirShare';
import { BlockedHeir, SpecialCase, CalculationStep } from '../utils/InheritanceEngine';
import * as Clipboard from 'expo-clipboard';
import { writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const screenWidth = Dimensions.get('window').width;

const colors = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { lastResult, addAuditLog } = useApp();

  if (!lastResult || !lastResult.success) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineMedium" style={styles.emptyText}>
          لا توجد نتائج
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          قم بإجراء حساب أولاً
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Calculator' as never)}
          style={styles.emptyButton}
        >
          الذهاب للحاسبة
        </Button>
      </View>
    );
  }

  const {
    madhhabName,
    madhhabIcon,
    estate,
    netEstate,
    finalBase,
    asl,
    awlApplied,
    raddApplied,
    shares,
    specialCases,
    blockedHeirs,
    madhhabNotes,
    warnings,
    steps,
    confidence
  } = lastResult;

  // FIXED: Added proper types
  const chartData = (shares?.map((share: HeirShare, index: number) => ({
    name: share.name,
    amount: share.amount,
    color: colors[index % colors.length],
    legendFontColor: '#64748b',
    legendFontSize: 12
  })) || []);

  const buildResultText = () => {
    let text = `نتائج حساب الميراث - المذهب ${madhhabName}\n`;
    text += `التاريخ: ${new Date().toLocaleDateString('ar-SA')}\n`;
    text += `═══════════════════════════════════\n\n`;
    text += `صافي التركة: ${netEstate?.toLocaleString('en-US')}\n`;
    text += `أصل المسألة: ${finalBase}\n`;
    if (awlApplied) text += `(عالت من ${asl})\n`;
    text += `\nالأنصبة:\n`;

    shares?.forEach((s: HeirShare) => {
      text += `• ${s.name}: ${s.fraction.toString()} = ${s.amount.toLocaleString('en-US')}\n`;
      if (s.count > 1) {
        text += `  (لكل فرد: ${s.amountPerPerson.toLocaleString('en-US')})\n`;
      }
    });

    if (specialCases && specialCases.length > 0) {
      text += `\nحالات خاصة:\n`;
      specialCases.forEach((c: SpecialCase) => {
        text += `• ${c.name}: ${c.description}\n`;
      });
    }
    return text;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: buildResultText(),
        title: 'نتائج حساب الميراث'
      });
      addAuditLog('مشاركة النتائج', 'success', 'تمت مشاركة النتائج');
    } catch {
      addAuditLog('مشاركة النتائج', 'error', 'فشلت المشاركة');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(buildResultText());
      Alert.alert('تم', 'تم نسخ النتائج إلى الحافظة');
      addAuditLog('نسخ النتائج', 'success', 'تم نسخ النتائج');
    } catch {
      addAuditLog('نسخ النتائج', 'error', 'فشل النسخ');
    }
  };

  const handleCsvExport = async () => {
    try {
      let csv = 'الوارث,النوع,العدد,الحصة,المبلغ\n';
      shares?.forEach((s: HeirShare) => {
        csv += `${s.name},${s.type},${s.count},${s.fraction.toDisplay()},${s.amount.toLocaleString('en-US')}\n`;
        if (s.count > 1) {
          csv += `لكل فرد,,${s.fraction.divide(s.count).toDisplay()},${s.amountPerPerson.toLocaleString('en-US')}\n`;
        }
      });

      if (specialCases?.length) {
        csv += '\nحالات خاصة\n';
        specialCases.forEach((c: SpecialCase) => {
          csv += `${c.name},${c.description}\n`;
        });
      }

      const uri = cacheDirectory + 'merath_results.csv';
      await writeAsStringAsync(uri, csv, { encoding: 'utf8' });
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'تصدير CSV' });
      addAuditLog('تصدير CSV', 'success', 'تم تصدير CSV');
    } catch {
      addAuditLog('تصدير CSV', 'error', 'فشل تصدير CSV');
    }
  };

  const handlePrint = async () => {
    try {
      let rows = '';
      shares?.forEach((s: HeirShare) => {
        rows += `<tr><td>${s.name}</td><td>${s.type}</td><td>${s.count}</td><td>${s.fraction.toDisplay()}</td><td>${s.amount.toLocaleString('en-US')}</td></tr>`;
        if (s.count > 1) {
          rows += `<tr class="per-person"><td colspan="2">لكل فرد</td><td></td><td>${s.fraction.divide(s.count).toDisplay()}</td><td>${s.amountPerPerson.toLocaleString('en-US')}</td></tr>`;
        }
      });

      const html = `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
  body { font-family: 'Arial', sans-serif; padding: 20px; color: #1e293b; }
  h1 { text-align: center; color: #1e293b; font-size: 22px; }
  .summary { background: #f8fafc; padding: 12px; border-radius: 8px; margin: 12px 0; display: flex; gap: 16px; flex-wrap: wrap; }
  .summary div { flex: 1; min-width: 120px; text-align: center; }
  .summary .label { font-size: 12px; color: #64748b; }
  .summary .value { font-size: 18px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #1e293b; color: #fff; padding: 10px; text-align: center; }
  td { padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0; }
  .per-person td { color: #64748b; font-style: italic; font-size: 13px; background: #f8fafc; }
  .warning { color: #92400e; background: #fef3c7; padding: 8px; border-radius: 6px; margin: 8px 0; }
  .note { color: #065f46; }
  .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style></head>
<body>
  <h1>نتائج حساب الميراث</h1>
  <p style="text-align:center;color:#64748b;">المذهب: ${madhhabName} | ${new Date().toLocaleDateString('ar-SA')}</p>
  <div class="summary">
    <div><div class="label">صافي التركة</div><div class="value">${netEstate?.toLocaleString('en-US')}</div></div>
    <div><div class="label">أصل المسألة</div><div class="value">${finalBase}${awlApplied ? ` (عالت من ${asl})` : ''}</div></div>
    <div><div class="label">الحالة</div><div class="value">${getStatusText()}</div></div>
  </div>
  <table><thead><tr><th>الوارث</th><th>النوع</th><th>العدد</th><th>الحصة</th><th>المبلغ</th></tr></thead><tbody>${rows}</tbody></table>
  ${specialCases?.length ? specialCases.map((c: SpecialCase) => `<div class="warning"><strong>${c.name}:</strong> ${c.description}</div>`).join('') : ''}
  ${blockedHeirs?.length ? blockedHeirs.map((b: BlockedHeir) => `<div class="warning"><strong>محجوب:</strong> ${b.reason}</div>`).join('') : ''}
  ${madhhabNotes?.length ? madhhabNotes.map((n: string) => `<div class="note">${n}</div>`).join('') : ''}
  <div class="footer">تم الإنشاء بواسطة تطبيق ميراث</div>
</body></html>`;

      await Print.printAsync({ html });
      addAuditLog('طباعة النتائج', 'success', 'تمت الطباعة');
    } catch {
      addAuditLog('طباعة النتائج', 'error', 'فشلت الطباعة');
    }
  };

  const getStatusText = () => {
    if (awlApplied) return 'عائلة';
    if (raddApplied) return 'رادّة';
    return 'عادية';
  };

  const getConfidenceColor = () => {
    if ((confidence || 0) > 0.95) return '#10b981';
    if ((confidence || 0) > 0.90) return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-right"
            iconColor="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            نتائج الحساب
          </Text>
          <IconButton
            icon="share-variant"
            iconColor="#fff"
            onPress={handleShare}
          />
        </View>
        <View style={styles.badgesRow}>
          <Chip style={styles.badge} textStyle={styles.badgeText}>
            {madhhabIcon} {madhhabName}
          </Chip>
          <Chip style={[styles.badge, { backgroundColor: awlApplied ? '#fef3c7' : raddApplied ? '#dbeafe' : '#dcfce7' }]}>
            {getStatusText()}
          </Chip>
          <Chip style={[styles.badge, { backgroundColor: getConfidenceColor() + '20' }]}>
            ثقة {(confidence ? confidence * 100 : 0).toFixed(0)}%
          </Chip>
        </View>
      </Surface>

      {/* Estate Summary */}
      <Card style={styles.card}>
        <Card.Title title="ملخص التركة" />
        <Card.Content>
          <View style={styles.summaryGrid}>
            <Surface style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>إجمالي التركة</Text>
              <Text style={styles.summaryValue}>{estate?.total.toLocaleString('en-US')}</Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#fef2f2' }]}>
              <Text style={styles.summaryLabel}>الخصومات</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
                {((estate?.funeral || 0) + (estate?.debts || 0) + (estate?.will || 0)).toLocaleString('en-US')}
              </Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.summaryLabel}>صافي التركة</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                {netEstate?.toLocaleString('en-US')}
              </Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.summaryLabel}>أصل المسألة</Text>
              <Text style={[styles.summaryValue, { color: '#4f46e5' }]}>
                {finalBase}
                {awlApplied && <Text style={styles.awlText}> (عالت من {asl})</Text>}
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <Card style={[styles.card, { borderColor: '#f59e0b', borderWidth: 1 }]}>
          <Card.Title
            title="⚠️ تحذيرات"
            titleStyle={{ color: '#92400e' }}
          />
          <Card.Content>
            {warnings.map((warning: string, index: number) => (
              <Text key={index} style={styles.warningText}>• {warning}</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Special Cases */}
      {specialCases && specialCases.length > 0 && (
        <Card style={[styles.card, { borderColor: '#3b82f6', borderWidth: 1 }]}>
          <Card.Title
            title="⚡ حالات خاصة"
            titleStyle={{ color: '#1e40af' }}
          />
          <Card.Content>
            {specialCases.map((c: SpecialCase, index: number) => (
              <View key={index} style={styles.specialCase}>
                <Text style={styles.specialCaseName}>{c.name}</Text>
                <Text style={styles.specialCaseDesc}>{c.description}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Madhhab Notes */}
      {madhhabNotes && madhhabNotes.length > 0 && (
        <Card style={[styles.card, { borderColor: '#10b981', borderWidth: 1 }]}>
          <Card.Title
            title="📚 ملاحظات مذهبية"
            titleStyle={{ color: '#065f46' }}
          />
          <Card.Content>
            {madhhabNotes.map((note: string, index: number) => (
              <Text key={index} style={styles.noteText}>• {note}</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Blocked Heirs */}
      {blockedHeirs && blockedHeirs.length > 0 && (
        <Card style={[styles.card, { borderColor: '#ef4444', borderWidth: 1 }]}>
          <Card.Title
            title="🚫 الورثة المحجوبون"
            titleStyle={{ color: '#991b1b' }}
          />
          <Card.Content>
            <View style={styles.blockedChips}>
              {blockedHeirs.map((b: BlockedHeir, index: number) => (
                <Chip
                  key={index}
                  style={styles.blockedChip}
                  textStyle={styles.blockedChipText}
                >
                  {b.reason}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="📊 التوزيع المرئي" />
          <Card.Content>
            <PieChart
              data={chartData}
              width={screenWidth - 48}
              height={200}
              accessor="amount"
            />
            <View style={styles.legend}>
              {shares?.map((share: HeirShare, index: number) => (
                <View key={share.key} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
                  <Text style={styles.legendText}>
                    {share.name}: {(share.fraction.toDecimal() * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Results Table */}
      <Card style={styles.card}>
        <Card.Title title="جدول التوزيع" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>الوارث</DataTable.Title>
              <DataTable.Title numeric>العدد</DataTable.Title>
              <DataTable.Title numeric>الحصة</DataTable.Title>
              <DataTable.Title numeric>المبلغ</DataTable.Title>
            </DataTable.Header>

            {shares?.flatMap((share: HeirShare) => {
              const rows = [
                <DataTable.Row key={share.key}>
                  <DataTable.Cell>
                    <View>
                      <Text style={styles.heirName}>{share.name}</Text>
                      <Text style={styles.heirType}>{share.type}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{share.count}</DataTable.Cell>
                  <DataTable.Cell numeric>{share.fraction.toDisplay()}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.amount}>{share.amount.toLocaleString('en-US')}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ];
              if (share.count > 1) {
                rows.push(
                  <DataTable.Row key={share.key + '_per'} style={styles.perPersonRow}>
                    <DataTable.Cell>
                      <Text style={styles.perPersonLabel}>لكل فرد</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{''}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.perPersonFraction}>
                        {share.fraction.divide(share.count).toDisplay()}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.perPersonAmount}>
                        {share.amountPerPerson.toLocaleString('en-US')}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              }
              return rows;
            })}
          </DataTable>
        </Card.Content>
      </Card>

      {/* Calculation Steps */}
      {steps && steps.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="📝 خطوات الحساب" />
          <Card.Content>
            {steps.map((step: CalculationStep, index: number) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.card}>
        <Card.Title title="إجراءات" />
        <Card.Content>
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              icon="clipboard-text"
              onPress={handleCopy}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              نسخ
            </Button>
            <Button
              mode="outlined"
              icon="file-delimited"
              onPress={handleCsvExport}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              CSV
            </Button>
            <Button
              mode="outlined"
              icon="printer"
              onPress={handlePrint}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              طباعة
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    marginBottom: 8
  },
  emptySubtext: {
    color: '#64748b',
    marginBottom: 20
  },
  emptyButton: {
    paddingHorizontal: 24
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold'
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  badge: {
    backgroundColor: '#e0e7ff'
  },
  badgeText: {
    fontSize: 12
  },
  card: {
    margin: 12,
    borderRadius: 12
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  awlText: {
    fontSize: 12,
    color: '#92400e'
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
    marginVertical: 2
  },
  specialCase: {
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8
  },
  specialCaseName: {
    fontWeight: 'bold',
    color: '#1e40af'
  },
  specialCaseDesc: {
    color: '#3b82f6',
    fontSize: 12
  },
  noteText: {
    color: '#065f46',
    fontSize: 14,
    marginVertical: 2
  },
  blockedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  blockedChip: {
    backgroundColor: '#fee2e2'
  },
  blockedChipText: {
    color: '#991b1b',
    fontSize: 12
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2
  },
  legendText: {
    fontSize: 12,
    color: '#64748b'
  },
  heirName: {
    fontWeight: 'bold'
  },
  heirType: {
    fontSize: 10,
    color: '#64748b'
  },
  amount: {
    fontWeight: 'bold',
    color: '#16a34a'
  },
  perPerson: {
    fontSize: 10,
    color: '#64748b'
  },
  perPersonRow: {
    backgroundColor: '#f8fafc'
  },
  perPersonLabel: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic'
  },
  perPersonFraction: {
    fontSize: 12,
    color: '#64748b'
  },
  perPersonAmount: {
    fontSize: 12,
    color: '#3b82f6'
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 12
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontWeight: 'bold',
    color: '#1e293b'
  },
  stepDesc: {
    color: '#64748b',
    fontSize: 12
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center'
  },
  actionButton: {
    flex: 1,
    borderRadius: 8
  },
  bottomPadding: {
    height: 40
  }
});

export default ResultsScreen;