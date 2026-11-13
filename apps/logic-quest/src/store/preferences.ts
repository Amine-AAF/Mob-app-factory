import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Difficulty, TimerOption } from '@/engine';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical and lightweight preferences kept in AsyncStorage (readable
 * before SQLite opens). Game progress lives in SQLite.
 */
export type MotionPreference = 'system' | 'reduce' | 'full';

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  analyticsConsent: boolean;
  haptics: boolean;
  motion: MotionPreference;
  /** Memory challenges show items 1.5× longer (accessibility). */
  relaxedTiming: boolean;
  startingDifficulty: Difficulty;
  defaultTimer: TimerOption;
  sessionCount: number;
  /** Interstitial frequency capping. */
  lastInterstitialAt: number;
  activitiesSinceInterstitial: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'logic-quest');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  analyticsConsent: false,
  haptics: true,
  motion: 'system' as MotionPreference,
  relaxedTiming: false,
  startingDifficulty: 'easy' as Difficulty,
  defaultTimer: 0 as TimerOption,
  sessionCount: 0,
  lastInterstitialAt: 0,
  activitiesSinceInterstitial: 0,
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
