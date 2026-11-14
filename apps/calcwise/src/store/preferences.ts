import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PaletteId } from '@/constants/theme';
import type { InterfaceLanguage } from '@/i18n';
import type { AngleMode } from '@/services/MathematicalEngine';

/**
 * Boot-critical, lightweight preferences kept in AsyncStorage (readable before
 * SQLite opens). Calculation history lives in SQLite.
 */
export type NumberFormatPreference = 'auto' | 'en-US' | 'fr-FR' | 'de-DE' | 'de-CH';

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  palette: PaletteId;
  numberFormat: NumberFormatPreference;
  /** ISO 4217 code; null = device region currency. */
  currency: string | null;
  angleMode: AngleMode;
  calculatorMode: 'standard' | 'scientific';
  haptics: boolean;
  /** Default VAT rate (percent string) for the shopping calculator. */
  defaultVat: string;
  defaultTip: string;
  analyticsConsent: boolean;
  sessionCount: number;
  /** Interstitial frequency capping. */
  lastInterstitialAt: number;
  activitiesSinceInterstitial: number;
  /** Epoch ms until which a rewarded ad unlocks Premium tools. */
  rewardedUnlockUntil: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'calcwise');

export const PREFERENCE_DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  palette: 'ember' as PaletteId,
  numberFormat: 'auto' as NumberFormatPreference,
  currency: null,
  angleMode: 'deg' as AngleMode,
  calculatorMode: 'standard' as const,
  haptics: true,
  defaultVat: '20',
  defaultTip: '15',
  analyticsConsent: false,
  sessionCount: 0,
  lastInterstitialAt: 0,
  activitiesSinceInterstitial: 0,
  rewardedUnlockUntil: 0,
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
