import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

import { usePreferences } from './preferences';

/** In-memory app state. Persistent data stays in SQLite / AsyncStorage. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any history/favorites write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

/** Verified Premium (store, or offline cache within its grace period). */
export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);

export function isPremiumNow(): boolean {
  return useSession.getState().entitlement.isPremium;
}

/**
 * Access to advanced tools: Premium, or a temporary unlock earned by watching a
 * rewarded ad (the unlock never removes ads and never extends history limits).
 */
export function hasAdvancedAccess(now: number): boolean {
  return isPremiumNow() || usePreferences.getState().rewardedUnlockUntil > now;
}
