import React, { createContext, useContext, useState, useCallback } from 'react';
import { MadhabType } from '../constants/FiqhDatabase';
import { Estate, Heirs, CalculationResult } from '../utils/InheritanceEngine';

/**
 * Audit Log Entry Interface
 */
export interface AuditLogEntry {
  id: number;
  timestamp: string;
  action: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

/**
 * App Context Interface
 */
interface AppContextType {
  // Current madhab
  currentMadhab: MadhabType;
  setCurrentMadhab: (madhab: MadhabType) => void;

  // Estate data
  estate: Estate;
  setEstate: (estate: Estate) => void;
  updateEstateField: (field: keyof Estate, value: number) => void;

  // Heirs data
  heirs: Heirs;
  setHeirs: (heirs: Heirs) => void;
  updateHeir: (key: string, value: number) => void;
  resetHeirs: () => void;

  // Last calculation result
  lastResult: CalculationResult | null;
  setLastResult: (result: CalculationResult | null) => void;

  // Audit log
  auditLog: AuditLogEntry[];
  addAuditLog: (action: string, type: AuditLogEntry['type'], message: string, details?: any) => void;
  clearAuditLog: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Default values
const defaultEstate: Estate = {
  total: 100000,
  funeral: 0,
  debts: 0,
  will: 0
};

const defaultHeirs: Heirs = {
  husband: 0,
  wife: 0,
  father: 0,
  mother: 0,
  grandfather: 0,
  grandmother_mother: 0,
  grandmother_father: 0,
  son: 0,
  daughter: 0,
  grandson: 0,
  granddaughter: 0,
  full_brother: 0,
  full_sister: 0,
  paternal_brother: 0,
  paternal_sister: 0,
  maternal_brother: 0,
  maternal_sister: 0,
  full_nephew: 0,
  paternal_nephew: 0,
  full_uncle: 0,
  paternal_uncle: 0,
  full_cousin: 0,
  paternal_cousin: 0,
  maternal_uncle: 0,
  maternal_aunt: 0,
  paternal_aunt: 0,
  daughter_son: 0,
  daughter_daughter: 0,
  sister_children: 0
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App Provider Component
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMadhab, setCurrentMadhabState] = useState<MadhabType>('shafii');
  const [estate, setEstateState] = useState<Estate>(defaultEstate);
  const [heirs, setHeirsState] = useState<Heirs>(defaultHeirs);
  const [lastResult, setLastResult] = useState<CalculationResult | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const setCurrentMadhab = useCallback((madhab: MadhabType) => {
    setCurrentMadhabState(madhab);
    addAuditLog('تغيير المذهب', 'info', `تم التغيير إلى المذهب ${madhab}`);
  }, []);

  const setEstate = useCallback((newEstate: Estate) => {
    setEstateState(newEstate);
  }, []);

  const updateEstateField = useCallback((field: keyof Estate, value: number) => {
    setEstateState(prev => ({ ...prev, [field]: value }));
  }, []);

  const setHeirs = useCallback((newHeirs: Heirs) => {
    setHeirsState(newHeirs);
  }, []);

  const updateHeir = useCallback((key: string, value: number) => {
    setHeirsState(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetHeirs = useCallback(() => {
    setHeirsState(defaultHeirs);
    addAuditLog('إعادة تعيين', 'info', 'تم إعادة تعيين الورثة');
  }, []);

  const addAuditLog = useCallback((action: string, type: AuditLogEntry['type'], message: string, details?: any) => {
    const entry: AuditLogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ar-SA'),
      action,
      type,
      message,
      details
    };

    setAuditLog(prev => [entry, ...prev].slice(0, 500));
  }, []);

  const clearAuditLog = useCallback(() => {
    setAuditLog([]);
    addAuditLog('مسح السجل', 'warning', 'تم مسح سجل المراجعة');
  }, [addAuditLog]);

  const value: AppContextType = {
    currentMadhab,
    setCurrentMadhab,
    estate,
    setEstate,
    updateEstateField,
    heirs,
    setHeirs,
    updateHeir,
    resetHeirs,
    lastResult,
    setLastResult,
    auditLog,
    addAuditLog,
    clearAuditLog,
    isLoading,
    setIsLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Use App Context Hook
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
