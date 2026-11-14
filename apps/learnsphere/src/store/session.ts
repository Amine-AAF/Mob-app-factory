import type { EntitlementState, PlanOption } from '@factory/monetization';
import { FREE_STATE } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory session state. The source of truth for learning data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  /** Achievement ids unlocked during this session, shown as a gentle toast. */
  celebrate: string[];
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  markDbReady: () => void;
  bump: () => void;
  pushCelebration: (ids: string[]) => void;
  shiftCelebration: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  celebrate: [],
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
  pushCelebration: (ids) => set((s) => ({ celebrate: [...s.celebrate, ...ids] })),
  shiftCelebration: () => set((s) => ({ celebrate: s.celebrate.slice(1) })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
