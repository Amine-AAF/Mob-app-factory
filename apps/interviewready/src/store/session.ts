import type { EntitlementState, PlanOption } from '@factory/monetization';
import { FREE_STATE } from '@factory/monetization';
import { create } from 'zustand';

import type { UserProfile } from '@/database/repositories/profileRepository';

/** In-memory session state. The source of truth for persisted data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  profile: UserProfile | null;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Bumped after any user-data write so screens reload their data. */
  dataVersion: number;
  setProfile: (p: UserProfile | null) => void;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  profile: null,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  dataVersion: 0,
  setProfile: (profile) => set({ profile }),
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
