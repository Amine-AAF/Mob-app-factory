import type { SessionExercise, SessionWithExercises, WorkoutSession } from '@/types';

/**
 * Pure active-workout logic. Every time value is derived from instants stored in
 * SQLite (started_at, paused_at, paused_total_ms, rest_ends_at), never from a
 * counter that must keep running. So when Android backgrounds or kills the app,
 * when the screen locks, or when the system clock jumps, re-opening the session
 * gives the right numbers: nothing depends on JavaScript having been executing.
 */

/** Active (non-paused) time of a session in ms, clamped to ≥ 0 (clock moved backwards). */
export function elapsedMs(s: Pick<WorkoutSession, 'startedAt' | 'pausedAt' | 'pausedTotalMs' | 'endedAt'>, now: number): number {
  const end = s.endedAt ?? s.pausedAt ?? now;
  return Math.max(0, end - s.startedAt - s.pausedTotalMs);
}

/** Remaining rest in whole seconds (0 when no rest is running or it is over). */
export function restRemainingSec(s: Pick<WorkoutSession, 'restEndsAt' | 'pausedAt'>, now: number): number {
  if (!s.restEndsAt) return 0;
  const ref = s.pausedAt ?? now;
  return Math.max(0, Math.ceil((s.restEndsAt - ref) / 1000));
}

/** Pausing freezes the clock; resuming adds the paused span and shifts a running rest timer. */
export function pausePatch(s: WorkoutSession, now: number): Partial<WorkoutSession> | null {
  if (s.status !== 'active') return null;
  return { status: 'paused', pausedAt: now };
}

export function resumePatch(s: WorkoutSession, now: number): Partial<WorkoutSession> | null {
  if (s.status !== 'paused' || s.pausedAt === null) return null;
  const span = Math.max(0, now - s.pausedAt);
  return {
    status: 'active',
    pausedAt: null,
    pausedTotalMs: s.pausedTotalMs + span,
    restEndsAt: s.restEndsAt ? s.restEndsAt + span : null,
  };
}

export function startRestPatch(restSec: number, now: number): Partial<WorkoutSession> {
  const sec = Math.max(0, Math.round(restSec));
  return sec > 0 ? { restStartedAt: now, restEndsAt: now + sec * 1000 } : { restStartedAt: null, restEndsAt: null };
}

/** +/- seconds on a running rest, never below "now". */
export function adjustRestPatch(s: WorkoutSession, deltaSec: number, now: number): Partial<WorkoutSession> | null {
  if (!s.restEndsAt) return null;
  return { restEndsAt: Math.max(now, s.restEndsAt + deltaSec * 1000) };
}

export const clearRestPatch: Partial<WorkoutSession> = { restStartedAt: null, restEndsAt: null };

export function isExerciseFinished(e: SessionExercise): boolean {
  return e.status !== 'pending' || e.sets.length >= e.targetSets;
}

/** Index of the next exercise still to do, starting after `from` and wrapping; -1 when all done. */
export function nextPendingIndex(exercises: SessionExercise[], from: number): number {
  const n = exercises.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (!isExerciseFinished(exercises[i]!)) return i;
  }
  return -1;
}

export interface WorkoutProgress {
  doneSets: number;
  totalSets: number;
  /** 0..1 — skipped exercises count as resolved. */
  ratio: number;
  doneExercises: number;
  totalExercises: number;
}

export function progressOf(session: Pick<SessionWithExercises, 'exercises'>): WorkoutProgress {
  let doneSets = 0;
  let totalSets = 0;
  let resolved = 0;
  for (const e of session.exercises) {
    const target = Math.max(e.targetSets, e.sets.length);
    totalSets += target;
    doneSets += e.status === 'skipped' ? target : Math.min(e.sets.length, target);
    if (isExerciseFinished(e)) resolved++;
  }
  return {
    doneSets,
    totalSets,
    ratio: totalSets ? doneSets / totalSets : 0,
    doneExercises: resolved,
    totalExercises: session.exercises.length,
  };
}

/**
 * Values pre-filled for the next set: what the user did on the previous set of this
 * exercise in this session, otherwise the planned targets, otherwise the last
 * performance from history.
 */
export function suggestedSet(
  e: SessionExercise,
  lastFromHistory?: { reps: number | null; weightKg: number | null; durationSec: number | null; distanceM: number | null } | null,
): { reps: number | null; weightKg: number | null; durationSec: number | null; distanceM: number | null } {
  const prev = e.sets[e.sets.length - 1];
  if (prev) return { reps: prev.reps, weightKg: prev.weightKg, durationSec: prev.durationSec, distanceM: prev.distanceM };
  return {
    reps: e.repsMax ?? e.repsMin ?? lastFromHistory?.reps ?? null,
    weightKg: e.weightKg ?? lastFromHistory?.weightKg ?? null,
    durationSec: e.durationSec ?? lastFromHistory?.durationSec ?? null,
    distanceM: e.distanceM ?? lastFromHistory?.distanceM ?? null,
  };
}

/** A session left "active" for more than this is offered for resume-or-finish, not auto-resumed silently. */
export const STALE_SESSION_MS = 12 * 60 * 60 * 1000;

export function isStale(s: Pick<WorkoutSession, 'startedAt' | 'pausedAt' | 'pausedTotalMs' | 'endedAt'>, now: number): boolean {
  return elapsedMs(s, now) > STALE_SESSION_MS;
}

/** Final duration stored when a session completes (whole seconds of active time). */
export function finalDurationSec(s: WorkoutSession, now: number): number {
  const base = s.status === 'paused' && s.pausedAt ? s.pausedAt : now;
  return Math.round(Math.max(0, base - s.startedAt - s.pausedTotalMs) / 1000);
}
