import type { ThemePreference } from '@factory/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical, non-financial preferences kept in AsyncStorage (readable before SQLite opens).
 * Financial data and finance settings (main currency, thresholds) live in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  /** Hides every amount on screen (one tap from the dashboard). */
  privacyMode: boolean;
  analyticsConsent: boolean;
  sessionCount: number;
  /** Ads pacing (no financial data). */
  lastInterstitialAt: number;
  actionsSinceInterstitial: number;
  /** Rewarded unlock of detailed reports, valid until this epoch ms. */
  reportsUnlockedUntil: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'spendwise');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  privacyMode: false,
  analyticsConsent: false,
  sessionCount: 0,
  lastInterstitialAt: 0,
  actionsSinceInterstitial: 0,
  reportsUnlockedUntil: 0,
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
