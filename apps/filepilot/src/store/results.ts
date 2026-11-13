import { create } from 'zustand';

import type { OperationOutcome } from '@/services/operations/runner';

/**
 * Results of operations finished in this session, for the result screen
 * (before/after previews need the original's temp URI, which history doesn't keep).
 * Past results are re-loaded from history instead.
 */
export interface ResultExtras {
  /** Temporary copy of the original image, for the before/after preview. */
  originalPreviewUri?: string;
  originalWidth?: number;
  originalHeight?: number;
  notes?: string[];
}

type Completed = Extract<OperationOutcome, { status: 'completed' }>;

interface ResultsState {
  byId: Record<string, Completed & { extras: ResultExtras }>;
  put: (outcome: Completed, extras?: ResultExtras) => void;
}

export const useResults = create<ResultsState>()((set) => ({
  byId: {},
  put: (outcome, extras = {}) => set((s) => ({ byId: { ...s.byId, [outcome.id]: { ...outcome, extras } } })),
}));
