import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { WeightUnit } from '@/domain/units';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical and display preferences kept in AsyncStorage (readable before SQLite opens).
 * Pet data never goes here: it lives in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  weightUnit: WeightUnit;
  /** ISO 4217 code used as default for new expenses. */
  currency: string;
  monthlyBudget: number | null;
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'petcare');

export const PREFERENCE_DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  weightUnit: 'kg' as WeightUnit,
  currency: 'USD',
  monthlyBudget: null,
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

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'MAD', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'BRL', 'XOF', 'JPY', 'INR'] as const;

/** Default currency from the device region (falls back to USD). */
export function defaultCurrency(currencyCode: string | null | undefined): string {
  return currencyCode && /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : 'USD';
}
