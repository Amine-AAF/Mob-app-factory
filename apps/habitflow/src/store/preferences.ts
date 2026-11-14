import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_WEEKLY_GOAL_PERCENT } from '@/constants';
import type { PaletteId } from '@/config/brand';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical, lightweight preferences kept in AsyncStorage (readable before
 * SQLite opens). Habits, logs, tasks and reminders live in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  /** Extra color palettes are a Premium personalization. */
  palette: PaletteId;
  analyticsConsent: boolean;
  haptics: boolean;
  /** Dashboard personalization: which optional sections are shown on Today. */
  showPlannerOnToday: boolean;
  showInsightOnToday: boolean;
  weeklyGoalPercent: number;
  goals: string[];
  sessionCount: number;
  lastInterstitialAt: number;
  activitiesSinceInterstitial: number;
  /** Epoch ms until which a rewarded ad unlocked advanced insights. */
  insightsUnlockedUntil: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'habitflow');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  palette: 'flow' as PaletteId,
  analyticsConsent: false,
  haptics: true,
  showPlannerOnToday: true,
  showInsightOnToday: true,
  weeklyGoalPercent: DEFAULT_WEEKLY_GOAL_PERCENT,
  goals: [] as string[],
  sessionCount: 0,
  lastInterstitialAt: 0,
  activitiesSinceInterstitial: 0,
  insightsUnlockedUntil: 0,
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
