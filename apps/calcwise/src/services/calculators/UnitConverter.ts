import { Dec } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * UnitConverter — linear conversions go through the category's base unit using exact
 * definitions (inch = 0.0254 m, pound = 0.45359237 kg, US gallon = 3.785411784 L…).
 * Temperature uses affine formulas. Storage has both decimal (kB = 1000 B) and binary
 * (KiB = 1024 B) units. Month = 1/12 of a mean Gregorian year (365.2425 days).
 */
export type UnitCategory = 'length' | 'mass' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data' | 'energy';

export interface UnitDef {
  id: string;
  symbol: string;
  /** Multiply by this to get the base unit (linear categories). Exact fractions allowed ("5/18"). */
  factor?: string;
}

export const UNIT_CATEGORIES: UnitCategory[] = ['length', 'mass', 'temperature', 'area', 'volume', 'speed', 'time', 'data', 'energy'];

export const UNITS: Record<UnitCategory, UnitDef[]> = {
  length: [
    { id: 'mm', symbol: 'mm', factor: '0.001' },
    { id: 'cm', symbol: 'cm', factor: '0.01' },
    { id: 'm', symbol: 'm', factor: '1' },
    { id: 'km', symbol: 'km', factor: '1000' },
    { id: 'in', symbol: 'in', factor: '0.0254' },
    { id: 'ft', symbol: 'ft', factor: '0.3048' },
    { id: 'yd', symbol: 'yd', factor: '0.9144' },
    { id: 'mi', symbol: 'mi', factor: '1609.344' },
    { id: 'nmi', symbol: 'nmi', factor: '1852' },
  ],
  mass: [
    { id: 'mg', symbol: 'mg', factor: '0.000001' },
    { id: 'g', symbol: 'g', factor: '0.001' },
    { id: 'kg', symbol: 'kg', factor: '1' },
    { id: 't', symbol: 't', factor: '1000' },
    { id: 'oz', symbol: 'oz', factor: '0.028349523125' },
    { id: 'lb', symbol: 'lb', factor: '0.45359237' },
    { id: 'st', symbol: 'st', factor: '6.35029318' },
  ],
  temperature: [
    { id: 'c', symbol: '°C' },
    { id: 'f', symbol: '°F' },
    { id: 'k', symbol: 'K' },
  ],
  area: [
    { id: 'mm2', symbol: 'mm²', factor: '0.000001' },
    { id: 'cm2', symbol: 'cm²', factor: '0.0001' },
    { id: 'm2', symbol: 'm²', factor: '1' },
    { id: 'ha', symbol: 'ha', factor: '10000' },
    { id: 'km2', symbol: 'km²', factor: '1000000' },
    { id: 'in2', symbol: 'in²', factor: '0.00064516' },
    { id: 'ft2', symbol: 'ft²', factor: '0.09290304' },
    { id: 'yd2', symbol: 'yd²', factor: '0.83612736' },
    { id: 'ac', symbol: 'ac', factor: '4046.8564224' },
    { id: 'mi2', symbol: 'mi²', factor: '2589988.110336' },
  ],
  volume: [
    { id: 'ml', symbol: 'mL', factor: '0.001' },
    { id: 'cl', symbol: 'cL', factor: '0.01' },
    { id: 'l', symbol: 'L', factor: '1' },
    { id: 'm3', symbol: 'm³', factor: '1000' },
    { id: 'tsp', symbol: 'tsp', factor: '0.00492892159375' },
    { id: 'tbsp', symbol: 'tbsp', factor: '0.01478676478125' },
    { id: 'floz', symbol: 'fl oz', factor: '0.0295735295625' },
    { id: 'cup', symbol: 'cup', factor: '0.2365882365' },
    { id: 'pt', symbol: 'pt', factor: '0.473176473' },
    { id: 'gal', symbol: 'gal', factor: '3.785411784' },
    { id: 'galuk', symbol: 'gal (UK)', factor: '4.54609' },
    { id: 'ft3', symbol: 'ft³', factor: '28.316846592' },
  ],
  speed: [
    { id: 'ms', symbol: 'm/s', factor: '1' },
    { id: 'kmh', symbol: 'km/h', factor: '5/18' },
    { id: 'mph', symbol: 'mph', factor: '0.44704' },
    { id: 'kn', symbol: 'kn', factor: '1852/3600' },
    { id: 'fts', symbol: 'ft/s', factor: '0.3048' },
  ],
  time: [
    { id: 'ms', symbol: 'ms', factor: '0.001' },
    { id: 's', symbol: 's', factor: '1' },
    { id: 'min', symbol: 'min', factor: '60' },
    { id: 'h', symbol: 'h', factor: '3600' },
    { id: 'd', symbol: 'd', factor: '86400' },
    { id: 'wk', symbol: 'wk', factor: '604800' },
    { id: 'mo', symbol: 'mo', factor: '2629746' },
    { id: 'yr', symbol: 'yr', factor: '31556952' },
  ],
  data: [
    { id: 'bit', symbol: 'bit', factor: '0.125' },
    { id: 'b', symbol: 'B', factor: '1' },
    { id: 'kb', symbol: 'kB', factor: '1000' },
    { id: 'mb', symbol: 'MB', factor: '1000000' },
    { id: 'gb', symbol: 'GB', factor: '1000000000' },
    { id: 'tb', symbol: 'TB', factor: '1000000000000' },
    { id: 'kib', symbol: 'KiB', factor: '1024' },
    { id: 'mib', symbol: 'MiB', factor: '1048576' },
    { id: 'gib', symbol: 'GiB', factor: '1073741824' },
    { id: 'tib', symbol: 'TiB', factor: '1099511627776' },
  ],
  energy: [
    { id: 'j', symbol: 'J', factor: '1' },
    { id: 'kj', symbol: 'kJ', factor: '1000' },
    { id: 'cal', symbol: 'cal', factor: '4.184' },
    { id: 'kcal', symbol: 'kcal', factor: '4184' },
    { id: 'wh', symbol: 'Wh', factor: '3600' },
    { id: 'kwh', symbol: 'kWh', factor: '3600000' },
    { id: 'btu', symbol: 'BTU', factor: '1055.05585262' },
    { id: 'ev', symbol: 'eV', factor: '1.602176634e-19' },
  ],
};

export const DEFAULT_PAIRS: Record<UnitCategory, [string, string]> = {
  length: ['km', 'mi'],
  mass: ['kg', 'lb'],
  temperature: ['c', 'f'],
  area: ['m2', 'ft2'],
  volume: ['l', 'gal'],
  speed: ['kmh', 'mph'],
  time: ['h', 'min'],
  data: ['gb', 'mb'],
  energy: ['kcal', 'kj'],
};

export function findUnit(category: UnitCategory, id: string): UnitDef | undefined {
  return UNITS[category].find((u) => u.id === id);
}

const ABSOLUTE_ZERO_C = new Dec('-273.15');

function toCelsius(value: Dec, unit: string): Dec {
  if (unit === 'c') return value;
  if (unit === 'f') return value.minus(32).times(5).div(9);
  return value.plus(ABSOLUTE_ZERO_C); // kelvin
}

function fromCelsius(celsius: Dec, unit: string): Dec {
  if (unit === 'c') return celsius;
  if (unit === 'f') return celsius.times(9).div(5).plus(32);
  return celsius.minus(ABSOLUTE_ZERO_C);
}

export function convert(value: Dec, category: UnitCategory, fromId: string, toId: string): CalcResult<Dec> {
  const from = findUnit(category, fromId);
  const to = findUnit(category, toId);
  if (!from) return fail('incompatible_units', 'from');
  if (!to) return fail('incompatible_units', 'to');
  if (category === 'temperature') {
    const c = toCelsius(value, from.id);
    if (c.lt(ABSOLUTE_ZERO_C)) return fail('percent_range', 'value'); // below absolute zero
    return ok(fromCelsius(c, to.id));
  }
  if (category !== 'time' && value.isNegative() && category !== 'energy') {
    // Negative lengths, masses, areas, volumes, speeds or data sizes are physical nonsense.
    return fail('negative', 'value');
  }
  // value × (fn/fd) ÷ (tn/td): fractions such as km/h = 5/18 m/s stay exact.
  const [fn = '1', fd = '1'] = (from.factor ?? '1').split('/');
  const [tn = '1', td = '1'] = (to.factor ?? '1').split('/');
  return ok(value.times(fn).times(td).div(new Dec(fd).times(tn)));
}

/** Converts a value to every unit of its category (for the "all units" list). */
export function convertAll(value: Dec, category: UnitCategory, fromId: string): CalcResult<{ unit: UnitDef; value: Dec }[]> {
  const out: { unit: UnitDef; value: Dec }[] = [];
  for (const unit of UNITS[category]) {
    const r = convert(value, category, fromId, unit.id);
    if (!r.ok) return r;
    out.push({ unit, value: r.value });
  }
  return ok(out);
}
