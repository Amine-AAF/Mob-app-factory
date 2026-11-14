import type { EntitlementState, PlanOption } from '@factory/monetization';
import { FREE_STATE } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory session state. The source of truth for user data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  markDbReady: () => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  markDbReady: () => set({ dbReady: true }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);

/** Call after any database write. */
export function dataChanged(): void {
  useSession.getState().bump();
}
