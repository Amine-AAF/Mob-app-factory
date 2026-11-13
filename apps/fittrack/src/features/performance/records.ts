import type { DayKey, ExerciseSet, PerformanceRecord, RecordKind, TrackingType } from '@/types';

import { estimateOneRepMax, setVolume } from './oneRepMax';

/**
 * Personal records. Measured records (heaviest load, most reps, longest hold…) and
 * the ESTIMATED 1RM are kept apart: kind 'est_1rm' is always shown as an estimate.
 */

export const RECORD_KINDS_BY_TRACKING: Record<TrackingType, RecordKind[]> = {
  weight_reps: ['max_weight', 'max_reps', 'max_volume', 'est_1rm'],
  reps: ['max_reps'],
  time: ['max_duration'],
  distance_time: ['max_distance', 'max_duration', 'best_pace'],
};

/** Value of a set for a record kind (null = not applicable). best_pace is sec/km: lower is better. */
export function setValueFor(kind: RecordKind, s: Pick<ExerciseSet, 'reps' | 'weightKg' | 'durationSec' | 'distanceM'>): number | null {
  switch (kind) {
    case 'max_weight':
      return s.weightKg && s.weightKg > 0 && s.reps && s.reps > 0 ? s.weightKg : null;
    case 'max_reps':
      return s.reps && s.reps > 0 ? s.reps : null;
    case 'max_volume': {
      const v = setVolume(s.weightKg, s.reps);
      return v > 0 ? v : null;
    }
    case 'est_1rm':
      return estimateOneRepMax(s.weightKg, s.reps);
    case 'max_duration':
      return s.durationSec && s.durationSec > 0 ? s.durationSec : null;
    case 'max_distance':
      return s.distanceM && s.distanceM > 0 ? s.distanceM : null;
    case 'best_pace':
      return s.distanceM && s.distanceM >= 400 && s.durationSec && s.durationSec > 0 ? s.durationSec / (s.distanceM / 1000) : null;
  }
}

export const lowerIsBetter = (kind: RecordKind) => kind === 'best_pace';

const better = (kind: RecordKind, a: number, b: number) => (lowerIsBetter(kind) ? a < b - 1e-9 : a > b + 1e-9);

/** Current best per kind from the record history. */
export function currentBests(records: readonly PerformanceRecord[]): Map<RecordKind, PerformanceRecord> {
  const out = new Map<RecordKind, PerformanceRecord>();
  for (const r of records) {
    const cur = out.get(r.kind);
    if (!cur || better(r.kind, r.value, cur.value)) out.set(r.kind, r);
  }
  return out;
}

export interface NewRecord {
  kind: RecordKind;
  value: number;
  setId: string;
  previous: number | null;
}

/**
 * Records beaten by a newly validated set, against the existing bests.
 * The very first set of an exercise establishes a baseline but is not celebrated
 * (`previous` is null) — the UI only celebrates real improvements.
 */
export function detectRecords(tracking: TrackingType, set: ExerciseSet, bests: Map<RecordKind, PerformanceRecord>): NewRecord[] {
  const out: NewRecord[] = [];
  for (const kind of RECORD_KINDS_BY_TRACKING[tracking]) {
    const value = setValueFor(kind, set);
    if (value === null) continue;
    const cur = bests.get(kind);
    if (!cur || better(kind, value, cur.value)) out.push({ kind, value, setId: set.id, previous: cur?.value ?? null });
  }
  return out;
}

export interface PerformancePoint {
  day: DayKey;
  sessionId: string;
  /** Heaviest load of the day (kg), most reps, total volume, best estimated 1RM, longest duration, longest distance. */
  maxWeight: number | null;
  maxReps: number | null;
  volume: number;
  est1rm: number | null;
  maxDuration: number | null;
  maxDistance: number | null;
  sets: number;
}

/** One point per session for an exercise's progression charts, oldest first. */
export function progression(rows: readonly (Pick<ExerciseSet, 'reps' | 'weightKg' | 'durationSec' | 'distanceM'> & { day: DayKey; sessionId: string; startedAt: number })[]): PerformancePoint[] {
  const by = new Map<string, PerformancePoint & { startedAt: number }>();
  for (const r of rows) {
    let p = by.get(r.sessionId);
    if (!p) {
      p = { day: r.day, sessionId: r.sessionId, startedAt: r.startedAt, maxWeight: null, maxReps: null, volume: 0, est1rm: null, maxDuration: null, maxDistance: null, sets: 0 };
      by.set(r.sessionId, p);
    }
    p.sets++;
    const max = (a: number | null, b: number | null) => (b === null ? a : a === null ? b : Math.max(a, b));
    p.maxWeight = max(p.maxWeight, setValueFor('max_weight', r));
    p.maxReps = max(p.maxReps, setValueFor('max_reps', r));
    p.volume += setVolume(r.weightKg, r.reps);
    p.est1rm = max(p.est1rm, setValueFor('est_1rm', r));
    p.maxDuration = max(p.maxDuration, setValueFor('max_duration', r));
    p.maxDistance = max(p.maxDistance, setValueFor('max_distance', r));
  }
  return [...by.values()].sort((a, b) => a.startedAt - b.startedAt).map(({ startedAt: _s, ...p }) => p);
}
