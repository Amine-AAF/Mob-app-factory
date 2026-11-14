import { createTestDatabase } from '@factory/testing';

import { initDatabase } from '@/database';
import { createManualRateProvider } from '@/database/repositories/currency';
import { budgetInsights, budgetOverview } from '@/features/budget/insights';
import { formatRate, pickRate } from '@/features/currency/rates';
import { allocateProportionally, computeBalances, splitEqually, suggestSettlements, validateCustomShares } from '@/features/shared-expenses/split';
import type { CurrencyRate } from '@/types/models';
import { clock } from '@/utils/clock';

let tick = 0;
beforeEach(() => {
  tick = 0;
  // Each call returns a later instant so "most recent" ordering is deterministic.
  clock.set(() => new Date(Date.UTC(2026, 5, 1, 10, 0, tick++)));
});
afterEach(() => clock.set(null));

async function setup() {
  const r = await initDatabase(await createTestDatabase());
  const trip = await r.trips.create({
    name: 'Friends in Lisbon',
    startDate: '2026-07-30',
    endDate: '2026-08-02',
    currency: 'EUR',
    budgetMinor: 100000,
    participants: [{ name: 'Ana', isSelf: true }, { name: 'Ben' }, { name: 'Chloé' }],
  });
  const [ana, ben, chloe] = trip.participants.map((p) => p.id) as [string, string, string];
  return { r, trip, ana, ben, chloe };
}

describe('split arithmetic', () => {
  it('splits equally with the remainder on the first participants', () => {
    expect([...splitEqually(1000, ['a', 'b', 'c']).values()]).toEqual([334, 333, 333]);
    expect([...splitEqually(2, ['a', 'b', 'c']).values()]).toEqual([1, 1, 0]);
    expect([...splitEqually(0, ['a']).values()]).toEqual([0]);
    expect(() => splitEqually(100, [])).toThrow();
    expect(() => splitEqually(-1, ['a'])).toThrow();
  });

  it('allocates proportionally without losing a cent', () => {
    const out = allocateProportionally(1001, new Map([['a', 1], ['b', 1], ['c', 1]]));
    expect([...out.values()].reduce((s, v) => s + v, 0)).toBe(1001);
    expect(out.get('a')).toBe(334);
    const uneven = allocateProportionally(10845, new Map([['a', 3333], ['b', 6667]]));
    expect(uneven.get('a')! + uneven.get('b')!).toBe(10845);
    expect(allocateProportionally(500, new Map([['a', 0]])).get('a')).toBe(0);
  });

  it('validates custom shares', () => {
    expect(validateCustomShares(100, new Map([['a', 60], ['b', 40]]))).toBeNull();
    expect(validateCustomShares(100, new Map([['a', 60], ['b', 39]]))).toBe('shares_mismatch');
    expect(validateCustomShares(100, new Map([['a', 110], ['b', -10]]))).toBe('negative_share');
    expect(validateCustomShares(100, new Map())).toBe('no_participants');
  });

  it('computes balances that always sum to zero and settles them', () => {
    const balances = computeBalances(['ana', 'ben', 'chloe'], [
      { tripAmountMinor: 9000, amountMinor: 9000, paidBy: 'ana', shares: new Map([['ana', 3000], ['ben', 3000], ['chloe', 3000]]) },
      { tripAmountMinor: 3000, amountMinor: 3000, paidBy: 'ben', shares: new Map([['ben', 1500], ['chloe', 1500]]) },
      { tripAmountMinor: 500, amountMinor: 500, paidBy: null, shares: new Map([['ana', 500]]) },
    ]);
    expect(Object.fromEntries(balances)).toEqual({ ana: 6000, ben: -1500, chloe: -4500 });
    expect([...balances.values()].reduce((s, v) => s + v, 0)).toBe(0);
    const transfers = suggestSettlements(balances);
    expect(transfers).toEqual([
      { from: 'chloe', to: 'ana', amountMinor: 4500 },
      { from: 'ben', to: 'ana', amountMinor: 1500 },
    ]);
  });

  it('settles a chain with at most n-1 transfers and leaves nothing behind', () => {
    const balances = new Map([['a', 5000], ['b', 2500], ['c', -1000], ['d', -6500]]);
    const transfers = suggestSettlements(balances);
    expect(transfers.length).toBeLessThanOrEqual(3);
    const net = new Map(balances);
    for (const tr of transfers) {
      net.set(tr.from, net.get(tr.from)! + tr.amountMinor);
      net.set(tr.to, net.get(tr.to)! - tr.amountMinor);
    }
    expect([...net.values()].every((v) => v === 0)).toBe(true);
    expect(suggestSettlements(new Map([['a', 0]]))).toEqual([]);
  });
});

describe('budget overview & insights', () => {
  const expenses = [
    { category: 'food' as const, tripAmountMinor: 4000, date: '2026-07-30' },
    { category: 'food' as const, tripAmountMinor: 2000, date: '2026-07-31' },
    { category: 'transport' as const, tripAmountMinor: 3000, date: '2026-07-31' },
  ];

  it('compares planned and recorded spending per category', () => {
    const o = budgetOverview(expenses, { food: 5000, transport: 10000 }, null);
    expect(o.totalPlannedMinor).toBe(15000);
    expect(o.spentMinor).toBe(9000);
    expect(o.remainingMinor).toBe(6000);
    const food = o.categories.find((c) => c.category === 'food')!;
    expect(food).toMatchObject({ plannedMinor: 5000, spentMinor: 6000, remainingMinor: -1000, ratio: 1.2 });
    expect(o.categories.find((c) => c.category === 'shopping')).toMatchObject({ plannedMinor: null, spentMinor: 0, ratio: null });
    // The trip's total budget wins over the sum of categories.
    expect(budgetOverview(expenses, { food: 5000 }, 20000).totalPlannedMinor).toBe(20000);
    expect(budgetOverview([], {}, null)).toMatchObject({ totalPlannedMinor: null, remainingMinor: null, ratio: null });
  });

  it('derives insights from real data only', () => {
    const trip = { startDate: '2026-07-30', endDate: '2026-08-02' };
    const i = budgetInsights(expenses, trip, 6000, '2026-07-31', new Map([['2026-07-31', 4000]]));
    expect(i.biggestCategory).toEqual({ category: 'food', spentMinor: 6000, share: 6000 / 9000 });
    expect(i.daysCounted).toBe(2);
    expect(i.averageDailyMinor).toBe(4500);
    expect(i.dailyAllowanceMinor).toBe(2000); // 6000 left over 31 Jul, 1 Aug, 2 Aug
    expect(i.byDay).toEqual([
      { date: '2026-07-30', spentMinor: 4000, plannedMinor: null },
      { date: '2026-07-31', spentMinor: 5000, plannedMinor: 4000 },
      { date: '2026-08-01', spentMinor: 0, plannedMinor: null },
      { date: '2026-08-02', spentMinor: 0, plannedMinor: null },
    ]);
    // After the trip the whole trip length is used and no allowance is suggested.
    const after = budgetInsights(expenses, trip, 6000, '2026-09-01');
    expect([after.daysCounted, after.averageDailyMinor, after.dailyAllowanceMinor]).toEqual([4, 2250, null]);
    // No expenses: nothing invented.
    expect(budgetInsights([], trip, null, '2026-07-31')).toMatchObject({ biggestCategory: null, averageDailyMinor: null, dailyAllowanceMinor: null });
    // Trip without dates: average over the days that have expenses.
    expect(budgetInsights(expenses, { startDate: null, endDate: null }, null, '2026-07-31').averageDailyMinor).toBe(4500);
  });
});

describe('expenses repository', () => {
  it('records an expense in the trip currency', async () => {
    const { r, trip, ana } = await setup();
    const e = await r.expenses.create(trip.id, { amountMinor: 2350, currency: 'EUR', category: 'food', date: '2026-07-30', description: 'Lunch', paidBy: ana });
    expect(e).toMatchObject({ amountMinor: 2350, tripAmountMinor: 2350, rateToTrip: 1, splitMode: 'none', shares: [] });
  });

  it('converts a foreign expense with the user rate and requires that rate', async () => {
    const { r, trip } = await setup();
    const e = await r.expenses.create(trip.id, { amountMinor: 15000, currency: 'MAD', rateToTrip: 0.0921, category: 'shopping', date: '2026-07-31' });
    expect(e.tripAmountMinor).toBe(1382); // 150 MAD × 0.0921 = 13.815 → 13.82 EUR
    const yen = await r.expenses.create(trip.id, { amountMinor: 1500, currency: 'JPY', rateToTrip: 0.0062, category: 'food', date: '2026-07-31' });
    expect(yen.tripAmountMinor).toBe(930);
    await expect(r.expenses.create(trip.id, { amountMinor: 100, currency: 'USD', category: 'food', date: '2026-07-31' })).rejects.toMatchObject({ code: 'invalid_rate' });
  });

  it.each([
    [{ amountMinor: -1 }, 'invalid_amount'],
    [{ amountMinor: 1.5 }, 'invalid_amount'],
    [{ currency: 'XYZ' }, 'invalid_currency'],
    [{ date: '2026-02-31' }, 'invalid_date'],
    [{ category: 'gifts' }, 'invalid_category'],
    [{ paymentMethod: '4111 1111 1111 1111' }, 'looks_like_card_number'],
    [{ notes: 'card 5500-0000-0000-0004' }, 'looks_like_card_number'],
    [{ paidBy: 'stranger' }, 'unknown_participant'],
    [{ splitMode: 'equal' }, 'payer_required'],
  ])('rejects %o with %s', async (patch, code) => {
    const { r, trip } = await setup();
    await expect(r.expenses.create(trip.id, { amountMinor: 1000, currency: 'EUR', category: 'food', date: '2026-07-30', ...(patch as object) })).rejects.toMatchObject({ code });
    expect(await r.expenses.list(trip.id)).toHaveLength(0);
  });

  it('splits equally (remainder to the first) and with custom shares', async () => {
    const { r, trip, ana, ben, chloe } = await setup();
    const dinner = await r.expenses.create(trip.id, { amountMinor: 10000, currency: 'EUR', category: 'food', date: '2026-07-30', paidBy: ana, splitMode: 'equal' });
    expect(dinner.shares.map((s) => s.shareMinor)).toEqual([3334, 3333, 3333]);
    const taxi = await r.expenses.create(trip.id, { amountMinor: 3000, currency: 'EUR', category: 'transport', date: '2026-07-30', paidBy: ben, splitMode: 'equal', sharedWith: [ben, chloe] });
    expect(taxi.shares.map((s) => [s.participantId, s.shareMinor])).toEqual([[ben, 1500], [chloe, 1500]]);
    const custom = await r.expenses.create(trip.id, { amountMinor: 5000, currency: 'EUR', category: 'activities', date: '2026-07-31', paidBy: chloe, splitMode: 'custom', customShares: { [ana]: 1000, [ben]: 1500, [chloe]: 2500 } });
    expect(custom.shares.map((s) => s.shareMinor)).toEqual([1000, 1500, 2500]);
    await expect(
      r.expenses.create(trip.id, { amountMinor: 5000, currency: 'EUR', category: 'food', date: '2026-07-31', paidBy: chloe, splitMode: 'custom', customShares: { [ana]: 1000 } }),
    ).rejects.toMatchObject({ code: 'shares_mismatch' });
    await expect(
      r.expenses.create(trip.id, { amountMinor: 5000, currency: 'EUR', category: 'food', date: '2026-07-31', paidBy: chloe, splitMode: 'equal', sharedWith: [] }),
    ).rejects.toMatchObject({ code: 'no_participants' });

    const all = await r.expenses.list(trip.id);
    const balances = computeBalances([ana, ben, chloe], all.map((e) => ({ tripAmountMinor: e.tripAmountMinor, amountMinor: e.amountMinor, paidBy: e.paidByParticipantId, shares: new Map(e.shares.map((s) => [s.participantId, s.shareMinor])) })));
    expect(Object.fromEntries(balances)).toEqual({ [ana]: 10000 - 3334 - 1000, [ben]: 3000 - 3333 - 1500 - 1500, [chloe]: 5000 - 3333 - 1500 - 2500 });
  });

  it('balances foreign shared expenses in the trip currency without rounding loss', async () => {
    const { r, trip, ana, ben, chloe } = await setup();
    await r.expenses.create(trip.id, { amountMinor: 10000, currency: 'USD', rateToTrip: 0.9213, category: 'food', date: '2026-07-30', paidBy: ana, splitMode: 'equal' });
    const [e] = await r.expenses.list(trip.id);
    const b = computeBalances([ana, ben, chloe], [{ tripAmountMinor: e!.tripAmountMinor, amountMinor: e!.amountMinor, paidBy: ana, shares: new Map(e!.shares.map((s) => [s.participantId, s.shareMinor])) }]);
    expect([...b.values()].reduce((s, v) => s + v, 0)).toBe(0);
    // 100 USD × 0.9213 = 92.13 EUR; shares 33.34/33.33/33.33 USD → 30.71 EUR each (largest remainder).
    expect(e!.tripAmountMinor).toBe(9213);
    expect(Object.fromEntries(b)).toEqual({ [ana]: 9213 - 3071, [ben]: -3071, [chloe]: -3071 });
  });

  it('filters, searches and sorts the history', async () => {
    const { r, trip, ana } = await setup();
    await r.expenses.create(trip.id, { amountMinor: 1200, currency: 'EUR', category: 'food', date: '2026-07-30', description: 'Pastries 100%' });
    await r.expenses.create(trip.id, { amountMinor: 8000, currency: 'EUR', category: 'accommodation', date: '2026-07-30', description: 'Guesthouse', paidBy: ana });
    await r.expenses.create(trip.id, { amountMinor: 3000, currency: 'EUR', category: 'food', date: '2026-08-01', description: 'Dinner', city: 'Sintra' });
    const desc = (list: { description: string }[]) => list.map((e) => e.description);
    expect(desc(await r.expenses.list(trip.id))).toEqual(['Dinner', 'Guesthouse', 'Pastries 100%']);
    expect(desc(await r.expenses.list(trip.id, { sort: 'amount_desc' }))).toEqual(['Guesthouse', 'Dinner', 'Pastries 100%']);
    expect(desc(await r.expenses.list(trip.id, { sort: 'date_asc' }))).toEqual(['Pastries 100%', 'Guesthouse', 'Dinner']);
    expect(desc(await r.expenses.list(trip.id, { category: 'food' }))).toEqual(['Dinner', 'Pastries 100%']);
    expect(desc(await r.expenses.list(trip.id, { paidBy: ana }))).toEqual(['Guesthouse']);
    expect(desc(await r.expenses.list(trip.id, { search: 'sintra' }))).toEqual(['Dinner']);
    expect(desc(await r.expenses.list(trip.id, { search: '100%' }))).toEqual(['Pastries 100%']);
    expect(desc(await r.expenses.list(trip.id, { search: '%' }))).toEqual(['Pastries 100%']);
    expect(desc(await r.expenses.list(trip.id, { from: '2026-07-31', to: '2026-08-31' }))).toEqual(['Dinner']);
  });

  it('updates an expense with new shares, deletes it, and survives a traveller leaving', async () => {
    const { r, trip, ana, ben, chloe } = await setup();
    const e = await r.expenses.create(trip.id, { amountMinor: 900, currency: 'EUR', category: 'food', date: '2026-07-30', paidBy: ben, splitMode: 'equal' });
    const u = await r.expenses.update(e.id, { amountMinor: 900, currency: 'EUR', category: 'food', date: '2026-07-30', paidBy: ben, splitMode: 'equal', sharedWith: [ana, ben] });
    expect(u.shares.map((s) => s.shareMinor)).toEqual([450, 450]);
    // Ben leaves the trip: his shares are removed and the payer is cleared, the expense stays.
    await r.trips.update(trip.id, { name: trip.name, currency: 'EUR', participants: [{ id: ana, name: 'Ana', isSelf: true }, { id: chloe, name: 'Chloé' }] });
    const after = (await r.expenses.get(e.id))!;
    expect(after.paidByParticipantId).toBeNull();
    expect(after.shares.map((s) => s.participantId)).toEqual([ana]);
    await r.expenses.remove(e.id);
    expect(await r.expenses.get(e.id)).toBeNull();
    await expect(r.expenses.update(e.id, { amountMinor: 1, currency: 'EUR', category: 'food', date: '2026-07-30' })).rejects.toMatchObject({ code: 'not_found' });
  });

  it('stores the category budget and feeds the trip summary', async () => {
    const { r, trip } = await setup();
    await r.expenses.setBudget(trip.id, { food: 30000, transport: 20000 });
    await r.expenses.setBudget(trip.id, { transport: null, shopping: 5000 });
    expect(await r.expenses.getBudget(trip.id)).toEqual({ food: 30000, shopping: 5000 });
    await expect(r.expenses.setBudget(trip.id, { food: -5 })).rejects.toMatchObject({ code: 'invalid_amount' });
    await r.expenses.create(trip.id, { amountMinor: 4200, currency: 'EUR', category: 'food', date: '2026-07-30' });
    expect((await r.trips.summaries([trip.id])).get(trip.id)!.spentMinor).toBe(4200);
    await r.itinerary.syncDaysWithTrip(trip.id);
    const day = (await r.itinerary.listDays(trip.id))[0]!;
    await r.itinerary.updateDay(day.id, { budgetMinor: 8000 });
    expect([...(await r.expenses.dayBudgets(trip.id))]).toEqual([['2026-07-30', 8000]]);
  });

  it('locks the trip currency once expenses exist', async () => {
    const { r, trip } = await setup();
    await r.trips.update(trip.id, { name: trip.name, currency: 'USD' });
    await r.trips.update(trip.id, { name: trip.name, currency: 'EUR' });
    await r.expenses.create(trip.id, { amountMinor: 100, currency: 'EUR', category: 'misc', date: '2026-07-30' });
    await expect(r.trips.update(trip.id, { name: trip.name, currency: 'USD' })).rejects.toMatchObject({ code: 'currency_has_expenses' });
  });
});

describe('currency rates & converter', () => {
  it('saves manual rates with their date and validates them', async () => {
    const { r, trip } = await setup();
    const rate = await r.currency.saveRate({ base: 'EUR', quote: 'MAD', rate: 10.85, rateDate: '2026-06-01', tripId: trip.id });
    expect(rate).toMatchObject({ source: 'manual', rateDate: '2026-06-01', tripId: trip.id });
    await expect(r.currency.saveRate({ base: 'EUR', quote: 'EUR', rate: 1, rateDate: '2026-06-01' })).rejects.toMatchObject({ code: 'same_currency' });
    await expect(r.currency.saveRate({ base: 'EUR', quote: 'XYZ', rate: 1, rateDate: '2026-06-01' })).rejects.toMatchObject({ code: 'invalid_currency' });
    await expect(r.currency.saveRate({ base: 'EUR', quote: 'USD', rate: 0, rateDate: '2026-06-01' })).rejects.toMatchObject({ code: 'invalid_rate' });
    await expect(r.currency.saveRate({ base: 'EUR', quote: 'USD', rate: 1.1, rateDate: '2026-6-1' })).rejects.toMatchObject({ code: 'invalid_date' });
  });

  it('prefers the trip rate, then the most recent, then the inverse pair', async () => {
    const { r, trip } = await setup();
    await r.currency.saveRate({ base: 'EUR', quote: 'USD', rate: 1.05, rateDate: '2026-05-01' });
    await r.currency.saveRate({ base: 'EUR', quote: 'USD', rate: 1.08, rateDate: '2026-06-01' });
    expect((await r.currency.findRate('EUR', 'USD'))?.rate).toBe(1.08);
    await r.currency.saveRate({ base: 'EUR', quote: 'USD', rate: 1.02, rateDate: '2026-04-01', tripId: trip.id });
    expect((await r.currency.findRate('EUR', 'USD', trip.id))?.rate).toBe(1.02);
    expect((await r.currency.findRate('EUR', 'USD'))?.rate).toBe(1.08);
    const inverse = (await r.currency.findRate('USD', 'EUR'))!;
    expect(inverse.inverted).toBe(true);
    expect(inverse.rate).toBeCloseTo(1 / 1.08, 10);
    expect(await r.currency.findRate('GBP', 'JPY')).toBeNull();
    const provider = createManualRateProvider(r.currency);
    expect(provider.online).toBe(false);
    expect((await provider.getRate('EUR', 'USD', { tripId: trip.id }))?.rate).toBe(1.02);
  });

  it('converts with correct rounding and keeps a bounded history', async () => {
    const { r } = await setup();
    const quote = { base: 'EUR', quote: 'JPY', rate: 162.37, rateDate: '2026-06-01', source: 'manual', inverted: false };
    const c = await r.currency.convert(1999, quote);
    expect(c.resultMinor).toBe(3246); // 19.99 × 162.37 = 3245.78 → ¥3246
    expect(c).toMatchObject({ rate: 162.37, rateDate: '2026-06-01', source: 'manual' });
    for (let i = 0; i < 55; i++) await r.currency.convert(100 + i, quote);
    const history = await r.currency.history();
    expect(history).toHaveLength(50);
    expect(history[0]!.amountMinor).toBe(154);
    await expect(r.currency.convert(-1, quote)).rejects.toMatchObject({ code: 'invalid_amount' });
    await r.currency.clearHistory();
    expect(await r.currency.history()).toEqual([]);
  });

  it('picks identity for the same currency and formats rates readably', () => {
    const rates: CurrencyRate[] = [];
    expect(pickRate(rates, 'EUR', 'EUR')?.rate).toBe(1);
    expect(formatRate(10.84567, 'en')).toBe('10.8457');
    expect(formatRate(162.374, 'en')).toBe('162.37');
    expect(formatRate(0.0061589, 'en')).toBe('0.006159');
  });
});
