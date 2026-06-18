import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useApp, currencySymbols } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { history, clearHistory, setLastResult, language, currency } = useApp();
  const currencySymbol = currencySymbols[currency];

  const handleItemPress = (index: number) => {
    const item = history[index];
    if (item) {
      setLastResult(item);
      navigation.navigate('Results');
    }
  };

  const handleClear = () => {
    Alert.alert(
      t('historyClearAlertTitle'),
      t('historyClearAlertMessage'),
      [
        { text: t('calculatorAlertCancel'), style: 'cancel' },
        { text: t('historyClearAll'), style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      return new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    }
    try {
      return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="history" size={64} iconColor="#94a3b8" />
          <Text variant="headlineSmall" style={styles.emptyText}>
            {t('historyEmptyTitle')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {t('historyEmptySubtitle')}
          </Text>
        </View>
      ) : (
        <>
          <Surface style={styles.header} elevation={2}>
            <View style={styles.headerRow}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                {t('historyTitle')}
              </Text>
              <Button
                mode="text"
                textColor="#ef4444"
                onPress={handleClear}
                labelStyle={styles.clearButton}
              >
                {t('historyClearAll')}
              </Button>
            </View>
          </Surface>

          <ScrollView style={styles.scrollView}>
            {history.map((item, index) => (
              <Card key={index} style={styles.card} onPress={() => handleItemPress(index)}>
                <Card.Content>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemMadhab}>{item.madhhabName}</Text>
                      <Text style={styles.itemDate}>{formatDate(item.steps?.[0]?.timestamp ? new Date(item.steps[0].timestamp).toISOString() : undefined)}</Text>
                    </View>
                    <View style={styles.itemStats}>
                      <Text style={styles.itemEstate}>
                        {item.netEstate?.toLocaleString('en-US')} {currencySymbol}
                      </Text>
                      <Text style={styles.itemHeirs}>
                        {t('historyHeirs', { count: item.shares?.length || 0 })}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#94a3b8',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemMadhab: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  itemDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  itemStats: {
    alignItems: 'flex-end',
  },
  itemEstate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  itemHeirs: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});

export default HistoryScreen;
