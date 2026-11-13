import type { EntitlementState, PlanOption } from '@factory/monetization';
import { FREE_STATE } from '@factory/monetization';
import { create } from 'zustand';

import type { Home } from '@/domain/types';

/** In-memory session state. The source of truth for persisted data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  homes: Home[];
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any write so focused screens reload their data. */
  dataVersion: number;
  setHomes: (homes: Home[]) => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  homes: [],
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  setHomes: (homes) => set({ homes }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
