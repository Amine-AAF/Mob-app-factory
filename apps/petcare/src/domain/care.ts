import { diffDays } from './dates';
import type { Activity, DayKey, FoodItem, WeightRecord } from './types';

/* ------------------------------------------------------------------ Food inventory */

export type StockLevel = 'ok' | 'low' | 'empty';

export function stockLevel(item: Pick<FoodItem, 'quantity' | 'lowThreshold'>): StockLevel {
  if (item.quantity <= 0) return 'empty';
  if (item.lowThreshold != null && item.quantity <= item.lowThreshold) return 'low';
  return 'ok';
}

/** Days of food left from the user's own daily usage figure. Null when unknown. */
export function daysOfStockLeft(item: Pick<FoodItem, 'quantity' | 'dailyUsage'>): number | null {
  if (!item.dailyUsage || item.dailyUsage <= 0) return null;
  return Math.max(0, Math.floor(item.quantity / item.dailyUsage));
}

export function needsRestock(item: Pick<FoodItem, 'quantity' | 'lowThreshold' | 'dailyUsage' | 'restockAlert'>, warnDays = 3): boolean {
  if (!item.restockAlert) return false;
  if (stockLevel(item) !== 'ok') return true;
  const left = daysOfStockLeft(item);
  return left != null && left <= warnDays;
}

/* ------------------------------------------------------------------ Weight */

export interface WeightComparison {
  latest: WeightRecord;
  previous: WeightRecord | null;
  /** latest - previous, in kg. */
  deltaKg: number | null;
  /** Relative change, e.g. 0.05 for +5 %. */
  deltaRatio: number | null;
  daysBetween: number | null;
}

/** Compares the two most recent measurements. Informational only, never an assessment. */
export function compareWeights(records: readonly WeightRecord[]): WeightComparison | null {
  const sorted = [...records].sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)));
  const latest = sorted.at(-1);
  if (!latest) return null;
  const previous = sorted.at(-2) ?? null;
  if (!previous) return { latest, previous, deltaKg: null, deltaRatio: null, daysBetween: null };
  const deltaKg = round(latest.weightKg - previous.weightKg, 3);
  return {
    latest,
    previous,
    deltaKg,
    deltaRatio: previous.weightKg > 0 ? deltaKg / previous.weightKg : null,
    daysBetween: diffDays(previous.date, latest.date),
  };
}

/** Points for the evolution chart, oldest first. */
export function weightSeries(records: readonly WeightRecord[]): { date: DayKey; value: number }[] {
  return [...records].sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({ date: r.date, value: r.weightKg }));
}

/* ------------------------------------------------------------------ Activities */

export interface ActivitySummary {
  minutes: number;
  distanceKm: number;
  count: number;
}

/** Totals for the given local day (activities store instants). */
export function summarizeDay(activities: readonly Activity[], day: DayKey, type?: Activity['type'], toDay: (iso: string) => DayKey = localDay): ActivitySummary {
  return activities
    .filter((a) => toDay(a.date) === day && (!type || a.type === type))
    .reduce<ActivitySummary>(
      (acc, a) => ({ minutes: acc.minutes + (a.durationMinutes ?? 0), distanceKm: round(acc.distanceKm + (a.distanceKm ?? 0), 2), count: acc.count + 1 }),
      { minutes: 0, distanceKm: 0, count: 0 },
    );
}

/** Progress toward a personal walk goal in [0, 1]. Null when no goal is set. */
export function goalProgress(minutes: number, goalMinutes: number | null): number | null {
  if (!goalMinutes || goalMinutes <= 0) return null;
  return Math.min(1, minutes / goalMinutes);
}

function localDay(iso: string): DayKey {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
