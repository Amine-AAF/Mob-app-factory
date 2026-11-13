/**
 * Unit handling. Storage is always metric (kg, cm, meters, seconds); the user picks
 * display units independently from the interface language.
 *
 * Conversion factors are exact international definitions:
 *   1 lb = 0.45359237 kg · 1 in = 2.54 cm · 1 mi = 1609.344 m
 */
export type WeightUnit = 'kg' | 'lb';
export type DistanceUnit = 'km' | 'mi';
export type LengthUnit = 'cm' | 'in';

export interface UnitPreferences {
  weight: WeightUnit;
  distance: DistanceUnit;
  length: LengthUnit;
}

export const DEFAULT_UNITS: UnitPreferences = { weight: 'kg', distance: 'km', length: 'cm' };

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;
export const M_PER_MI = 1609.344;

export const kgToDisplay = (kg: number, unit: WeightUnit) => (unit === 'kg' ? kg : kg / KG_PER_LB);
export const displayToKg = (value: number, unit: WeightUnit) => (unit === 'kg' ? value : value * KG_PER_LB);

export const metersToDisplay = (m: number, unit: DistanceUnit) => (unit === 'km' ? m / 1000 : m / M_PER_MI);
export const displayToMeters = (value: number, unit: DistanceUnit) => (unit === 'km' ? value * 1000 : value * M_PER_MI);

export const cmToDisplay = (cm: number, unit: LengthUnit) => (unit === 'cm' ? cm : cm / CM_PER_IN);
export const displayToCm = (value: number, unit: LengthUnit) => (unit === 'cm' ? value : value * CM_PER_IN);

/** Smallest sensible increment for weight steppers (2.5 lb ≈ 1.13 kg, 1.25 kg plates). */
export const weightStep = (unit: WeightUnit) => (unit === 'kg' ? 1.25 : 2.5);

/** Rounds a display value to a readable precision (weights 0.1–0.5, distances 0.01). */
export function roundDisplay(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** "1:05", "12:30", "1:02:03" from seconds. Negative/invalid → "0:00". */
export function formatDuration(totalSeconds: number): string {
  const s = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const ss = sec < 10 ? `0${sec}` : String(sec);
  if (h > 0) return `${h}:${m < 10 ? `0${m}` : m}:${ss}`;
  return `${m}:${ss}`;
}

/** Whole minutes, rounded (for summaries: "45 min"). */
export const toMinutes = (seconds: number) => Math.round(Math.max(0, seconds) / 60);

/** Parses "mm:ss", "h:mm:ss" or a plain number of minutes into seconds. Invalid → null. */
export function parseDuration(raw: string): number | null {
  const s = raw.trim().replace(',', '.');
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(Number(s) * 60);
  const parts = s.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  const [a, b, c] = nums as [number, number, number | undefined];
  if (c === undefined) return b < 60 ? a * 60 + b : null;
  return b < 60 && c < 60 ? a * 3600 + b * 60 + c : null;
}
