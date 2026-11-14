import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Level, ProgramGoal } from '@/content/types';
import { DEFAULT_UNITS, type DistanceUnit, type LengthUnit, type WeightUnit } from '@/features/units';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical, lightweight preferences kept in AsyncStorage (readable before
 * SQLite opens). Workouts, measurements and everything personal live in SQLite.
 * Language and units are independent choices.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  lengthUnit: LengthUnit;
  analyticsConsent: boolean;
  haptics: boolean;
  /** Workout cues (rest end, timer phases). */
  sound: boolean;
  vibration: boolean;
  keepScreenOn: boolean;
  /** Local notification when a rest ends while the app is in the background. */
  restNotification: boolean;
  defaultRestSec: number;
  autoStartRest: boolean;
  weeklyTarget: number;
  level: Level;
  goal: ProgramGoal;
  sessionCount: number;
  lastInterstitialAt: number;
  activitiesSinceInterstitial: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'fittrack');

export const DEFAULT_PREFERENCES = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  weightUnit: DEFAULT_UNITS.weight,
  distanceUnit: DEFAULT_UNITS.distance,
  lengthUnit: DEFAULT_UNITS.length,
  analyticsConsent: false,
  haptics: true,
  sound: true,
  vibration: true,
  keepScreenOn: true,
  restNotification: true,
  defaultRestSec: 90,
  autoStartRest: true,
  weeklyTarget: 3,
  level: 'beginner' as Level,
  goal: 'general_fitness' as ProgramGoal,
  sessionCount: 0,
  lastInterstitialAt: 0,
  activitiesSinceInterstitial: 0,
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      hydrated: false,
      set: (patch) => set(patch),
      reset: () => set({ ...DEFAULT_PREFERENCES }),
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

export const useUnits = () => {
  const weight = usePreferences((s) => s.weightUnit);
  const distance = usePreferences((s) => s.distanceUnit);
  const length = usePreferences((s) => s.lengthUnit);
  return { weight, distance, length };
};
