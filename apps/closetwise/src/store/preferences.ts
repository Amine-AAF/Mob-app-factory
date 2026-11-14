import AsyncStorage from '@react-native-async-storage/async-storage';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SortKey } from '@/domain/wardrobeQuery';
import type { InterfaceLanguage } from '@/i18n';
import type { PaletteName, ThemePreference } from '@/ui/theme';

/**
 * Boot-critical and per-device UI preferences, kept in AsyncStorage (readable before SQLite
 * opens). Wardrobe data and app settings (currency, budget…) live in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  palette: PaletteName;
  analyticsConsent: boolean;
  sessionCount: number;
  wardrobeView: 'grid' | 'list';
  wardrobeSort: SortKey;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'closetwise');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  palette: 'atelier' as PaletteName,
  analyticsConsent: false,
  sessionCount: 0,
  wardrobeView: 'grid' as const,
  wardrobeSort: 'newest' as SortKey,
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
