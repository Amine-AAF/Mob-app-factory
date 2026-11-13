import { loadVehicleBundle, type Repositories, type VehicleBundle } from '@/database';
import { budgetStatus, inRange, toCostEntries, totals, type BudgetStatus } from '@/features/expenses/aggregate';
import { currentPolicy, policyStatus } from '@/features/deadlines/deadlines';
import { computeConsumption, unitsInUse } from '@/features/fuel/consumption';
import { sortByUrgency, type DueInfo } from '@/features/maintenance/schedule';
import type { CurrencyTotals } from '@/features/money/money';
import { alertsFor, deriveOdometer, scheduleDues, type Alert, type DerivedOdometer } from '@/features/reminders/plan';
import type { AdminDeadline, DayKey, FuelRecord, InsurancePolicy, MaintenanceSchedule, Vehicle } from '@/types';
import { endOfMonth, monthKey, startOfMonth } from '@/utils/dates';

/** Everything the Home screen shows, computed from local data only. */
export interface VehicleSummary {
  vehicle: Vehicle;
  odometer: DerivedOdometer;
  nextMaintenance: { schedule: MaintenanceSchedule; due: DueInfo } | null;
  nextOilChange: { schedule: MaintenanceSchedule; due: DueInfo } | null;
  insurance: { policy: InsurancePolicy; status: ReturnType<typeof policyStatus> } | null;
  inspection: AdminDeadline | null;
  monthSpend: CurrencyTotals;
  recentFuel: FuelRecord[];
  consumption: { unit: 'L' | 'kWh'; per100km: number | null }[];
  alerts: Alert[];
}

export function summarize(b: VehicleBundle, today: DayKey): VehicleSummary {
  const ctx = { vehicle: b.vehicle, readings: b.readings, schedules: b.schedules, deadlines: b.deadlines, policies: b.policies, documents: b.documents, tires: b.tires };
  const odometer = deriveOdometer(ctx, today);
  const dues = sortByUrgency(scheduleDues(ctx, today, odometer));
  const withDate = dues.filter((d) => d.due.status !== 'unknown');
  const policy = currentPolicy(b.policies, today);
  const inspection = b.deadlines.filter((d) => d.type === 'inspection' && !d.completedAt).sort((a, z) => (a.dueDay < z.dueDay ? -1 : 1))[0] ?? null;
  const entries = inRange(toCostEntries(b), startOfMonth(today), endOfMonth(today));
  return {
    vehicle: b.vehicle,
    odometer,
    nextMaintenance: withDate[0] ?? dues[0] ?? null,
    nextOilChange: dues.find((d) => d.schedule.type === 'oil_change') ?? null,
    insurance: policy ? { policy, status: policyStatus(policy, today) } : null,
    inspection,
    monthSpend: totals(entries),
    recentFuel: b.fuel.slice(0, 3),
    consumption: unitsInUse(b.fuel).map((unit) => ({ unit, per100km: computeConsumption(b.fuel, unit).averagePer100km })),
    alerts: alertsFor(ctx, today),
  };
}

export async function loadDashboard(r: Repositories, today: DayKey): Promise<{ summaries: VehicleSummary[]; budget: BudgetStatus | null; monthTotals: CurrencyTotals }> {
  const vehicles = await r.vehicles.list();
  const bundles = (await Promise.all(vehicles.map((v) => loadVehicleBundle(r, v.id)))).filter((b): b is VehicleBundle => !!b);
  const summaries = bundles.map((b) => summarize(b, today));
  const allEntries = bundles.flatMap((b) => toCostEntries(b));
  const budget = await r.budgets.get(null);
  const month = monthKey(today);
  return {
    summaries,
    budget: budget ? budgetStatus(allEntries, budget, month) : null,
    monthTotals: totals(inRange(allEntries, startOfMonth(today), endOfMonth(today))),
  };
}
