import { Dec } from '@/utils/decimal';
import { displayExpression, formatDecimal, formatMoney, formatPercentValue, getSeparators, parseLocalizedNumber } from '@/utils/numberFormat';

const d = (v: string | number) => new Dec(v);
const nbsp = /[  ]/g;
const plain = (s: string) => s.replace(nbsp, ' ');

describe('locale separators', () => {
  it('detects separators per locale', () => {
    expect(getSeparators('en-US')).toEqual({ decimal: '.', group: ',' });
    expect(getSeparators('de-DE')).toEqual({ decimal: ',', group: '.' });
    expect(getSeparators('fr-FR').decimal).toBe(',');
    expect(getSeparators('fr-FR').group).toMatch(nbsp);
  });
});

describe('formatDecimal', () => {
  it('groups and localizes', () => {
    expect(formatDecimal(d('1234567.891'), 'en-US')).toBe('1,234,567.891');
    expect(formatDecimal(d('1234567.891'), 'de-DE')).toBe('1.234.567,891');
    expect(plain(formatDecimal(d('1234567.891'), 'fr-FR'))).toBe('1 234 567,891');
    expect(formatDecimal(d('-0.5'), 'en-US')).toBe('−0.5');
  });

  it('rounds half-up once, at display', () => {
    expect(formatDecimal(d('2.675'), 'en-US', { fractionDigits: 2 })).toBe('2.68');
    expect(formatDecimal(d('1.005'), 'en-US', { fractionDigits: 2 })).toBe('1.01');
    expect(formatDecimal(d('0.125'), 'en-US', { fractionDigits: 2 })).toBe('0.13');
    expect(formatDecimal(d('-0.0001'), 'en-US', { fractionDigits: 2 })).toBe('0.00');
  });

  it('uses scientific notation for extreme magnitudes', () => {
    expect(formatDecimal(d('1e21'), 'en-US')).toBe('1 × 10²¹');
    expect(formatDecimal(d('-1.5e-12'), 'fr-FR')).toBe('−1,5 × 10⁻¹²');
    expect(formatDecimal(d('123456789012345'), 'en-US', { grouping: false })).toBe('123456789012345');
  });
});

describe('formatMoney / formatPercentValue', () => {
  it('formats currencies with their own minor units', () => {
    expect(formatMoney(d('1234.565'), 'USD', 'en-US')).toBe('$1,234.57');
    expect(plain(formatMoney(d('1234.5'), 'EUR', 'fr-FR'))).toBe('1 234,50 €');
    expect(formatMoney(d('1234.5'), 'JPY', 'en-US')).toBe('¥1,235');
    expect(plain(formatMoney(d('99.9'), 'MAD', 'fr-FR'))).toMatch(/99,90/);
  });

  it('formats percentages by locale', () => {
    expect(formatPercentValue(d('12.345'), 'en-US')).toBe('12.35%');
    expect(plain(formatPercentValue(d('12.5'), 'fr-FR'))).toBe('12,5 %');
  });
});

describe('parseLocalizedNumber', () => {
  it.each([
    ['1234.5', 'en-US', '1234.5'],
    ['1,234.5', 'en-US', '1234.5'],
    ['1,000', 'en-US', '1000'],
    ['1234,5', 'fr-FR', '1234.5'],
    ['1 234,5', 'fr-FR', '1234.5'],
    ['1234.5', 'fr-FR', '1234.5'],
    ['1.234,5', 'de-DE', '1234.5'],
    ['1.000', 'de-DE', '1000'],
    ['12,5', 'de-DE', '12.5'],
    ['-3', 'en-US', '-3'],
    ['−3,5', 'fr-FR', '-3.5'],
    ['.5', 'en-US', '0.5'],
  ])('%s (%s) → %s', (raw, locale, expected) => expect(parseLocalizedNumber(raw, locale)?.toString()).toBe(expected));

  it.each([
    ['', 'en-US'],
    ['abc', 'en-US'],
    ['1,2,3', 'fr-FR'],
    ['1.2.3', 'en-US'],
    ['1,23', 'en-US'], // ambiguous grouping in English: refused, not guessed
    ['1e5', 'en-US'],
    ['--1', 'en-US'],
  ])('rejects %s (%s)', (raw, locale) => expect(parseLocalizedNumber(raw, locale)).toBeNull());
});

describe('displayExpression', () => {
  it('localizes canonical expressions', () => {
    expect(displayExpression('1234.5*2-3/4', 'en-US')).toBe('1,234.5×2−3÷4');
    expect(displayExpression('3.5+sqrt(2)', 'de-DE')).toBe('3,5+√(2)');
  });
});
