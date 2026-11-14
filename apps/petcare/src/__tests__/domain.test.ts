import { compareWeights, daysOfStockLeft, goalProgress, needsRestock, stockLevel, summarizeDay, weightSeries } from '@/domain/care';
import { addMonths, ageFrom, atLocalTime, endOfMonth, estimateBirthDate, isValidDayKey, isValidTime, splitInstant, toInstant } from '@/domain/dates';
import { budgetState, byCategory, inMonth, monthlySeries, parseAmount, totalsByCurrency } from '@/domain/expenses';
import { csvField, escapeHtml, expensesCsv, petReportHtml, toCsv } from '@/domain/exporters';
import { daysUntilDue, defaultReminderTimes, isPastDueAppointment, isUpcomingAppointment, treatmentDays, treatmentStatus, vaccinationStatus } from '@/domain/health';
import { applyHistoryLimit, canAddChecklist, canAddDocument, canAddPet, FREE_LIMITS, historyCutoff, isTemplateLocked } from '@/domain/limits';
import type { Activity, Expense, Pet, WeightRecord } from '@/domain/types';
import { createId, defaultWeightUnit, fromKg, parseDecimal, toKg } from '@/domain/units';

const pet = (over: Partial<Pet> = {}): Pet => ({
  id: 'p1',
  name: 'Rex',
  species: 'dog',
  breed: null,
  sex: null,
  birthDate: null,
  birthEstimated: false,
  weightKg: null,
  color: null,
  identification: null,
  adoptionDate: null,
  notes: null,
  photo: null,
  walkGoalMinutes: null,
  archived: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

describe('dates', () => {
  it('validates day keys strictly, including impossible dates', () => {
    expect(isValidDayKey('2026-02-28')).toBe(true);
    expect(isValidDayKey('2028-02-29')).toBe(true);
    expect(isValidDayKey('2026-02-29')).toBe(false);
    expect(isValidDayKey('2026-13-01')).toBe(false);
    expect(isValidDayKey('26-1-1')).toBe(false);
    expect(isValidDayKey(null)).toBe(false);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
  });

  it('computes calendar age and handles future birth dates', () => {
    expect(ageFrom('2020-05-15', '2026-05-14')).toEqual({ years: 5, months: 11 });
    expect(ageFrom('2020-05-15', '2026-05-15')).toEqual({ years: 6, months: 0 });
    expect(ageFrom('2027-01-01', '2026-05-15')).toBeNull();
  });

  it('estimates a birth date from an approximate age', () => {
    expect(estimateBirthDate(2, 3, '2026-11-13')).toBe('2024-08-01');
    expect(estimateBirthDate(0, 0, '2026-11-13')).toBe('2026-11-01');
    expect(ageFrom(estimateBirthDate(4, 0, '2026-11-13'), '2026-11-13')?.years).toBe(4);
  });

  it('handles month arithmetic across years', () => {
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-01');
    expect(addMonths('2026-01-31', -1)).toBe('2025-12-01');
    expect(endOfMonth('2028-02-10')).toBe('2028-02-29');
  });

  it('round-trips a local day + time through a UTC instant', () => {
    const iso = toInstant('2026-03-29', '02:30');
    expect(splitInstant(iso).day).toBe('2026-03-29');
    expect(atLocalTime('2026-07-01', '08:15').getHours()).toBe(8);
  });
});

/**
 * Jest sandboxes process.env, so the zone cannot be switched inside a test file. The default zone is
 * pinned in jest.config.js (Europe/Paris, has DST) and `pnpm test:tz` re-runs these suites under
 * UTC+14, UTC-8, Casablanca and Tokyo.
 */
describe('time zones (current: ' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')', () => {
  it('date-only statuses never shift with the zone', () => {
    expect(vaccinationStatus({ administeredDate: '2025-06-01', nextDueDate: '2026-06-01' }, '2026-06-01')).toBe('upcoming');
    expect(vaccinationStatus({ administeredDate: '2025-06-01', nextDueDate: '2026-06-01' }, '2026-06-02')).toBe('overdue');
    expect(treatmentStatus({ startDate: '2026-06-01', endDate: '2026-06-10', stoppedAt: null }, '2026-06-10')).toBe('ending_soon');
    expect(treatmentStatus({ startDate: '2026-06-01', endDate: '2026-06-10', stoppedAt: null }, '2026-06-11')).toBe('completed');
    expect(ageFrom('2020-02-29', '2026-02-28')).toEqual({ years: 5, months: 11 });
    expect(splitInstant(toInstant('2026-12-31', '23:30'))).toEqual({ day: '2026-12-31', time: '23:30' });
  });

  it('keeps reminder wall-clock time across DST changes', () => {
    for (const [a, b] of [['2026-03-28', '2026-03-29'], ['2026-10-24', '2026-10-25']] as const) {
      const before = atLocalTime(a, '09:00');
      const after = atLocalTime(b, '09:00');
      expect([before.getHours(), after.getHours()]).toEqual([9, 9]);
      // Absolute gap = 24 h minus the clock change of that night (23 h / 25 h in Europe/Paris).
      const shift = (after.getTimezoneOffset() - before.getTimezoneOffset()) / 60;
      expect((after.getTime() - before.getTime()) / 3_600_000).toBe(24 + shift);
    }
  });
});

describe('health rules', () => {
  it('derives vaccination status from user-entered dates only', () => {
    expect(vaccinationStatus({ administeredDate: '2026-01-10', nextDueDate: null }, '2026-11-13')).toBe('done');
    expect(vaccinationStatus({ administeredDate: null, nextDueDate: null }, '2026-11-13')).toBe('upcoming');
    expect(vaccinationStatus({ administeredDate: '2025-11-01', nextDueDate: '2026-11-01' }, '2026-11-13')).toBe('overdue');
    expect(daysUntilDue({ nextDueDate: '2026-11-20' }, '2026-11-13')).toBe(7);
    expect(daysUntilDue({ nextDueDate: null }, '2026-11-13')).toBeNull();
  });

  it('computes treatment status', () => {
    const t = { startDate: '2026-11-10', endDate: '2026-11-30', stoppedAt: null };
    expect(treatmentStatus(t, '2026-11-09')).toBe('scheduled');
    expect(treatmentStatus(t, '2026-11-13')).toBe('active');
    expect(treatmentStatus(t, '2026-11-28')).toBe('ending_soon');
    expect(treatmentStatus({ ...t, endDate: null }, '2030-01-01')).toBe('active');
    expect(treatmentStatus({ ...t, stoppedAt: '2026-11-12' }, '2026-11-13')).toBe('stopped');
  });

  it('lists due days per prescribed frequency', () => {
    const base = { startDate: '2026-11-01', endDate: '2026-11-30', stoppedAt: null };
    expect(treatmentDays({ ...base, frequency: 'once_daily' }, '2026-11-13', '2026-11-15')).toEqual(['2026-11-13', '2026-11-14', '2026-11-15']);
    expect(treatmentDays({ ...base, frequency: 'every_other_day' }, '2026-11-13', '2026-11-16')).toEqual(['2026-11-13', '2026-11-15']);
    expect(treatmentDays({ ...base, frequency: 'weekly' }, '2026-11-01', '2026-11-30')).toEqual(['2026-11-01', '2026-11-08', '2026-11-15', '2026-11-22', '2026-11-29']);
    expect(treatmentDays({ ...base, frequency: 'monthly', endDate: null }, '2026-11-01', '2027-01-05')).toEqual(['2026-11-01', '2026-12-01', '2027-01-01']);
    expect(treatmentDays({ ...base, frequency: 'once' }, '2026-10-01', '2026-12-01')).toEqual(['2026-11-01']);
    expect(treatmentDays({ ...base, frequency: 'as_needed' }, '2026-11-01', '2026-11-30')).toEqual([]);
    // Window after the end date is empty.
    expect(treatmentDays({ ...base, frequency: 'once_daily' }, '2026-12-01', '2026-12-05')).toEqual([]);
  });

  it('never proposes a dosage: default reminder times are only clock times', () => {
    expect(defaultReminderTimes('twice_daily')).toEqual(['08:00', '20:00']);
    expect(defaultReminderTimes('as_needed')).toEqual([]);
    for (const t of defaultReminderTimes('three_times_daily')) expect(t).toMatch(/^\d{2}:\d{2}$/);
  });

  it('classifies appointments relative to now', () => {
    const now = new Date('2026-11-13T10:00:00Z');
    expect(isUpcomingAppointment({ status: 'scheduled', startsAt: '2026-11-14T09:00:00Z' }, now)).toBe(true);
    expect(isUpcomingAppointment({ status: 'cancelled', startsAt: '2026-11-14T09:00:00Z' }, now)).toBe(false);
    expect(isPastDueAppointment({ status: 'scheduled', startsAt: '2026-11-12T09:00:00Z' }, now)).toBe(true);
  });
});

describe('care', () => {
  it('computes stock levels and restock needs', () => {
    expect(stockLevel({ quantity: 0, lowThreshold: 2 })).toBe('empty');
    expect(stockLevel({ quantity: 2, lowThreshold: 2 })).toBe('low');
    expect(stockLevel({ quantity: 5, lowThreshold: null })).toBe('ok');
    expect(daysOfStockLeft({ quantity: 3, dailyUsage: 0.25 })).toBe(12);
    expect(daysOfStockLeft({ quantity: 3, dailyUsage: null })).toBeNull();
    expect(needsRestock({ quantity: 1, lowThreshold: 0.5, dailyUsage: 0.4, restockAlert: true })).toBe(true);
    expect(needsRestock({ quantity: 1, lowThreshold: 2, dailyUsage: null, restockAlert: false })).toBe(false);
  });

  it('compares the two latest weights without judging them', () => {
    const w = (date: string, kg: number): WeightRecord => ({ id: date, petId: 'p1', date, weightKg: kg, heightCm: null, notes: null, createdAt: `${date}T00:00:00Z` });
    const c = compareWeights([w('2026-10-01', 10), w('2026-11-01', 10.5), w('2026-09-01', 9)]);
    expect(c?.latest.weightKg).toBe(10.5);
    expect(c?.deltaKg).toBe(0.5);
    expect(c?.deltaRatio).toBeCloseTo(0.05);
    expect(c?.daysBetween).toBe(31);
    expect(compareWeights([w('2026-10-01', 4)])?.deltaKg).toBeNull();
    expect(compareWeights([])).toBeNull();
    expect(weightSeries([w('2026-11-01', 2), w('2026-10-01', 1)]).map((p) => p.value)).toEqual([1, 2]);
  });

  it('summarises a day of activity and walk goals (no invented data)', () => {
    const a = (date: string, type: Activity['type'], min: number | null, km: number | null = null): Activity => ({ id: date + type, petId: 'p1', type, date, durationMinutes: min, distanceKm: km, notes: null, createdAt: date });
    const list = [a(new Date(2026, 10, 13, 8).toISOString(), 'walk', 20, 1.2), a(new Date(2026, 10, 13, 19).toISOString(), 'walk', 25), a(new Date(2026, 10, 12, 19).toISOString(), 'walk', 60), a(new Date(2026, 10, 13, 12).toISOString(), 'play', 10)];
    expect(summarizeDay(list, '2026-11-13', 'walk')).toEqual({ minutes: 45, distanceKm: 1.2, count: 2 });
    expect(summarizeDay(list, '2026-11-13').count).toBe(3);
    expect(goalProgress(45, 60)).toBeCloseTo(0.75);
    expect(goalProgress(90, 60)).toBe(1);
    expect(goalProgress(10, null)).toBeNull();
  });
});

describe('expenses', () => {
  const e = (date: string, amount: number, currency = 'EUR', category: Expense['category'] = 'food'): Expense => ({ id: date + amount, petId: null, date, amount, currency, category, notes: null, receiptDocumentId: null, createdAt: date });
  const list = [e('2026-11-02', 30), e('2026-11-10', 45.5, 'EUR', 'vet'), e('2026-10-02', 12), e('2026-11-03', 20, 'USD')];

  it('never mixes currencies', () => {
    expect(totalsByCurrency(inMonth(list, '2026-11-13'))).toEqual([
      { currency: 'EUR', total: 75.5 },
      { currency: 'USD', total: 20 },
    ]);
  });

  it('builds monthly series and category totals', () => {
    const series = monthlySeries(list, 2026, 'EUR');
    expect(series[10]).toBe(75.5);
    expect(series[9]).toBe(12);
    expect(byCategory(list, 'EUR')).toEqual([
      { category: 'vet', total: 45.5 },
      { category: 'food', total: 42 },
    ]);
  });

  it('reports budget levels', () => {
    expect(budgetState(50, 100)?.level).toBe('ok');
    expect(budgetState(85, 100)?.level).toBe('warning');
    expect(budgetState(120, 100)?.level).toBe('over');
    expect(budgetState(10, null)).toBeNull();
  });

  it('parses localized amounts', () => {
    expect(parseAmount('12,50')).toBe(12.5);
    expect(parseAmount('1 234.5')).toBe(1234.5);
    expect(parseAmount('-3')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
});

describe('units', () => {
  it('converts kg and lb and stores kg canonically', () => {
    expect(fromKg(10, 'lb')).toBeCloseTo(22.05, 2);
    expect(toKg(22.05, 'lb')).toBeCloseTo(10, 2);
    expect(fromKg(3.456, 'kg')).toBe(3.46);
    expect(defaultWeightUnit('US')).toBe('lb');
    expect(defaultWeightUnit('FR')).toBe('kg');
    expect(defaultWeightUnit(null)).toBe('kg');
  });

  it('parses decimals with either separator and rejects negatives', () => {
    expect(parseDecimal('4,5')).toBe(4.5);
    expect(parseDecimal(' 7 ')).toBe(7);
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('-1')).toBeNull();
    expect(parseDecimal('1.2.3')).toBeNull();
  });

  it('creates unique ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId('x')));
    expect(ids.size).toBe(500);
  });
});

describe('free vs premium limits', () => {
  it('limits pets, documents and checklists in the free version only', () => {
    expect(canAddPet(1, false)).toBe(true);
    expect(canAddPet(FREE_LIMITS.pets, false)).toBe(false);
    expect(canAddPet(50, true)).toBe(true);
    expect(canAddDocument(FREE_LIMITS.documentsPerPet, false)).toBe(false);
    expect(canAddChecklist(FREE_LIMITS.customChecklists, true)).toBe(true);
  });

  it('hides (never deletes) history older than the free window', () => {
    const items = [{ d: '2026-11-01' }, { d: '2026-01-01' }, { d: '2025-01-01' }];
    const free = applyHistoryLimit(items, (i) => i.d, false, '2026-11-13');
    expect(free.visible.map((i) => i.d)).toEqual(['2026-11-01']);
    expect(free.hiddenCount).toBe(2);
    expect(applyHistoryLimit(items, (i) => i.d, true, '2026-11-13').hiddenCount).toBe(0);
    expect(historyCutoff(true, '2026-11-13')).toBeNull();
  });

  it('locks templates after the free ones', () => {
    expect(isTemplateLocked(0, false)).toBe(false);
    expect(isTemplateLocked(FREE_LIMITS.freeTemplates, false)).toBe(true);
    expect(isTemplateLocked(FREE_LIMITS.freeTemplates, true)).toBe(false);
  });
});

describe('exports', () => {
  it('escapes CSV fields and neutralises formula injection', () => {
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvField('-12.5')).toBe('-12.5');
    expect(csvField(null)).toBe('');
    expect(toCsv(['a'], [[1]]).startsWith('﻿a\r\n1')).toBe(true);
  });

  it('exports expenses with translated categories', () => {
    const csv = expensesCsv(
      [{ id: '1', petId: 'p1', date: '2026-11-01', amount: 12, currency: 'EUR', category: 'vet', notes: 'Checkup', receiptDocumentId: null, createdAt: '' }],
      [pet()],
      { header: ['date', 'pet', 'cat', 'amount', 'cur', 'notes'], category: (c) => `cat:${c}` },
    );
    expect(csv).toContain('2026-11-01,Rex,cat:vet,12.00,EUR,Checkup');
  });

  it('escapes HTML in the PDF report and includes the disclaimer', () => {
    const html = petReportHtml(
      { pet: pet({ name: '<script>x</script>' }), vaccinations: [], treatments: [], health: [], weights: [] },
      {
        title: 'Summary',
        generatedOn: 'today',
        disclaimer: 'Not a medical document',
        profile: 'Profile',
        vaccinations: 'V',
        treatments: 'T',
        health: 'H',
        weights: 'W',
        none: 'None',
        fields: {},
        formatDate: (d) => d ?? '',
        formatWeight: (kg) => `${kg} kg`,
        species: 'Dog',
      },
    );
    expect(html).not.toContain('<script>x');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Not a medical document');
    expect(escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;');
  });
});
