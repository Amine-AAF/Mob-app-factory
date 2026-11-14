import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ClimateProfile } from '@/domain/seasons';
import type { TemperatureUnit, UnitSystem } from '@/domain/units';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical preferences kept in AsyncStorage (readable before SQLite opens).
 * All plant data lives in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  units: UnitSystem | null; // null = from device region
  temperature: TemperatureUnit | null;
  climate: ClimateProfile;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'plantcare');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  units: null,
  temperature: null,
  climate: 'north' as ClimateProfile,
  notificationsEnabled: true,
  reminderHour: 9,
  reminderMinute: 0,
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

export { kv as preferencesKv };
