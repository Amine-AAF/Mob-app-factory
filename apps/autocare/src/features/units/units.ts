import type { ConsumptionFormat, DistanceUnit, EnergyConsumptionFormat, UnitPreferences, VolumeUnit } from '@/types';

/**
 * Unit conversions. Storage is always metric (km, litres, kWh); these helpers
 * convert at the UI edge only, so changing a preference never rewrites data.
 */
export const KM_PER_MILE = 1.609344;
export const LITRES_PER_US_GALLON = 3.785411784;
export const LITRES_PER_UK_GALLON = 4.54609;

export const DEFAULT_UNITS: UnitPreferences = { distance: 'km', volume: 'L', consumption: 'l_per_100km', energyConsumption: 'kwh_per_100km' };

/** Sensible starting units for a region; the user can change each one independently. */
export function unitsForRegion(regionCode: string | null | undefined): UnitPreferences {
  switch ((regionCode ?? '').toUpperCase()) {
    case 'US':
      return { distance: 'mi', volume: 'gal_us', consumption: 'mpg_us', energyConsumption: 'mi_per_kwh' };
    case 'GB':
      return { distance: 'mi', volume: 'L', consumption: 'mpg_uk', energyConsumption: 'mi_per_kwh' };
    default:
      return DEFAULT_UNITS;
  }
}

export function kmToDistance(km: number, unit: DistanceUnit): number {
  return unit === 'km' ? km : km / KM_PER_MILE;
}

export function distanceToKm(value: number, unit: DistanceUnit): number {
  return unit === 'km' ? value : value * KM_PER_MILE;
}

export function litresToVolume(litres: number, unit: VolumeUnit): number {
  if (unit === 'gal_us') return litres / LITRES_PER_US_GALLON;
  if (unit === 'gal_uk') return litres / LITRES_PER_UK_GALLON;
  return litres;
}

export function volumeToLitres(value: number, unit: VolumeUnit): number {
  if (unit === 'gal_us') return value * LITRES_PER_US_GALLON;
  if (unit === 'gal_uk') return value * LITRES_PER_UK_GALLON;
  return value;
}

/** Price per litre ↔ price per display volume unit. */
export function pricePerLitreToUnit(pricePerLitre: number, unit: VolumeUnit): number {
  return pricePerLitre * volumeToLitres(1, unit);
}

export function pricePerUnitToLitre(pricePerUnit: number, unit: VolumeUnit): number {
  return pricePerUnit / volumeToLitres(1, unit);
}

/**
 * Converts a consumption expressed in litres per 100 km into the chosen format.
 * Returns null for non-positive inputs (no meaningful figure).
 */
export function formatConsumptionValue(lPer100km: number, format: ConsumptionFormat): number | null {
  if (!Number.isFinite(lPer100km) || lPer100km <= 0) return null;
  switch (format) {
    case 'l_per_100km':
      return lPer100km;
    case 'km_per_l':
      return 100 / lPer100km;
    case 'mpg_us':
      return (100 / lPer100km / KM_PER_MILE) * LITRES_PER_US_GALLON;
    case 'mpg_uk':
      return (100 / lPer100km / KM_PER_MILE) * LITRES_PER_UK_GALLON;
  }
}

export function formatEnergyConsumptionValue(kwhPer100km: number, format: EnergyConsumptionFormat): number | null {
  if (!Number.isFinite(kwhPer100km) || kwhPer100km <= 0) return null;
  switch (format) {
    case 'kwh_per_100km':
      return kwhPer100km;
    case 'kwh_per_100mi':
      return kwhPer100km * KM_PER_MILE;
    case 'km_per_kwh':
      return 100 / kwhPer100km;
    case 'mi_per_kwh':
      return 100 / kwhPer100km / KM_PER_MILE;
  }
}

/** True when a bigger number means a more efficient vehicle (km/L, MPG, mi/kWh). */
export function higherIsBetter(format: ConsumptionFormat | EnergyConsumptionFormat): boolean {
  return format === 'km_per_l' || format === 'mpg_us' || format === 'mpg_uk' || format === 'km_per_kwh' || format === 'mi_per_kwh';
}

/** Cost per km → cost per display distance unit (still in minor units). */
export function costPerKmToUnit(costPerKmMinor: number, unit: DistanceUnit): number {
  return unit === 'km' ? costPerKmMinor : costPerKmMinor * KM_PER_MILE;
}

/** Parses a user-typed decimal ("1 234,5", "1,234.5", "12.5"). Returns null when invalid. */
export function parseDecimal(input: string): number | null {
  const s = input.replace(/[\s  ']/g, '').trim();
  if (!s) return null;
  if (!/^-?[\d.,]+$/.test(s)) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  let normalized: string;
  if (lastComma >= 0 && lastDot >= 0) {
    // The last separator is the decimal one; the other is grouping.
    normalized = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lastComma >= 0) {
    // A single comma is a decimal separator ("1,879" €/L is far more common than "1,879" km
    // typed with grouping); several commas are grouping ("1,234,567").
    normalized = s.split(',').length === 2 ? s.replace(',', '.') : s.replace(/,/g, '');
  } else {
    const parts = s.split('.');
    normalized = parts.length > 2 ? s.replace(/\./g, '') : s;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
