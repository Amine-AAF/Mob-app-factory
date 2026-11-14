import { canAdd, FREE_LIMITS, remaining } from '@/config/limits';
import { screenAllowsAds } from '@/config/adPlacements';
import { maskToSeasons, matchesSeason, seasonForDate, seasonsToMask } from '@/domain/catalog';
import { budgetStatus, byCategory, crossesThreshold, monthlySeries, parseAmount, periodChange, totalsByCurrency } from '@/domain/budget';
import { goalProgress, newLookDays } from '@/domain/goals';
import { computeInsights, costPerWear, isRarelyUsed, usageLevel, valueByCurrency } from '@/domain/insights';
import { planNotifications, DEFAULT_NOTIFICATION_SETTINGS, MAX_SCHEDULED } from '@/domain/notificationPlan';
import { isValidTripDates, itemsToPack, missingFromChecklist, packingProgress, tripNights, tripPhase } from '@/domain/packing';
import { duplicateWeekPlan, monthGrid, shiftMonth, weekDays } from '@/domain/planner';
import { colorScore, generateSuggestions, missingForSuggestions, signatureOf, type SuggestionContext } from '@/domain/suggestions';
import type { OutfitSchedule, ShoppingRecord, UsageEntry, WardrobeGoal, WardrobeItem } from '@/domain/types';
import { EMPTY_FILTER, filterItems, findPossibleDuplicates, sortItems } from '@/domain/wardrobeQuery';

let n = 0;
function item(p: Partial<WardrobeItem> & { cat?: string } = {}): WardrobeItem {
  n++;
  const { cat, ...rest } = p;
  return {
    id: `i${n}`,
    name: `Item ${n}`,
    categoryId: `cat_${cat ?? 'tops'}`,
    subcategory: null,
    primaryColor: 'black',
    secondaryColors: [],
    brandId: null,
    brandName: null,
    size: null,
    sizeSystem: null,
    seasons: 0,
    styleId: null,
    occasionIds: [],
    purchaseDate: null,
    purchasePrice: null,
    currency: null,
    condition: null,
    notes: null,
    photoPath: null,
    thumbPath: null,
    favorite: false,
    archived: false,
    careStatus: 'clean',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    wearCount: 0,
    lastWornOn: null,
    ...rest,
  };
}

const ctxFor = (items: WardrobeItem[]): SuggestionContext => ({
  items,
  categoryKeyOf: (id) => id.replace('cat_', ''),
  styleKeyOf: (id) => (id ? id.replace('sty_', '') : null),
  occasionKeyOf: (id) => id.replace('occ_', ''),
});

describe('seasons', () => {
  it('round-trips masks and treats 0 as all-season', () => {
    expect(maskToSeasons(seasonsToMask(['summer', 'winter']))).toEqual(['summer', 'winter']);
    expect(matchesSeason(0, 'winter')).toBe(true);
    expect(matchesSeason(seasonsToMask(['summer']), 'winter')).toBe(false);
  });
  it('derives the season from the date and hemisphere', () => {
    expect(seasonForDate(new Date(2026, 0, 15))).toBe('winter');
    expect(seasonForDate(new Date(2026, 6, 15))).toBe('summer');
    expect(seasonForDate(new Date(2026, 6, 15), 'south')).toBe('winter');
  });
});

describe('cost per wear & insights', () => {
  it('divides price by recorded wears', () => {
    expect(costPerWear(100, 4)).toBe(25);
    expect(costPerWear(10, 3)).toBe(3.33);
  });
  it('is unavailable (null) without wears or price instead of a misleading value', () => {
    expect(costPerWear(100, 0)).toBeNull();
    expect(costPerWear(null, 5)).toBeNull();
    expect(costPerWear(-3, 5)).toBeNull();
    expect(costPerWear(Number.NaN, 5)).toBeNull();
  });
  it('rates usage frequency without judging brand-new items too early', () => {
    expect(usageLevel({ wearCount: 0, createdAt: '2026-11-01T00:00:00Z' }, '2026-11-13')).toBe('never');
    expect(usageLevel({ wearCount: 5, createdAt: '2026-11-01T00:00:00Z' }, '2026-11-13')).toBe('frequent');
    expect(usageLevel({ wearCount: 2, createdAt: '2026-01-01T00:00:00Z' }, '2026-11-13')).toBe('rare');
  });
  it('flags items not worn for 90 days', () => {
    expect(isRarelyUsed({ lastWornOn: '2026-08-01', createdAt: '2026-01-01' }, '2026-11-13')).toBe(true);
    expect(isRarelyUsed({ lastWornOn: '2026-11-01', createdAt: '2026-01-01' }, '2026-11-13')).toBe(false);
  });
  it('never adds amounts in different currencies', () => {
    const v = valueByCurrency([{ purchasePrice: 10, currency: 'EUR' }, { purchasePrice: 5, currency: 'USD' }, { purchasePrice: 2.5, currency: 'EUR' }, { purchasePrice: null, currency: 'EUR' }], 'USD');
    expect(v).toEqual([
      { currency: 'EUR', total: 12.5, count: 2 },
      { currency: 'USD', total: 5, count: 1 },
    ]);
  });
  it('computes the dashboard, excluding archived items', () => {
    const items = [item({ cat: 'jeans', primaryColor: 'denim', wearCount: 3, purchasePrice: 60, currency: 'EUR' }), item({ cat: 'jeans', brandName: 'Levi' }), item({ archived: true })];
    const ins = computeInsights(items, { today: '2026-11-13', categoryKeyOf: (id) => id.replace('cat_', ''), fallbackCurrency: 'EUR' });
    expect(ins.total).toBe(2);
    expect(ins.byCategory[0]).toEqual({ key: 'jeans', count: 2 });
    expect(ins.byBrand).toEqual([{ key: 'Levi', count: 1 }]);
    expect(ins.bestCostPerWear[0]?.cpw).toBe(20);
    expect(ins.mostWorn).toHaveLength(1);
  });
});

describe('wardrobe search, filters & sort', () => {
  const items = [
    item({ name: 'Chemise été', cat: 'shirts', primaryColor: 'white', favorite: true, createdAt: '2026-03-01T00:00:00Z' }),
    item({ name: 'Wool coat', cat: 'coats', primaryColor: 'camel', seasons: seasonsToMask(['winter']), purchasePrice: 200, createdAt: '2026-02-01T00:00:00Z' }),
    item({ name: 'Old tee', archived: true }),
  ];
  it('searches accent-insensitively and excludes archived by default', () => {
    expect(filterItems(items, { ...EMPTY_FILTER, query: 'ete' }).map((i) => i.name)).toEqual(['Chemise été']);
    expect(filterItems(items, EMPTY_FILTER)).toHaveLength(2);
    expect(filterItems(items, { ...EMPTY_FILTER, archived: true })).toHaveLength(1);
  });
  it('filters by category, color, season and favorites', () => {
    expect(filterItems(items, { ...EMPTY_FILTER, colors: ['camel'] })).toHaveLength(1);
    expect(filterItems(items, { ...EMPTY_FILTER, season: 'summer' }).map((i) => i.name)).toEqual(['Chemise été']);
    expect(filterItems(items, { ...EMPTY_FILTER, favoritesOnly: true })).toHaveLength(1);
    expect(filterItems(items, { ...EMPTY_FILTER, categoryIds: ['cat_coats'] })).toHaveLength(1);
  });
  it('sorts by date, name and price (unknown prices last)', () => {
    const active = items.slice(0, 2);
    expect(sortItems(active, 'newest')[0]?.name).toBe('Chemise été');
    expect(sortItems(active, 'oldest')[0]?.name).toBe('Wool coat');
    expect(sortItems(active, 'price_low')[0]?.name).toBe('Wool coat');
    expect(sortItems(active, 'name')[0]?.name).toBe('Chemise été');
  });
  it('warns about likely duplicates', () => {
    const dup = findPossibleDuplicates({ name: 'wool COAT', categoryId: 'cat_coats', primaryColor: 'camel', brandName: null, size: null }, items);
    expect(dup).toHaveLength(1);
    expect(findPossibleDuplicates({ name: 'Wool coat', categoryId: 'cat_coats', primaryColor: 'black', brandName: null, size: null }, items)).toHaveLength(0);
  });
});

describe('local suggestion engine', () => {
  const wardrobe = [
    item({ cat: 'shirts', primaryColor: 'white', styleId: 'sty_smart_casual', occasionIds: ['occ_work'] }),
    item({ cat: 'tshirts', primaryColor: 'black', styleId: 'sty_casual' }),
    item({ cat: 'jeans', primaryColor: 'denim', styleId: 'sty_casual' }),
    item({ cat: 'pants', primaryColor: 'navy', styleId: 'sty_business', occasionIds: ['occ_work'] }),
    item({ cat: 'shoes', primaryColor: 'brown' }),
    item({ cat: 'coats', primaryColor: 'camel', seasons: seasonsToMask(['winter', 'autumn']) }),
    item({ cat: 'shorts', primaryColor: 'beige', seasons: seasonsToMask(['summer']) }),
    item({ cat: 'tops', primaryColor: 'red', careStatus: 'in_laundry' }),
  ];

  it('is deterministic for a given seed and returns unique combinations', () => {
    const a = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 7 });
    const b = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 7 });
    expect(a).toEqual(b);
    expect(new Set(a.map((s) => s.signature)).size).toBe(a.length);
    expect(a.length).toBeGreaterThan(0);
  });

  it('always builds a wearable base (top+bottom or one-piece) and respects seasons', () => {
    const res = generateSuggestions(ctxFor(wardrobe), { preset: 'winter', season: 'winter', seed: 3 });
    for (const s of res) {
      const slots = s.items.map((i) => i.slot);
      expect(slots.includes('onepiece') || (slots.includes('top') && slots.includes('bottom'))).toBe(true);
      expect(s.items.some((i) => i.itemId === wardrobe[6]!.id)).toBe(false); // summer shorts excluded in winter
      expect(slots).toContain('outerwear'); // winter preset requires a coat when available
    }
  });

  it('skips laundry items, excluded items, saved outfits and disliked suggestions', () => {
    const base = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 1, count: 20 });
    expect(base.some((s) => s.items.some((i) => i.itemId === wardrobe[7]!.id))).toBe(false);
    const excluded = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 1, excludedItemIds: [wardrobe[2]!.id], count: 20 });
    expect(excluded.some((s) => s.items.some((i) => i.itemId === wardrobe[2]!.id))).toBe(false);
    const first = base[0]!;
    const withFeedback = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 1, count: 20, feedback: new Map([[first.signature, -1]]) });
    expect(withFeedback.some((s) => s.signature === first.signature)).toBe(false);
    const withSaved = generateSuggestions(ctxFor(wardrobe), { preset: 'casual', season: 'spring', seed: 1, count: 20, savedSignatures: new Set([first.signature]) });
    expect(withSaved.some((s) => s.signature === first.signature)).toBe(false);
  });

  it('favours matching style/occasion for business casual', () => {
    const res = generateSuggestions(ctxFor(wardrobe), { preset: 'business_casual', season: 'spring', seed: 5, count: 3 });
    expect(res[0]!.reasons).toEqual(expect.arrayContaining(['style_match']));
  });

  it('prefers neutral palettes with a simple, explainable rule', () => {
    expect(colorScore(['black', 'white', 'denim'])).toBe(2);
    expect(colorScore(['red', 'green', 'yellow'])).toBe(-2);
  });

  it('explains what is missing when nothing can be suggested', () => {
    expect(generateSuggestions(ctxFor([item({ cat: 'shoes' })]), { preset: 'casual', season: 'spring' })).toEqual([]);
    expect(missingForSuggestions(ctxFor([item({ cat: 'shoes' })]))).toEqual(['top', 'bottom']);
    expect(signatureOf(['b', 'a', 'b'])).toBe('a+b');
  });
});

describe('planner', () => {
  it('builds a Monday-first 6-week grid', () => {
    const g = monthGrid('2026-11');
    expect(g).toHaveLength(42);
    expect(g[0]?.day).toBe('2026-10-26');
    expect(g.filter((c) => c.inMonth)).toHaveLength(30);
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(weekDays('2026-11-13')[0]).toBe('2026-11-09');
  });
  it('copies a week to the same weekdays without overwriting', () => {
    const s = (date: string, id: string): OutfitSchedule => ({ id, date, outfitId: 'o', occasionId: null, notes: null, remind: true, wornLogged: true, createdAt: '' });
    const out = duplicateWeekPlan([s('2026-11-09', 'a'), s('2026-11-15', 'b')], '2026-11-10', '2026-11-17', [s('2026-11-16', 'x')]);
    expect(out.map((o) => o.date)).toEqual(['2026-11-22']);
    expect(out[0]?.wornLogged).toBe(false);
    expect(duplicateWeekPlan([s('2026-11-09', 'a')], '2026-11-10', '2026-11-11', [])).toEqual([]);
  });
});

describe('shopping & budget', () => {
  const rec = (purchasedOn: string, price: number, currency = 'EUR', categoryId: string | null = 'cat_shoes'): ShoppingRecord => ({ id: purchasedOn + price, itemName: 'x', itemId: null, brand: null, categoryId, purchasedOn, price, currency, store: null, size: null, notes: null, receiptPath: null, createdAt: '' });
  const records = [rec('2026-11-02', 50), rec('2026-11-05', 40), rec('2026-11-06', 30, 'USD'), rec('2026-10-10', 60, 'EUR', 'cat_coats')];

  it('computes the monthly budget status in one currency and reports others separately', () => {
    const s = budgetStatus(records, '2026-11', 100, 'EUR', 80);
    expect(s).toMatchObject({ level: 'warning', spent: 90, remaining: 10 });
    expect(s.otherCurrencies).toEqual([{ currency: 'USD', total: 30, count: 1 }]);
    expect(budgetStatus(records, '2026-11', 80, 'EUR').level).toBe('over');
    expect(budgetStatus(records, '2026-11', null, 'EUR').level).toBe('none');
  });
  it('alerts once when crossing a threshold', () => {
    expect(crossesThreshold(70, 15, 100, 80)).toBe('warning');
    expect(crossesThreshold(85, 5, 100, 80)).toBeNull();
    expect(crossesThreshold(90, 20, 100, 80)).toBe('over');
    expect(crossesThreshold(90, 20, null, 80)).toBeNull();
  });
  it('aggregates by currency, category, month and period', () => {
    expect(totalsByCurrency(records)).toEqual([
      { currency: 'EUR', total: 150, count: 3 },
      { currency: 'USD', total: 30, count: 1 },
    ]);
    expect(byCategory(records, 'EUR')[0]).toEqual({ categoryId: 'cat_shoes', total: 90, count: 2 });
    expect(monthlySeries(records, 2026, 'EUR').slice(9, 11)).toEqual([60, 90]);
    expect(periodChange(90, 60)).toBe(50);
    expect(periodChange(10, 0)).toBeNull();
  });
  it('parses amounts typed in any locale', () => {
    expect(parseAmount('12,50')).toBe(12.5);
    expect(parseAmount('1 299.90')).toBe(1299.9);
    expect(parseAmount('1.299,90 €')).toBe(1299.9);
    expect(parseAmount('1,299.90')).toBe(1299.9);
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });
});

describe('packing assistant', () => {
  it('handles trip dates and phases', () => {
    expect(isValidTripDates('2026-12-01', '2026-12-01')).toBe(true);
    expect(isValidTripDates('2026-12-05', '2026-12-01')).toBe(false);
    expect(tripNights({ departureDate: '2026-12-01', returnDate: '2026-12-04' })).toBe(3);
    expect(tripPhase({ departureDate: '2026-12-01', returnDate: '2026-12-04' }, '2026-11-13')).toBe('upcoming');
    expect(tripPhase({ departureDate: '2026-12-01', returnDate: '2026-12-04' }, '2026-12-04')).toBe('ongoing');
    expect(tripPhase({ departureDate: '2026-12-01', returnDate: '2026-12-04' }, '2026-12-05')).toBe('past');
  });
  it('tracks progress and finds forgotten items', () => {
    expect(packingProgress([{ packed: true }, { packed: false }])).toEqual({ packed: 1, total: 2, ratio: 0.5 });
    expect(packingProgress([]).ratio).toBe(0);
    const needed = itemsToPack([{ items: [{ itemId: 'a' }, { itemId: 'b' }] }], ['c']);
    expect(needed.sort()).toEqual(['a', 'b', 'c']);
    const entries = [{ id: '1', tripId: 't', kind: 'item' as const, itemId: 'a', outfitId: null, label: null, section: 'clothes' as const, packed: false, position: 0 }];
    expect(missingFromChecklist(entries, needed).sort()).toEqual(['b', 'c']);
  });
});

describe('goals & challenges', () => {
  const goal = (p: Partial<WardrobeGoal>): WardrobeGoal => ({ id: 'g', kind: 'challenge_7x7', title: null, target: 7, startDate: '2026-11-07', endDate: '2026-11-13', status: 'active', payload: {}, createdAt: '', ...p });
  const use = (wornOn: string, outfitId: string | null, itemId = 'i'): UsageEntry => ({ id: wornOn + outfitId + itemId, itemId, outfitId, wornOn });
  const data = { items: [] as WardrobeItem[], outfits: [], usage: [] as UsageEntry[], shopping: [] as ShoppingRecord[], budgetCurrency: 'EUR', today: '2026-11-13' };

  it('counts days with a new look for 7x7 and 30-looks', () => {
    const usage = [use('2026-11-07', 'o1'), use('2026-11-08', 'o1'), use('2026-11-09', 'o2'), use('2026-11-09', 'o3'), use('2026-11-10', 'o4')];
    expect(newLookDays(usage, goal({}), '2026-11-13')).toBe(3);
    const p = goalProgress(goal({}), { ...data, usage });
    expect(p).toMatchObject({ value: 3, target: 7, done: false, daysLeft: 0 });
  });
  it('tracks no-shopping days from the last purchase, without shaming', () => {
    const g = goal({ kind: 'challenge_no_shopping', target: 30, startDate: '2026-11-01', endDate: '2026-11-30' });
    expect(goalProgress(g, data).value).toBe(13);
    const shopping = [{ id: 's', itemName: 'x', itemId: null, brand: null, categoryId: null, purchasedOn: '2026-11-10', price: 5, currency: 'EUR', store: null, size: null, notes: null, receiptPath: null, createdAt: '' }];
    const p = goalProgress(g, { ...data, shopping });
    expect(p.value).toBe(3);
    expect(p.withinLimit).toBe(false);
  });
  it('evaluates limit goals (impulse buys, budget) as "within the limit"', () => {
    const g = goal({ kind: 'reduce_impulse', target: 2, startDate: '2026-11-01', endDate: '2026-11-10' });
    const shopping = [1, 2].map((i) => ({ id: `s${i}`, itemName: 'x', itemId: null, brand: null, categoryId: null, purchasedOn: '2026-11-0' + i, price: 5, currency: 'EUR', store: null, size: null, notes: null, receiptPath: null, createdAt: '' }));
    expect(goalProgress(g, { ...data, shopping })).toMatchObject({ value: 2, withinLimit: true, done: true });
  });
  it('measures wardrobe organisation and capsule size', () => {
    const items = [item({ photoPath: 'photos/a.jpg', seasons: 1, styleId: 's' }), item({})];
    expect(goalProgress(goal({ kind: 'organize', target: 100, endDate: null }), { ...data, items }).value).toBe(50);
    expect(goalProgress(goal({ kind: 'capsule', target: 2, endDate: null, payload: { itemIds: [items[0]!.id, 'deleted'] } }), { ...data, items }).value).toBe(1);
  });
});

describe('notifications plan', () => {
  const enabled = DEFAULT_NOTIFICATION_SETTINGS.map((s) => ({ ...s, enabled: true }));
  const now = new Date('2026-11-13T09:00:00');
  const sched = (date: string, remind = true): OutfitSchedule => ({ id: date, date, outfitId: 'o', occasionId: null, notes: 'Secret meeting with Bob', remind, wornLogged: false, createdAt: '' });

  it('schedules only future, opted-in reminders with generic texts', () => {
    const plan = planNotifications({
      settings: enabled,
      schedules: [sched('2026-11-13'), sched('2026-11-14'), sched('2026-11-15', false)],
      trips: [{ id: 't', destination: 'Paris', departureDate: '2026-11-20', returnDate: '2026-11-22', template: null, notes: null, reminderDays: 2, createdAt: '' }],
      hasActiveGoals: true,
      hasBudget: true,
      now,
    });
    const ids = plan.map((p) => p.id);
    expect(ids).toContain('closetwise-outfit-2026-11-14');
    expect(ids).not.toContain('closetwise-outfit-2026-11-13'); // 07:30 already passed
    expect(ids).not.toContain('closetwise-outfit-2026-11-15'); // reminder off
    expect(ids).toEqual(expect.arrayContaining(['closetwise-trip-t', 'closetwise-checklist-t', 'closetwise-budget-monthly', 'closetwise-goals-weekly']));
    // Privacy: only i18n keys, never notes, destinations or names.
    expect(JSON.stringify(plan)).not.toMatch(/Paris|Bob|Secret/);
  });

  it('schedules nothing when every kind is disabled and caps the total', () => {
    expect(planNotifications({ settings: DEFAULT_NOTIFICATION_SETTINGS, schedules: [sched('2026-11-14')], trips: [], hasActiveGoals: true, hasBudget: true, now })).toEqual([]);
    const many = Array.from({ length: 100 }, (_, i) => sched(`2027-01-${String((i % 28) + 1).padStart(2, '0')}`)).map((s, i) => ({ ...s, date: `2027-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${s.date.slice(8)}` }));
    expect(planNotifications({ settings: enabled, schedules: many, trips: [], hasActiveGoals: false, hasBudget: false, now }).length).toBeLessThanOrEqual(MAX_SCHEDULED);
  });
});

describe('monetization rules', () => {
  it('enforces free limits without affecting Premium', () => {
    expect(canAdd('items', FREE_LIMITS.items - 1, false)).toBe(true);
    expect(canAdd('items', FREE_LIMITS.items, false)).toBe(false);
    expect(canAdd('items', 10_000, true)).toBe(true);
    expect(remaining('outfits', 5, false)).toBe(FREE_LIMITS.outfits - 5);
    expect(remaining('outfits', 5, true)).toBeNull();
  });
  it('never allows ads while creating an outfit or planning', () => {
    expect(screenAllowsAds('wardrobe')).toBe(true);
    for (const s of ['outfit_builder', 'suggestions', 'calendar', 'day_plan', 'trip', 'paywall']) expect(screenAllowsAds(s)).toBe(false);
  });
});
