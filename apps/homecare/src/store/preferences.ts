import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UnitSystem } from '@/domain/units';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical preferences kept in AsyncStorage (readable before SQLite opens).
 * Everything else lives in SQLite.
 */
export type DateFormatPreference = 'auto' | 'dmy' | 'mdy' | 'ymd';

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  units: UnitSystem;
  dateFormat: DateFormatPreference;
  /** Default currency for new homes. */
  currency: string;
  activeHomeId: string | null;
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'homecare');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  units: 'metric' as UnitSystem,
  dateFormat: 'auto' as DateFormatPreference,
  currency: 'USD',
  activeHomeId: null,
  analyticsConsent: false,
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
