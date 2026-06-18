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
import { useApp } from '../context/AppContext';
import {
  loadAllScenarios,
  deleteScenario,
  saveScenario,
  Scenario
} from '../utils/ScenarioStorage';

const ScenariosScreen: React.FC = () => {
  const navigation = useNavigation();
  const appContext = useApp();
  const { setCurrentMadhab, updateEstateField, updateHeir, resetHeirs, setDeceasedGender, currentMadhab, estate, heirs, deceasedGender } = appContext;
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [visible, setVisible] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const refresh = useCallback(async () => {
    const list = await loadAllScenarios();
    setScenarios(list);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleLoad = (s: Scenario) => {
    Alert.alert(
      'تحميل السيناريو',
      `هل تريد تحميل "${s.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحميل',
          onPress: () => {
            resetHeirs();
            setCurrentMadhab(s.madhab as any);
            setDeceasedGender(s.deceasedGender);
            Object.entries(s.estate).forEach(([k, v]) => updateEstateField(k, v));
            Object.entries(s.heirs).forEach(([k, v]) => updateHeir(k, v));
            navigation.navigate('Calculator' as never);
          }
        }
      ]
    );
  };

  const handleDelete = (s: Scenario) => {
    Alert.alert('حذف', `حذف "${s.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteScenario(s.id);
          refresh();
        }
      }
    ]);
  };

  const handleSaveCurrent = async () => {
    if (!scenarioName.trim()) return;
    await saveScenario(scenarioName.trim(), currentMadhab, estate, heirs, deceasedGender);
    setVisible(false);
    setScenarioName('');
    refresh();
    Alert.alert('تم', 'تم حفظ السيناريو');
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerRow}>
          <IconButton icon="arrow-right" iconColor="#fff" onPress={() => navigation.goBack()} />
          <Text variant="headlineSmall" style={styles.headerTitle}>السيناريوهات</Text>
          <IconButton
            icon="content-save"
            iconColor="#fff"
            onPress={() => setVisible(true)}
          />
        </View>
      </Surface>

      {scenarios.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>لا توجد سيناريوهات محفوظة</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            احفظ حساباتك لترجع إليها لاحقاً
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
                  {Object.keys(s.heirs).length} وارث
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
          <Dialog.Title>حفظ السيناريو</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="اسم السيناريو"
              value={scenarioName}
              onChangeText={setScenarioName}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>إلغاء</Button>
            <Button onPress={handleSaveCurrent} disabled={!scenarioName.trim()}>حفظ</Button>
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
