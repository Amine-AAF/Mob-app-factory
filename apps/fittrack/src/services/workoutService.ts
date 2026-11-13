import { toDayKey } from '@factory/app-core';

import type { TemplateDay } from '@/content/types';
import { defaultTargets, type Repositories, type SessionPlanItem, type SetInput } from '@/database';
import { currentBests, detectRecords, type NewRecord } from '@/features/performance/records';
import { finalDurationSec, nextPendingIndex, pausePatch, resumePatch, startRestPatch, clearRestPatch, adjustRestPatch } from '@/features/workout/engine';
import type { PerformanceRecord, ProgramDay, RecordKind, SessionWithExercises, TrackingType } from '@/types';
import { useSession } from '@/store/session';

import { track } from './analytics';
import { clock } from './clock';
import { cancelRestAlert, scheduleRestAlert } from './restAlerts';
import { evaluateAchievements } from './progressService';

/**
 * Active-workout operations. Each call writes to SQLite before returning, so the
 * session survives an unexpected close at any point: the next launch finds it with
 * status 'active'/'paused' and offers to resume (see app/workout/active.tsx).
 */

export class WorkoutError extends Error {
  constructor(public readonly code: 'already_active' | 'empty' | 'not_found' | 'not_active' | 'invalid_set') {
    super(code);
    this.name = 'WorkoutError';
  }
}

const now = () => clock.now().getTime();

function planFromDay(day: ProgramDay): SessionPlanItem[] {
  return day.exercises.map((e) => ({
    exerciseId: e.exerciseId, targetSets: e.sets, repsMin: e.repsMin, repsMax: e.repsMax, weightKg: e.weightKg,
    durationSec: e.durationSec, distanceM: e.distanceM, restSec: e.restSec, notes: e.notes,
  }));
}

export function planFromTemplateDay(day: TemplateDay): SessionPlanItem[] {
  return day.exercises.map((e) => ({
    exerciseId: e.exerciseId, targetSets: e.sets, repsMin: e.repsMin ?? null, repsMax: e.repsMax ?? null, weightKg: null,
    durationSec: e.durationSec ?? null, distanceM: e.distanceM ?? null, restSec: e.restSec, notes: null,
  }));
}

async function ensureNoActive(r: Repositories) {
  if (await r.sessions.active()) throw new WorkoutError('already_active');
}

export async function startFromProgramDay(r: Repositories, programId: string, dayId: string, scheduleId: string | null = null): Promise<string> {
  await ensureNoActive(r);
  const program = await r.programs.get(programId);
  const day = program?.days.find((d) => d.id === dayId);
  if (!program || !day) throw new WorkoutError('not_found');
  if (day.exercises.length === 0) throw new WorkoutError('empty');
  const name = program.days.length > 1 ? `${program.name} · ${day.name}` : program.name;
  const id = await r.sessions.start({ name, day: clock.today(), programId, programDayId: dayId, scheduleId, plan: planFromDay(day) });
  useSession.getState().setActiveSession(id);
  track('workout_started', { from_program: true });
  return id;
}

/** "Quick start": an empty session the user fills as they go. */
export async function startEmpty(r: Repositories, name: string, plan: SessionPlanItem[] = []): Promise<string> {
  await ensureNoActive(r);
  const id = await r.sessions.start({ name, day: clock.today(), programId: null, programDayId: null, scheduleId: null, plan });
  useSession.getState().setActiveSession(id);
  track('workout_started', { from_program: false });
  return id;
}

async function load(r: Repositories, id: string): Promise<SessionWithExercises> {
  const s = await r.sessions.get(id);
  if (!s) throw new WorkoutError('not_found');
  return s;
}

export async function addExerciseToSession(r: Repositories, sessionId: string, exerciseId: string, tracking: TrackingType): Promise<string> {
  const t = defaultTargets(tracking);
  return r.sessions.addExercise(sessionId, { exerciseId, targetSets: t.sets, repsMin: t.repsMin, repsMax: t.repsMax, weightKg: null, durationSec: t.durationSec, distanceM: t.distanceM, restSec: t.restSec, notes: null });
}

function validSet(tracking: TrackingType, s: SetInput): boolean {
  const pos = (n: number | null) => n === null || (Number.isFinite(n) && n >= 0);
  if (![s.reps, s.weightKg, s.durationSec, s.distanceM].every(pos)) return false;
  switch (tracking) {
    case 'weight_reps':
    case 'reps':
      return !!s.reps && s.reps > 0 && s.reps <= 1000 && (s.weightKg ?? 0) <= 1000;
    case 'time':
      return !!s.durationSec && s.durationSec > 0 && s.durationSec <= 6 * 3600;
    case 'distance_time':
      return (!!s.durationSec && s.durationSec > 0) || (!!s.distanceM && s.distanceM > 0);
  }
}

export interface SetResult {
  records: NewRecord[];
  restSec: number;
  exerciseFinished: boolean;
  workoutFinished: boolean;
}

/**
 * Validates a set: stores it, detects personal records against history, starts the
 * rest timer (timestamp-based) and moves to the next exercise once the planned sets are done.
 */
export async function logSet(
  r: Repositories,
  sessionId: string,
  sessionExerciseId: string,
  input: SetInput,
  tracking: TrackingType,
  opts: { autoRest: boolean; restAlerts: { enabled: boolean; title: string; body: string } },
): Promise<SetResult> {
  const session = await load(r, sessionId);
  if (session.status !== 'active' && session.status !== 'paused') throw new WorkoutError('not_active');
  const ex = session.exercises.find((e) => e.id === sessionExerciseId);
  if (!ex) throw new WorkoutError('not_found');
  if (!validSet(tracking, input)) throw new WorkoutError('invalid_set');

  const t = now();
  const set = await r.sessions.addSet(sessionExerciseId, input);
  const bests = currentBests(await r.records.forExercise(ex.exerciseId));
  const found = detectRecords(tracking, set, bests);
  for (const rec of found) await r.records.insert({ exerciseId: ex.exerciseId, sessionId, setId: set.id, kind: rec.kind, value: rec.value, day: session.day, achievedAt: t });

  const doneNow = ex.sets.length + 1 >= ex.targetSets;
  if (doneNow) await r.sessions.setExerciseStatus(ex.id, 'done');
  const fresh = await load(r, sessionId);
  const idx = fresh.exercises.findIndex((e) => e.id === ex.id);
  const next = doneNow ? nextPendingIndex(fresh.exercises, idx) : idx;
  const workoutFinished = doneNow && next === -1;
  const restSec = !workoutFinished && opts.autoRest ? ex.restSec : 0;
  await r.sessions.patch(sessionId, { currentIndex: next === -1 ? idx : next, ...startRestPatch(restSec, t) });
  if (restSec > 0 && opts.restAlerts.enabled) await scheduleRestAlert(t + restSec * 1000, opts.restAlerts.title, opts.restAlerts.body);
  useSession.getState().bump();
  // Only real improvements are celebrated (the first set of an exercise is a baseline).
  return { records: found.filter((f) => f.previous !== null), restSec, exerciseFinished: doneNow, workoutFinished };
}

/** Editing or deleting a set recomputes this exercise's records from scratch (history stays exact). */
export async function editSet(r: Repositories, setId: string, exerciseId: string, tracking: TrackingType, input: SetInput | null): Promise<void> {
  if (input && !validSet(tracking, input)) throw new WorkoutError('invalid_set');
  if (input) await r.sessions.updateSet(setId, input);
  else await r.sessions.deleteSet(setId);
  await rebuildRecords(r, exerciseId, tracking);
  useSession.getState().bump();
}

export async function rebuildRecords(r: Repositories, exerciseId: string, tracking: TrackingType): Promise<void> {
  const facts = await r.sessions.setFacts({ exerciseId });
  // Include the in-progress session too: its sets are real.
  const active = await r.sessions.active();
  const activeSets = active ? ((await r.sessions.get(active.id))?.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.map((s) => ({ ...s, day: active.day, sessionId: active.id }))) ?? []) : [];
  const all = [
    ...facts.map((f) => ({ id: f.setId, sessionExerciseId: '', setIndex: 0, reps: f.reps, weightKg: f.weightKg, durationSec: f.durationSec, distanceM: f.distanceM, completedAt: f.startedAt, day: f.day, sessionId: f.sessionId })),
    ...activeSets,
  ].sort((a, b) => a.completedAt - b.completedAt);
  await r.db.withTransactionAsync(async () => {
    await r.records.deleteForExercise(exerciseId);
    const bests = new Map<RecordKind, PerformanceRecord>();
    for (const s of all) {
      for (const f of detectRecords(tracking, s, bests)) {
        const rec = { exerciseId, sessionId: s.sessionId, setId: s.id, kind: f.kind, value: f.value, day: s.day, achievedAt: s.completedAt };
        await r.records.insert(rec);
        bests.set(f.kind, { id: '', ...rec });
      }
    }
  });
}

export async function skipExercise(r: Repositories, sessionId: string, sessionExerciseId: string): Promise<void> {
  await r.sessions.setExerciseStatus(sessionExerciseId, 'skipped');
  const s = await load(r, sessionId);
  const idx = s.exercises.findIndex((e) => e.id === sessionExerciseId);
  const next = nextPendingIndex(s.exercises, idx);
  await r.sessions.patch(sessionId, { currentIndex: next === -1 ? idx : next, ...clearRestPatch });
  await cancelRestAlert();
  useSession.getState().bump();
}

/** Re-opens a skipped/done exercise (e.g. to add an extra set). */
export async function reopenExercise(r: Repositories, sessionId: string, sessionExerciseId: string, index: number): Promise<void> {
  const s = await load(r, sessionId);
  const ex = s.exercises.find((e) => e.id === sessionExerciseId);
  if (!ex) return;
  if (ex.sets.length >= ex.targetSets) await r.sessions.setTargetSets(ex.id, ex.sets.length + 1);
  await r.sessions.setExerciseStatus(ex.id, 'pending');
  await r.sessions.patch(sessionId, { currentIndex: index });
  useSession.getState().bump();
}

export async function goTo(r: Repositories, sessionId: string, index: number): Promise<void> {
  await r.sessions.patch(sessionId, { currentIndex: Math.max(0, index) });
  useSession.getState().bump();
}

export async function pause(r: Repositories, sessionId: string): Promise<void> {
  const s = await load(r, sessionId);
  const p = pausePatch(s, now());
  if (p) {
    await r.sessions.patch(sessionId, p);
    await cancelRestAlert();
  }
  useSession.getState().bump();
}

export async function resume(r: Repositories, sessionId: string, restAlerts?: { enabled: boolean; title: string; body: string }): Promise<void> {
  const s = await load(r, sessionId);
  const p = resumePatch(s, now());
  if (p) {
    await r.sessions.patch(sessionId, p);
    if (p.restEndsAt && p.restEndsAt > now() && restAlerts?.enabled) await scheduleRestAlert(p.restEndsAt, restAlerts.title, restAlerts.body);
  }
  useSession.getState().bump();
}

export async function startRest(r: Repositories, sessionId: string, sec: number, restAlerts?: { enabled: boolean; title: string; body: string }): Promise<void> {
  const t = now();
  await r.sessions.patch(sessionId, startRestPatch(sec, t));
  if (sec > 0 && restAlerts?.enabled) await scheduleRestAlert(t + sec * 1000, restAlerts.title, restAlerts.body);
  useSession.getState().bump();
}

export async function adjustRest(r: Repositories, sessionId: string, deltaSec: number, restAlerts?: { enabled: boolean; title: string; body: string }): Promise<void> {
  const s = await load(r, sessionId);
  const p = adjustRestPatch(s, deltaSec, now());
  if (!p) return;
  await r.sessions.patch(sessionId, p);
  if (restAlerts?.enabled && p.restEndsAt && p.restEndsAt > now()) await scheduleRestAlert(p.restEndsAt, restAlerts.title, restAlerts.body);
  useSession.getState().bump();
}

export async function skipRest(r: Repositories, sessionId: string): Promise<void> {
  await r.sessions.patch(sessionId, clearRestPatch);
  await cancelRestAlert();
  useSession.getState().bump();
}

export interface FinishSummary {
  sessionId: string;
  durationSec: number;
  sets: number;
  exercises: number;
  records: number;
  achievements: string[];
}

/** Completes a session. A session with no validated set is discarded instead (nothing to keep). */
export async function finish(r: Repositories, sessionId: string, notes: string | null = null): Promise<FinishSummary | null> {
  const s = await load(r, sessionId);
  if (s.status !== 'active' && s.status !== 'paused') throw new WorkoutError('not_active');
  await cancelRestAlert();
  const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
  if (sets === 0) {
    await discard(r, sessionId);
    return null;
  }
  const t = now();
  const durationSec = finalDurationSec(s, t);
  await r.db.withTransactionAsync(async () => {
    await r.sessions.patch(sessionId, { status: 'completed', endedAt: t, durationSec, pausedAt: null, notes, ...clearRestPatch });
    if (s.scheduleId) await r.planner.update(s.scheduleId, { status: 'done', sessionId });
  });
  const records = (await r.records.all()).filter((x) => x.sessionId === sessionId).length;
  const achievements = await evaluateAchievements(r);
  useSession.getState().setActiveSession(null);
  useSession.getState().bump();
  track('workout_completed', { exercises: s.exercises.filter((e) => e.sets.length > 0).length, resumed: s.pausedTotalMs > 0 });
  return { sessionId, durationSec, sets, exercises: s.exercises.filter((e) => e.sets.length > 0).length, records, achievements };
}

/** Throws the session away (records it produced go with it via ON DELETE CASCADE). */
export async function discard(r: Repositories, sessionId: string): Promise<void> {
  await cancelRestAlert();
  await r.sessions.remove(sessionId);
  useSession.getState().setActiveSession(null);
  useSession.getState().bump();
}

/**
 * Called at boot and when the app returns to the foreground: a session whose start
 * day is in the past keeps its original day (sessions are dated by their start).
 */
export async function restoreActiveSession(r: Repositories): Promise<string | null> {
  const s = await r.sessions.active();
  useSession.getState().setActiveSession(s?.id ?? null);
  return s?.id ?? null;
}

/** Marks a planned schedule entry (or a virtual routine occurrence) as the session's origin. */
export async function linkScheduleToSession(r: Repositories, scheduleId: string, sessionId: string): Promise<void> {
  await r.planner.update(scheduleId, { sessionId });
}

export const dayOf = (ms: number) => toDayKey(new Date(ms));
