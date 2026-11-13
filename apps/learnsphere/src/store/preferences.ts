import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_SRS, type SrsSettings } from '@/config/limits';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical and per-device preferences kept in AsyncStorage (readable before SQLite opens).
 * Learning data lives in SQLite.
 */
export type DashboardCard = 'today' | 'goals' | 'suggestions' | 'reviews' | 'exams' | 'courses' | 'week' | 'subjects';
export const DASHBOARD_CARDS: DashboardCard[] = ['today', 'suggestions', 'goals', 'reviews', 'exams', 'week', 'courses', 'subjects'];

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  learnerName: string;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  /** Premium personalisation: accent override (null = brand default). */
  accentColor: string | null;
  /** Reading comfort for notes and flashcards. */
  readingSize: 'normal' | 'large' | 'xlarge';
  /** Minutes the learner wants to study per day (drives suggestions and the daily ring). */
  dailyMinutes: number;
  dashboardCards: DashboardCard[];
  srs: SrsSettings;
  hapticsEnabled: boolean;
  keepScreenAwakeInFocus: boolean;
  analyticsConsent: boolean;
  sessionCount: number;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'learnsphere');

const DEFAULTS = {
  onboardingCompleted: false,
  learnerName: '',
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  accentColor: null,
  readingSize: 'normal' as const,
  dailyMinutes: 60,
  dashboardCards: DASHBOARD_CARDS,
  srs: DEFAULT_SRS,
  hapticsEnabled: true,
  keepScreenAwakeInFocus: false,
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

export const READING_SCALE = { normal: 1, large: 1.15, xlarge: 1.3 } as const;
