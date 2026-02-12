import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { MadhabType, getMadhabConfig } from '../constants/FiqhDatabase';
import { appTypography } from '../constants/theme';

interface Props {
  selectedMadhab: MadhabType;
  onSelect: (madhab: MadhabType) => void;
}

export const MadhabDropdown: React.FC<Props> = ({ selectedMadhab, onSelect }) => {
  const [visible, setVisible] = useState(false);
  
  const madhabs: MadhabType[] = ['shafii', 'hanafi', 'maliki', 'hanbali'];

  const getButtonLabel = () => {
    const config = getMadhabConfig(selectedMadhab);
    return `${config.icon} ${config.name}`;
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            mode="contained-tonal"
            onPress={() => setVisible(true)}
            icon={visible ? 'chevron-up' : 'chevron-down'}
            contentStyle={styles.buttonContent}
            labelStyle={[appTypography.labelLarge, styles.buttonLabel]}
            style={[styles.button, { backgroundColor: `${getMadhabConfig(selectedMadhab).color}20` }]}
            textColor={getMadhabConfig(selectedMadhab).color}
          >
            {getButtonLabel()}
          </Button>
        }
      >
        {madhabs.map((madhab) => {
          const config = getMadhabConfig(madhab);
          const isSelected = madhab === selectedMadhab;
          return (
            <Menu.Item
              key={madhab}
              onPress={() => {
                onSelect(madhab);
                setVisible(false);
              }}
              title={config.name}
              leadingIcon={() => <Text style={styles.menuIcon}>{config.icon}</Text>}
              style={isSelected ? { backgroundColor: `${config.color}15` } : undefined}
              titleStyle={[
                appTypography.bodyLarge,
                isSelected && { color: config.color, fontWeight: 'bold' }
              ]}
            />
          );
        })}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: 8,
    width: '100%',
  },
  button: {
    borderRadius: 30,
    paddingHorizontal: 4,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonLabel: {
    marginHorizontal: 8,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 8,
  },
});