import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Surface,
  Chip,
  Divider
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';

const AuditScreen: React.FC = () => {
  const { t } = useTranslation();
  const { auditLog, clearAuditLog } = useApp();

  const handleClear = () => {
    Alert.alert(
      t('auditClearAlertTitle'),
      t('auditClearAlertMessage'),
      [
        { text: t('calculatorAlertCancel'), style: 'cancel' },
        {
          text: t('auditClearButton'),
          style: 'destructive',
          onPress: clearAuditLog
        }
      ]
    );
  };

  const handleExport = async () => {
    try {
      const text = auditLog.map(e =>
        `[${e.timestamp}] [${e.type.toUpperCase()}] ${e.action}: ${e.message}`
      ).join('\n');

      const fileUri = FileSystem.documentDirectory + `audit_log_${new Date().toISOString().split('T')[0]}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, '\uFEFF' + text, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch {
      Alert.alert(t('calculatorAlertError'), t('auditExportError'));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerRow}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('auditTitle')}
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="delete"
              iconColor="#fff"
              onPress={handleClear}
              disabled={auditLog.length === 0}
            />
            <IconButton
              icon="export"
              iconColor="#fff"
              onPress={handleExport}
              disabled={auditLog.length === 0}
            />
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {t('auditRecordCount', { count: auditLog.length })}
        </Text>
      </Surface>

      {auditLog.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>{t('auditEmptyTitle')}</Text>
          <Text style={styles.emptySubtext}>
            {t('auditEmptySubtitle')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              {auditLog.map((entry, index) => (
                <View key={entry.id}>
                  <View style={styles.logEntry}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logIcon}>
                        {getTypeIcon(entry.type)}
                      </Text>
                      <Chip
                        style={[
                          styles.typeChip,
                          { backgroundColor: getTypeColor(entry.type) + '20' }
                        ]}
                        textStyle={{ color: getTypeColor(entry.type), fontSize: 10 }}
                      >
                        {entry.type}
                      </Chip>
                      <Text style={styles.logTime}>{entry.timestamp}</Text>
                    </View>
                    <Text style={styles.logAction}>{entry.action}</Text>
                    <Text style={styles.logMessage}>{entry.message}</Text>
                  </View>
                  {index < auditLog.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold'
  },
  headerActions: {
    flexDirection: 'row'
  },
  headerSubtitle: {
    color: '#94a3b8',
    marginTop: 4
  },
  scrollView: {
    flex: 1
  },
  card: {
    margin: 12,
    borderRadius: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  emptySubtext: {
    color: '#64748b',
    marginTop: 8
  },
  logEntry: {
    paddingVertical: 12
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  logIcon: {
    fontSize: 16
  },
  typeChip: {
    height: 24
  },
  logTime: {
    fontSize: 11,
    color: '#94a3b8'
  },
  logAction: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2
  },
  logMessage: {
    color: '#64748b',
    fontSize: 13
  },
  divider: {
    marginVertical: 4
  },
  bottomPadding: {
    height: 40
  }
});

export default AuditScreen;