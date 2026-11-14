import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory session state. The source of truth for persisted data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  petCount: number;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  markDbReady: () => void;
  setPetCount: (n: number) => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  petCount: 0,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  markDbReady: () => set({ dbReady: true }),
  setPetCount: (petCount) => set({ petCount }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
