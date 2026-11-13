import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PaletteId } from '@/config/brand';
import type { LibrarySort } from '@/database';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical, lightweight preferences kept in AsyncStorage (readable before
 * SQLite opens). Books, reading data, notes and quotes live in SQLite only.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  palette: PaletteId;
  analyticsConsent: boolean;
  haptics: boolean;
  libraryView: 'grid' | 'list';
  librarySort: LibrarySort;
  /** Preferred currency for prices and the book budget. */
  currency: string;
  /** Monthly book budget in cents (null = not set). */
  monthlyBudgetCents: number | null;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'booknest');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  palette: 'library' as PaletteId,
  analyticsConsent: false,
  haptics: true,
  libraryView: 'grid' as const,
  librarySort: 'recent' as LibrarySort,
  currency: 'USD',
  monthlyBudgetCents: null,
  sessionCount: 0,
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,
      set: (patch) => set(patch),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'preferences',
      version: 1,
      storage: createJSONStorage(() => kv.raw),
      partialize: ({ hydrated: _h, set: _s, reset: _r, ...rest }) => rest,
      onRehydrateStorage: () => () => usePreferences.setState({ hydrated: true }),
    },
  ),
);
