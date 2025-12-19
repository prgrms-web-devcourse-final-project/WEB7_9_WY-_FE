'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ThemeModeContextType {
  mode: 'light';
  resolvedMode: 'light';
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  resolvedMode: 'light',
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeModeContext.Provider value={{ mode: 'light', resolvedMode: 'light' }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
