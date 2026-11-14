import { CARE_STATUSES } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { EMPTY_FILTER } from '@/domain/wardrobeQuery';
import { groupByCareStatus, matchingSuggestions, parseTemperature, resolveItemName, sheetFilterCount, toggleId } from '@/features/wardrobe/logic';

const compose = (color: string, base: string) => `${color} ${base}`;

describe('resolveItemName', () => {
  it('keeps a typed name (trimmed)', () => {
    expect(resolveItemName('  Linen shirt ', { category: 'Shirts', color: 'White' }, compose)).toBe('Linen shirt');
  });
  it('defaults to color + category label', () => {
    expect(resolveItemName('', { category: 'Shirts', color: 'White' }, compose)).toBe('White Shirts');
  });
  it('prefers the subcategory over the category label', () => {
    expect(resolveItemName(null, { category: 'Shoes', subcategory: 'Ankle boots', color: 'Black' }, compose)).toBe('Black Ankle boots');
  });
  it('falls back to the category label alone without a color', () => {
    expect(resolveItemName('   ', { category: 'Bags', color: null }, compose)).toBe('Bags');
  });
});

describe('parseTemperature', () => {
  it('treats empty as not specified', () => expect(parseTemperature(' ')).toEqual({ value: null, valid: true }));
  it('accepts integers 0–95', () => {
    expect(parseTemperature('0')).toEqual({ value: 0, valid: true });
    expect(parseTemperature('40')).toEqual({ value: 40, valid: true });
    expect(parseTemperature('95')).toEqual({ value: 95, valid: true });
  });
  it('rejects out of range and non-integers', () => {
    expect(parseTemperature('96').valid).toBe(false);
    expect(parseTemperature('30.5').valid).toBe(false);
    expect(parseTemperature('-5').valid).toBe(false);
    expect(parseTemperature('abc').valid).toBe(false);
  });
});

describe('sheetFilterCount', () => {
  it('ignores the category quick filter and the query', () => {
    expect(sheetFilterCount({ ...EMPTY_FILTER, query: 'x', categoryIds: ['c1'] })).toBe(0);
    expect(sheetFilterCount({ ...EMPTY_FILTER, colors: ['black'], favoritesOnly: true, season: 'summer' })).toBe(3);
  });
});

describe('groupByCareStatus', () => {
  it('returns every status in order, even empty ones', () => {
    const items = [{ id: 'a', careStatus: 'to_wash' }, { id: 'b', careStatus: 'clean' }, { id: 'c', careStatus: 'to_wash' }] as WardrobeItem[];
    const g = groupByCareStatus(items, CARE_STATUSES);
    expect(Object.keys(g)).toEqual([...CARE_STATUSES]);
    expect(g.to_wash.map((i) => i.id)).toEqual(['a', 'c']);
    expect(g.in_laundry).toEqual([]);
  });
});

describe('helpers', () => {
  it('toggles ids', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
  it('filters suggestions by typed text, excluding exact matches', () => {
    expect(matchingSuggestions(['Oxford', 'Polo', 'Oxford slim'], 'oxf')).toEqual(['Oxford', 'Oxford slim']);
    expect(matchingSuggestions(['Oxford', 'Polo'], 'oxford')).toEqual([]);
    expect(matchingSuggestions(['A', 'B', 'C'], '', 2)).toEqual(['A', 'B']);
  });
});
