import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical preferences kept in AsyncStorage (readable before SQLite opens).
 * Everything the user produces (answers, notes, history) lives in SQLite.
 */
export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  theme: ThemePreference;
  analyticsConsent: boolean;
  /** Mock interview: show a countdown per question (optional, off by default). */
  mockTimerEnabled: boolean;
  sessionCount: number;
  /** Extra free mock interviews unlocked with a rewarded ad, valid for one local day. */
  bonusMocks: { day: string; count: number } | null;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'interviewready');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  theme: 'system' as ThemePreference,
  analyticsConsent: false,
  mockTimerEnabled: false,
  sessionCount: 0,
  bonusMocks: null,
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
