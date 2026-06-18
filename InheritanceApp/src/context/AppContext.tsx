import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useColorScheme, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, appTypography } from '../constants/theme';
import { CalculationResult } from '../utils/InheritanceEngine';
import { MadhabType } from '../constants/FiqhDatabase';
export type LanguageType = 'ar' | 'en';
export type GenderType = 'male' | 'female';
export type CurrencyType = 'SAR' | 'USD' | 'EUR';
export const currencySymbols: Record<CurrencyType, string> = {
  SAR: 'ر.س',
  USD: '$',
  EUR: '€'
};

const SETTINGS_KEY = 'merath_settings';

interface Settings {
  currentMadhab: MadhabType;
  language: LanguageType;
  isDarkMode: boolean;
  currency: CurrencyType;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  type: string;
  message: string;
}

interface AppContextType {
  currentMadhab: MadhabType;
  setCurrentMadhab: (madhab: MadhabType) => void;
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  typography: typeof typography;
  appTypography: typeof appTypography;
  estate: {
    total: number;
    funeral: number;
    debts: number;
    will: number;
  };
  updateEstateField: (field: string, value: number) => void;
  heirs: Record<string, number>;
  updateHeir: (key: string, value: number) => void;
  resetHeirs: () => void;
  lastResult: CalculationResult | null;
  setLastResult: (result: CalculationResult | null) => void;
  auditLog: AuditLogEntry[];
  addAuditLog: (action: string, type: string, message: string) => void;
  clearAuditLog: () => void;
  deceasedGender: GenderType;
  setDeceasedGender: (gender: GenderType) => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  hasPregnancy: boolean;
  setHasPregnancy: (value: boolean) => void;
  hasMissingHeir: boolean;
  setHasMissingHeir: (value: boolean) => void;
  history: CalculationResult[];
  addToHistory: (result: CalculationResult) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let auditIdCounter = 0;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [currentMadhab, setCurrentMadhabState] = useState<MadhabType>('shafii');
  const [language, setLanguageState] = useState<LanguageType>('ar');
  const [isDarkMode, setIsDarkModeState] = useState(colorScheme === 'dark');
  const [deceasedGender, setDeceasedGender] = useState<GenderType>('male');
  const [currency, setCurrencyState] = useState<CurrencyType>('SAR');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const prevColorScheme = useRef(colorScheme);

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        if (data) {
          const saved: Settings = JSON.parse(data);
          if (saved.currentMadhab) setCurrentMadhabState(saved.currentMadhab);
          if (saved.language) {
            setLanguageState(saved.language);
            if (I18nManager.isRTL !== (saved.language === 'ar')) {
              I18nManager.forceRTL(saved.language === 'ar');
            }
          }
          if (typeof saved.isDarkMode === 'boolean') setIsDarkModeState(saved.isDarkMode);
          if (saved.currency) setCurrencyState(saved.currency);
        }
      } catch { /* ignore */ }
      setSettingsLoaded(true);
    })();
  }, []);

  // Persist settings when changed
  const saveSettings = useCallback((madhab: MadhabType, lang: LanguageType, dark: boolean, curr: CurrencyType) => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ currentMadhab: madhab, language: lang, isDarkMode: dark, currency: curr } as Settings)).catch(() => {});
  }, []);

  const setCurrentMadhab = useCallback((madhab: MadhabType) => {
    setCurrentMadhabState(madhab);
    saveSettings(madhab, language, isDarkMode, currency);
  }, [language, isDarkMode, currency, saveSettings]);

  const setLanguage = useCallback((lang: LanguageType) => {
    setLanguageState(lang);
    saveSettings(currentMadhab, lang, isDarkMode, currency);
    if (I18nManager.isRTL !== (lang === 'ar')) {
      I18nManager.forceRTL(lang === 'ar');
    }
  }, [currentMadhab, isDarkMode, currency, saveSettings]);

  const toggleTheme = useCallback(() => {
    setIsDarkModeState(prev => {
      const next = !prev;
      saveSettings(currentMadhab, language, next, currency);
      return next;
    });
  }, [currentMadhab, language, currency, saveSettings]);

  const setCurrency = useCallback((curr: CurrencyType) => {
    setCurrencyState(curr);
    saveSettings(currentMadhab, language, isDarkMode, curr);
  }, [currentMadhab, language, isDarkMode, saveSettings]);

  useEffect(() => {
    if (prevColorScheme.current !== colorScheme && settingsLoaded) {
      prevColorScheme.current = colorScheme;
    }
  }, [colorScheme, settingsLoaded]);

  // Load draft and lastResult on mount after settings are loaded
  useEffect(() => {
    if (!settingsLoaded) return;
    (async () => {
      try {
        const draftData = await AsyncStorage.getItem('merath_draft');
        if (draftData) {
          const draft = JSON.parse(draftData);
          const isEmptyHeirs = Object.keys(heirs).length === 0;
          if (isEmptyHeirs && estate.total === 100000 && estate.funeral === 0 && estate.debts === 0 && estate.will === 0) {
            if (draft.estate) setEstate(draft.estate);
            if (draft.heirs) setHeirs(draft.heirs);
            if (draft.deceasedGender) setDeceasedGender(draft.deceasedGender);
            if (draft.currentMadhab) setCurrentMadhabState(draft.currentMadhab);
            if (draft.language) {
              setLanguageState(draft.language);
              if (I18nManager.isRTL !== (draft.language === 'ar')) {
                I18nManager.forceRTL(draft.language === 'ar');
              }
            }
          }
        }
      } catch { /* ignore */ }

      try {
        const lastResultData = await AsyncStorage.getItem('merath_last_result');
        if (lastResultData) {
          setLastResult(JSON.parse(lastResultData));
        }
      } catch { /* ignore */ }

      try {
        const historyData = await AsyncStorage.getItem('merath_history');
        if (historyData) {
          setHistory(JSON.parse(historyData));
        }
      } catch { /* ignore */ }
    })();
  }, [settingsLoaded]);

  const [estate, setEstate] = useState({
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0
  });
  const [heirs, setHeirs] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<CalculationResult | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [hasPregnancy, setHasPregnancy] = useState(false);
  const [hasMissingHeir, setHasMissingHeir] = useState(false);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const isFirstDraftSave = useRef(true);
  const isFirstLastResultSave = useRef(true);

  // Auto-save draft
  useEffect(() => {
    if (isFirstDraftSave.current) {
      isFirstDraftSave.current = false;
      return;
    }
    AsyncStorage.setItem('merath_draft', JSON.stringify({ estate, heirs, deceasedGender, currentMadhab, language })).catch(() => {});
  }, [estate, heirs, deceasedGender, currentMadhab, language]);

  // Persist lastResult
  useEffect(() => {
    if (isFirstLastResultSave.current) {
      isFirstLastResultSave.current = false;
      return;
    }
    if (lastResult) {
      AsyncStorage.setItem('merath_last_result', JSON.stringify(lastResult)).catch(() => {});
    }
  }, [lastResult]);

  const updateEstateField = (field: string, value: number) => {
    setEstate(prev => ({ ...prev, [field]: value }));
  };

  const updateHeir = (key: string, value: number) => {
    setHeirs(prev => ({ ...prev, [key]: value }));
  };

  const resetHeirs = () => {
    setHeirs({});
  };

  const addAuditLog = (action: string, type: string, message: string) => {
    setAuditLog(prev => {
      const entry: AuditLogEntry = {
        id: `audit-${++auditIdCounter}`,
        timestamp: new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'),
        action,
        type,
        message
      };
      return [entry, ...prev].slice(0, 100);
    });
  };

  const clearAuditLog = () => {
    setAuditLog([]);
  };

  const addToHistory = useCallback((result: CalculationResult) => {
    setHistory(prev => {
      const next = [result, ...prev].slice(0, 50);
      AsyncStorage.setItem('merath_history', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem('merath_history').catch(() => {});
  }, []);

  // Auto-add lastResult to history when it changes
  const prevLastResultRef = useRef<CalculationResult | null>(null);
  useEffect(() => {
    if (lastResult && lastResult !== prevLastResultRef.current) {
      addToHistory(lastResult);
      prevLastResultRef.current = lastResult;
    }
  }, [lastResult, addToHistory]);

  return (
    <AppContext.Provider
      value={{
        currentMadhab,
        setCurrentMadhab,
        language,
        setLanguage,
        isDarkMode,
        toggleTheme,
        typography,
        appTypography,
        estate,
        updateEstateField,
        heirs,
        updateHeir,
        resetHeirs,
        lastResult,
        setLastResult,
        auditLog,
        addAuditLog,
        clearAuditLog,
        deceasedGender,
        setDeceasedGender,
        currency,
        setCurrency,
        hasPregnancy,
        setHasPregnancy,
        hasMissingHeir,
        setHasMissingHeir,
        history,
        addToHistory,
        clearHistory
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
