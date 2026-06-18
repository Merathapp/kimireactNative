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
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useApp, currencySymbols } from '../context/AppContext';
import PieChart from '../components/PieChart';
import SimpleBarChart from '../components/SimpleBarChart';
import { appTypography } from '../constants/theme';
import { HeirShare } from '../utils/HeirShare';
import { BlockedHeir, SpecialCase, CalculationStep } from '../utils/InheritanceEngine';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;
import { getHeirVerse } from '../constants/QuranicVerses';
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
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { lastResult, addAuditLog, currency } = useApp();
  const currencySymbol = currencySymbols[currency];

  if (!lastResult || !lastResult.success) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineMedium" style={styles.emptyText}>
          {t('resultsEmptyTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          {t('resultsEmptySubtitle')}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Calculator')}
          style={styles.emptyButton}
        >
          {t('resultsEmptyButton')}
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
    let text = t('resultsShareTitle') + '\n';
    text += t('resultsShareDate', { date: new Date().toLocaleDateString('ar-SA') }) + '\n';
    text += `═══════════════════════════════════\n\n`;
    text += `${t('resultsNetEstate')}: ${netEstate?.toLocaleString('en-US')} ${currencySymbol}\n`;
    text += `${t('resultsCaseOrigin')}: ${finalBase}\n`;
    if (awlApplied) text += `(${t('resultsAwlNote', { asl })})`;
    text += `\n${t('resultsColumnShare')}:\n`;

    shares?.forEach((s: HeirShare) => {
      text += `• ${s.name}: ${s.fraction.toString()} = ${s.amount.toLocaleString('en-US')} ${currencySymbol}\n`;
      if (s.count > 1) {
        text += `  (${t('resultsPerPerson')}: ${s.amountPerPerson.toLocaleString('en-US')} ${currencySymbol})\n`;
      }
    });

    if (specialCases && specialCases.length > 0) {
      text += `\n${t('resultsSpecialCasesCard')}:\n`;
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
        title: t('resultsShareTitle')
      });
      addAuditLog(t('auditLogShare'), 'success', t('auditLogShareSuccess'));
    } catch {
      addAuditLog(t('auditLogShare'), 'error', t('auditLogShareError'));
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(buildResultText());
      Alert.alert(t('resultsAlertDone'), t('resultsAlertCopied'));
      addAuditLog(t('auditLogCopy'), 'success', t('auditLogCopySuccess'));
    } catch {
      addAuditLog(t('auditLogCopy'), 'error', t('auditLogCopyError'));
    }
  };

  const handleCsvExport = async () => {
    try {
      let csv = t('resultsCsvHeader') + '\n';
      shares?.forEach((s: HeirShare) => {
        csv += `${s.name},${s.type},${s.count},${s.fraction.toDisplay()},${s.amount.toLocaleString('en-US')} ${currencySymbol}\n`;
        if (s.count > 1) {
          csv += `${t('resultsPerPerson')},,${s.fraction.divide(s.count).toDisplay()},${s.amountPerPerson.toLocaleString('en-US')} ${currencySymbol}\n`;
        }
      });

      if (specialCases?.length) {
        csv += `\n${t('resultsSpecialCasesCard')}\n`;
        specialCases.forEach((c: SpecialCase) => {
          csv += `${c.name},${c.description}\n`;
        });
      }

      const uri = cacheDirectory + 'merath_results.csv';
      await writeAsStringAsync(uri, csv, { encoding: 'utf8' });
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: t('auditLogCsvExport') });
      addAuditLog(t('auditLogCsvExport'), 'success', t('auditLogCsvSuccess'));
    } catch {
      addAuditLog(t('auditLogCsvExport'), 'error', t('auditLogCsvError'));
    }
  };

  const handlePdf = async () => {
    try {
      let rows = '';
      shares?.forEach((s: HeirShare) => {
        rows += `<tr><td>${s.name}</td><td>${s.type}</td><td>${s.count}</td><td>${s.fraction.toDisplay()}</td><td>${s.amount.toLocaleString('en-US')} ${currencySymbol}</td></tr>`;
        if (s.count > 1) {
          rows += `<tr class="per-person"><td colspan="2">${t('resultsPerPerson')}</td><td></td><td>${s.fraction.divide(s.count).toDisplay()}</td><td>${s.amountPerPerson.toLocaleString('en-US')} ${currencySymbol}</td></tr>`;
        }
      });

      const htmlPdf = `<!DOCTYPE html>
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
  <h1>${t('resultsPdfHeading')}</h1>
  <p style="text-align:center;color:#64748b;">${t('rulesMadhabDisplay', { name: madhhabName })} | ${new Date().toLocaleDateString('ar-SA')}</p>
  <div class="summary">
    <div><div class="label">${t('resultsNetEstate')}</div><div class="value">${netEstate?.toLocaleString('en-US')} ${currencySymbol}</div></div>
    <div><div class="label">${t('resultsCaseOrigin')}</div><div class="value">${finalBase}${awlApplied ? ` (${t('resultsAwlNote', { asl })})` : ''}</div></div>
    <div><div class="label">${t('resultsPdfStatus')}</div><div class="value">${getStatusText()}</div></div>
  </div>
  <table><thead><tr><th>${t('resultsColumnHeir')}</th><th>${t('resultsColumnCount')}</th><th>${t('resultsColumnShare')}</th><th>${t('resultsColumnAmount')}</th></tr></thead><tbody>${rows}</tbody></table>
  ${specialCases?.length ? specialCases.map((c: SpecialCase) => `<div class="warning"><strong>${c.name}:</strong> ${c.description}</div>`).join('') : ''}
  ${blockedHeirs?.length ? blockedHeirs.map((b: BlockedHeir) => `<div class="warning"><strong>${t('resultsBlockedLabel')}</strong> ${b.reason}</div>`).join('') : ''}
  ${madhhabNotes?.length ? madhhabNotes.map((n: string) => `<div class="note">${n}</div>`).join('') : ''}
  <div class="footer">${t('appFooter')}</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlPdf });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('auditLogPdfExport') });
      addAuditLog(t('auditLogPdfExport'), 'success', t('auditLogPdfSuccess'));
    } catch {
      addAuditLog(t('auditLogPdfExport'), 'error', t('auditLogPdfError'));
    }
  };

  const handlePrint = async () => {
    try {
      let rows = '';
      shares?.forEach((s: HeirShare) => {
        rows += `<tr><td>${s.name}</td><td>${s.type}</td><td>${s.count}</td><td>${s.fraction.toDisplay()}</td><td>${s.amount.toLocaleString('en-US')} ${currencySymbol}</td></tr>`;
        if (s.count > 1) {
          rows += `<tr class="per-person"><td colspan="2">${t('resultsPerPerson')}</td><td></td><td>${s.fraction.divide(s.count).toDisplay()}</td><td>${s.amountPerPerson.toLocaleString('en-US')} ${currencySymbol}</td></tr>`;
        }
      });

      const htmlPrint = `<!DOCTYPE html>
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
  <h1>${t('resultsPdfHeading')}</h1>
  <p style="text-align:center;color:#64748b;">${t('rulesMadhabDisplay', { name: madhhabName })} | ${new Date().toLocaleDateString('ar-SA')}</p>
  <div class="summary">
    <div><div class="label">${t('resultsNetEstate')}</div><div class="value">${netEstate?.toLocaleString('en-US')} ${currencySymbol}</div></div>
    <div><div class="label">${t('resultsCaseOrigin')}</div><div class="value">${finalBase}${awlApplied ? ` (${t('resultsAwlNote', { asl })})` : ''}</div></div>
    <div><div class="label">${t('resultsPdfStatus')}</div><div class="value">${getStatusText()}</div></div>
  </div>
  <table><thead><tr><th>${t('resultsColumnHeir')}</th><th>${t('resultsColumnCount')}</th><th>${t('resultsColumnShare')}</th><th>${t('resultsColumnAmount')}</th></tr></thead><tbody>${rows}</tbody></table>
  ${specialCases?.length ? specialCases.map((c: SpecialCase) => `<div class="warning"><strong>${c.name}:</strong> ${c.description}</div>`).join('') : ''}
  ${blockedHeirs?.length ? blockedHeirs.map((b: BlockedHeir) => `<div class="warning"><strong>${t('resultsBlockedLabel')}</strong> ${b.reason}</div>`).join('') : ''}
  ${madhhabNotes?.length ? madhhabNotes.map((n: string) => `<div class="note">${n}</div>`).join('') : ''}
  <div class="footer">${t('appFooter')}</div>
</body></html>`;

      await Print.printAsync({ html: htmlPrint });
      addAuditLog(t('auditLogPrint'), 'success', t('auditLogPrintSuccess'));
    } catch {
      addAuditLog(t('auditLogPrint'), 'error', t('auditLogPrintError'));
    }
  };

  const getStatusText = () => {
    if (awlApplied) return t('resultsStatusAwl');
    if (raddApplied) return t('resultsStatusRadd');
    return t('resultsStatusNormal');
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
            {t('resultsTitle')}
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
            {t('resultsConfidence', { pct: (confidence ? confidence * 100 : 0).toFixed(0) })}
          </Chip>
        </View>
      </Surface>

      {/* Estate Summary */}
      <Card style={styles.card}>
        <Card.Title title={t('resultsEstateSummaryCard')} />
        <Card.Content>
          <View style={styles.summaryGrid}>
            <Surface style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('resultsTotalEstate')}</Text>
              <Text style={styles.summaryValue}>{estate?.total.toLocaleString('en-US')} {currencySymbol}</Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#fef2f2' }]}>
              <Text style={styles.summaryLabel}>{t('resultsDeductions')}</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
                {((estate?.funeral || 0) + (estate?.debts || 0) + (estate?.will || 0)).toLocaleString('en-US')} {currencySymbol}
              </Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.summaryLabel}>{t('resultsNetEstate')}</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                {netEstate?.toLocaleString('en-US')} {currencySymbol}
              </Text>
            </Surface>
            <Surface style={[styles.summaryItem, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.summaryLabel}>{t('resultsCaseOrigin')}</Text>
              <Text style={[styles.summaryValue, { color: '#4f46e5' }]}>
                {finalBase}
                {awlApplied && <Text style={styles.awlText}> {t('resultsAwlNote', { asl })}</Text>}
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <Card style={[styles.card, { borderColor: '#f59e0b', borderWidth: 1 }]}>
          <Card.Title
            title={t('resultsWarningsCard')}
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
            title={t('resultsSpecialCasesCard')}
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
            title={t('resultsMadhabNotesCard')}
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
            title={t('resultsBlockedHeirsCard')}
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
          <Card.Title title={t('resultsChartCard')} />
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
            <SimpleBarChart
              data={chartData.map((d, i) => ({
                label: d.name,
                percentage: (d.amount / (netEstate || 1)) * 100,
                color: colors[i % colors.length],
              }))}
            />
          </Card.Content>
        </Card>
      )}

      {/* Results Table */}
      <Card style={styles.card}>
        <Card.Title title={t('resultsTableCard')} />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>{t('resultsColumnHeir')}</DataTable.Title>
              <DataTable.Title numeric>{t('resultsColumnCount')}</DataTable.Title>
              <DataTable.Title numeric>{t('resultsColumnShare')}</DataTable.Title>
              <DataTable.Title numeric>{t('resultsColumnAmount')}</DataTable.Title>
            </DataTable.Header>

            {shares?.flatMap((share: HeirShare) => {
              const rows = [
                <DataTable.Row key={share.key}>
                  <DataTable.Cell>
                    <View style={styles.heirNameRow}>
                      <View>
                        <Text style={styles.heirName}>{share.name}</Text>
                        <Text style={styles.heirType}>{share.type}</Text>
                      </View>
                      {getHeirVerse(share.key) && (
                        <IconButton
                          icon="book-open-variant"
                          size={16}
                          style={styles.verseIcon}
                          onPress={() => {
                            const v = getHeirVerse(share.key)!;
                            Alert.alert(v.topic, `سورة ${v.sura} ${v.ayah}\n\n${v.text}`);
                          }}
                        />
                      )}
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{share.count}</DataTable.Cell>
                  <DataTable.Cell numeric>{share.fraction.toDisplay()}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.amount}>{share.amount.toLocaleString('en-US')} {currencySymbol}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ];
              if (share.count > 1) {
                rows.push(
                  <DataTable.Row key={share.key + '_per'} style={styles.perPersonRow}>
                    <DataTable.Cell>
                      <Text style={styles.perPersonLabel}>{t('resultsPerPerson')}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{''}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.perPersonFraction}>
                        {share.fraction.divide(share.count).toDisplay()}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.perPersonAmount}>
                        {share.amountPerPerson.toLocaleString('en-US')} {currencySymbol}
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
          <Card.Title title={t('resultsStepsCard')} />
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
        <Card.Title title={t('resultsActionsCard')} />
        <Card.Content>
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              icon="clipboard-text"
              onPress={handleCopy}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              {t('resultsCopyButton')}
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
              icon="file-pdf-box"
              onPress={handlePdf}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              PDF
            </Button>
            <Button
              mode="outlined"
              icon="printer"
              onPress={handlePrint}
              style={styles.actionButton}
              labelStyle={appTypography.labelLarge}
            >
              {t('resultsPrintButton')}
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
  heirNameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heirName: {
    fontWeight: 'bold'
  },
  heirType: {
    fontSize: 10,
    color: '#64748b'
  },
  verseIcon: {
    margin: 0,
    padding: 0
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