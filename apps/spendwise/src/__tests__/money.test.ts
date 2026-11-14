import { addMonths, addMonthsAnchored, diffMonths, isValidDayKey, monthEnd, periodRange, previousPeriod } from '@/utils/dates';
import { allocate, convertMinor, formatMoney, MAX_MINOR, minorToDecimalString, parseAmount, roundDiv, sumByCurrency } from '@/utils/money';

describe('parseAmount (no floating point)', () => {
  it.each([
    ['12', 'USD', 1200],
    ['12.5', 'USD', 1250],
    ['12,50', 'EUR', 1250],
    ['0.1', 'USD', 10],
    ['0,07', 'USD', 7],
    ['1,234.56', 'USD', 123456],
    ['1.234,56', 'EUR', 123456],
    ['1 234,56', 'EUR', 123456],
    ['1,000', 'USD', 100000],
    ['1.000.000', 'EUR', 100000000],
    ['10.500', 'USD', 1050], // trailing zero beyond precision is harmless
    ['1500', 'JPY', 1500],
    ['1,250', 'KWD', 1250], // 3-digit currency: comma is the decimal separator
    ['0', 'USD', 0],
  ])('%s %s -> %i', (input, cur, expected) => {
    expect(parseAmount(input, cur)).toEqual({ ok: true, minor: expected });
  });

  it('handles the classic 0.1 + 0.2 case exactly', () => {
    const a = parseAmount('0.1', 'USD');
    const b = parseAmount('0.2', 'USD');
    expect(a.ok && b.ok && a.minor + b.minor).toBe(30);
  });

  it.each([
    ['', 'empty'],
    ['abc', 'invalid'],
    ['1.2.3,4,5', 'invalid'],
    ['12.345', 'too_many_decimals'],
    ['-5', 'negative'],
    ['999999999999999999', 'too_large'],
  ])('rejects %p (%s)', (input, error) => {
    expect(parseAmount(input, 'USD')).toEqual({ ok: false, error });
  });

  it('rejects decimals for zero-digit currencies', () => {
    expect(parseAmount('10.5', 'JPY')).toEqual({ ok: false, error: 'too_many_decimals' });
  });

  it('accepts negative values only when allowed (adjustments)', () => {
    expect(parseAmount('-5.25', 'USD', { allowNegative: true })).toEqual({ ok: true, minor: -525 });
  });

  it('accepts very large amounts up to the limit', () => {
    const r = parseAmount('99999999999.99', 'USD');
    expect(r).toEqual({ ok: true, minor: 9_999_999_999_999 });
    expect(MAX_MINOR).toBeGreaterThan(9_999_999_999_999);
  });
});

describe('formatting', () => {
  it('formats exactly with locale separators', () => {
    expect(formatMoney(123456, 'USD', 'en')).toBe('$1,234.56');
    expect(formatMoney(123456, 'EUR', 'fr').replace(/\s/g, ' ')).toBe('1 234,56 €');
    expect(formatMoney(-500, 'USD', 'en')).toBe('-$5.00');
    expect(formatMoney(500, 'USD', 'en', { signed: true })).toBe('+$5.00');
    expect(formatMoney(1500, 'JPY', 'en')).toBe('¥1,500');
  });

  it('keeps every cent for huge amounts', () => {
    expect(formatMoney(9_999_999_999_999, 'USD', 'en')).toBe('$99,999,999,999.99');
    expect(minorToDecimalString(9_999_999_999_999, 'USD')).toBe('99999999999.99');
    expect(minorToDecimalString(-7, 'USD')).toBe('-0.07');
    expect(minorToDecimalString(1250, 'KWD')).toBe('1.250');
  });
});

describe('arithmetic', () => {
  it('rounds half away from zero', () => {
    expect(roundDiv(5n, 2n)).toBe(3n);
    expect(roundDiv(-5n, 2n)).toBe(-3n);
    expect(roundDiv(4n, 3n)).toBe(1n);
  });

  it('allocates remainders so parts always sum to the total', () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(1001, [50, 30, 20])).toEqual([501, 300, 200]);
    expect(allocate(-100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(-100);
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
  });

  it('converts between currencies with different exponents', () => {
    expect(convertMinor(10000, 'USD', 'MAD', '10.05')).toBe(100500); // $100 -> 1005 MAD
    expect(convertMinor(10000, 'USD', 'JPY', '151.234')).toBe(15123); // $100 -> ¥15,123
    expect(convertMinor(1500, 'JPY', 'USD', '0.0066')).toBe(990); // ¥1500 -> $9.90
    expect(convertMinor(100, 'USD', 'USD', 'anything')).toBe(100);
    expect(convertMinor(100, 'USD', 'EUR', 'abc')).toBeNull();
  });

  it('never mixes currencies when summing', () => {
    expect(sumByCurrency([{ amount: 100, currency: 'USD' }, { amount: 50, currency: 'EUR' }, { amount: 25, currency: 'USD' }])).toEqual({ USD: 125, EUR: 50 });
  });
});

describe('dates', () => {
  it('handles month and year boundaries', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(diffMonths('2026-11', '2027-02')).toBe(3);
    expect(monthEnd('2028-02')).toBe('2028-02-29');
    expect(monthEnd('2027-02')).toBe('2027-02-28');
  });

  it('anchors month-end dates without drift', () => {
    expect(addMonthsAnchored('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsAnchored('2026-01-31', 2)).toBe('2026-03-31');
    expect(addMonthsAnchored('2028-02-29', 12)).toBe('2029-02-28');
  });

  it('computes periods', () => {
    expect(periodRange('week', '2026-11-13')).toEqual({ start: '2026-11-09', end: '2026-11-15' });
    expect(periodRange('year', '2026-11-13')).toEqual({ start: '2026-01-01', end: '2026-12-31' });
    expect(previousPeriod('month', '2026-01-15')).toEqual({ start: '2025-12-01', end: '2025-12-31' });
    expect(isValidDayKey('2026-02-30')).toBe(false);
    expect(isValidDayKey('2028-02-29')).toBe(true);
  });
});
