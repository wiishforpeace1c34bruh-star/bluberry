import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const PERFORMANCE_KEY = 'sapphire_performance_mode';

interface PerformanceContextValue {
  performanceMode: boolean;
  togglePerformanceMode: () => void;
  setPerformanceMode: (enabled: boolean) => void;
}

export const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function usePerformanceModeState() {
  const [performanceMode, setPerformanceModeState] = useState(() => {
    try {
      return localStorage.getItem(PERFORMANCE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERFORMANCE_KEY, String(performanceMode));
    } catch {
      // Storage might be full or disabled
    }
  }, [performanceMode]);

  const togglePerformanceMode = useCallback(() => {
    setPerformanceModeState((prev) => !prev);
  }, []);

  const setPerformanceMode = useCallback((enabled: boolean) => {
    setPerformanceModeState(enabled);
  }, []);

  return {
    performanceMode,
    togglePerformanceMode,
    setPerformanceMode,
  };
}

export function usePerformanceMode() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMode must be used within a PerformanceProvider');
  }
  return context;
}
