import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { Estate, Heirs } from '../utils/InheritanceEngine';

interface QuickPreviewProps {
  estate: Estate;
  heirs: Heirs;
  madhabName: string;
}

export const QuickPreview: React.FC<QuickPreviewProps> = ({
  estate,
  heirs,
  madhabName
}) => {
  const netEstate = Math.max(0, estate.total - estate.funeral - estate.debts - estate.will);
  const heirsCount = Object.values(heirs).reduce((sum, count) => sum + count, 0);

  return (
    <Card style={styles.card}>
      <Card.Title
        title="معاينة سريعة"
        subtitle="نظرة عامة على البيانات المدخلة"
      />
      <Card.Content>
        <View style={styles.grid}>
          <Surface style={styles.item}>
            <Text style={styles.label}>التركة الصافية</Text>
            <Text style={styles.value}>{netEstate.toLocaleString()}</Text>
          </Surface>

          <Surface style={styles.item}>
            <Text style={styles.label}>عدد الورثة</Text>
            <Text style={styles.value}>{heirsCount}</Text>
          </Surface>

          <Surface style={[styles.item, styles.madhabItem]}>
            <Text style={styles.label}>المذهب المحدد</Text>
            <Text style={[styles.value, styles.madhabValue]}>{madhabName}</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  item: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center'
  },
  madhabItem: {
    backgroundColor: '#ecfdf5'
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  madhabValue: {
    color: '#16a34a'
  }
});

export default QuickPreview;
