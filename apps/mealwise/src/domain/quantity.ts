import type { UnitId, UnitSystem } from './types';
import { localize, UNITS } from './units';

/**
 * Quantity parsing, scaling, rounding and formatting.
 * Handles: "2", "1.5", "1,5", "1/2", "1 1/2", "½", "1½", "2-3" / "2–3" (upper bound kept).
 */
const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
  '⅕': 0.2,
  '⅙': 1 / 6,
};

const MAX_QUANTITY = 100_000;

function parseSingle(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;
  let total = 0;
  // Unicode fraction possibly attached to a whole number ("1½").
  const last = s.slice(-1);
  if (UNICODE_FRACTIONS[last] !== undefined) {
    total += UNICODE_FRACTIONS[last];
    s = s.slice(0, -1).trim();
    if (!s) return total;
  }
  // "1 1/2"
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s);
  if (mixed) {
    const den = Number(mixed[3]);
    if (den === 0) return null;
    return total + Number(mixed[1]) + Number(mixed[2]) / den;
  }
  const frac = /^(\d+)\/(\d+)$/.exec(s);
  if (frac) {
    const den = Number(frac[2]);
    if (den === 0) return null;
    return total + Number(frac[1]) / den;
  }
  if (/^\d+([.,]\d+)?$/.test(s) || /^[.,]\d+$/.test(s)) return total + Number(s.replace(',', '.'));
  return null;
}

/** Parses a user-typed quantity. Returns null when empty or not a number. Never returns negatives or NaN. */
export function parseQuantity(input: string | null | undefined): number | null {
  if (input == null) return null;
  const s = input.trim();
  if (!s) return null;
  const range = s.split(/\s*[-–—]\s*|\s+(?:to|à|a)\s+/i);
  if (range.length === 2) {
    const a = parseSingle(range[0] ?? '');
    const b = parseSingle(range[1] ?? '');
    if (a !== null && b !== null) return sanitize(Math.max(a, b));
  }
  return sanitize(parseSingle(s));
}

function sanitize(n: number | null): number | null {
  if (n === null || !Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, MAX_QUANTITY);
}

/** Scales a quantity for a different number of servings. Null (to taste) stays null. */
export function scaleQuantity(quantity: number | null, baseServings: number, targetServings: number): number | null {
  if (quantity === null) return null;
  if (!(baseServings > 0) || !(targetServings > 0)) return quantity;
  return (quantity * targetServings) / baseServings;
}

export function servingsFactor(baseServings: number, targetServings: number): number {
  if (!(baseServings > 0) || !(targetServings > 0)) return 1;
  return targetServings / baseServings;
}

const NICE_FRACTIONS = [0, 1 / 8, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];
const FRACTION_GLYPHS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
];

/** Units displayed with fractions (cooks measure these with spoons, cups or by hand). */
const FRACTIONAL_UNITS: UnitId[] = ['tsp', 'tbsp', 'cup', 'pc', 'clove', 'slice', 'can', 'bunch', 'pack', 'pinch', 'oz', 'lb', 'fl_oz'];

/** Rounds to the closest kitchen-friendly fraction (⅛, ¼, ⅓, ½, ⅔, ¾). */
export function roundToFraction(value: number): number {
  const whole = Math.floor(value);
  const rest = value - whole;
  let best = 0;
  let bestDiff = Infinity;
  for (const f of NICE_FRACTIONS) {
    const diff = Math.abs(rest - f);
    if (diff < bestDiff - 1e-9) {
      best = f;
      bestDiff = diff;
    }
  }
  const out = whole + best;
  // Never round a positive amount down to zero.
  return out === 0 && value > 0 ? 1 / 8 : out;
}

/** Rounds metric amounts to sensible precision (g / ml). */
export function roundMetric(value: number, unit: UnitId): number {
  if (unit === 'kg' || unit === 'l') return Math.round(value * 100) / 100;
  if (value < 10) return Math.max(0.5, Math.round(value * 2) / 2);
  if (value < 100) return Math.round(value);
  if (value < 1000) return Math.round(value / 5) * 5;
  return Math.round(value / 10) * 10;
}

export function roundForDisplay(value: number, unit: UnitId): number {
  if (UNITS[unit].dimension === 'none') return value;
  if (FRACTIONAL_UNITS.includes(unit)) {
    if (value >= 10) return Math.round(value * 2) / 2;
    return roundToFraction(value);
  }
  return roundMetric(value, unit);
}

/**
 * Amount to buy: counts are rounded up to whole items (you can't buy 1.5 onions),
 * weights and volumes are rounded up slightly to a readable figure.
 */
export function roundForShopping(value: number, unit: UnitId): number {
  const d = UNITS[unit].dimension;
  if (d === 'none') return value;
  if (d === 'count') return Math.max(1, Math.ceil(value - 1e-9));
  if (unit === 'g' || unit === 'ml') {
    if (value < 10) return Math.ceil(value);
    if (value < 100) return Math.ceil(value / 5) * 5;
    return Math.ceil(value / 10) * 10;
  }
  if (unit === 'kg' || unit === 'l') return Math.ceil(value * 10) / 10;
  if (unit === 'oz' || unit === 'fl_oz') return Math.ceil(value * 2) / 2;
  return Math.ceil(value * 4) / 4; // lb, cup, tbsp, tsp
}

function formatDecimal(value: number, lng: string): string {
  return new Intl.NumberFormat(lng, { maximumFractionDigits: 2 }).format(value);
}

/** Formats a (rounded) number, using ½-style glyphs for fractional units. */
export function formatAmount(value: number, unit: UnitId, lng: string): string {
  if (!FRACTIONAL_UNITS.includes(unit) || value >= 10) return formatDecimal(value, lng);
  const whole = Math.floor(value + 1e-9);
  const rest = value - whole;
  if (rest < 1e-6) return formatDecimal(whole, lng);
  const glyph = FRACTION_GLYPHS.find(([f]) => Math.abs(f - rest) < 0.01)?.[1];
  if (!glyph) return formatDecimal(value, lng);
  return whole > 0 ? `${whole}${glyph}` : glyph;
}

export interface DisplayQuantity {
  /** Formatted number ("1½", "250"), or null for "to taste". */
  amount: string | null;
  value: number | null;
  unit: UnitId;
}

/**
 * Full pipeline used by recipe screens: scale → convert to the user's system → round → format.
 * `keepOriginalUnits` shows the authored units (still scaled).
 */
export function displayQuantity(
  quantity: number | null,
  unit: UnitId,
  opts: { system: UnitSystem; lng: string; factor?: number; keepOriginalUnits?: boolean; forShopping?: boolean },
): DisplayQuantity {
  if (quantity === null || unit === 'to_taste') return { amount: null, value: null, unit };
  const scaled = quantity * (opts.factor ?? 1);
  const target = opts.keepOriginalUnits ? { quantity: scaled, unit } : localize(scaled, unit, opts.system);
  const rounded = opts.forShopping ? roundForShopping(target.quantity, target.unit) : roundForDisplay(target.quantity, target.unit);
  return { amount: formatAmount(rounded, target.unit, opts.lng), value: rounded, unit: target.unit };
}
