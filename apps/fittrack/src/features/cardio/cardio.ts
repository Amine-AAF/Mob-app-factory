import type { CardioActivity, CardioType } from '@/types';

/**
 * Cardio metrics are computed ONLY from what the user entered (duration, distance).
 * FitTrack has no sensor: it never measures heart rate, and calories are either typed
 * by the user or an explicitly labelled MET estimate the user asks for.
 */

/** Average speed in km/h, or null without a distance. */
export function speedKmh(distanceM: number | null, durationSec: number): number | null {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return null;
  return distanceM / 1000 / (durationSec / 3600);
}

/** Pace in seconds per km (or per mile with `perMeters` = 1609.344), or null without a distance. */
export function paceSecPer(distanceM: number | null, durationSec: number, perMeters = 1000): number | null {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return null;
  return durationSec / (distanceM / perMeters);
}

/**
 * Approximate MET values (moderate effort) from the Compendium of Physical Activities
 * (Ainsworth et al., 2011 update). They describe an average adult and moderate pace;
 * real expenditure varies a lot, which the UI states next to every estimate.
 */
export const MET_VALUES: Record<CardioType, number> = {
  running: 9.8, // ~9.7 km/h
  walking: 3.5, // brisk ~5.6 km/h
  cycling: 7.5, // general, moderate
  treadmill: 8.3, // mixed jog/run
  elliptical: 5.0, // moderate
  swimming: 5.8, // leisurely laps
  rowing: 7.0, // moderate ergometer
  other: 5.0,
};

/** kcal ≈ MET × body mass (kg) × hours. Requires a body weight the user entered. */
export function estimateCaloriesMet(type: CardioType, durationSec: number, bodyWeightKg: number | null): number | null {
  if (!bodyWeightKg || bodyWeightKg <= 0 || durationSec <= 0) return null;
  return Math.round(MET_VALUES[type] * bodyWeightKg * (durationSec / 3600));
}

export interface CardioRecords {
  longestDistance: CardioActivity | null;
  longestDuration: CardioActivity | null;
  fastestPace: CardioActivity | null;
}

/** Personal bests per activity type (fastest pace only counts activities ≥ 1 km). */
export function cardioRecords(activities: readonly CardioActivity[]): CardioRecords {
  let longestDistance: CardioActivity | null = null;
  let longestDuration: CardioActivity | null = null;
  let fastestPace: CardioActivity | null = null;
  let bestPace = Infinity;
  for (const a of activities) {
    if (a.distanceM && (!longestDistance || a.distanceM > (longestDistance.distanceM ?? 0))) longestDistance = a;
    if (!longestDuration || a.durationSec > longestDuration.durationSec) longestDuration = a;
    const p = a.distanceM && a.distanceM >= 1000 ? paceSecPer(a.distanceM, a.durationSec) : null;
    if (p !== null && p < bestPace) {
      bestPace = p;
      fastestPace = a;
    }
  }
  return { longestDistance, longestDuration, fastestPace };
}

/** Validates user input before saving. Returns an error key or null. */
export function validateCardio(input: { durationSec: number | null; distanceM: number | null; calories: number | null }): 'duration' | 'distance' | 'calories' | 'speed' | null {
  if (!input.durationSec || input.durationSec <= 0 || input.durationSec > 24 * 3600) return 'duration';
  if (input.distanceM !== null && (input.distanceM < 0 || input.distanceM > 500_000)) return 'distance';
  if (input.calories !== null && (input.calories < 0 || input.calories > 20_000)) return 'calories';
  const v = speedKmh(input.distanceM, input.durationSec);
  // Above 100 km/h is certainly a typo (unit mix-up), even for cycling.
  if (v !== null && v > 100) return 'speed';
  return null;
}
