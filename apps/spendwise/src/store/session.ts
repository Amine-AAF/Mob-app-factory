import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

import { DEFAULT_SETTINGS, type AppSettings } from '@/database/repositories/core';

/** In-memory session state. SQLite stays the source of truth for financial data. */
interface SessionState {
  dbReady: boolean;
  settings: AppSettings;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  setSettings: (s: AppSettings) => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  settings: DEFAULT_SETTINGS,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  setSettings: (settings) => set({ settings }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
/** Main currency; USD until the user picks one during onboarding. */
export const useMainCurrency = () => useSession((s) => s.settings.mainCurrency ?? 'USD');
