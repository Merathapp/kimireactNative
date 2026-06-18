import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useColorScheme, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, appTypography } from '../constants/theme';
import { CalculationResult } from '../utils/InheritanceEngine';

export type MadhabType = 'shafii' | 'hanafi' | 'maliki' | 'hanbali';
export type LanguageType = 'ar' | 'en';
export type GenderType = 'male' | 'female';

const SETTINGS_KEY = 'merath_settings';

interface Settings {
  currentMadhab: MadhabType;
  language: LanguageType;
  isDarkMode: boolean;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [currentMadhab, setCurrentMadhabState] = useState<MadhabType>('shafii');
  const [language, setLanguageState] = useState<LanguageType>('ar');
  const [isDarkMode, setIsDarkModeState] = useState(colorScheme === 'dark');
  const [deceasedGender, setDeceasedGender] = useState<GenderType>('male');
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
        }
      } catch { /* ignore */ }
      setSettingsLoaded(true);
    })();
  }, []);

  // Persist settings when changed
  const saveSettings = useCallback((madhab: MadhabType, lang: LanguageType, dark: boolean) => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ currentMadhab: madhab, language: lang, isDarkMode: dark } as Settings)).catch(() => {});
  }, []);

  const setCurrentMadhab = useCallback((madhab: MadhabType) => {
    setCurrentMadhabState(madhab);
    saveSettings(madhab, language, isDarkMode);
  }, [language, isDarkMode, saveSettings]);

  const setLanguage = useCallback((lang: LanguageType) => {
    setLanguageState(lang);
    saveSettings(currentMadhab, lang, isDarkMode);
    if (I18nManager.isRTL !== (lang === 'ar')) {
      I18nManager.forceRTL(lang === 'ar');
    }
  }, [currentMadhab, isDarkMode, saveSettings]);

  const toggleTheme = useCallback(() => {
    setIsDarkModeState(prev => {
      const next = !prev;
      saveSettings(currentMadhab, language, next);
      return next;
    });
  }, [currentMadhab, language, saveSettings]);

  useEffect(() => {
    if (prevColorScheme.current !== colorScheme && settingsLoaded) {
      prevColorScheme.current = colorScheme;
    }
  }, [colorScheme, settingsLoaded]);

  const [estate, setEstate] = useState({
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0
  });
  const [heirs, setHeirs] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<CalculationResult | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

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
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('en-US'),
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
        setDeceasedGender
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
