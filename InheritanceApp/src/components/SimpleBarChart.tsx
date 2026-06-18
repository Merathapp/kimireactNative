import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface BarData {
  label: string;
  percentage: number;
  color: string;
}

interface SimpleBarChartProps {
  data: BarData[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  const maxPct = Math.max(...data.map(d => d.percentage), 100);

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  width: `${(item.percentage / maxPct) * 100}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <Text style={styles.percentage}>{item.percentage.toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    width: 80,
    fontSize: 12,
    color: '#1e293b',
  },
  barContainer: {
    flex: 1,
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    width: 48,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
  },
});

export default React.memo(SimpleBarChart);
