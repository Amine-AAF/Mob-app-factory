import { FREE_STATE, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';

import { currencyDecimals } from '@/constants/currencies';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import type { ExpenseWithShares } from '@/database/repositories/expenses';
import { csvCell, escapeHtml, exportFileName, expensesCsv, itineraryHtml, type ItineraryLabels } from '@/features/export/builders';
import { assertCanAddDocument, PremiumLimitError } from '@/features/premium/guard';
import { canCreateActiveTrip, canEarnBonusSlot, FREE_LIMITS, isItineraryTemplateFree, isPackingTemplateFree, PREMIUM_BENEFITS } from '@/features/premium/limits';
import { createTrip, duplicateTrip, unarchiveTrip } from '@/features/trips/actions';
import { bannerAllowed, interstitialAllowed } from '@/services/ads';
import { applyEntitlement, initMonetization, purchase, resetLocalEntitlement, subscriptionsConfigured } from '@/services/monetization';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { clock } from '@/utils/clock';

const premium = (patch: Partial<EntitlementState> = {}): EntitlementState => ({
  isPremium: true,
  expiresAt: '2027-06-01T00:00:00.000Z',
  productId: 'travelwise_premium_annual',
  willRenew: true,
  verifiedAt: '2026-06-01T10:00:00.000Z',
  source: 'store',
  ...patch,
});

async function setup(): Promise<Repositories> {
  const r = await initDatabase(await createTestDatabase());
  setRepositories(r);
  return r;
}

beforeEach(() => {
  clock.set(() => new Date('2026-06-01T10:00:00.000Z'));
  useSession.setState({ entitlement: FREE_STATE, plans: [], plansAvailable: false });
  usePreferences.setState({ bonusTripSlots: 0, sessionCount: 10, lastInterstitialAt: null, activitiesSinceInterstitial: 0 });
});
afterEach(() => clock.set(null));

describe('free vs premium rules', () => {
  it('limits active trips for free users, with rewarded bonus slots capped', () => {
    expect(canCreateActiveTrip(false, FREE_LIMITS.activeTrips - 1, 0)).toBe(true);
    expect(canCreateActiveTrip(false, FREE_LIMITS.activeTrips, 0)).toBe(false);
    expect(canCreateActiveTrip(false, FREE_LIMITS.activeTrips, 1)).toBe(true);
    expect(canCreateActiveTrip(false, FREE_LIMITS.activeTrips + 5, 99)).toBe(false);
    expect(canCreateActiveTrip(true, 500, 0)).toBe(true);
    expect(canEarnBonusSlot(false, FREE_LIMITS.maxBonusTripSlots)).toBe(false);
    expect(canEarnBonusSlot(true, 0)).toBe(false);
  });

  it('keeps some templates free and only lists implemented benefits', () => {
    expect(isItineraryTemplateFree('weekend')).toBe(true);
    expect(isItineraryTemplateFree('roadtrip10')).toBe(false);
    expect(isPackingTemplateFree('beach')).toBe(true);
    expect(isPackingTemplateFree('winter')).toBe(false);
    expect(PREMIUM_BENEFITS).not.toContain('advanced_backup');
    expect(PREMIUM_BENEFITS).toHaveLength(new Set(PREMIUM_BENEFITS).size);
  });

  it('enforces the active-trip limit inside the actions (not only in the UI)', async () => {
    const r = await setup();
    for (let i = 0; i < FREE_LIMITS.activeTrips; i++) await createTrip({ name: `Trip ${i}`, currency: 'EUR' });
    await expect(createTrip({ name: 'One too many', currency: 'EUR' })).rejects.toBeInstanceOf(PremiumLimitError);
    // Completed trips never count.
    await r.trips.create({ name: 'Past', startDate: '2026-01-01', endDate: '2026-01-05', currency: 'EUR' });
    const first = (await r.trips.list()).find((t) => t.name === 'Trip 0')!;
    await expect(duplicateTrip(first.id, 'copy')).rejects.toMatchObject({ limit: 'active_trips' });
    await r.trips.archive(first.id);
    await createTrip({ name: 'Fits again', currency: 'EUR' });
    await expect(unarchiveTrip(first.id)).rejects.toBeInstanceOf(PremiumLimitError);
    // A rewarded slot or Premium lifts the limit.
    usePreferences.setState({ bonusTripSlots: 1 });
    await unarchiveTrip(first.id);
    useSession.setState({ entitlement: premium() });
    await createTrip({ name: 'Premium trip', currency: 'EUR' });
    expect(await r.trips.count()).toBe(6);
  });

  it('enforces the document limit', async () => {
    const r = await setup();
    for (let i = 0; i < FREE_LIMITS.documents; i++) {
      await r.documents.create({ title: `Doc ${i}`, type: 'other' }, { uri: `file:///x/${i}.pdf`, mimeType: 'application/pdf', sizeBytes: 100 });
    }
    await expect(assertCanAddDocument()).rejects.toMatchObject({ limit: 'documents' });
    useSession.setState({ entitlement: premium() });
    await expect(assertCanAddDocument()).resolves.toBeUndefined();
  });
});

describe('entitlement (Premium)', () => {
  const fakeProvider = (state: EntitlementState | null): SubscriptionProvider & { purchases: string[] } => {
    const purchases: string[] = [];
    return {
      purchases,
      name: 'fake',
      isConfigured: true,
      initialize: async () => undefined,
      fetchEntitlement: async () => state,
      getPlans: async () => [{ id: 'annual', period: 'annual', priceString: '17,99 €', price: 17.99, currencyCode: 'EUR', hasFreeTrial: false }],
      purchase: async (id) => {
        purchases.push(id);
        return { status: 'success', state: premium({ productId: id }) };
      },
      restore: async () => state,
      onChange: () => () => undefined,
    };
  };

  it('migrates the subscription cache table', async () => {
    const r = await setup();
    expect((await r.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []))!.user_version).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe(2);
  });

  it('never grants Premium without a configured store', async () => {
    const r = await setup();
    await initMonetization(r.db);
    expect(subscriptionsConfigured()).toBe(false);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });

  it('applies the store state, caches it and honours it offline within the grace period', async () => {
    const r = await setup();
    await initMonetization(r.db, fakeProvider(premium()));
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'store' });
    expect(useSession.getState().plans.map((p) => p.priceString)).toEqual(['17,99 €']);
    // Offline 3 days later: cache is trusted.
    clock.set(() => new Date('2026-06-04T10:00:00.000Z'));
    expect(await applyEntitlement(r.db, null)).toMatchObject({ isPremium: true, source: 'cache' });
    // Offline 10 days later: grace period over, back to free.
    clock.set(() => new Date('2026-06-11T10:00:00.000Z'));
    expect((await applyEntitlement(r.db, null)).isPremium).toBe(false);
  });

  it('records a successful purchase and resets local state on data wipe', async () => {
    const r = await setup();
    const provider = fakeProvider(null);
    await initMonetization(r.db, provider);
    const outcome = await purchase(r.db, 'annual');
    expect(outcome.status).toBe('success');
    expect(provider.purchases).toEqual(['annual']);
    expect(useSession.getState().entitlement.isPremium).toBe(true);
    resetLocalEntitlement();
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });
});

describe('ad policy', () => {
  it('never shows banners off browse screens, before consent or to Premium users', () => {
    // No SDK and no consent in tests: always false, including on allowed screens.
    expect(bannerAllowed(null)).toBe(false);
    expect(bannerAllowed('home')).toBe(false);
    expect(interstitialAllowed(Date.now())).toBe(false);
    useSession.setState({ entitlement: premium() });
    expect(bannerAllowed('trips')).toBe(false);
  });
});

describe('exports', () => {
  const labels: ItineraryLabels = {
    title: (n) => n,
    dates: '30 Jul – 6 Aug',
    day: (n, d) => `Day ${n} ${d}`,
    anytime: 'Anytime',
    category: (c) => c,
    bookingsTitle: 'Bookings',
    bookingType: (b) => b,
    reference: 'Ref',
    noActivities: 'Nothing planned',
    footer: 'Entered by the traveller',
    generated: 'Generated',
  };

  it('escapes every user value in the itinerary HTML', () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe('&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
    const html = itineraryHtml({
      trip: { name: 'Porto <script>', destinations: [{ city: 'Porto' }], primaryDestination: 'Porto' } as never,
      days: [
        { id: 'd1', date: '2026-07-30', title: 'Arrival', description: '', destinationId: null, activities: [{ id: 'a', name: 'Dinner & "fado"', startTime: '20:00', endTime: null, category: 'restaurant', address: '', notes: '' }] },
        { id: 'd2', date: '2026-07-31', title: '', description: '', destinationId: null, activities: [] },
      ] as never,
      bookings: [
        { type: 'flight', provider: 'Air', reference: 'AB<1>', date: '2026-07-30', time: '07:15', departureInfo: 'Home', arrivalInfo: 'OPO', status: 'confirmed' },
        { type: 'hotel', provider: 'Gone', reference: '', date: null, time: null, departureInfo: '', arrivalInfo: '', status: 'cancelled' },
      ] as never,
      labels,
      dayNumber: (d) => (d === '2026-07-30' ? 1 : 2),
      cityOf: () => null,
      lang: 'en',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('Porto &lt;script&gt;');
    expect(html).toContain('Dinner &amp; &quot;fado&quot;');
    expect(html).toContain('AB&lt;1&gt;');
    expect(html).toContain('Nothing planned');
    expect(html).not.toContain('Gone');
    expect(html).toContain('Entered by the traveller');
  });

  it('neutralises spreadsheet formulas and quotes CSV cells', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+33 6')).toBe("'+33 6");
    expect(csvCell('-5')).toBe("'-5");
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(csvCell(-12.5)).toBe('-12.5');
    expect(csvCell(null)).toBe('');
  });

  it('exports expenses with BOM, correct decimals and shares', () => {
    const base = { tripId: 't', city: 'Kyoto', paymentMethod: 'Card', notes: '', splitMode: 'none', createdAt: '', updatedAt: '', shares: [] } as const;
    const rows = [
      { ...base, id: '1', amountMinor: 1500, currency: 'JPY', tripAmountMinor: 930, rateToTrip: 0.0062, category: 'food', date: '2026-07-31', description: 'Ramen', paidByParticipantId: 'p1' },
      {
        ...base,
        id: '2',
        amountMinor: 3000,
        currency: 'EUR',
        tripAmountMinor: 3000,
        rateToTrip: 1,
        category: 'transport',
        date: '2026-08-01',
        description: '=cmd',
        paidByParticipantId: null,
        splitMode: 'equal',
        shares: [
          { expenseId: '2', participantId: 'p1', shareMinor: 1500 },
          { expenseId: '2', participantId: 'p2', shareMinor: 1500 },
        ],
      },
    ] as unknown as ExpenseWithShares[];
    const csv = expensesCsv(rows, 'EUR', currencyDecimals, {
      headers: ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Rate', 'Trip amount', 'Trip currency', 'City', 'Payment', 'Paid by', 'Shares', 'Notes'],
      category: (c) => c.toUpperCase(),
      participant: (id) => ({ p1: 'Ana', p2: 'Ben' })[id as 'p1' | 'p2'] ?? '',
    });
    expect(csv.startsWith('﻿Date,Description')).toBe(true);
    const lines = csv.slice(1).trim().split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('2026-07-31,Ramen,FOOD,1500,JPY,0.0062,9.30,EUR,Kyoto,Card,Ana,,');
    expect(lines[2]).toBe("2026-08-01,'=cmd,TRANSPORT,30.00,EUR,,30.00,EUR,Kyoto,Card,,Ana: 15.00 | Ben: 15.00,");
  });

  it('builds safe file names', () => {
    expect(exportFileName('Été à Lisbonne / Porto', 'itinerary', 'pdf')).toBe('Ete-a-Lisbonne-Porto-itinerary.pdf');
    expect(exportFileName('***', 'expenses', 'csv')).toBe('trip-expenses.csv');
  });
});
