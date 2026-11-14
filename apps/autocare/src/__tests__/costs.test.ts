import { metricsFor, bestIndex } from '@/features/comparison/compare';
import { currentPolicy, deadlineStatus, documentExpiryStatus, expectedPaymentDays, nextDeadlineDay, normalizeLeadDays, policyStatus, renewalTerm, tireDistanceKm } from '@/features/deadlines/deadlines';
import { budgetStatus, byCategory, costPerKm, dueOccurrences, inRange, monthlyEquivalent, nextOccurrence, toCostEntries, totalCostOfOwnership, totals, totalsByMonth, totalsByYear } from '@/features/expenses/aggregate';
import { canAddDocument, canAddExpense, canAddSchedule, canAddVehicle, FREE_LIMITS, hasFeature, statsMonths } from '@/features/premium/limits';
import type { Expense, MaintenanceRecord, TireRecord } from '@/types';

import { fill, vehicle } from './fixtures';

const expense = (p: Partial<Expense>): Expense => ({
  id: Math.random().toString(36).slice(2),
  vehicleId: 'v1',
  category: 'parking',
  day: '2026-03-10',
  amountMinor: 1000,
  currency: 'EUR',
  vendor: null,
  odometerKm: null,
  notes: null,
  recurrence: 'none',
  recurringParentId: null,
  insuranceId: null,
  createdAt: '',
  updatedAt: '',
  ...p,
});
const maint = (p: Partial<MaintenanceRecord>): MaintenanceRecord => ({ id: 'm1', vehicleId: 'v1', type: 'oil_change', title: null, day: '2026-03-01', odometerKm: null, description: null, provider: null, costMinor: 12000, currency: 'EUR', parts: null, notes: null, scheduleId: null, createdAt: '', updatedAt: '', ...p });
const tire = (p: Partial<TireRecord>): TireRecord => ({ id: 't1', vehicleId: 'v1', brand: 'Michelin', model: null, size: null, season: 'summer', position: 'all', installedDay: '2026-02-01', installedOdometerKm: 10000, removedDay: null, removedOdometerKm: null, priceMinor: 40000, currency: 'EUR', status: 'mounted', reminderDay: null, reminderKm: null, notes: null, createdAt: '', updatedAt: '', ...p });

describe('cost aggregation', () => {
  const entries = toCostEntries({
    expenses: [expense({ category: 'parking', amountMinor: 500 }), expense({ category: 'tolls', amountMinor: 1500, currency: 'MAD', day: '2026-02-05' })],
    fuel: [fill({ day: '2026-03-02', totalMinor: 7000 })],
    maintenance: [maint({}), maint({ id: 'm2', type: 'repair', costMinor: 30000 }), maint({ id: 'm3', costMinor: null })],
    tires: [tire({})],
  });

  it('collects every cost from its own table exactly once', () => {
    expect(entries).toHaveLength(6);
    expect(entries.filter((e) => e.source === 'maintenance').map((e) => e.category).sort()).toEqual(['maintenance', 'repair']);
  });

  it('totals per currency, never mixing them', () => {
    expect(totals(entries)).toEqual({ EUR: 500 + 7000 + 12000 + 30000 + 40000, MAD: 1500 });
  });

  it('breaks down by category within one currency', () => {
    const cats = byCategory(entries, 'EUR');
    expect(cats[0]).toMatchObject({ category: 'tires', minor: 40000 });
    expect(cats.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1, 9);
    expect(cats.some((c) => c.category === 'tolls')).toBe(false);
  });

  it('groups by month and year', () => {
    const m = totalsByMonth(entries, ['2026-02', '2026-03']);
    expect(m[0]!.totals).toEqual({ EUR: 40000, MAD: 1500 });
    expect(totalsByYear(entries)).toHaveLength(1);
    expect(inRange(entries, '2026-03-01', '2026-03-31')).toHaveLength(4);
  });

  it('cost per km needs a known distance', () => {
    expect(costPerKm({ EUR: 10000 }, 1000)).toEqual({ EUR: 10 });
    expect(costPerKm({ EUR: 10000 }, null)).toBeNull();
    expect(costPerKm({ EUR: 10000 }, 0)).toBeNull();
  });

  it('total cost of ownership adds the purchase price in its currency', () => {
    expect(totalCostOfOwnership(entries, { minor: 1000000, currency: 'EUR' }).EUR).toBe(1000000 + 89500);
    expect(totalCostOfOwnership(entries, { minor: null, currency: 'EUR' }).EUR).toBe(89500);
  });

  it('budget only counts its own currency and reports the others', () => {
    const b = budgetStatus(entries, { monthlyMinor: 50000, currency: 'EUR' }, '2026-03');
    expect(b.spentMinor).toBe(500 + 7000 + 12000 + 30000);
    expect(b.state).toBe('near');
    const feb = budgetStatus(entries, { monthlyMinor: 30000, currency: 'EUR' }, '2026-02');
    expect(feb.state).toBe('over');
    expect(feb.otherCurrencies).toEqual(['MAD']);
  });
});

describe('recurring expenses', () => {
  it('lists missed occurrences up to today, clamping month ends', () => {
    expect(dueOccurrences({ day: '2026-01-31', recurrence: 'monthly' }, new Set(), '2026-04-15')).toEqual(['2026-02-28', '2026-03-31']);
  });

  it('is idempotent (existing days are skipped)', () => {
    expect(dueOccurrences({ day: '2026-01-31', recurrence: 'monthly' }, new Set(['2026-02-28']), '2026-04-15')).toEqual(['2026-03-31']);
  });

  it('handles quarterly / yearly and one-offs', () => {
    expect(dueOccurrences({ day: '2025-01-15', recurrence: 'yearly' }, new Set(), '2026-06-01')).toEqual(['2026-01-15']);
    expect(dueOccurrences({ day: '2026-01-15', recurrence: 'quarterly' }, new Set(), '2026-07-15')).toEqual(['2026-04-15', '2026-07-15']);
    expect(dueOccurrences({ day: '2026-01-15', recurrence: 'none' }, new Set(), '2027-01-01')).toEqual([]);
  });

  it('caps a wrong start date', () => {
    expect(dueOccurrences({ day: '1990-01-01', recurrence: 'monthly' }, new Set(), '2026-01-01').length).toBe(120);
  });

  it('computes next occurrence and monthly equivalent', () => {
    expect(nextOccurrence({ day: '2026-01-10', recurrence: 'monthly' }, '2026-03-10')).toBe('2026-04-10');
    expect(monthlyEquivalent(12000, 'yearly')).toBe(1000);
    expect(monthlyEquivalent(12000, 'none')).toBeNull();
  });
});

describe('deadlines, insurance, documents, tires', () => {
  it('deadline status uses the configured lead days', () => {
    expect(deadlineStatus({ dueDay: '2026-03-01', completedAt: null, remindDaysBefore: [30] }, '2026-03-02')).toBe('overdue');
    expect(deadlineStatus({ dueDay: '2026-03-20', completedAt: null, remindDaysBefore: [30] }, '2026-03-02')).toBe('due_soon');
    expect(deadlineStatus({ dueDay: '2026-06-20', completedAt: null, remindDaysBefore: [30] }, '2026-03-02')).toBe('ok');
    expect(deadlineStatus({ dueDay: '2026-03-01', completedAt: 'x', remindDaysBefore: [30] }, '2026-03-02')).toBe('done');
  });

  it('repeats only when the user set an interval (no country rule is assumed)', () => {
    expect(nextDeadlineDay({ dueDay: '2026-05-31', repeatMonths: 24 })).toBe('2028-05-31');
    expect(nextDeadlineDay({ dueDay: '2026-05-31', repeatMonths: null })).toBeNull();
  });

  it('normalizes lead days', () => {
    expect(normalizeLeadDays([7, 30, 7, -1, 1.5, 400, 0])).toEqual([30, 7, 0]);
  });

  it('policy status and current policy', () => {
    const p = { startDay: '2026-01-01', endDay: '2026-12-31', remindDaysBefore: 30 };
    expect(policyStatus(p, '2026-06-01')).toBe('active');
    expect(policyStatus(p, '2026-12-15')).toBe('expiring');
    expect(policyStatus(p, '2027-01-01')).toBe('expired');
    expect(policyStatus(p, '2025-12-01')).toBe('upcoming');
    const older = { id: 'a', startDay: '2025-01-01', endDay: '2025-12-31' };
    const current = { id: 'b', startDay: '2026-01-01', endDay: '2026-12-31' };
    expect(currentPolicy([older, current], '2026-05-01')?.id).toBe('b');
    expect(currentPolicy([older], '2026-05-01')?.id).toBe('a');
  });

  it('renewal keeps the term length', () => {
    expect(renewalTerm({ startDay: '2026-01-01', endDay: '2026-12-31' })).toEqual({ startDay: '2027-01-01', endDay: '2027-12-31' });
    expect(renewalTerm({ startDay: '2026-01-01', endDay: '2026-06-30' })).toEqual({ startDay: '2026-07-01', endDay: '2026-12-31' });
  });

  it('expected payment days follow the frequency', () => {
    expect(expectedPaymentDays({ startDay: '2026-01-15', endDay: '2027-01-14', paymentFrequency: 'quarterly' })).toEqual(['2026-01-15', '2026-04-15', '2026-07-15', '2026-10-15']);
    expect(expectedPaymentDays({ startDay: '2026-01-15', endDay: '2027-01-14', paymentFrequency: 'annual' })).toHaveLength(1);
  });

  it('document expiry', () => {
    expect(documentExpiryStatus({ expiryDay: null }, '2026-01-01')).toBe('none');
    expect(documentExpiryStatus({ expiryDay: '2026-01-20' }, '2026-01-01')).toBe('expiring');
    expect(documentExpiryStatus({ expiryDay: '2025-12-20' }, '2026-01-01')).toBe('expired');
  });

  it('tire distance is computed from odometer readings only (no wear claim)', () => {
    expect(tireDistanceKm(tire({}), 25000)).toBe(15000);
    expect(tireDistanceKm(tire({ status: 'stored', removedOdometerKm: 18000 }), 25000)).toBe(8000);
    expect(tireDistanceKm(tire({ installedOdometerKm: null }), 25000)).toBeNull();
    expect(tireDistanceKm(tire({ status: 'stored' }), 25000)).toBeNull();
  });
});

describe('vehicle comparison', () => {
  it('computes per-vehicle metrics over the same period', () => {
    const data = {
      vehicle: vehicle(),
      readings: [
        { day: '2026-01-01', odometerKm: 10000 },
        { day: '2026-03-31', odometerKm: 12000 },
      ],
      expenses: [expense({ day: '2026-02-01', amountMinor: 2000 })],
      fuel: [fill({ day: '2026-01-01', odometerKm: 10000, totalMinor: 6000 }), fill({ day: '2026-02-01', odometerKm: 11000, quantity: 60, totalMinor: 9000 })],
      maintenance: [maint({ day: '2026-03-01', costMinor: 10000 })],
      tires: [],
    };
    const m = metricsFor(data, '2026-01-01', '2026-03-31', ['2026-01', '2026-02', '2026-03']);
    expect(m.total).toEqual({ EUR: 2000 + 6000 + 9000 + 10000 });
    expect(m.fuel).toEqual({ EUR: 15000 });
    expect(m.maintenance).toEqual({ EUR: 10000 });
    expect(m.distanceKm).toBe(2000);
    expect(m.costPerKm?.EUR).toBeCloseTo(27000 / 2000, 9);
    expect(m.consumption).toEqual([{ unit: 'L', per100km: 6 }]);
  });

  it('best index ignores missing values', () => {
    expect(bestIndex([3, null, 1, undefined])).toBe(2);
    expect(bestIndex([null, null])).toBeNull();
  });
});

describe('free vs premium', () => {
  it('free plan limits creation, never access to existing data', () => {
    expect(canAddVehicle(false, 0)).toBe(true);
    expect(canAddVehicle(false, FREE_LIMITS.vehicles)).toBe(false);
    expect(canAddVehicle(true, 50)).toBe(true);
    expect(canAddExpense(false, FREE_LIMITS.expensesPerMonth)).toBe(false);
    expect(canAddDocument(false, FREE_LIMITS.documents - 1)).toBe(true);
    expect(canAddSchedule(false, FREE_LIMITS.schedules)).toBe(false);
    expect(statsMonths(false)).toBe(FREE_LIMITS.statsMonths);
    expect(statsMonths(true)).toBeGreaterThan(FREE_LIMITS.statsMonths);
  });

  it('premium-only areas', () => {
    expect(hasFeature(false, 'reports')).toBe(false);
    expect(hasFeature(false, 'comparison')).toBe(false);
    expect(hasFeature(true, 'reports')).toBe(true);
  });
});
