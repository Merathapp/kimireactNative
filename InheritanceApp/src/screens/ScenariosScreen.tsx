import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  Surface,
  IconButton,
  Chip
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { MadhabType } from '../constants/FiqhDatabase';
import {
  loadAllScenarios,
  deleteScenario,
  saveScenario,
  Scenario
} from '../utils/ScenarioStorage';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type NavProp = StackNavigationProp<RootStackParamList>;

const ScenariosScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { setCurrentMadhab, updateEstateField, updateHeir, resetHeirs, setDeceasedGender, currentMadhab, estate, heirs, deceasedGender } = useApp();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [visible, setVisible] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [importVisible, setImportVisible] = useState(false);
  const [importText, setImportText] = useState('');

  const refresh = useCallback(async () => {
    const list = await loadAllScenarios();
    setScenarios(list);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleLoad = (s: Scenario) => {
    Alert.alert(
      t('scenariosLoadAlertTitle'),
      t('scenariosLoadAlertMessage', { name: s.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('scenariosLoadButton'),
          onPress: () => {
            resetHeirs();
            setCurrentMadhab(s.madhab as MadhabType);
            setDeceasedGender(s.deceasedGender);
            Object.entries(s.estate).forEach(([k, v]) => updateEstateField(k, v));
            Object.entries(s.heirs).forEach(([k, v]) => updateHeir(k, v));
            navigation.navigate('Calculator');
          }
        }
      ]
    );
  };

  const handleDelete = (s: Scenario) => {
    Alert.alert(t('scenariosDeleteAlertTitle'), t('scenariosDeleteAlertMessage', { name: s.name }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('scenariosDeleteButton'),
        style: 'destructive',
        onPress: async () => {
          await deleteScenario(s.id);
          refresh();
        }
      }
    ]);
  };

  const handleExportAll = async () => {
    try {
      const list = await loadAllScenarios();
      if (list.length === 0) {
        Alert.alert(t('scenariosNoScenariosTitle'), t('scenariosNoScenariosExport'));
        return;
      }
      const json = JSON.stringify(list, null, 2);
      const uri = cacheDirectory + 'merath_scenarios.json';
      await writeAsStringAsync(uri, json, { encoding: 'utf8' });
      await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: t('scenariosExportTitle') });
    } catch {
      Alert.alert(t('error'), t('scenariosExportError'));
    }
  };

  const handleImportConfirm = async () => {
    try {
      const parsed: Scenario[] = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error('must be array');
      parsed.forEach(s => {
        if (!s.id || !s.name || !s.madhab || !s.estate || !s.heirs) throw new Error('invalid shape');
      });
      const existing = await loadAllScenarios();
      const merged = [...existing];
      parsed.forEach(incoming => {
        const idx = merged.findIndex(e => e.id === incoming.id);
        if (idx >= 0) {
          merged[idx] = incoming;
        } else {
          merged.push(incoming);
        }
      });
      await AsyncStorage.setItem('merath_scenarios', JSON.stringify(merged));
      setImportVisible(false);
      setImportText('');
      refresh();
      Alert.alert(t('success'), t('scenariosImportSuccess', { count: parsed.length }));
    } catch {
      Alert.alert(t('error'), t('scenariosImportInvalid'));
    }
  };

  const handleSaveCurrent = async () => {
    if (!scenarioName.trim()) return;
    await saveScenario(scenarioName.trim(), currentMadhab, estate, heirs, deceasedGender);
    setVisible(false);
    setScenarioName('');
    refresh();
    Alert.alert(t('success'), t('scenariosSavedAlert'));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerRow}>
          <IconButton icon="arrow-right" iconColor="#fff" onPress={() => navigation.goBack()} />
          <Text variant="headlineSmall" style={styles.headerTitle}>{t('scenariosTitle')}</Text>
          <IconButton
            icon="file-export"
            iconColor="#fff"
            onPress={handleExportAll}
          />
          <IconButton
            icon="file-import"
            iconColor="#fff"
            onPress={() => setImportVisible(true)}
          />
          <IconButton
            icon="content-save"
            iconColor="#fff"
            onPress={() => setVisible(true)}
          />
        </View>
      </Surface>

      {scenarios.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>{t('scenariosEmptyTitle')}</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {t('scenariosEmptySubtitle')}
          </Text>
        </View>
      ) : (
        scenarios.map(s => (
          <Card key={s.id} style={styles.card}>
            <Card.Content>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioName}>{s.name}</Text>
                <View style={styles.scenarioActions}>
                  <IconButton icon="folder-upload" size={20} onPress={() => handleLoad(s)} />
                  <IconButton icon="delete" size={20} onPress={() => handleDelete(s)} />
                </View>
              </View>
              <View style={styles.chips}>
                <Chip style={styles.chip} textStyle={styles.chipText}>{s.madhab}</Chip>
                <Chip style={styles.chip} textStyle={styles.chipText}>
                  {t('scenariosHeirCount', { count: Object.keys(s.heirs).length })}
                </Chip>
              </View>
              <Text style={styles.scenarioDate}>
                {new Date(s.updatedAt).toLocaleDateString('ar-SA')}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>{t('scenariosSaveDialogTitle')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('scenariosSaveNameLabel')}
              value={scenarioName}
              onChangeText={setScenarioName}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>{t('cancel')}</Button>
            <Button onPress={handleSaveCurrent} disabled={!scenarioName.trim()}>{t('scenariosSaveButton')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={importVisible} onDismiss={() => setImportVisible(false)}>
          <Dialog.Title>{t('scenariosImportDialogTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#64748b' }}>
              {t('scenariosImportDialogLabel')}
            </Text>
            <TextInput
              label="JSON"
              value={importText}
              onChangeText={setImportText}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportVisible(false)}>{t('cancel')}</Button>
            <Button onPress={handleImportConfirm} disabled={!importText.trim()}>{t('scenariosImportButton')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80
  },
  emptyText: {
    color: '#64748b',
    marginBottom: 8
  },
  emptySubtext: {
    color: '#94a3b8'
  },
  card: {
    margin: 12,
    borderRadius: 12
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  scenarioActions: {
    flexDirection: 'row'
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  chip: {
    backgroundColor: '#e0e7ff'
  },
  chipText: {
    fontSize: 11
  },
  scenarioDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4
  },
  dialogInput: {
    marginTop: 8
  },
  bottomPadding: {
    height: 40
  }
});

export default ScenariosScreen;
