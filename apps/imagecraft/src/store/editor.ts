import { create } from 'zustand';

import { SAFETY_LIMITS } from '@/constants/limits';
import { initialEditState, type EditState, type SourceImage } from '@/types/image';
import { canRedo, canUndo, createHistory, push, redo, resetTo, undo, type History } from '@/utils/history';

/**
 * The picture currently open in the editor (Edit tab) and its undo/redo history.
 * The source is a private copy: the user's original is never modified.
 */
export type EditorPanel = 'crop' | 'adjust' | 'filters' | 'text' | 'watermark';

interface EditorState {
  source: SourceImage | null;
  projectId: string | null;
  history: History<EditState>;
  panel: EditorPanel;
  open: (source: SourceImage, opts?: { editState?: EditState | null; projectId?: string | null; panel?: EditorPanel }) => void;
  apply: (next: EditState, coalesceKey?: string | null) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  setPanel: (panel: EditorPanel) => void;
  setProjectId: (id: string) => void;
  close: () => void;
}

export const useEditor = create<EditorState>()((set) => ({
  source: null,
  projectId: null,
  history: createHistory(initialEditState()),
  panel: 'crop',
  open: (source, opts) =>
    set({ source, projectId: opts?.projectId ?? null, history: createHistory(opts?.editState ?? initialEditState()), panel: opts?.panel ?? 'crop' }),
  apply: (next, key = null) => set((s) => ({ history: push(s.history, next, SAFETY_LIMITS.undoDepth, key) })),
  undo: () => set((s) => ({ history: undo(s.history) })),
  redo: () => set((s) => ({ history: redo(s.history) })),
  reset: () => set((s) => ({ history: resetTo(s.history, initialEditState(), SAFETY_LIMITS.undoDepth) })),
  setPanel: (panel) => set({ panel }),
  setProjectId: (projectId) => set({ projectId }),
  close: () => set({ source: null, projectId: null, history: createHistory(initialEditState()) }),
}));

export const useEditState = () => useEditor((s) => s.history.present);
export const useCanUndo = () => useEditor((s) => canUndo(s.history));
export const useCanRedo = () => useEditor((s) => canRedo(s.history));
