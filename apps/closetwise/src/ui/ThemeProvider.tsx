import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { createClosetTheme, type ClosetTheme, type PaletteName, type ThemePreference } from './theme';

const ThemeContext = createContext<ClosetTheme | null>(null);

export function ClosetThemeProvider({ preference, palette, children }: { preference: ThemePreference; palette: PaletteName; children: ReactNode }) {
  const system = useColorScheme();
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => createClosetTheme(scheme, palette), [scheme, palette]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ClosetTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside <ClosetThemeProvider>');
  return theme;
}
