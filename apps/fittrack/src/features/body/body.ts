import type { BodyMeasurement, DayKey, MeasurementKind } from '@/types';

/**
 * Body measurements are displayed as the user's own numbers over time. FitTrack
 * NEVER interprets them (no BMI category, no "healthy range", no diagnosis):
 * a comparison is a plain difference between two dates.
 */

export const LENGTH_KINDS: readonly MeasurementKind[] = ['height', 'chest', 'waist', 'hips', 'arm', 'thigh', 'custom'];
export const isLength = (k: MeasurementKind) => LENGTH_KINDS.includes(k);

/** Plausible input bounds (typo guard only, not a judgement). kg for weight, cm otherwise. */
export const BOUNDS: Record<MeasurementKind, [number, number]> = {
  weight: [20, 400],
  height: [80, 260],
  chest: [40, 250],
  waist: [30, 250],
  hips: [40, 250],
  arm: [10, 80],
  thigh: [20, 120],
  custom: [0.1, 500],
};

export function validMeasurement(kind: MeasurementKind, value: number | null): boolean {
  if (value === null || !Number.isFinite(value)) return false;
  const [min, max] = BOUNDS[kind];
  return value >= min && value <= max;
}

/** Series key: custom measurements are grouped by their name. */
export const seriesKey = (m: Pick<BodyMeasurement, 'kind' | 'customName'>) => (m.kind === 'custom' ? `custom:${(m.customName ?? '').trim().toLowerCase()}` : m.kind);

/** One value per day (the latest entry of that day), oldest first. */
export function dailySeries(list: readonly BodyMeasurement[]): { day: DayKey; value: number }[] {
  const by = new Map<DayKey, number>();
  for (const m of list) by.set(m.day, m.value); // list is ordered by day, created_at
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => ({ day, value }));
}

/** Value on or before a day (the most recent measurement not after it). */
export function valueAt(series: readonly { day: DayKey; value: number }[], day: DayKey): { day: DayKey; value: number } | null {
  let found: { day: DayKey; value: number } | null = null;
  for (const p of series) if (p.day <= day) found = p;
  return found;
}

export function compare(series: readonly { day: DayKey; value: number }[], from: DayKey, to: DayKey): { from: { day: DayKey; value: number }; to: { day: DayKey; value: number }; delta: number } | null {
  const a = valueAt(series, from);
  const b = valueAt(series, to);
  if (!a || !b || a.day === b.day) return null;
  return { from: a, to: b, delta: b.value - a.value };
}
