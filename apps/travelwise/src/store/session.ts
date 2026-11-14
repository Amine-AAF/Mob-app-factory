import { create } from 'zustand';

/**
 * In-memory session state. `dataVersion` is bumped after every write so screens
 * using `useAsync` reload from SQLite (single source of truth, no cached copies).
 */
interface SessionState {
  dbReady: boolean;
  dataVersion: number;
  /** When the Documents section was last unlocked (ms), null = locked. Never persisted. */
  documentsUnlockedAt: number | null;
  setDocumentsUnlockedAt: (at: number | null) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  dataVersion: 0,
  documentsUnlockedAt: null,
  setDocumentsUnlockedAt: (at) => set({ documentsUnlockedAt: at }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

/** Call after any mutation so lists and dashboards refresh. */
export const notifyDataChanged = () => useSession.getState().bump();
