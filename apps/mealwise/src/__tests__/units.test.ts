import { displayQuantity, formatAmount, parseQuantity, roundForDisplay, roundForShopping, roundToFraction, scaleQuantity, servingsFactor } from '@/domain/quantity';
import { areCompatible, bestUnit, convert, localize, mergeKey, toBase } from '@/domain/units';

describe('unit conversion', () => {
  it('converts within a dimension', () => {
    expect(convert(1, 'kg', 'g')).toBe(1000);
    expect(convert(1000, 'ml', 'l')).toBe(1);
    expect(convert(1, 'lb', 'oz')).toBeCloseTo(16, 6);
    expect(convert(1, 'cup', 'tbsp')).toBeCloseTo(16, 6);
    expect(convert(1, 'tbsp', 'tsp')).toBeCloseTo(3, 6);
    expect(convert(2, 'clove', 'clove')).toBe(2);
  });

  it('refuses to convert between dimensions or different count units', () => {
    expect(() => convert(1, 'cup', 'g')).toThrow(/Incompatible/);
    expect(() => convert(1, 'clove', 'pc')).toThrow(/Incompatible/);
    expect(areCompatible('g', 'ml')).toBe(false);
    expect(areCompatible('can', 'pc')).toBe(false);
    expect(areCompatible('to_taste', 'to_taste')).toBe(false);
    expect(areCompatible('g', 'lb')).toBe(true);
  });

  it('uses one merge key per dimension and per count unit', () => {
    expect(mergeKey('g')).toBe(mergeKey('kg'));
    expect(mergeKey('tsp')).toBe(mergeKey('l'));
    expect(mergeKey('clove')).not.toBe(mergeKey('pc'));
  });

  it('picks readable units for each system', () => {
    expect(bestUnit(1500, 'g', 'metric')).toBe('kg');
    expect(bestUnit(250, 'g', 'metric')).toBe('g');
    expect(bestUnit(500, 'g', 'imperial')).toBe('lb');
    expect(bestUnit(200, 'g', 'imperial')).toBe('oz');
    expect(bestUnit(toBase(2, 'tbsp'), 'tbsp', 'metric')).toBe('tbsp');
    expect(bestUnit(toBase(1, 'tsp'), 'tsp', 'metric')).toBe('tsp');
    expect(bestUnit(250, 'ml', 'metric')).toBe('ml');
    expect(bestUnit(250, 'ml', 'imperial')).toBe('cup');
    expect(bestUnit(5, 'ml', 'imperial')).toBe('tsp');
    expect(bestUnit(30, 'ml', 'imperial')).toBe('tbsp');
  });

  it('localizes metric recipes for imperial users and back', () => {
    expect(localize(250, 'ml', 'imperial').unit).toBe('cup');
    expect(localize(250, 'ml', 'imperial').quantity).toBeCloseTo(1.0567, 3);
    expect(localize(2, 'cup', 'metric')).toEqual({ quantity: expect.closeTo(473.18, 1), unit: 'ml' });
    expect(localize(3, 'pc', 'imperial')).toEqual({ quantity: 3, unit: 'pc' });
  });
});

describe('quantity parsing', () => {
  it.each([
    ['2', 2],
    ['1.5', 1.5],
    ['1,5', 1.5],
    ['1/2', 0.5],
    ['1 1/2', 1.5],
    ['½', 0.5],
    ['1½', 1.5],
    ['2-3', 3],
    ['2 – 3', 3],
    ['.5', 0.5],
  ])('parses "%s" as %s', (input, expected) => {
    expect(parseQuantity(input)).toBeCloseTo(expected, 6);
  });

  it.each(['', '   ', 'abc', '0', '-2', '1/0', null, undefined])('rejects %p', (input) => {
    expect(parseQuantity(input as string | null | undefined)).toBeNull();
  });

  it('caps absurd values', () => {
    expect(parseQuantity('99999999')).toBe(100000);
  });
});

describe('scaling and rounding', () => {
  it('scales by servings and keeps "to taste" null', () => {
    expect(scaleQuantity(200, 4, 2)).toBe(100);
    expect(scaleQuantity(1, 3, 4)).toBeCloseTo(4 / 3, 6);
    expect(scaleQuantity(null, 4, 8)).toBeNull();
    expect(scaleQuantity(100, 0, 4)).toBe(100); // invalid base servings: unchanged
    expect(servingsFactor(4, 6)).toBe(1.5);
    expect(servingsFactor(-1, 6)).toBe(1);
  });

  it('rounds spoons and pieces to kitchen fractions, never to zero', () => {
    expect(roundToFraction(0.3)).toBeCloseTo(1 / 3, 6);
    expect(roundToFraction(1.49)).toBe(1.5);
    expect(roundToFraction(0.01)).toBe(1 / 8);
    expect(roundForDisplay(0.7, 'tbsp')).toBeCloseTo(2 / 3, 6);
    expect(roundForDisplay(13.3, 'pc')).toBe(13.5);
  });

  it('rounds metric amounts sensibly', () => {
    expect(roundForDisplay(3.2, 'g')).toBe(3);
    expect(roundForDisplay(0.1, 'g')).toBe(0.5);
    expect(roundForDisplay(47.4, 'g')).toBe(47);
    expect(roundForDisplay(333, 'g')).toBe(335);
    expect(roundForDisplay(1.234, 'kg')).toBe(1.23);
  });

  it('rounds shopping amounts up (you cannot buy 1.5 onions)', () => {
    expect(roundForShopping(1.2, 'pc')).toBe(2);
    expect(roundForShopping(2, 'pc')).toBe(2);
    expect(roundForShopping(0.3, 'can')).toBe(1);
    expect(roundForShopping(312, 'g')).toBe(320);
    expect(roundForShopping(42, 'ml')).toBe(45);
    expect(roundForShopping(1.21, 'kg')).toBe(1.3);
    expect(roundForShopping(1.1, 'cup')).toBe(1.25);
  });

  it('formats fractions with glyphs and decimals with the locale separator', () => {
    expect(formatAmount(1.5, 'cup', 'en')).toBe('1½');
    expect(formatAmount(0.25, 'tsp', 'en')).toBe('¼');
    expect(formatAmount(2, 'pc', 'en')).toBe('2');
    expect(formatAmount(2.5, 'kg', 'fr')).toBe('2,5');
    expect(formatAmount(1.5, 'g', 'es')).toBe('1,5');
  });

  it('displayQuantity runs the full pipeline', () => {
    expect(displayQuantity(200, 'g', { system: 'metric', lng: 'en', factor: 2 })).toEqual({ amount: '400', value: 400, unit: 'g' });
    expect(displayQuantity(500, 'ml', { system: 'imperial', lng: 'en' }).unit).toBe('cup');
    expect(displayQuantity(500, 'ml', { system: 'imperial', lng: 'en', keepOriginalUnits: true })).toEqual({ amount: '500', value: 500, unit: 'ml' });
    expect(displayQuantity(null, 'to_taste', { system: 'metric', lng: 'en' }).amount).toBeNull();
    expect(displayQuantity(1, 'clove', { system: 'imperial', lng: 'en', factor: 1.5 }).amount).toBe('1½');
  });
});
