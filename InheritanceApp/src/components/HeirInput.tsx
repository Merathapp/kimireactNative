import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Surface,
  IconButton,
  HelperText
} from 'react-native-paper';

interface HeirInputProps {
  heirKey: string;
  label: string;
  description: string;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const HeirInput: React.FC<HeirInputProps> = ({
  heirKey: _heirKey,
  label,
  description,
  max,
  value,
  onChange
}) => {
  const isActive = value > 0;

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleChangeText = (text: string) => {
    const num = parseInt(text) || 0;
    if (num >= 0 && num <= max) {
      onChange(num);
    }
  };

  return (
    <Surface
      style={[
        styles.container,
        isActive && styles.activeContainer
      ]}
      elevation={isActive ? 2 : 1}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.label, isActive && styles.activeLabel]}>
            {label}
          </Text>
          <HelperText type="info" style={styles.description}>
            {description}
          </HelperText>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon="minus"
            size={20}
            onPress={decrement}
            disabled={value === 0}
            style={styles.button}
          />

          <TextInput
            value={value.toString()}
            onChangeText={handleChangeText}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            dense
          />

          <IconButton
            icon="plus"
            size={20}
            onPress={increment}
            disabled={value >= max}
            style={styles.button}
          />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  activeContainer: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5'
  },
  content: {
    padding: 8
  },
  info: {
    marginBottom: 8
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1e293b'
  },
  activeLabel: {
    color: '#4f46e5'
  },
  description: {
    fontSize: 10,
    color: '#64748b',
    paddingHorizontal: 0
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  button: {
    margin: 0,
    width: 32,
    height: 32
  },
  input: {
    width: 50,
    height: 36,
    textAlign: 'center'
  }
});

export default HeirInput;