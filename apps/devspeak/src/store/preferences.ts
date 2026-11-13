import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@factory/design-system';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { InterfaceLanguage } from '@/i18n';

/**
 * Boot-critical preferences kept in AsyncStorage (readable before SQLite opens).
 * Everything else lives in SQLite.
 */
export type TranslationPreference = 'auto' | 'fr' | 'es' | 'none';

export interface PreferencesState {
  hydrated: boolean;
  onboardingCompleted: boolean;
  interfaceLanguage: InterfaceLanguage | null; // null = follow device
  translationLanguage: TranslationPreference;
  theme: ThemePreference;
  analyticsConsent: boolean;
  speechRate: number;
  sessionCount: number;
  /** Extra free practice exercises unlocked via a rewarded ad, valid for one local day. */
  bonusPractice: { day: string; count: number } | null;
  set: (patch: Partial<Omit<PreferencesState, 'set' | 'hydrated' | 'reset'>>) => void;
  reset: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'devspeak');

const DEFAULTS = {
  onboardingCompleted: false,
  interfaceLanguage: null,
  translationLanguage: 'auto' as TranslationPreference,
  theme: 'system' as ThemePreference,
  analyticsConsent: false,
  speechRate: 0.95,
  sessionCount: 0,
  bonusPractice: null,
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

/** Resolves which helper translation to display (English UI defaults to none). */
export function resolveTranslationLanguage(pref: TranslationPreference, ui: InterfaceLanguage): 'fr' | 'es' | null {
  if (pref === 'none') return null;
  if (pref === 'fr' || pref === 'es') return pref;
  return ui === 'fr' || ui === 'es' ? ui : null;
}
