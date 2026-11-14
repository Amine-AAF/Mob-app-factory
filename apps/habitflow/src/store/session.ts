import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory app state. The source of truth for user data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Current local day; refreshed when the app returns to the foreground or at midnight. */
  today: string;
  pendingAchievements: string[];
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  setToday: (day: string) => void;
  pushAchievements: (ids: string[]) => void;
  takeAchievements: () => string[];
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set, get) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  today: '',
  pendingAchievements: [],
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  setToday: (today) => get().today !== today && set({ today }),
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
