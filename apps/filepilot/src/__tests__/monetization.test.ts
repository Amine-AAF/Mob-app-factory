import { createMemoryProvider, sanitizeParams } from '@factory/analytics';
import { FREE_STATE, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';

import manifest from '../../app.manifest.json';
import { FREE_LIMITS } from '@/config/limits';
import { matchesTool, TOOLS } from '@/config/tools';
import { initDatabase } from '@/database';
import { countBucket, registerAnalyticsProvider, setAnalyticsConsent, sizeBucket, track } from '@/services/analytics';
import { initMonetization, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { canUse, featureCap, quotaStatus } from '@/services/quota';
import { useSession } from '@/store/session';

const PREMIUM: EntitlementState = { isPremium: true, expiresAt: '2099-01-01T00:00:00.000Z', productId: 'filepilot_premium_annual', willRenew: true, verifiedAt: new Date().toISOString(), source: 'store' };

function fakeProvider(state: EntitlementState | null): SubscriptionProvider & { purchases: string[] } {
  const purchases: string[] = [];
  return {
    name: 'fake',
    isConfigured: true,
    purchases,
    initialize: async () => undefined,
    fetchEntitlement: async () => state,
    getPlans: async () => [
      { id: 'monthly', period: 'monthly', priceString: '2,99 €', price: 2.99, currencyCode: 'EUR', hasFreeTrial: false },
      { id: 'annual', period: 'annual', priceString: '14,99 €', price: 14.99, currencyCode: 'EUR', hasFreeTrial: false },
    ],
    purchase: async (id) => {
      purchases.push(id);
      return { status: 'success', state: PREMIUM };
    },
    restore: async () => state,
    onChange: () => () => undefined,
  };
}

describe('free quota and premium access', () => {
  const usage = (operations: number, bonus = 0, rewardedCount = 0) => ({ day: '2026-11-13', operations, bonus, rewardedCount });

  it('gives a daily free quota that only successful operations consume', () => {
    expect(quotaStatus(false, usage(0))).toMatchObject({ remaining: FREE_LIMITS.dailyOperations, unlimited: false });
    expect(quotaStatus(false, usage(FREE_LIMITS.dailyOperations)).remaining).toBe(0);
  });

  it('adds rewarded bonuses, capped per day', () => {
    expect(quotaStatus(false, usage(10, 3, 1))).toMatchObject({ remaining: 3, canEarnBonus: true });
    expect(quotaStatus(false, usage(10, 6, FREE_LIMITS.maxRewardedPerDay)).canEarnBonus).toBe(false);
  });

  it('is unlimited for Premium', () => {
    expect(quotaStatus(true, usage(500))).toMatchObject({ unlimited: true, remaining: Infinity });
  });

  it('gates batch, target size and PDF caps by plan', () => {
    expect(canUse(false, 'batch')).toBe(false);
    expect(canUse(false, 'targetSize')).toBe(false);
    expect(canUse(true, 'batch')).toBe(true);
    expect(featureCap(false, 'batchImages')).toBe(1);
    expect(featureCap(false, 'mergeFiles')).toBe(FREE_LIMITS.mergeFiles);
    expect(featureCap(true, 'mergeFiles')).toBeGreaterThan(FREE_LIMITS.mergeFiles);
    expect(featureCap(true, 'historyEntries')).toBe(Infinity);
  });
});

describe('subscriptions (RevenueCat abstraction)', () => {
  beforeEach(() => useSession.getState().set({ entitlement: FREE_STATE, plans: [], storeAvailable: false }));

  it('manifest declares the three FilePilot products with indicative prices only', () => {
    expect(manifest.monetization.subscriptions?.plans.map((p) => [p.productId, p.period])).toEqual([
      ['filepilot_premium_monthly', 'monthly'],
      ['filepilot_premium_annual', 'annual'],
      ['filepilot_premium_lifetime', 'lifetime'],
    ]);
  });

  it('without a store key, never grants premium and never simulates purchases', async () => {
    const repos = await initDatabase(await createTestDatabase());
    await initMonetization(repos);
    expect(subscriptionsConfigured()).toBe(false);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(await purchase(repos, 'annual')).toEqual({ status: 'error', message: 'store_not_configured' });
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });

  it('loads localized store plans and validates the entitlement', async () => {
    const repos = await initDatabase(await createTestDatabase());
    await initMonetization(repos, fakeProvider(PREMIUM));
    const s = useSession.getState();
    expect(s.entitlement).toMatchObject({ isPremium: true, source: 'store' });
    expect(s.plans.map((p) => p.priceString)).toEqual(['2,99 €', '14,99 €']);
    // The verified state is cached for offline use.
    expect((await repos.subscription.read())?.isPremium).toBe(true);
  });

  it('keeps Premium offline from a recent cache, and expires it', async () => {
    const repos = await initDatabase(await createTestDatabase());
    await repos.subscription.write(PREMIUM, new Date().toISOString());
    const offline = { ...fakeProvider(null), fetchEntitlement: async () => null };
    await initMonetization(repos, offline);
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'cache' });

    await repos.subscription.write({ ...PREMIUM, expiresAt: '2020-01-01T00:00:00.000Z' }, new Date().toISOString());
    await initMonetization(repos, offline);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });

  it('purchases and restores through the provider', async () => {
    const repos = await initDatabase(await createTestDatabase());
    const provider = fakeProvider(FREE_STATE);
    await initMonetization(repos, provider);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect((await purchase(repos, 'annual')).status).toBe('success');
    expect(provider.purchases).toEqual(['annual']);
    expect(useSession.getState().entitlement.isPremium).toBe(true);
    expect(await restore(repos)).toMatchObject({ isPremium: false }); // store says free again
  });
});

describe('anonymous analytics', () => {
  it('sends nothing without consent, and no file metadata with consent', () => {
    const memory = createMemoryProvider();
    registerAnalyticsProvider(memory);
    track('tool_opened', { tool: 'compress' });
    expect(memory.events).toEqual([]);
    setAnalyticsConsent(true);
    track('compression_completed', { format: 'jpeg', size_bucket: sizeBucket(2_500_000), saved_percent: 61, batch: false, target_size: false });
    expect(memory.events).toEqual([{ name: 'compression_completed', params: { format: 'jpeg', size_bucket: 'lt_5mb', saved_percent: 61, batch: false, target_size: false } }]);
    setAnalyticsConsent(false);
  });

  it('strips name-like parameters even if a call site tried to send them', () => {
    expect(sanitizeParams({ file_name: 'secret.pdf', original_name: 'x', tool: 'merge' })).toEqual({ tool: 'merge' });
  });

  it('buckets sizes and counts', () => {
    expect([sizeBucket(50_000), sizeBucket(500_000), sizeBucket(30_000_000)]).toEqual(['lt_100kb', 'lt_1mb', 'gte_20mb']);
    expect([countBucket(1), countBucket(4), countBucket(12), countBucket(40)]).toEqual(['1', '2_5', '6_20', '21_plus']);
  });
});

describe('tool search', () => {
  it('matches words in any order, ignoring case and accents', () => {
    expect(matchesTool('PDF fusion', ['Fusionner des PDF', 'Assembler'])).toBe(true);
    expect(matchesTool('compresion', ['Compresión de imágenes'])).toBe(true);
    expect(matchesTool('zip', ['Image Compressor'])).toBe(false);
    expect(matchesTool('', ['anything'])).toBe(true);
  });

  it('lists every dashboard tool exactly once', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(6);
  });
});
