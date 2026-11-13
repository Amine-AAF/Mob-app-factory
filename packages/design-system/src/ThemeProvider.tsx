import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { createTheme, type BrandPalette, type Theme } from './theme';

export type ThemePreference = 'system' | 'light' | 'dark';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  brand,
  preference,
  children,
}: {
  brand: BrandPalette;
  preference: ThemePreference;
  children: ReactNode;
}) {
  const system = useColorScheme();
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => createTheme(brand, scheme), [brand, scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside <ThemeProvider>');
  return theme;
}
