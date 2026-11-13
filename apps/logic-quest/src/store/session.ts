import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory app state. The source of truth for progress stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  /** One-time "remove ads" purchase (independent of the subscription). */
  adsRemoved: boolean;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Achievements unlocked since the last time the UI displayed them. */
  pendingAchievements: string[];
  /** Bumped after any progress write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setAdsRemoved: (v: boolean) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  pushAchievements: (ids: string[]) => void;
  takeAchievements: () => string[];
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set, get) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  adsRemoved: false,
  plans: [],
  storeAvailable: false,
  pendingAchievements: [],
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setAdsRemoved: (adsRemoved) => set({ adsRemoved }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  pushAchievements: (ids) => ids.length && set((s) => ({ pendingAchievements: [...s.pendingAchievements, ...ids] })),
  takeAchievements: () => {
    const ids = get().pendingAchievements;
    if (ids.length) set({ pendingAchievements: [] });
    return ids;
  },
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
/** Premium users and buyers of the ad-removal product never see ads. */
export const useAdsDisabled = () => useSession((s) => s.entitlement.isPremium || s.adsRemoved);
