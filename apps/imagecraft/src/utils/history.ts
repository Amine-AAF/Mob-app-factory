/**
 * Undo / redo stack (pure). `present` is the current state; pushes clear the redo branch.
 * Consecutive pushes sharing the same `coalesceKey` (e.g. one slider being dragged)
 * replace the present instead of creating one entry per frame.
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
}

export function createHistory<T>(initial: T): History<T> {
  return { past: [], present: initial, future: [], lastKey: null };
}

export function push<T>(h: History<T>, next: T, depth: number, coalesceKey: string | null = null): History<T> {
  if (coalesceKey && coalesceKey === h.lastKey) return { ...h, present: next, future: [] };
  const past = [...h.past, h.present];
  while (past.length > depth) past.shift();
  return { past, present: next, future: [], lastKey: coalesceKey };
}

export function undo<T>(h: History<T>): History<T> {
  const previous = h.past[h.past.length - 1];
  if (previous === undefined) return h;
  return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future], lastKey: null };
}

export function redo<T>(h: History<T>): History<T> {
  const next = h.future[0];
  if (next === undefined) return h;
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1), lastKey: null };
}

export const canUndo = <T>(h: History<T>) => h.past.length > 0;
export const canRedo = <T>(h: History<T>) => h.future.length > 0;

/** Back to the initial state, as a new undoable step. */
export function resetTo<T>(h: History<T>, initial: T, depth: number): History<T> {
  return push(h, initial, depth);
}
