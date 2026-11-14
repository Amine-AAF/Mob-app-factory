import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_UNITS } from '@/features/units/units';
import type { InterfaceLanguage } from '@/i18n';
import type { CurrencyCode, UnitPreferences } from '@/types';

/**
 * Boot-critical, lightweight preferences kept in AsyncStorage (readable before
 * SQLite opens). Vehicles and their history live in SQLite.
 *
 * Units are independent from the interface language: a French speaker in the
 * UK can use miles and litres, a US user can choose km.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  units: UnitPreferences;
  /** Default currency for new entries (each entry keeps its own currency). */
  currency: CurrencyCode;
  /** Vehicle shown first on Home / preselected in quick-add. */
  activeVehicleId: string | null;
  notificationsEnabled: boolean;
  analyticsConsent: boolean;
  haptics: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'autocare');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  units: DEFAULT_UNITS,
  currency: 'USD',
  activeVehicleId: null,
  notificationsEnabled: true,
  analyticsConsent: false,
  haptics: true,
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
