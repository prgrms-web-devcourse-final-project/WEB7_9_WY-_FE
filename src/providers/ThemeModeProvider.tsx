'use client';

import { createContext, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useColorScheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

function ThemeModeProviderInner({ children }: { children: ReactNode }) {
  const { mode: muiMode, setMode: setMuiMode, systemMode } = useColorScheme();

  const resolvedMode = useMemo(() => {
    if (muiMode === 'system') {
      return systemMode || 'light';
    }
    return muiMode || 'light';
  }, [muiMode, systemMode]);

  // Sync class with resolved mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedMode);
  }, [resolvedMode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setMuiMode(newMode);
    // Also immediately apply class for instant visual feedback
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    const resolved = newMode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newMode;
    root.classList.add(resolved);
  }, [setMuiMode]);

  const value = useMemo(
    () => ({
      mode: (muiMode || 'light') as ThemeMode,
      setMode,
      resolvedMode: resolvedMode as 'light' | 'dark'
    }),
    [muiMode, setMode, resolvedMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  return <ThemeModeProviderInner>{children}</ThemeModeProviderInner>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}
