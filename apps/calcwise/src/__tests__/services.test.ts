import fs from 'node:fs';
import path from 'node:path';

import { ADMOB_TEST_IDS, FREE_STATE, resolveAdUnits, shouldShowInterstitial, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';

import manifest from '../../app.manifest.json';
import { PALETTES } from '@/constants/theme';
import { LIMITS } from '@/constants/tools';
import { initDatabase } from '@/database';
import { clock } from '@/services/clock';
import { initMonetization, purchase, restore } from '@/services/monetization';
import { usePreferences } from '@/store/preferences';
import { hasAdvancedAccess, useSession } from '@/store/session';
import { contrastRatio, createTheme } from '@factory/design-system';

const premium = (over: Partial<EntitlementState> = {}): EntitlementState => ({
  isPremium: true,
  expiresAt: '2026-12-13T00:00:00.000Z',
  productId: 'calcwise_premium_monthly',
  willRenew: true,
  verifiedAt: '2026-11-13T00:00:00.000Z',
  source: 'store',
  ...over,
});

function fakeProvider(initial: EntitlementState | null): SubscriptionProvider & { state: EntitlementState | null } {
  const p = {
    name: 'fake',
    isConfigured: true,
    state: initial,
    initialize: async () => undefined,
    fetchEntitlement: async () => p.state,
    getPlans: async () => [
      { id: '$rc_monthly', period: 'monthly' as const, priceString: '$1.99', price: 1.99, currencyCode: 'USD', hasFreeTrial: false },
      { id: '$rc_annual', period: 'annual' as const, priceString: '$9.99', price: 9.99, currencyCode: 'USD', hasFreeTrial: false },
      { id: '$rc_lifetime', period: 'lifetime' as const, priceString: '$19.99', price: 19.99, currencyCode: 'USD', hasFreeTrial: false },
    ],
    purchase: async (id: string) => {
      p.state = premium({ productId: id, expiresAt: id === '$rc_lifetime' ? null : '2026-12-13T00:00:00.000Z' });
      return { status: 'success' as const, state: p.state };
    },
    restore: async () => p.state,
    onChange: () => () => undefined,
  };
  return p;
}

beforeEach(() => {
  clock.now = () => new Date('2026-11-13T10:00:00.000Z');
  useSession.setState({ entitlement: FREE_STATE, plans: [], storeAvailable: false });
  usePreferences.setState({ rewardedUnlockUntil: 0 });
});

describe('Premium (monetization service)', () => {
  it('stays free and never fakes Premium without a store', async () => {
    const { db } = { db: await createTestDatabase() };
    await initDatabase(db);
    await initMonetization(db);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(useSession.getState().storeAvailable).toBe(false);
  });

  it('grants Premium only after a verified purchase, and lists all three plans', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const provider = fakeProvider(FREE_STATE);
    await initMonetization(db, provider);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(useSession.getState().plans.map((p) => p.period)).toEqual(['monthly', 'annual', 'lifetime']);
    const outcome = await purchase(db, '$rc_lifetime', 'lifetime');
    expect(outcome.status).toBe('success');
    expect(useSession.getState().entitlement.isPremium).toBe(true);
    expect(useSession.getState().entitlement.expiresAt).toBeNull();
  });

  it('restores purchases and honours the cache offline for at most 7 days', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const provider = fakeProvider(premium());
    await initMonetization(db, provider);
    expect((await restore(db))?.isPremium).toBe(true);

    // Offline next day: store unreachable → cached state honoured.
    provider.state = null;
    clock.now = () => new Date('2026-11-14T10:00:00.000Z');
    await initMonetization(db, provider);
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'cache' });

    // Offline 8 days after the last verification: back to free.
    clock.now = () => new Date('2026-11-21T10:00:00.000Z');
    await initMonetization(db, provider);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });
});

describe('advanced access', () => {
  it('rewarded unlock lasts one hour and never replaces Premium', () => {
    const now = Date.parse('2026-11-13T10:00:00.000Z');
    expect(hasAdvancedAccess(now)).toBe(false);
    usePreferences.setState({ rewardedUnlockUntil: now + LIMITS.rewardedUnlockMs });
    expect(hasAdvancedAccess(now + 59 * 60_000)).toBe(true);
    expect(hasAdvancedAccess(now + 61 * 60_000)).toBe(false);
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });
});

describe('ads policy', () => {
  it('uses Google test units in development and never test IDs in production', () => {
    expect(resolveAdUnits({ isDev: true }).banner).toBe(ADMOB_TEST_IDS.banner);
    expect(resolveAdUnits({ isDev: false, production: { banner: ADMOB_TEST_IDS.banner } }).banner).toBeNull();
    expect(resolveAdUnits({ isDev: false }).banner).toBeNull();
  });

  it('interstitials only at natural breaks, frequency-capped, never for Premium or in the first session', () => {
    const base = { isPremium: false, consentObtained: true, sessionCount: 3, graceSessions: manifest.monetization.ads.graceSessions, atNaturalBreak: true, activitiesSinceLast: 3, msSinceLast: 5 * 60_000 };
    expect(shouldShowInterstitial(base)).toBe(true);
    expect(shouldShowInterstitial({ ...base, isPremium: true })).toBe(false);
    expect(shouldShowInterstitial({ ...base, atNaturalBreak: false })).toBe(false);
    expect(shouldShowInterstitial({ ...base, activitiesSinceLast: 2 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, msSinceLast: 60_000 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, sessionCount: 1 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, consentObtained: false })).toBe(false);
  });

  it('no ad component is ever rendered on the calculator or a tool screen', () => {
    const root = path.resolve(__dirname, '..', '..', 'app');
    const forbidden = ['(tabs)/calculator.tsx', 'tools/percentage.tsx', 'tools/discount.tsx', 'tools/tip.tsx', 'tools/units.tsx', 'tools/loan.tsx', 'tools/savings.tsx', 'paywall.tsx', 'onboarding.tsx'];
    for (const file of forbidden) expect({ file, banner: fs.readFileSync(path.join(root, file), 'utf8').includes('AdBanner') }).toEqual({ file, banner: false });
  });
});

describe('privacy & offline', () => {
  const srcRoot = path.resolve(__dirname, '..', '..');
  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === '__tests__' ? [] : files(path.join(dir, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : []));
  const code = [...files(path.join(srcRoot, 'app')), ...files(path.join(srcRoot, 'src'))].map((f) => [f, fs.readFileSync(f, 'utf8')] as const);

  it('makes no network calls of its own (offline-first)', () => {
    for (const [file, src] of code) expect({ file: path.basename(file), net: /\bfetch\(|XMLHttpRequest|axios|WebSocket/.test(src) }).toEqual({ file: path.basename(file), net: false });
  });

  it('never uses eval or Function constructors', () => {
    for (const [file, src] of code) expect({ file: path.basename(file), unsafe: /\beval\(|new Function\(/.test(src) }).toEqual({ file: path.basename(file), unsafe: false });
  });

  it('analytics events carry only tool ids, modes, sources and plan periods', () => {
    const calls = code.flatMap(([, src]) => [...src.matchAll(/track\('([a-z_]+)', \{([^}]*)\}/g)].map((m) => ({ name: m[1], params: m[2] ?? '' })));
    expect(calls.length).toBeGreaterThan(5);
    for (const c of calls) {
      const keys = [...c.params.matchAll(/(\w+):/g)].map((m) => m[1]);
      for (const k of keys) expect(['tool', 'mode', 'source', 'period']).toContain(k);
    }
    // Strict allowlist of event names from the product spec.
    const names = new Set(calls.map((c) => c.name));
    for (const n of names) expect(['calculator_opened', 'calculation_completed', 'tool_used', 'premium_screen_viewed', 'purchase_started', 'purchase_completed']).toContain(n);
  });
});

describe('themes', () => {
  it('every palette keeps readable contrast in light and dark mode', () => {
    for (const [id, p] of Object.entries(PALETTES)) {
      for (const scheme of ['light', 'dark'] as const) {
        const t = createTheme(p, scheme);
        expect({ id, scheme, text: contrastRatio(t.colors.text, t.colors.background) >= 7 }).toEqual({ id, scheme, text: true });
        expect({ id, scheme, primary: contrastRatio(t.colors.primary, t.colors.surface) >= 3 }).toEqual({ id, scheme, primary: true });
        expect({ id, scheme, onPrimary: contrastRatio(t.colors.onPrimary, t.colors.primary) >= 4.5 }).toEqual({ id, scheme, onPrimary: true });
      }
    }
  });
});
