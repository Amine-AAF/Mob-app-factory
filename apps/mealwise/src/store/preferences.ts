import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FirstDayOfWeek } from '@/domain/planner';
import type { AppLanguage, UnitSystem } from '@/domain/types';

/**
 * Boot-critical and regional preferences kept in AsyncStorage (readable before
 * SQLite opens). User data lives in SQLite.
 */
export type DietPreference = 'none' | 'vegetarian' | 'vegan';
export type TimeFormat = 'auto' | '12h' | '24h';

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  /** null = follow the device language. */
  interfaceLanguage: AppLanguage | null;
  theme: ThemePreference;
  unitSystem: UnitSystem;
  /** Show quantities exactly as written in the recipe (no metric/imperial conversion). */
  keepOriginalUnits: boolean;
  currency: string;
  firstDayOfWeek: FirstDayOfWeek;
  timeFormat: TimeFormat;
  householdSize: number;
  diet: DietPreference;
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'mealwise');

export const PREFERENCE_DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  unitSystem: 'metric' as UnitSystem,
  keepOriginalUnits: false,
  currency: 'USD',
  firstDayOfWeek: 'monday' as FirstDayOfWeek,
  timeFormat: 'auto' as TimeFormat,
  householdSize: 2,
  diet: 'none' as DietPreference,
  analyticsConsent: false,
  sessionCount: 0,
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...PREFERENCE_DEFAULTS,
      hydrated: false,
      set: (patch) => set(patch),
      reset: () => set({ ...PREFERENCE_DEFAULTS }),
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

/** Regional defaults from the device locale (used by onboarding). */
export function regionalDefaults(regionCode: string | null | undefined, currencyCode: string | null | undefined): Pick<PreferencesState, 'unitSystem' | 'currency' | 'firstDayOfWeek'> {
  const region = (regionCode ?? '').toUpperCase();
  const imperial = ['US', 'LR', 'MM'].includes(region);
  const sundayFirst = ['US', 'CA', 'MX', 'BR', 'JP', 'IL', 'PH', 'AU'].includes(region);
  return {
    unitSystem: imperial ? 'imperial' : 'metric',
    currency: currencyCode && /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : 'USD',
    firstDayOfWeek: sundayFirst ? 'sunday' : 'monday',
  };
}
