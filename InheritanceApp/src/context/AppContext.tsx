import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { typography, appTypography } from '../constants/theme';

export type MadhabType = 'shafii' | 'hanafi' | 'maliki' | 'hanbali';
export type LanguageType = 'ar' | 'en';

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
  lastResult: any;
  setLastResult: (result: any) => void;
  auditLog: any[];
  addAuditLog: (action: string, type: string, message: string) => void;
  clearAuditLog: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [currentMadhab, setCurrentMadhab] = useState<MadhabType>('shafii');
  const [language, setLanguage] = useState<LanguageType>('ar');
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [estate, setEstate] = useState({
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0
  });
  const [heirs, setHeirs] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<any>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

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
    setAuditLog(prev => [
      {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('ar-SA'),
        action,
        type,
        message
      },
      ...prev
    ]);
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
        clearAuditLog
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
