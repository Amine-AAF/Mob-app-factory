import type { UnitId, UnitSystem } from './types';

/**
 * Units of measure.
 *
 * Rules (deliberately conservative):
 * - Mass converts only to mass, volume only to volume. Mass ↔ volume is never
 *   done implicitly (a cup of flour and a cup of honey do not weigh the same).
 * - Each count unit (piece, clove, slice, can, bunch, pack, pinch) is its own
 *   dimension: 2 cloves of garlic and 1 piece of garlic are never added up.
 * - "to taste" has no quantity and is never summed.
 *
 * Volume measures are US customary (cup = 236.588 ml, tbsp = 14.787 ml, tsp = 4.929 ml).
 */
export type Dimension = 'mass' | 'volume' | 'count' | 'none';

interface UnitDef {
  dimension: Dimension;
  /** Factor to the base unit of its dimension (g for mass, ml for volume, 1 for counts). */
  toBase: number;
}

export const UNITS: Record<UnitId, UnitDef> = {
  g: { dimension: 'mass', toBase: 1 },
  kg: { dimension: 'mass', toBase: 1000 },
  oz: { dimension: 'mass', toBase: 28.349523125 },
  lb: { dimension: 'mass', toBase: 453.59237 },
  ml: { dimension: 'volume', toBase: 1 },
  l: { dimension: 'volume', toBase: 1000 },
  tsp: { dimension: 'volume', toBase: 4.92892159375 },
  tbsp: { dimension: 'volume', toBase: 14.78676478125 },
  cup: { dimension: 'volume', toBase: 236.5882365 },
  fl_oz: { dimension: 'volume', toBase: 29.5735295625 },
  pc: { dimension: 'count', toBase: 1 },
  clove: { dimension: 'count', toBase: 1 },
  slice: { dimension: 'count', toBase: 1 },
  can: { dimension: 'count', toBase: 1 },
  bunch: { dimension: 'count', toBase: 1 },
  pinch: { dimension: 'count', toBase: 1 },
  pack: { dimension: 'count', toBase: 1 },
  to_taste: { dimension: 'none', toBase: 0 },
};

export function isUnitId(value: unknown): value is UnitId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(UNITS, value);
}

export function dimensionOf(unit: UnitId): Dimension {
  return UNITS[unit].dimension;
}

/**
 * Key under which two quantities may be added together.
 * Mass and volume share a key per dimension; every count unit has its own key.
 */
export function mergeKey(unit: UnitId): string {
  const d = UNITS[unit].dimension;
  return d === 'count' ? `count:${unit}` : d;
}

export function areCompatible(a: UnitId, b: UnitId): boolean {
  if (a === 'to_taste' || b === 'to_taste') return false;
  return mergeKey(a) === mergeKey(b);
}

export function baseUnitFor(unit: UnitId): UnitId {
  const d = UNITS[unit].dimension;
  if (d === 'mass') return 'g';
  if (d === 'volume') return 'ml';
  return unit;
}

export function toBase(quantity: number, unit: UnitId): number {
  const d = UNITS[unit];
  return d.dimension === 'count' ? quantity : quantity * d.toBase;
}

/** Converts between compatible units. Throws on incompatible units (callers must check first). */
export function convert(quantity: number, from: UnitId, to: UnitId): number {
  if (from === to) return quantity;
  if (!areCompatible(from, to)) throw new Error(`Incompatible units: ${from} -> ${to}`);
  return (quantity * UNITS[from].toBase) / UNITS[to].toBase;
}

const SPOONS: UnitId[] = ['tsp', 'tbsp'];

/**
 * Picks a readable unit for a base amount in the user's unit system.
 * `hint` is the unit the amount was authored in (spoons stay spoons when small).
 */
export function bestUnit(baseAmount: number, unit: UnitId, system: UnitSystem): UnitId {
  const d = UNITS[unit].dimension;
  if (d === 'count' || d === 'none') return unit;
  const amount = Math.abs(baseAmount);
  if (d === 'mass') {
    if (system === 'metric') return amount >= 1000 ? 'kg' : 'g';
    return amount >= 453.59237 ? 'lb' : 'oz';
  }
  // volume
  const spoonHint = SPOONS.includes(unit);
  if (system === 'metric') {
    if (spoonHint && amount < 60) return amount < UNITS.tbsp.toBase ? 'tsp' : 'tbsp';
    return amount >= 1000 ? 'l' : 'ml';
  }
  if (amount < UNITS.tbsp.toBase) return 'tsp';
  if (amount < UNITS.cup.toBase / 4) return 'tbsp';
  return 'cup';
}

/** Converts an authored quantity to the user's system (counts unchanged). */
export function localize(quantity: number, unit: UnitId, system: UnitSystem): { quantity: number; unit: UnitId } {
  const d = UNITS[unit].dimension;
  if (d === 'count' || d === 'none') return { quantity, unit };
  const base = toBase(quantity, unit);
  const target = bestUnit(base, unit, system);
  return { quantity: base / UNITS[target].toBase, unit: target };
}

/** Units offered in pickers, by system. */
export function unitsForPicker(system: UnitSystem): UnitId[] {
  const mass: UnitId[] = system === 'metric' ? ['g', 'kg'] : ['oz', 'lb'];
  const volume: UnitId[] = system === 'metric' ? ['ml', 'l', 'tsp', 'tbsp', 'cup'] : ['cup', 'tbsp', 'tsp', 'fl_oz'];
  const other: UnitId[] = system === 'metric' ? ['oz', 'lb', 'fl_oz'] : ['g', 'kg', 'ml', 'l'];
  return ['pc', ...mass, ...volume, 'clove', 'slice', 'can', 'bunch', 'pack', 'pinch', 'to_taste', ...other];
}
