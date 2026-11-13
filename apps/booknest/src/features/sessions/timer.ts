import type { SessionTimer } from '@/types';

/**
 * Timed reading sessions are computed from timestamps only. Nothing ticks in the
 * background: when Android suspends or kills the app, the elapsed time is still
 * exact on return because it is derived from `startedAt`, `pausedAt` and `pausedMs`.
 */

/** Sessions longer than this are suspicious (e.g. a forgotten timer) and must be confirmed. */
export const MAX_PLAUSIBLE_SESSION_SEC = 8 * 3600;
/** Sessions shorter than this are discarded as accidental taps. */
export const MIN_SESSION_SEC = 30;

export function elapsedMs(timer: Pick<SessionTimer, 'startedAt' | 'pausedAt' | 'pausedMs'>, now: Date): number {
  const start = Date.parse(timer.startedAt);
  const end = timer.pausedAt ? Date.parse(timer.pausedAt) : now.getTime();
  // A clock moved backwards must never produce negative durations.
  return Math.max(0, end - start - timer.pausedMs);
}

export function elapsedSec(timer: Pick<SessionTimer, 'startedAt' | 'pausedAt' | 'pausedMs'>, now: Date): number {
  return Math.floor(elapsedMs(timer, now) / 1000);
}

export function pauseTimer<T extends SessionTimer>(timer: T, now: Date): T {
  if (timer.pausedAt) return timer;
  return { ...timer, pausedAt: now.toISOString() };
}

export function resumeTimer<T extends SessionTimer>(timer: T, now: Date): T {
  if (!timer.pausedAt) return timer;
  const pausedFor = Math.max(0, now.getTime() - Date.parse(timer.pausedAt));
  return { ...timer, pausedAt: null, pausedMs: timer.pausedMs + pausedFor };
}

export type FinishCheck = 'ok' | 'too_short' | 'too_long';

export function checkDuration(seconds: number): FinishCheck {
  if (seconds < MIN_SESSION_SEC) return 'too_short';
  if (seconds > MAX_PLAUSIBLE_SESSION_SEC) return 'too_long';
  return 'ok';
}

export class SessionError extends Error {
  constructor(public readonly code: 'end_before_start' | 'invalid_pages' | 'too_long' | 'future' | 'timer_running' | 'no_timer') {
    super(`Session error: ${code}`);
    this.name = 'SessionError';
  }
}

export interface ManualSessionInput {
  startedAt: Date;
  endedAt: Date;
  startPage: number | null;
  endPage: number | null;
}

/** Validates a manually entered session (no negative durations, no backwards pages, not in the future). */
export function validateManualSession(input: ManualSessionInput, now: Date, totalPages: number | null): number {
  const sec = Math.round((input.endedAt.getTime() - input.startedAt.getTime()) / 1000);
  if (sec <= 0) throw new SessionError('end_before_start');
  if (sec > 24 * 3600) throw new SessionError('too_long');
  if (input.endedAt.getTime() > now.getTime() + 60_000) throw new SessionError('future');
  const { startPage: a, endPage: b } = input;
  if (a != null && (a < 0 || !Number.isInteger(a))) throw new SessionError('invalid_pages');
  if (b != null && (b < 0 || !Number.isInteger(b))) throw new SessionError('invalid_pages');
  if (a != null && b != null && b < a) throw new SessionError('invalid_pages');
  if (totalPages != null && ((a ?? 0) > totalPages || (b ?? 0) > totalPages)) throw new SessionError('invalid_pages');
  return sec;
}

/** Pages read in a session, only when both bounds are known. */
export function sessionPages(startPage: number | null, endPage: number | null): number | null {
  if (startPage == null || endPage == null) return null;
  return Math.max(0, endPage - startPage);
}
