import type { TFunction } from 'i18next';

import type { GoalProgress } from '@/domain/goals';
import type { ShoppingRecord, WishlistItem } from '@/domain/types';
import { formatGoalValue, goalCopy, goalUnit, isLimitGoal, isValidTarget } from '@/features/goals/goalCopy';
import { budgetTone, compareByCurrency, isOpenableUrl, monthSections, purchaseCrossing, wishlistTotals } from '@/features/shopping/logic';

let n = 0;
function rec(p: Partial<ShoppingRecord> = {}): ShoppingRecord {
  n++;
  return { id: `r${n}`, itemName: 'x', itemId: null, brand: null, categoryId: null, purchasedOn: '2026-11-05', price: 10, currency: 'EUR', store: null, size: null, notes: null, receiptPath: null, createdAt: '2026-11-05T10:00:00Z', ...p };
}
function wish(p: Partial<WishlistItem> = {}): WishlistItem {
  n++;
  return { id: `w${n}`, name: 'w', photoPath: null, thumbPath: null, brand: null, categoryId: null, estimatedPrice: 50, currency: 'EUR', url: null, store: null, priority: 2, notes: null, status: 'wanted', createdAt: '', updatedAt: '', ...p };
}
const fakeT = ((key: string, opts?: Record<string, unknown>) => (opts ? `${key}|${JSON.stringify(opts)}` : key)) as unknown as TFunction;
const money = (v: number) => `€${v}`;
const progress = (p: Partial<GoalProgress>): GoalProgress => ({ value: 0, target: 5, ratio: 0, daysLeft: 10, done: false, ...p });

describe('shopping helpers', () => {
  test('monthSections groups by month and keeps order', () => {
    const s = monthSections([rec({ purchasedOn: '2026-11-03' }), rec({ purchasedOn: '2026-11-01' }), rec({ purchasedOn: '2026-10-20' })]);
    expect(s.map((x) => [x.key, x.data.length])).toEqual([
      ['2026-11', 2],
      ['2026-10', 1],
    ]);
  });

  test('purchaseCrossing detects warning and over for new purchases in the budget currency only', () => {
    const records = [rec({ price: 70 })];
    const base = { records, previous: null, monthKey: '2026-11', budget: 100, budgetCurrency: 'EUR', warnPercent: 80 };
    expect(purchaseCrossing({ ...base, next: { price: 15, currency: 'EUR', purchasedOn: '2026-11-10' } })).toBe('warning');
    expect(purchaseCrossing({ ...base, next: { price: 40, currency: 'EUR', purchasedOn: '2026-11-10' } })).toBe('over');
    expect(purchaseCrossing({ ...base, next: { price: 40, currency: 'USD', purchasedOn: '2026-11-10' } })).toBeNull();
    expect(purchaseCrossing({ ...base, next: { price: 40, currency: 'EUR', purchasedOn: '2026-10-10' } })).toBeNull();
    expect(purchaseCrossing({ ...base, budget: null, next: { price: 40, currency: 'EUR', purchasedOn: '2026-11-10' } })).toBeNull();
  });

  test('purchaseCrossing on edit only counts the price difference', () => {
    const edited = rec({ price: 50 });
    const records = [rec({ price: 35 }), edited];
    const base = { records, previous: edited, monthKey: '2026-11', budget: 100, budgetCurrency: 'EUR', warnPercent: 80 };
    // Already at 85 (warning): raising 50 -> 55 stays in warning, no new crossing.
    expect(purchaseCrossing({ ...base, next: { price: 55, currency: 'EUR', purchasedOn: '2026-11-05' } })).toBeNull();
    expect(purchaseCrossing({ ...base, next: { price: 70, currency: 'EUR', purchasedOn: '2026-11-05' } })).toBe('over');
    // Lowering the price never alerts.
    expect(purchaseCrossing({ ...base, next: { price: 10, currency: 'EUR', purchasedOn: '2026-11-05' } })).toBeNull();
  });

  test('compareByCurrency keeps currencies apart', () => {
    const rows = compareByCurrency([rec({ price: 30 }), rec({ price: 20, currency: 'USD' })], [rec({ price: 10 })], 'EUR');
    expect(rows).toEqual([
      { currency: 'EUR', current: 30, previous: 10 },
      { currency: 'USD', current: 20, previous: 0 },
    ]);
    expect(compareByCurrency([], [], 'EUR')).toEqual([{ currency: 'EUR', current: 0, previous: 0 }]);
  });

  test('wishlistTotals sums wanted + planned per currency', () => {
    const totals = wishlistTotals([wish(), wish({ status: 'planned', estimatedPrice: 25.5 }), wish({ status: 'purchased' }), wish({ currency: null, estimatedPrice: 10 }), wish({ currency: 'USD' }), wish({ estimatedPrice: null })], 'GBP');
    expect(totals).toEqual([
      { currency: 'EUR', total: 75.5, count: 2 },
      { currency: 'GBP', total: 10, count: 1 },
      { currency: 'USD', total: 50, count: 1 },
    ]);
  });

  test('isOpenableUrl only accepts http(s)', () => {
    expect(isOpenableUrl('https://shop.example/x')).toBe(true);
    expect(isOpenableUrl('javascript:alert(1)')).toBe(false);
    expect(isOpenableUrl(null)).toBe(false);
  });

  test('budgetTone maps levels', () => {
    expect([budgetTone('none'), budgetTone('ok'), budgetTone('warning'), budgetTone('over')]).toEqual(['primary', 'success', 'warning', 'danger']);
  });
});

describe('goal copy', () => {
  test('units per kind', () => {
    expect(goalUnit('monthly_budget')).toBe('amount');
    expect(goalUnit('organize')).toBe('percent');
    expect(goalUnit('challenge_7x7')).toBe('days');
    expect(goalUnit('challenge_capsule')).toBe('pieces');
    expect(isLimitGoal('reduce_impulse')).toBe(true);
    expect(isLimitGoal('create_outfits')).toBe(false);
  });

  test('target validation', () => {
    expect(isValidTarget('organize', 100)).toBe(true);
    expect(isValidTarget('organize', 120)).toBe(false);
    expect(isValidTarget('create_outfits', 2.5)).toBe(false);
    expect(isValidTarget('monthly_budget', 99.9)).toBe(true);
    expect(isValidTarget('capsule', 0)).toBe(false);
    expect(isValidTarget('capsule', null)).toBe(false);
  });

  test('formats values in the goal unit', () => {
    expect(formatGoalValue('monthly_budget', 80, money)).toBe('€80');
    expect(formatGoalValue('organize', 45, money)).toBe('45%');
    expect(formatGoalValue('create_outfits', 3, money)).toBe('3');
  });

  test('encouraging wording, never shaming', () => {
    expect(goalCopy('create_outfits', progress({ value: 0 }), fakeT, money)).toBe('goals.copy.start');
    expect(goalCopy('create_outfits', progress({ value: 1, ratio: 0.2 }), fakeT, money)).toContain('goals.copy.progress');
    expect(goalCopy('create_outfits', progress({ value: 3, ratio: 0.6 }), fakeT, money)).toBe('goals.copy.halfway|{"value":"3","target":"5"}');
    expect(goalCopy('create_outfits', progress({ value: 5, ratio: 1, done: true }), fakeT, money)).toBe('goals.copy.done');
    expect(goalCopy('monthly_budget', progress({ value: 40, target: 100, withinLimit: true }), fakeT, money)).toBe('goals.copy.withinLimit|{"value":"€40","target":"€100"}');
    expect(goalCopy('reduce_impulse', progress({ value: 3, target: 2, withinLimit: false }), fakeT, money)).toBe('goals.copy.overLimit');
    expect(goalCopy('challenge_no_shopping', progress({ value: 4, withinLimit: true }), fakeT, money)).toContain('goals.copy.streak');
    expect(goalCopy('challenge_no_shopping', progress({ value: 2, withinLimit: false }), fakeT, money)).toContain('goals.copy.freshStart');
  });
});
