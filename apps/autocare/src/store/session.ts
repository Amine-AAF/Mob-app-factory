import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory app state. The source of truth for user data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  today: string;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  setToday: (day: string) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set, get) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  today: '',
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  setToday: (today) => get().today !== today && set({ today }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
