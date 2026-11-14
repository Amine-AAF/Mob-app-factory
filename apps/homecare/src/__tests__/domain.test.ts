import { addMonths, endOfMonth, isDayKey, lastNMonths } from '@/domain/dates';
import { escapeCell, toCsv } from '@/domain/csv';
import { addMoney, convert, currencyForRegion, formatMoney, parseAmount, sumByCurrency } from '@/domain/money';
import { addInterval, dueStatus, nextDueAfterCompletion, nextOccurrenceAfter, occurrencesBetween, postpone, toInterval } from '@/domain/recurrence';
import { planCatchUp } from '@/domain/recurringExpenses';
import { areaFromDisplay, areaToDisplay, defaultUnitSystem } from '@/domain/units';
import { coveredByWarranty, expiryStatus } from '@/domain/warranty';
import { MAINTENANCE_TEMPLATES } from '@/content/maintenanceTemplates';

describe('dates', () => {
  it('validates real calendar days only', () => {
    expect(isDayKey('2026-02-28')).toBe(true);
    expect(isDayKey('2026-02-30')).toBe(false);
    expect(isDayKey('2026-2-3')).toBe(false);
    expect(isDayKey(null)).toBe(false);
  });

  it('adds months with end-of-month clamping and leap years', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
  });

  it('lists the last N months oldest first', () => {
    expect(lastNMonths('2026-02-15', 3)).toEqual(['2025-12', '2026-01', '2026-02']);
  });
});

describe('recurrence', () => {
  it('maps presets to intervals and validates custom ones', () => {
    expect(toInterval({ frequency: 'quarterly' })).toEqual({ value: 3, unit: 'month' });
    expect(toInterval({ frequency: 'once' })).toBeNull();
    expect(toInterval({ frequency: 'custom', intervalValue: 10, intervalUnit: 'day' })).toEqual({ value: 10, unit: 'day' });
    expect(toInterval({ frequency: 'custom', intervalValue: 0, intervalUnit: 'day' })).toBeNull();
    expect(toInterval({ frequency: 'custom', intervalValue: 2, intervalUnit: null })).toBeNull();
  });

  it('computes the next due date from the completion day', () => {
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'monthly' })).toBe('2026-12-13');
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'weekly' })).toBe('2026-11-20');
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'annual' })).toBe('2027-11-13');
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'semiannual' })).toBe('2027-05-13');
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'custom', intervalValue: 2, intervalUnit: 'year' })).toBe('2028-11-13');
    expect(nextDueAfterCompletion('2026-11-13', { frequency: 'once' })).toBeNull();
  });

  it('keeps anchored monthly schedules from drifting at month end', () => {
    const r = { frequency: 'monthly' as const };
    expect(occurrencesBetween('2026-01-31', r, null, '2026-04-30')).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
    expect(addInterval('2026-01-31', r, 2)).toBe('2026-03-31');
    expect(nextOccurrenceAfter('2020-01-15', r, '2026-11-13')).toBe('2026-11-15');
    expect(nextOccurrenceAfter('2026-12-01', r, '2026-11-13')).toBe('2026-12-01');
  });

  it('classifies due dates, including past dates', () => {
    expect(dueStatus('2026-11-01', '2026-11-13')).toBe('overdue');
    expect(dueStatus('2026-11-13', '2026-11-13')).toBe('today');
    expect(dueStatus('2026-11-18', '2026-11-13')).toBe('soon');
    expect(dueStatus('2027-01-01', '2026-11-13')).toBe('upcoming');
    expect(dueStatus(null, '2026-11-13')).toBe('none');
  });

  it('postpones overdue tasks from today, future ones from their due date', () => {
    expect(postpone('2026-11-01', 7, '2026-11-13')).toBe('2026-11-20');
    expect(postpone('2026-11-20', 7, '2026-11-13')).toBe('2026-11-27');
    expect(postpone('2026-11-20', 0, '2026-11-13')).toBe('2026-11-21');
  });
});

describe('money and currencies', () => {
  it('parses localized amounts into minor units', () => {
    expect(parseAmount('12.50', 'USD')).toBe(1250);
    expect(parseAmount('12,5', 'EUR')).toBe(1250);
    expect(parseAmount('1 234,56', 'EUR')).toBe(123456);
    expect(parseAmount('1,234.56', 'USD')).toBe(123456);
    expect(parseAmount('1.234,56', 'EUR')).toBe(123456);
    expect(parseAmount('1.234', 'USD')).toBe(123400);
    expect(parseAmount('1.234', 'TND')).toBe(1234);
    expect(parseAmount('1500', 'JPY')).toBe(1500);
    expect(parseAmount('', 'USD')).toBeNull();
    expect(parseAmount('-5', 'USD')).toBeNull();
    expect(parseAmount('abc', 'USD')).toBeNull();
  });

  it('never sums different currencies', () => {
    const totals = sumByCurrency(
      [
        { amountMinor: 1000, currency: 'EUR' },
        { amountMinor: 500, currency: 'USD' },
        { amountMinor: 250, currency: 'EUR' },
      ],
      'USD',
    );
    expect(totals).toEqual([
      { currency: 'USD', amountMinor: 500 },
      { currency: 'EUR', amountMinor: 1250 },
    ]);
    expect(() => addMoney({ amountMinor: 1, currency: 'EUR' }, { amountMinor: 1, currency: 'USD' })).toThrow(/explicit conversion/);
  });

  it('converts only with an explicit rate', () => {
    expect(convert({ amountMinor: 1000, currency: 'EUR' }, 'USD', 1.1)).toEqual({ amountMinor: 1100, currency: 'USD' });
    expect(convert({ amountMinor: 1000, currency: 'USD' }, 'JPY', 150)).toEqual({ amountMinor: 1500, currency: 'JPY' });
    expect(() => convert({ amountMinor: 1, currency: 'EUR' }, 'USD', 0)).toThrow();
  });

  it('formats per locale and picks a regional default', () => {
    expect(formatMoney({ amountMinor: 123456, currency: 'USD' }, 'en')).toBe('$1,234.56');
    expect(formatMoney({ amountMinor: 123456, currency: 'EUR' }, 'fr').replace(/\s/g, ' ')).toBe('1 234,56 €');
    expect(currencyForRegion('MA')).toBe('MAD');
    expect(currencyForRegion('xx')).toBe('USD');
  });
});

describe('units, warranties, csv', () => {
  it('converts area between metric and imperial', () => {
    expect(Math.round(areaToDisplay(100, 'imperial'))).toBe(1076);
    expect(areaFromDisplay(areaToDisplay(73.5, 'imperial'), 'imperial')).toBeCloseTo(73.5);
    expect(defaultUnitSystem('US')).toBe('imperial');
    expect(defaultUnitSystem('FR')).toBe('metric');
  });

  it('classifies warranty expiry', () => {
    expect(expiryStatus('2026-11-01', '2026-11-13')).toBe('expired');
    expect(expiryStatus('2026-12-01', '2026-11-13')).toBe('expiring');
    expect(expiryStatus('2028-01-01', '2026-11-13')).toBe('valid');
    expect(expiryStatus(null, '2026-11-13')).toBe('none');
    expect(coveredByWarranty('2026-12-01', '2026-11-13')).toBe(true);
    expect(coveredByWarranty('2026-11-01', '2026-11-13')).toBe(false);
  });

  it('escapes CSV and neutralises formulas', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(escapeCell(-5)).toBe('-5');
    expect(toCsv(['a'], [[1], [null]])).toBe('﻿a\r\n1\r\n\r\n');
  });
});

describe('recurring expenses catch-up', () => {
  const base = { startDate: '2026-08-31', nextDate: '2026-08-31', endDate: null, frequency: 'monthly' as const, active: true };

  it('records every missed occurrence once, without drift', () => {
    const plan = planCatchUp(base, '2026-11-13');
    expect(plan.dates).toEqual(['2026-08-31', '2026-09-30', '2026-10-31']);
    expect(plan.nextDate).toBe('2026-11-30');
    // Running again from the new state finds nothing (idempotent).
    expect(planCatchUp({ ...base, nextDate: plan.nextDate }, '2026-11-13').dates).toEqual([]);
  });

  it('stops at the end date and deactivates', () => {
    const plan = planCatchUp({ ...base, endDate: '2026-09-30' }, '2026-11-13');
    expect(plan.dates).toEqual(['2026-08-31', '2026-09-30']);
    expect(plan.stillActive).toBe(false);
  });

  it('does nothing for future schedules or inactive ones', () => {
    expect(planCatchUp({ ...base, startDate: '2027-01-01', nextDate: '2027-01-01' }, '2026-11-13').dates).toEqual([]);
    expect(planCatchUp({ ...base, active: false }, '2026-11-13').dates).toEqual([]);
  });
});

describe('maintenance templates', () => {
  it('ships at least 50 unique templates with valid recurrences', () => {
    expect(MAINTENANCE_TEMPLATES.length).toBeGreaterThanOrEqual(50);
    const ids = new Set(MAINTENANCE_TEMPLATES.map((t) => t.id));
    expect(ids.size).toBe(MAINTENANCE_TEMPLATES.length);
    for (const t of MAINTENANCE_TEMPLATES) {
      expect(t.frequency === 'once' || toInterval(t) !== null).toBe(true);
    }
    expect(MAINTENANCE_TEMPLATES.filter((t) => t.free).length).toBeGreaterThanOrEqual(15);
  });
});
