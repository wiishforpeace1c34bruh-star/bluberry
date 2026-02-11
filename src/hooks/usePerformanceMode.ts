import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const PERFORMANCE_KEY = 'sapphire_performance_mode';
const ULTRA_KEY = 'sapphire_ultra_mode';

interface PerformanceContextValue {
  performanceMode: boolean;
  ultraMode: boolean;
  togglePerformanceMode: () => void;
  toggleUltraMode: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  setUltraMode: (enabled: boolean) => void;
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

  const [ultraMode, setUltraModeState] = useState(() => {
    try {
      return localStorage.getItem(ULTRA_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERFORMANCE_KEY, String(performanceMode));
      document.documentElement.classList.toggle('performance-mode', performanceMode);
    } catch {
      // Storage might be full or disabled
    }
  }, [performanceMode]);

  useEffect(() => {
    try {
      localStorage.setItem(ULTRA_KEY, String(ultraMode));
      document.documentElement.setAttribute('data-performance', ultraMode ? 'ultra' : 'normal');

      // If ultra is on, high-perf mode is automatically on
      if (ultraMode) {
        setPerformanceModeState(true);
      }
    } catch {
      // Storage might be full or disabled
    }
  }, [ultraMode]);

  const togglePerformanceMode = useCallback(() => {
    setPerformanceModeState((prev) => !prev);
  }, []);

  const toggleUltraMode = useCallback(() => {
    setUltraModeState((prev) => !prev);
  }, []);

  const setPerformanceMode = useCallback((enabled: boolean) => {
    setPerformanceModeState(enabled);
  }, []);

  const setUltraMode = useCallback((enabled: boolean) => {
    setUltraModeState(enabled);
  }, []);

  return {
    performanceMode,
    ultraMode,
    togglePerformanceMode,
    toggleUltraMode,
    setPerformanceMode,
    setUltraMode,
  };
}

export function usePerformanceMode() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMode must be used within a PerformanceProvider');
  }
  return context;
}
