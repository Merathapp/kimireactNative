import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MadhabType, getMadhabConfig } from '../constants/FiqhDatabase';

interface MadhabCardProps {
  madhab: MadhabType;
  isSelected: boolean;
  onSelect: () => void;
}

export const MadhabCard: React.FC<MadhabCardProps> = ({
  madhab,
  isSelected,
  onSelect
}) => {
  const config = getMadhabConfig(madhab);

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Surface
        style={[
          styles.card,
          { backgroundColor: config.color },
          isSelected && styles.selectedCard
        ]}
        elevation={isSelected ? 4 : 2}
      >
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.name}>{config.name}</Text>
        <Text style={styles.imam}>الإمام {getImamName(madhab)}</Text>
      </Surface>
    </TouchableOpacity>
  );
};

const getImamName = (madhab: MadhabType): string => {
  const names: Record<MadhabType, string> = {
    shafii: 'الشافعي',
    hanafi: 'أبو حنيفة',
    maliki: 'مالك',
    hanbali: 'أحمد'
  };
  return names[madhab];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '22%',
    margin: 4
  },
  card: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedCard: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  icon: {
    fontSize: 28,
    marginBottom: 4
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center'
  },
  imam: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center'
  }
});

export default MadhabCard;
