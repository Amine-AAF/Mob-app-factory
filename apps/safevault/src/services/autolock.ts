/**
 * Auto-lock policy (pure). Timers are not reliable while Android freezes a backgrounded app,
 * so the decision is re-evaluated from timestamps when the app becomes active again.
 */
export const AUTO_LOCK_CHOICES = [0, 30, 60, 300, 900, 1800] as const; // seconds; 0 = immediately
export const DEFAULT_AUTO_LOCK = 60;

export interface AutoLockState {
  /** epoch ms of the last user interaction while in the foreground */
  lastActivityAt: number;
  /** epoch ms when the app went to background, null if in foreground */
  backgroundedAt: number | null;
}

/** Should the vault be locked now? */
export function shouldLock(state: AutoLockState, timeoutSeconds: number, now: number): boolean {
  const timeoutMs = Math.max(0, timeoutSeconds) * 1000;
  if (state.backgroundedAt !== null) return now - state.backgroundedAt >= timeoutMs;
  // In the foreground, "immediately" means after one minute of inactivity at most:
  // locking while the user is reading would be hostile.
  const idleMs = timeoutMs === 0 ? 60_000 : timeoutMs;
  return now - state.lastActivityAt >= idleMs;
}
