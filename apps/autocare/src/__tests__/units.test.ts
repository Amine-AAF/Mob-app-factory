import { createFormatter } from '@/features/format/format';
import { convertTotals, currenciesOf, singleCurrency, sumByCurrency, toMinor } from '@/features/money/money';
import {
  DEFAULT_UNITS,
  distanceToKm,
  formatConsumptionValue,
  formatEnergyConsumptionValue,
  higherIsBetter,
  kmToDistance,
  litresToVolume,
  parseDecimal,
  pricePerLitreToUnit,
  pricePerUnitToLitre,
  unitsForRegion,
  volumeToLitres,
} from '@/features/units/units';

describe('distance and volume conversions', () => {
  it('converts km ↔ miles both ways without drift', () => {
    expect(kmToDistance(160.9344, 'mi')).toBeCloseTo(100, 6);
    expect(distanceToKm(100, 'mi')).toBeCloseTo(160.9344, 6);
    expect(distanceToKm(kmToDistance(12345.6, 'mi'), 'mi')).toBeCloseTo(12345.6, 6);
    expect(kmToDistance(42, 'km')).toBe(42);
  });

  it('converts litres ↔ US and UK gallons', () => {
    expect(litresToVolume(3.785411784, 'gal_us')).toBeCloseTo(1, 9);
    expect(litresToVolume(4.54609, 'gal_uk')).toBeCloseTo(1, 9);
    expect(volumeToLitres(10, 'gal_us')).toBeCloseTo(37.854, 3);
    expect(volumeToLitres(litresToVolume(55, 'gal_uk'), 'gal_uk')).toBeCloseTo(55, 9);
  });

  it('converts unit prices consistently with volumes', () => {
    const perGallon = pricePerLitreToUnit(1, 'gal_us');
    expect(perGallon).toBeCloseTo(3.785, 3);
    expect(pricePerUnitToLitre(perGallon, 'gal_us')).toBeCloseTo(1, 9);
  });
});

describe('consumption formats', () => {
  it('converts L/100 km to km/L and MPG', () => {
    expect(formatConsumptionValue(5, 'l_per_100km')).toBe(5);
    expect(formatConsumptionValue(5, 'km_per_l')).toBeCloseTo(20, 6);
    // 5 L/100 km ≈ 47.04 mpg (US) and ≈ 56.5 mpg (UK)
    expect(formatConsumptionValue(5, 'mpg_us')).toBeCloseTo(47.04, 1);
    expect(formatConsumptionValue(5, 'mpg_uk')).toBeCloseTo(56.5, 1);
  });

  it('converts electric consumption', () => {
    expect(formatEnergyConsumptionValue(16, 'kwh_per_100km')).toBe(16);
    expect(formatEnergyConsumptionValue(16, 'kwh_per_100mi')).toBeCloseTo(25.75, 2);
    expect(formatEnergyConsumptionValue(16, 'km_per_kwh')).toBeCloseTo(6.25, 6);
    expect(formatEnergyConsumptionValue(16, 'mi_per_kwh')).toBeCloseTo(3.88, 2);
  });

  it('returns null instead of a fake figure for invalid input', () => {
    expect(formatConsumptionValue(0, 'mpg_us')).toBeNull();
    expect(formatConsumptionValue(Number.NaN, 'l_per_100km')).toBeNull();
    expect(formatEnergyConsumptionValue(-1, 'kwh_per_100km')).toBeNull();
  });

  it('knows which formats are "higher is better"', () => {
    expect(higherIsBetter('mpg_us')).toBe(true);
    expect(higherIsBetter('l_per_100km')).toBe(false);
    expect(higherIsBetter('kwh_per_100km')).toBe(false);
  });
});

describe('regional defaults', () => {
  it('suggests miles/gallons in the US, miles/litres in the UK, metric elsewhere', () => {
    expect(unitsForRegion('US')).toMatchObject({ distance: 'mi', volume: 'gal_us', consumption: 'mpg_us' });
    expect(unitsForRegion('GB')).toMatchObject({ distance: 'mi', volume: 'L', consumption: 'mpg_uk' });
    expect(unitsForRegion('FR')).toEqual(DEFAULT_UNITS);
    expect(unitsForRegion(null)).toEqual(DEFAULT_UNITS);
  });
});

describe('decimal parsing', () => {
  it.each([
    ['12.5', 12.5],
    ['12,5', 12.5],
    ['1,879', 1.879],
    ['1 234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['1.234,56', 1234.56],
    ['1,234,567', 1234567],
    ['45 000', 45000],
    ['0', 0],
  ])('parses %s', (input, expected) => {
    expect(parseDecimal(input)).toBeCloseTo(expected, 6);
  });

  it.each(['', 'abc', '12a', '--1'])('rejects %p', (input) => {
    const v = parseDecimal(input);
    expect(v === null || Number.isNaN(v)).toBe(true);
  });
});

describe('money never mixes currencies', () => {
  it('sums per currency', () => {
    const t = sumByCurrency([
      { minor: 1000, currency: 'EUR' },
      { minor: 500, currency: 'EUR' },
      { minor: 20000, currency: 'MAD' },
      null,
    ]);
    expect(t).toEqual({ EUR: 1500, MAD: 20000 });
    expect(singleCurrency(t)).toBeNull();
    expect(singleCurrency({ EUR: 1 })).toBe('EUR');
    expect(currenciesOf(t, 'EUR')[0]).toBe('EUR');
  });

  it('converts only with explicit rates and reports missing ones', () => {
    expect(convertTotals({ EUR: 1000, USD: 1000 }, 'EUR', { USD: 0.9 })).toEqual({ minor: 1900, missing: [] });
    expect(convertTotals({ EUR: 1000, MAD: 1000 }, 'EUR', {})).toEqual({ minor: 1000, missing: ['MAD'] });
  });

  it('rounds to minor units', () => {
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(0.1 + 0.2)).toBe(30);
  });
});

describe('formatter', () => {
  it('lists multi-currency totals instead of adding them', () => {
    const f = createFormatter('en', DEFAULT_UNITS);
    const s = f.totals({ EUR: 150000, USD: 2000 }, 'EUR');
    expect(s).toContain('€');
    expect(s).toContain('$');
    expect(s).toContain('+');
  });

  it('uses units independently from the language', () => {
    const fr = createFormatter('fr', { ...DEFAULT_UNITS, distance: 'mi', consumption: 'mpg_us' });
    expect(fr.distance(160.9344)).toMatch(/100\s?mi/);
    expect(fr.consumption(5, 'L')).toContain('mpg (US)');
    const en = createFormatter('en', DEFAULT_UNITS);
    expect(en.distance(1000)).toBe('1,000 km');
    expect(en.consumption(6.4, 'L')).toBe('6.4 L/100 km');
    expect(en.consumption(null, 'L')).toBeNull();
  });

  it('formats cost per distance in the chosen unit', () => {
    const km = createFormatter('en', DEFAULT_UNITS);
    const mi = createFormatter('en', { ...DEFAULT_UNITS, distance: 'mi' });
    expect(km.costPerDistance(10, 'USD')).toBe('$0.10/km');
    expect(mi.costPerDistance(10, 'USD')).toBe('$0.161/mi');
  });
});
