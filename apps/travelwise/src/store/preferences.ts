import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical preferences kept in AsyncStorage (readable before SQLite opens).
 * Trip data lives in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  defaultCurrency: CurrencyCode;
  /** Ask for biometrics / device PIN before showing travel documents (off by default). */
  documentsLock: boolean;
  /** Extra active-trip slots earned with rewarded ads (free tier only). */
  bonusTripSlots: number;
  /** Interstitial frequency capping. */
  lastInterstitialAt: number | null;
  activitiesSinceInterstitial: number;
  /** Opt-in only. */
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

export const kv = createKeyValueStore(AsyncStorage, 'travelwise');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  defaultCurrency: DEFAULT_CURRENCY,
  analyticsConsent: false,
  documentsLock: false,
  bonusTripSlots: 0,
  lastInterstitialAt: null as number | null,
  activitiesSinceInterstitial: 0,
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
