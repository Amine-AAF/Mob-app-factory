/**
 * Failed-unlock policy (pure).
 *
 * The first FREE_ATTEMPTS mistakes cost nothing (typos). After that every failure imposes
 * an exponentially growing wait, capped at MAX_DELAY_MS. The counter and deadline are
 * persisted, so restarting the app does not reset them.
 *
 * Limits (documented in SECURITY.md): this slows down someone guessing on the device's UI.
 * It does not stop an attacker who copied the database file — that attacker is slowed down
 * only by Argon2id. The vault is never auto-wiped (a child or a thief could otherwise destroy
 * the user's data on purpose).
 */
export const FREE_ATTEMPTS = 5;
export const BASE_DELAY_MS = 30_000;
export const MAX_DELAY_MS = 15 * 60_000;

export function lockoutDelayMs(failedAttempts: number): number {
  if (failedAttempts < FREE_ATTEMPTS) return 0;
  const exp = failedAttempts - FREE_ATTEMPTS;
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.min(exp, 20));
}

export interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number;
}

export function registerFailure(state: LockoutState, now: number): LockoutState {
  const failedAttempts = state.failedAttempts + 1;
  const delay = lockoutDelayMs(failedAttempts);
  return { failedAttempts, lockoutUntil: delay > 0 ? now + delay : 0 };
}

export function remainingLockoutMs(state: LockoutState, now: number): number {
  return Math.max(0, state.lockoutUntil - now);
}

/** Attempts left before the next failure triggers a wait. */
export function attemptsBeforeDelay(failedAttempts: number): number {
  return Math.max(0, FREE_ATTEMPTS - 1 - failedAttempts);
}
