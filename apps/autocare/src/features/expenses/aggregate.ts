import { addTo, type CurrencyTotals } from '@/features/money/money';
import type { CurrencyCode, DayKey, Expense, ExpenseCategory, FuelRecord, MaintenanceRecord, Recurrence, TireRecord } from '@/types';
import { addMonths, monthKey, yearOf } from '@/utils/dates';

/**
 * Every cost of a vehicle, whatever screen it was entered on, as one list:
 * expenses + fuel fills + maintenance costs + tire purchases. Each cost lives
 * in exactly one table, so nothing is counted twice.
 */
export type CostSource = 'expense' | 'fuel' | 'maintenance' | 'tire';
export interface CostEntry {
  source: CostSource;
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  day: DayKey;
  minor: number;
  currency: CurrencyCode;
}

export function toCostEntries(input: { expenses?: readonly Expense[]; fuel?: readonly FuelRecord[]; maintenance?: readonly MaintenanceRecord[]; tires?: readonly TireRecord[] }): CostEntry[] {
  const out: CostEntry[] = [];
  for (const e of input.expenses ?? []) out.push({ source: 'expense', id: e.id, vehicleId: e.vehicleId, category: e.category, day: e.day, minor: e.amountMinor, currency: e.currency });
  for (const f of input.fuel ?? []) out.push({ source: 'fuel', id: f.id, vehicleId: f.vehicleId, category: 'fuel', day: f.day, minor: f.totalMinor, currency: f.currency });
  for (const m of input.maintenance ?? []) {
    if (m.costMinor === null || m.costMinor <= 0) continue;
    out.push({ source: 'maintenance', id: m.id, vehicleId: m.vehicleId, category: m.type === 'repair' ? 'repair' : m.type === 'tires' ? 'tires' : 'maintenance', day: m.day, minor: m.costMinor, currency: m.currency });
  }
  for (const t of input.tires ?? []) {
    if (t.priceMinor === null || t.priceMinor <= 0) continue;
    out.push({ source: 'tire', id: t.id, vehicleId: t.vehicleId, category: 'tires', day: t.installedDay, minor: t.priceMinor, currency: t.currency });
  }
  return out.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
}

export function inRange(entries: readonly CostEntry[], fromDay: DayKey | null, toDay: DayKey | null): CostEntry[] {
  return entries.filter((e) => (!fromDay || e.day >= fromDay) && (!toDay || e.day <= toDay));
}

export function totals(entries: readonly CostEntry[]): CurrencyTotals {
  const t: CurrencyTotals = {};
  for (const e of entries) addTo(t, { minor: e.minor, currency: e.currency });
  return t;
}

/** Totals per month key ("2026-11") for the given months (missing months → {}). */
export function totalsByMonth(entries: readonly CostEntry[], months: readonly string[]): { month: string; totals: CurrencyTotals }[] {
  const map = new Map<string, CurrencyTotals>(months.map((m) => [m, {}]));
  for (const e of entries) {
    const t = map.get(monthKey(e.day));
    if (t) addTo(t, { minor: e.minor, currency: e.currency });
  }
  return months.map((month) => ({ month, totals: map.get(month)! }));
}

export function totalsByYear(entries: readonly CostEntry[]): { year: number; totals: CurrencyTotals }[] {
  const map = new Map<number, CurrencyTotals>();
  for (const e of entries) {
    const y = yearOf(e.day);
    addTo(map.get(y) ?? map.set(y, {}).get(y)!, { minor: e.minor, currency: e.currency });
  }
  return [...map.entries()].sort(([a], [b]) => a - b).map(([year, t]) => ({ year, totals: t }));
}

/** Breakdown per category for ONE currency (shares only make sense within a currency). */
export function byCategory(entries: readonly CostEntry[], currency: CurrencyCode): { category: ExpenseCategory; minor: number; share: number }[] {
  const map = new Map<ExpenseCategory, number>();
  let total = 0;
  for (const e of entries) {
    if (e.currency !== currency) continue;
    map.set(e.category, (map.get(e.category) ?? 0) + e.minor);
    total += e.minor;
  }
  return [...map.entries()]
    .map(([category, minor]) => ({ category, minor, share: total > 0 ? minor / total : 0 }))
    .sort((a, b) => b.minor - a.minor);
}

/** Cost per km per currency (minor units per km). Null when the distance is unknown or zero. */
export function costPerKm(t: CurrencyTotals, distanceKm: number | null): Record<CurrencyCode, number> | null {
  if (distanceKm === null || !(distanceKm > 0)) return null;
  return Object.fromEntries(Object.entries(t).map(([c, v]) => [c, v / distanceKm]));
}

/**
 * Total cost of ownership: purchase price + every running cost, per currency.
 * (Resale value is unknown to the app, so this is the gross cost so far.)
 */
export function totalCostOfOwnership(entries: readonly CostEntry[], purchase: { minor: number | null; currency: CurrencyCode }): CurrencyTotals {
  const t = totals(entries);
  if (purchase.minor !== null && purchase.minor > 0) addTo(t, { minor: purchase.minor, currency: purchase.currency });
  return t;
}

export interface BudgetStatus {
  spentMinor: number;
  budgetMinor: number;
  ratio: number;
  state: 'under' | 'near' | 'over';
  /** Spending in other currencies is not counted against the budget (shown apart). */
  otherCurrencies: CurrencyCode[];
}

export function budgetStatus(entries: readonly CostEntry[], budget: { monthlyMinor: number; currency: CurrencyCode }, month: string): BudgetStatus {
  const monthEntries = entries.filter((e) => monthKey(e.day) === month);
  const spentMinor = monthEntries.filter((e) => e.currency === budget.currency).reduce((s, e) => s + e.minor, 0);
  const ratio = budget.monthlyMinor > 0 ? spentMinor / budget.monthlyMinor : 0;
  const otherCurrencies = [...new Set(monthEntries.filter((e) => e.currency !== budget.currency).map((e) => e.currency))];
  return { spentMinor, budgetMinor: budget.monthlyMinor, ratio, state: ratio > 1 ? 'over' : ratio >= 0.8 ? 'near' : 'under', otherCurrencies };
}

const RECURRENCE_MONTHS: Record<Exclude<Recurrence, 'none'>, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12 };

/**
 * Days on which a recurring expense should have occurred after its first day,
 * up to `today` (inclusive), excluding days that already exist. Capped so a
 * wrong start date can't flood the database.
 */
export function dueOccurrences(first: Pick<Expense, 'day' | 'recurrence'>, existingDays: ReadonlySet<DayKey>, today: DayKey, cap = 120): DayKey[] {
  if (first.recurrence === 'none') return [];
  const step = RECURRENCE_MONTHS[first.recurrence];
  const out: DayKey[] = [];
  for (let i = 1; i <= cap; i++) {
    const day = addMonths(first.day, step * i);
    if (day > today) break;
    if (!existingDays.has(day)) out.push(day);
  }
  return out;
}

/** Monthly-equivalent of a recurring amount (for "fixed costs per month"). */
export function monthlyEquivalent(minor: number, recurrence: Recurrence): number | null {
  if (recurrence === 'none') return null;
  return Math.round(minor / RECURRENCE_MONTHS[recurrence]);
}

/** Next occurrence after `fromDay` (for display). */
export function nextOccurrence(first: Pick<Expense, 'day' | 'recurrence'>, fromDay: DayKey): DayKey | null {
  if (first.recurrence === 'none') return null;
  const step = RECURRENCE_MONTHS[first.recurrence];
  for (let i = 0; i < 1200; i++) {
    const day = addMonths(first.day, step * i);
    if (day > fromDay) return day;
  }
  return null;
}
