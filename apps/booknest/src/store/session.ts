import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

/** In-memory app state. The source of truth for user data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  /** Current local day; refreshed when the app returns to the foreground. */
  today: string;
  /** Goals reached since the last celebration was shown. */
  celebrations: string[];
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  setToday: (day: string) => void;
  celebrate: (goalIds: string[]) => void;
  takeCelebrations: () => string[];
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set, get) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  today: '',
  celebrations: [],
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  setToday: (today) => get().today !== today && set({ today }),
  celebrate: (ids) => ids.length && set((s) => ({ celebrations: [...s.celebrations, ...ids] })),
  takeCelebrations: () => {
    const ids = get().celebrations;
    if (ids.length) set({ celebrations: [] });
    return ids;
  },
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
export const isPremiumNow = () => useSession.getState().entitlement.isPremium;
