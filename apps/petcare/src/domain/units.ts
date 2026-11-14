import { round } from './care';

export type WeightUnit = 'kg' | 'lb';

const LB_PER_KG = 2.2046226218;

/** Weights are stored in kg; the display unit is a preference. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? round(kg, 2) : round(kg * LB_PER_KG, 2);
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? round(value, 3) : round(value / LB_PER_KG, 3);
}

/** Parses a decimal typed with either separator. Null when empty, invalid or negative. */
export function parseDecimal(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const cleaned = raw.trim().replace(/[\s  ]/g, '').replace(',', '.');
  if (cleaned === '' || !/^\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Default unit for a region: pounds in the US, Liberia and Myanmar; kilograms elsewhere. */
export function defaultWeightUnit(regionCode: string | null | undefined): WeightUnit {
  return regionCode && ['US', 'LR', 'MM'].includes(regionCode.toUpperCase()) ? 'lb' : 'kg';
}

/** Local, collision-resistant id (no crypto API needed, never leaves the device). */
export function createId(prefix = ''): string {
  const time = Date.now().toString(36);
  const rand = Array.from({ length: 3 }, () => Math.floor(Math.random() * 0x100000).toString(36).padStart(4, '0')).join('');
  return `${prefix}${time}${rand}`;
}
