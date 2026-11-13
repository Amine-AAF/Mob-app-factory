/**
 * Measurement units. Values are always stored in metric (cm, ml, °C) and converted
 * for display only, so switching units never alters the user's records.
 */
export type UnitSystem = 'metric' | 'imperial';
export type TemperatureUnit = 'c' | 'f';

const CM_PER_IN = 2.54;
const ML_PER_FLOZ = 29.5735;

export function round(value: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function lengthFromCm(cm: number, system: UnitSystem): number {
  return system === 'metric' ? round(cm) : round(cm / CM_PER_IN);
}

export function lengthToCm(value: number, system: UnitSystem): number {
  return system === 'metric' ? round(value, 2) : round(value * CM_PER_IN, 2);
}

export function volumeFromMl(ml: number, system: UnitSystem): number {
  return system === 'metric' ? Math.round(ml) : round(ml / ML_PER_FLOZ);
}

export function volumeToMl(value: number, system: UnitSystem): number {
  return system === 'metric' ? Math.round(value) : Math.round(value * ML_PER_FLOZ);
}

export function celsiusTo(c: number, unit: TemperatureUnit): number {
  return unit === 'c' ? Math.round(c) : Math.round((c * 9) / 5 + 32);
}

export const lengthUnit = (s: UnitSystem) => (s === 'metric' ? 'cm' : 'in');
export const volumeUnit = (s: UnitSystem) => (s === 'metric' ? 'ml' : 'fl oz');
export const temperatureUnit = (u: TemperatureUnit) => (u === 'c' ? '°C' : '°F');

/** Parses user input with either "," or "." as decimal separator. Returns null for empty/invalid. */
export function parseDecimal(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (s === '') return null;
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Default unit system from the device region (US, Liberia, Myanmar use imperial). */
export function defaultUnitSystem(regionCode: string | null | undefined): UnitSystem {
  return regionCode && ['US', 'LR', 'MM'].includes(regionCode.toUpperCase()) ? 'imperial' : 'metric';
}

export function defaultTemperatureUnit(regionCode: string | null | undefined): TemperatureUnit {
  return regionCode && ['US', 'BS', 'BZ', 'KY', 'PW', 'LR'].includes(regionCode.toUpperCase()) ? 'f' : 'c';
}
