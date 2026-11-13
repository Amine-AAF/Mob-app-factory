import type { ThemePreference } from '@factory/design-system';
import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

import { DEFAULT_GENERATOR_OPTIONS, type GeneratorOptions } from '@/features/generator/generator';
import { DEFAULT_AUTO_LOCK } from '@/services/autolock';

export type Language = 'en' | 'fr' | 'es';

/** Non-secret preferences, persisted in the SQLite `settings` table (key "app"). */
export interface AppSettings {
  language: Language | null; // null = follow the device
  theme: ThemePreference;
  accent: string | null; // Premium personalisation
  autoLockSeconds: number;
  clipboardClearSeconds: number;
  screenProtection: boolean;
  revealOnLongPressOnly: boolean;
  generator: GeneratorOptions;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: null,
  theme: 'system',
  accent: null,
  autoLockSeconds: DEFAULT_AUTO_LOCK,
  clipboardClearSeconds: 30,
  screenProtection: true,
  revealOnLongPressOnly: false,
  generator: DEFAULT_GENERATOR_OPTIONS,
};

export function mergeSettings(stored: Partial<AppSettings> | null | undefined): AppSettings {
  const s = { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  s.generator = { ...DEFAULT_GENERATOR_OPTIONS, ...(stored?.generator ?? {}) };
  return s;
}

interface AppState {
  ready: boolean;
  settings: AppSettings;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  setReady: (ready: boolean) => void;
  applySettings: (s: AppSettings) => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], available: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  ready: false,
  settings: DEFAULT_SETTINGS,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  setReady: (ready) => set({ ready }),
  applySettings: (settings) => set({ settings }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
}));

export const useIsPremium = () => useApp((s) => s.entitlement.isPremium);
