import { currenciesOf, type CurrencyTotals } from '@/features/money/money';
import { costPerKmToUnit, formatConsumptionValue, formatEnergyConsumptionValue, kmToDistance, litresToVolume } from '@/features/units/units';
import type { CurrencyCode, DayKey, QuantityUnit, UnitPreferences } from '@/types';
import { fromDayKey } from '@/utils/dates';

/**
 * Locale-aware formatting. Language drives number/date/currency formatting;
 * unit preferences drive the units — the two are independent.
 * Pure functions (language and units passed in) so they are unit-tested.
 */
export const UNIT_SYMBOLS = {
  km: 'km',
  mi: 'mi',
  L: 'L',
  gal_us: 'gal (US)',
  gal_uk: 'gal (UK)',
  kWh: 'kWh',
  l_per_100km: 'L/100 km',
  km_per_l: 'km/L',
  mpg_us: 'mpg (US)',
  mpg_uk: 'mpg (UK)',
  kwh_per_100km: 'kWh/100 km',
  kwh_per_100mi: 'kWh/100 mi',
  km_per_kwh: 'km/kWh',
  mi_per_kwh: 'mi/kWh',
} as const;

export function createFormatter(lng: string, units: UnitPreferences) {
  const num = (n: number, digits = 0) => new Intl.NumberFormat(lng, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);

  const money = (minor: number, currency: CurrencyCode) => {
    try {
      return new Intl.NumberFormat(lng, { style: 'currency', currency }).format(minor / 100);
    } catch {
      return `${num(minor / 100, 2)} ${currency}`;
    }
  };

  return {
    lng,
    units,
    number: num,
    money,
    /** "1 234,00 € + 300,00 MAD": multi-currency totals are listed, never added. */
    totals: (t: CurrencyTotals, preferred?: CurrencyCode, empty = '—') => {
      const cs = currenciesOf(t, preferred).filter((c) => (t[c] ?? 0) !== 0);
      return cs.length ? cs.map((c) => money(t[c]!, c)).join(' + ') : empty;
    },
    distance: (km: number | null | undefined, digits = 0) => (km === null || km === undefined ? '—' : `${num(kmToDistance(km, units.distance), digits)} ${UNIT_SYMBOLS[units.distance]}`),
    distanceValue: (km: number) => kmToDistance(km, units.distance),
    distanceUnit: UNIT_SYMBOLS[units.distance],
    volume: (litres: number, digits = 2) => `${num(litresToVolume(litres, units.volume), digits)} ${UNIT_SYMBOLS[units.volume]}`,
    volumeUnit: UNIT_SYMBOLS[units.volume],
    quantity: (q: number, unit: QuantityUnit) => (unit === 'kWh' ? `${num(q, 1)} kWh` : `${num(litresToVolume(q, units.volume), 2)} ${UNIT_SYMBOLS[units.volume]}`),
    /** Consumption from a per-100 km value in the user's format ("6,4 L/100 km", "36.8 mpg (US)"). */
    consumption: (per100km: number | null, unit: QuantityUnit) => {
      if (per100km === null) return null;
      if (unit === 'kWh') {
        const v = formatEnergyConsumptionValue(per100km, units.energyConsumption);
        return v === null ? null : `${num(v, 1)} ${UNIT_SYMBOLS[units.energyConsumption]}`;
      }
      const v = formatConsumptionValue(per100km, units.consumption);
      return v === null ? null : `${num(v, 1)} ${UNIT_SYMBOLS[units.consumption]}`;
    },
    consumptionValue: (per100km: number, unit: QuantityUnit) => (unit === 'kWh' ? formatEnergyConsumptionValue(per100km, units.energyConsumption) : formatConsumptionValue(per100km, units.consumption)),
    /** Cost per km/mi; input in minor units per km. */
    costPerDistance: (minorPerKm: number, currency: CurrencyCode) => {
      const perUnit = costPerKmToUnit(minorPerKm, units.distance) / 100;
      let s: string;
      try {
        s = new Intl.NumberFormat(lng, { style: 'currency', currency, maximumFractionDigits: 3, minimumFractionDigits: 2 }).format(perUnit);
      } catch {
        s = `${num(perUnit, 3)} ${currency}`;
      }
      return `${s}/${UNIT_SYMBOLS[units.distance]}`;
    },
    day: (day: DayKey | null | undefined, style: 'short' | 'medium' | 'long' = 'medium') => {
      if (!day) return '—';
      const d = fromDayKey(day);
      const opts: Intl.DateTimeFormatOptions = style === 'short' ? { day: 'numeric', month: 'short' } : style === 'long' ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' };
      return new Intl.DateTimeFormat(lng, opts).format(d);
    },
    month: (month: string, style: 'short' | 'long' = 'short') => new Intl.DateTimeFormat(lng, style === 'short' ? { month: 'short' } : { month: 'long', year: 'numeric' }).format(fromDayKey(`${month}-01`)),
    percent: (ratio: number) => new Intl.NumberFormat(lng, { style: 'percent', maximumFractionDigits: 0 }).format(ratio),
    unitPrice: (price: number, currency: CurrencyCode, unit: QuantityUnit) => {
      const perUnit = unit === 'kWh' ? price : price * (units.volume === 'L' ? 1 : units.volume === 'gal_us' ? 3.785411784 : 4.54609);
      let s: string;
      try {
        s = new Intl.NumberFormat(lng, { style: 'currency', currency, minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(perUnit);
      } catch {
        s = `${num(perUnit, 3)} ${currency}`;
      }
      return `${s}/${unit === 'kWh' ? 'kWh' : UNIT_SYMBOLS[units.volume]}`;
    },
  };
}

export type Formatter = ReturnType<typeof createFormatter>;
