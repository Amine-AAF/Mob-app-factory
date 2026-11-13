/** Area is stored in m² and shown in the user's unit system. */
export type UnitSystem = 'metric' | 'imperial';

const FT2_PER_M2 = 10.763910417;

export function areaToDisplay(m2: number, system: UnitSystem): number {
  return system === 'imperial' ? m2 * FT2_PER_M2 : m2;
}

export function areaFromDisplay(value: number, system: UnitSystem): number {
  return system === 'imperial' ? value / FT2_PER_M2 : value;
}

export function areaUnitLabel(system: UnitSystem): string {
  return system === 'imperial' ? 'ft²' : 'm²';
}

/** Imperial is the default only where it is the everyday norm. */
export function defaultUnitSystem(region: string | null | undefined): UnitSystem {
  return region && ['US', 'LR', 'MM'].includes(region.toUpperCase()) ? 'imperial' : 'metric';
}

export function formatArea(m2: number, system: UnitSystem, locale: string): string {
  const v = areaToDisplay(m2, system);
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: v < 100 ? 1 : 0 }).format(v)} ${areaUnitLabel(system)}`;
}
