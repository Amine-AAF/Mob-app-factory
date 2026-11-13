import { ADMOB_TEST_IDS, resolveInterstitialUnit, shouldShowInterstitial, annualSavingsPercent, createUnconfiguredProvider, FREE_STATE, OFFLINE_GRACE_DAYS, resolveAdUnits, resolveEntitlement, shouldShowBanner, type EntitlementState } from '../index';

const NOW = new Date('2026-06-15T12:00:00Z');
const premium = (over: Partial<EntitlementState> = {}): EntitlementState => ({
  isPremium: true,
  expiresAt: '2026-07-15T12:00:00Z',
  productId: 'devspeak_premium_monthly',
  willRenew: true,
  verifiedAt: '2026-06-14T12:00:00Z',
  source: 'store',
  ...over,
});

describe('resolveEntitlement', () => {
  it('prefers a fresh store answer, including a downgrade to free', () => {
    expect(resolveEntitlement({ ...FREE_STATE, verifiedAt: NOW.toISOString() }, premium(), NOW).isPremium).toBe(false);
    expect(resolveEntitlement(premium(), null, NOW).source).toBe('store');
  });

  it('honours a recent cached premium state offline', () => {
    const r = resolveEntitlement(null, premium(), NOW);
    expect(r.isPremium).toBe(true);
    expect(r.source).toBe('cache');
  });

  it('drops premium offline after expiry', () => {
    expect(resolveEntitlement(null, premium({ expiresAt: '2026-06-01T00:00:00Z' }), NOW).isPremium).toBe(false);
  });

  it('drops premium offline after the grace period without verification', () => {
    const old = new Date(NOW.getTime() - (OFFLINE_GRACE_DAYS + 1) * 86_400_000).toISOString();
    expect(resolveEntitlement(null, premium({ verifiedAt: old, expiresAt: null }), NOW).isPremium).toBe(false);
  });

  it('is free without cache or store', () => {
    expect(resolveEntitlement(null, null, NOW)).toEqual(FREE_STATE);
  });
});

describe('plans', () => {
  it('computes annual savings only for comparable plans', () => {
    const monthly = { id: 'm', period: 'monthly' as const, priceString: '$3.99', price: 3.99, currencyCode: 'USD', hasFreeTrial: false };
    const annual = { id: 'a', period: 'annual' as const, priceString: '$19.99', price: 19.99, currencyCode: 'USD', hasFreeTrial: false };
    expect(annualSavingsPercent([monthly, annual])).toBe(58);
    expect(annualSavingsPercent([monthly, { ...annual, currencyCode: 'EUR' }])).toBeNull();
    expect(annualSavingsPercent([annual])).toBeNull();
  });

  it('the unconfigured provider never grants or fakes purchases', async () => {
    const p = createUnconfiguredProvider();
    expect(p.isConfigured).toBe(false);
    expect(await p.fetchEntitlement()).toBeNull();
    expect(await p.purchase('x')).toEqual({ status: 'error', message: 'store_not_configured' });
    expect(await p.restore()).toBeNull();
  });
});

describe('ads', () => {
  it('always uses Google test IDs in development', () => {
    expect(resolveAdUnits({ isDev: true, production: { banner: 'ca-app-pub-123/456' } })).toEqual({ banner: ADMOB_TEST_IDS.banner, rewarded: ADMOB_TEST_IDS.rewarded, test: true });
  });

  it('never falls back to test IDs in production and rejects malformed IDs', () => {
    expect(resolveAdUnits({ isDev: false })).toEqual({ banner: null, rewarded: null, test: false });
    expect(resolveAdUnits({ isDev: false, production: { banner: ADMOB_TEST_IDS.banner, rewarded: 'garbage' } }).banner).toBeNull();
    expect(resolveAdUnits({ isDev: false, production: { banner: 'ca-app-pub-1111111111111111/2222222222' } }).banner).toBe('ca-app-pub-1111111111111111/2222222222');
  });

  it('shows banners only to consenting free users after the grace period', () => {
    const base = { isPremium: false, consentObtained: true, sessionCount: 5, graceSessions: 2, screenAllowsAds: true };
    expect(shouldShowBanner(base)).toBe(true);
    expect(shouldShowBanner({ ...base, isPremium: true })).toBe(false);
    expect(shouldShowBanner({ ...base, consentObtained: false })).toBe(false);
    expect(shouldShowBanner({ ...base, sessionCount: 2 })).toBe(false);
    expect(shouldShowBanner({ ...base, screenAllowsAds: false })).toBe(false);
  });
});

describe('interstitial policy', () => {
  const base = { isPremium: false, consentObtained: true, sessionCount: 5, graceSessions: 2, atNaturalBreak: true, activitiesSinceLast: 3, msSinceLast: 5 * 60_000 };

  it('uses the test unit in development and never a test unit in production', () => {
    expect(resolveInterstitialUnit({ isDev: true, production: 'ca-app-pub-1/2' })).toBe(ADMOB_TEST_IDS.interstitial);
    expect(resolveInterstitialUnit({ isDev: false })).toBeNull();
    expect(resolveInterstitialUnit({ isDev: false, production: ADMOB_TEST_IDS.interstitial })).toBeNull();
    expect(resolveInterstitialUnit({ isDev: false, production: 'ca-app-pub-1111111111111111/3333333333' })).toBe('ca-app-pub-1111111111111111/3333333333');
  });

  it('shows only at a natural break, within frequency caps, for consenting free users', () => {
    expect(shouldShowInterstitial(base)).toBe(true);
    expect(shouldShowInterstitial({ ...base, atNaturalBreak: false })).toBe(false);
    expect(shouldShowInterstitial({ ...base, isPremium: true })).toBe(false);
    expect(shouldShowInterstitial({ ...base, adsRemoved: true })).toBe(false);
    expect(shouldShowInterstitial({ ...base, consentObtained: false })).toBe(false);
    expect(shouldShowInterstitial({ ...base, sessionCount: 2 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, activitiesSinceLast: 2 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, msSinceLast: 60_000 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, msSinceLast: Infinity, activitiesSinceLast: 10 })).toBe(true);
  });
});
