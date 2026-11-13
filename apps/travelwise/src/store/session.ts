import { create } from 'zustand';

/**
 * In-memory session state. `dataVersion` is bumped after every write so screens
 * using `useAsync` reload from SQLite (single source of truth, no cached copies).
 */
interface SessionState {
  dbReady: boolean;
  dataVersion: number;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  dataVersion: 0,
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

/** Call after any mutation so lists and dashboards refresh. */
export const notifyDataChanged = () => useSession.getState().bump();
