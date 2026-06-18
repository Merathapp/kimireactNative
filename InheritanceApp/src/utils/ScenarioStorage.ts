import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'merath_scenarios';

export interface Scenario {
  id: string;
  name: string;
  madhab: string;
  estate: { total: number; funeral: number; debts: number; will: number };
  heirs: Record<string, number>;
  deceasedGender: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

export const saveScenario = async (
  name: string,
  madhab: string,
  estate: { total: number; funeral: number; debts: number; will: number },
  heirs: Record<string, number>,
  deceasedGender: 'male' | 'female'
): Promise<Scenario> => {
  const scenarios = await loadAllScenarios();
  const now = new Date().toISOString();
  const existing = scenarios.find(s => s.name === name);
  let scenario: Scenario;

  if (existing) {
    scenario = { ...existing, madhab, estate, heirs, deceasedGender, updatedAt: now };
    const idx = scenarios.findIndex(s => s.id === scenario.id);
    scenarios[idx] = scenario;
  } else {
    scenario = {
      id: Date.now().toString(),
      name,
      madhab,
      estate,
      heirs,
      deceasedGender,
      createdAt: now,
      updatedAt: now,
    };
    scenarios.push(scenario);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  return scenario;
};

export const loadAllScenarios = async (): Promise<Scenario[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const deleteScenario = async (id: string): Promise<void> => {
  const scenarios = await loadAllScenarios();
  const filtered = scenarios.filter(s => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllScenarios = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
