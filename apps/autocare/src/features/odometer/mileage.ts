import { addDays, diffDays } from '@factory/app-core';

import type { DayKey } from '@/types';

/**
 * Odometer history helpers. AutoCare never knows the real mileage of the car:
 * it only knows the readings the user entered. Every projection made from them
 * is an ESTIMATE and is labelled as such in the UI and in notifications.
 */
export interface Reading {
  day: DayKey;
  odometerKm: number;
}

/** Highest known reading (odometers only go up; a lower later value is a typo or a reset). */
export function latestOdometer(readings: readonly Reading[]): Reading | null {
  let best: Reading | null = null;
  for (const r of readings) {
    if (!best || r.odometerKm > best.odometerKm || (r.odometerKm === best.odometerKm && r.day > best.day)) best = r;
  }
  return best;
}

export type ReadingIssue = 'lower_than_earlier' | 'higher_than_later' | 'negative';

/** Checks a new reading against history so the user can confirm or fix it. */
export function checkReading(candidate: Reading, history: readonly Reading[]): ReadingIssue | null {
  if (!(candidate.odometerKm >= 0)) return 'negative';
  if (history.some((r) => r.day < candidate.day && r.odometerKm > candidate.odometerKm)) return 'lower_than_earlier';
  if (history.some((r) => r.day > candidate.day && r.odometerKm < candidate.odometerKm)) return 'higher_than_later';
  return null;
}

export interface DailyRate {
  kmPerDay: number;
  /** Number of days spanned by the readings used. */
  spanDays: number;
  basedOn: number;
}

/**
 * Average distance driven per day from the readings of the last `windowDays`
 * (falls back to all history). Needs at least two readings ≥ 14 days apart;
 * otherwise returns null and the app does not project anything.
 */
export function estimateDailyRate(readings: readonly Reading[], today: DayKey, windowDays = 180): DailyRate | null {
  const sorted = [...readings].filter((r) => r.day <= today).sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.odometerKm - b.odometerKm));
  if (sorted.length < 2) return null;
  const from = addDays(today, -windowDays);
  let window = sorted.filter((r) => r.day >= from);
  if (window.length < 2 || diffDays(window[0]!.day, window[window.length - 1]!.day) < 14) window = sorted;
  const first = window[0]!;
  const last = window[window.length - 1]!;
  const spanDays = diffDays(first.day, last.day);
  const km = last.odometerKm - first.odometerKm;
  if (spanDays < 14 || km < 0) return null;
  return { kmPerDay: km / spanDays, spanDays, basedOn: window.length };
}

/** Estimated odometer today, from the latest reading and the daily rate. */
export function estimateOdometer(latest: Reading | null, rate: DailyRate | null, today: DayKey): number | null {
  if (!latest) return null;
  if (!rate) return latest.odometerKm;
  return latest.odometerKm + rate.kmPerDay * Math.max(0, diffDays(latest.day, today));
}

/** Estimated day when the odometer reaches `targetKm`. Null when it can't be estimated. */
export function estimateDayForOdometer(targetKm: number, latest: Reading | null, rate: DailyRate | null): DayKey | null {
  if (!latest || !rate || rate.kmPerDay <= 0) return null;
  if (targetKm <= latest.odometerKm) return latest.day;
  const days = Math.ceil((targetKm - latest.odometerKm) / rate.kmPerDay);
  if (days > 365 * 10) return null; // too far to be meaningful
  return addDays(latest.day, days);
}

/** Distance driven between two days according to readings (null when not enough data). */
export function distanceBetween(readings: readonly Reading[], fromDay: DayKey, toDay: DayKey): number | null {
  const inRange = readings.filter((r) => r.day >= fromDay && r.day <= toDay);
  if (inRange.length < 2) return null;
  const min = Math.min(...inRange.map((r) => r.odometerKm));
  const max = Math.max(...inRange.map((r) => r.odometerKm));
  return max - min;
}
