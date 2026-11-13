import { byCategory, costPerKm, inRange, toCostEntries, totals, totalsByMonth } from '@/features/expenses/aggregate';
import { computeConsumption, unitsInUse } from '@/features/fuel/consumption';
import type { CurrencyTotals } from '@/features/money/money';
import { distanceBetween, type Reading } from '@/features/odometer/mileage';
import type { DayKey, Expense, FuelRecord, MaintenanceRecord, QuantityUnit, TireRecord, Vehicle } from '@/types';

/**
 * Side-by-side metrics for several vehicles over the same period.
 * Monetary metrics stay per currency; a vehicle tracked in EUR is never
 * ranked against one tracked in USD on the same axis.
 */
export interface VehicleData {
  vehicle: Vehicle;
  readings: Reading[];
  expenses: Expense[];
  fuel: FuelRecord[];
  maintenance: MaintenanceRecord[];
  tires: TireRecord[];
}

export interface VehicleMetrics {
  vehicleId: string;
  total: CurrencyTotals;
  fuel: CurrencyTotals;
  maintenance: CurrencyTotals;
  distanceKm: number | null;
  costPerKm: Record<string, number> | null;
  consumption: { unit: QuantityUnit; per100km: number | null }[];
  monthly: { month: string; totals: CurrencyTotals }[];
}

export function metricsFor(d: VehicleData, fromDay: DayKey, toDay: DayKey, months: readonly string[]): VehicleMetrics {
  const entries = inRange(toCostEntries(d), fromDay, toDay);
  const total = totals(entries);
  const fuel = totals(entries.filter((e) => e.category === 'fuel'));
  const maintenance = totals(entries.filter((e) => e.category === 'maintenance' || e.category === 'repair'));
  const distanceKm = distanceBetween(d.readings, fromDay, toDay);
  const fills = d.fuel.filter((f) => f.day >= fromDay && f.day <= toDay);
  return {
    vehicleId: d.vehicle.id,
    total,
    fuel,
    maintenance,
    distanceKm,
    costPerKm: costPerKm(total, distanceKm),
    consumption: unitsInUse(fills).map((unit) => ({ unit, per100km: computeConsumption(fills, unit).averagePer100km })),
    monthly: totalsByMonth(entries, months),
  };
}

/** Index of the best vehicle for a metric among those sharing `currency` (lower is better). */
export function bestIndex(values: readonly (number | null | undefined)[]): number | null {
  let best: number | null = null;
  values.forEach((v, i) => {
    if (v === null || v === undefined || !Number.isFinite(v)) return;
    if (best === null || v < (values[best] as number)) best = i;
  });
  return best;
}

export { byCategory };
