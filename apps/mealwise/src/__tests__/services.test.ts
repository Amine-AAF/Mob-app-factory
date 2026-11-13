import { createTestDatabase } from '@factory/testing';
import { FREE_STATE, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import * as Notifications from 'expo-notifications';

import manifest from '../../app.manifest.json';
import { BUILTIN_RECIPES } from '@/content/recipes';
import { BUILTIN_TEMPLATES } from '@/content/templates';
import { initDatabase, setRepositories } from '@/database';
import { initI18n } from '@/i18n';
import { AD_SCREENS, adUnits, bannerAllowed } from '@/services/ads';
import { clock } from '@/services/clock';
import { initMonetization, purchase, restore } from '@/services/monetization';
import { applySchedule, buildSchedule, DEFAULT_NOTIFICATION_SETTINGS, NOTIFICATION_PREFIX, scheduleTimer, type NotificationSettings } from '@/services/notifications';
import { syncNotifications } from '@/services/planning';
import { groceryListAsCsv, groceryListAsText, planAsCsv, recipeAsText, toCsv } from '@/services/share';
import { useSession } from '@/store/session';
import { localizeRecipe } from '@/domain/recipes';
import { regionalDefaults } from '@/store/preferences';

const scheduled = (Notifications as unknown as { __scheduled: { identifier: string; trigger: { type: string } }[] }).__scheduled;

const allOn: NotificationSettings = {
  mealPrep: { enabled: true, minutesBefore: 60 },
  weeklyPlanning: { enabled: true, weekday: 1, hour: 18, minute: 0 },
  shopping: { enabled: true, weekday: 7, hour: 10, minute: 0 },
  expiry: { enabled: true, daysBefore: 2, hour: 9 },
};

describe('notification schedule (pure)', () => {
  let t: Awaited<ReturnType<typeof initI18n>>['t'];
  beforeAll(async () => {
    t = (await initI18n('en', [])).t;
  });

  const now = new Date(2026, 10, 13, 10, 0); // Friday 13 Nov 2026, 10:00

  it('schedules nothing when everything is off (default)', () => {
    expect(buildSchedule({ settings: DEFAULT_NOTIFICATION_SETTINGS, now, today: '2026-11-13', meals: [{ id: 1, day: '2026-11-13', slot: 'dinner', cookedAt: null, title: 'Tacos' }], pantry: [], t })).toEqual([]);
  });

  it('schedules meal reminders before future, uncooked meals only', () => {
    const out = buildSchedule({
      settings: { ...DEFAULT_NOTIFICATION_SETTINGS, mealPrep: { enabled: true, minutesBefore: 60 } },
      now,
      today: '2026-11-13',
      meals: [
        { id: 1, day: '2026-11-13', slot: 'breakfast', cookedAt: null, title: 'Oats' }, // already past
        { id: 2, day: '2026-11-13', slot: 'dinner', cookedAt: null, title: 'Tacos' },
        { id: 3, day: '2026-11-14', slot: 'lunch', cookedAt: 'x', title: 'Soup' }, // cooked
        { id: 4, day: '2026-11-30', slot: 'lunch', cookedAt: null, title: 'Far away' }, // beyond 7 days
      ],
      pantry: [],
      t,
    });
    expect(out.map((n) => n.id)).toEqual([`${NOTIFICATION_PREFIX}meal-2`]);
    const trig = out[0]!.trigger;
    expect(trig.kind === 'date' && trig.date.getHours()).toBe(18);
    expect(trig.kind === 'date' && trig.date.getMinutes()).toBe(30);
    expect(out[0]!.body).toContain('Tacos');
  });

  it('schedules weekly reminders and expiry alerts', () => {
    const out = buildSchedule({
      settings: allOn,
      now,
      today: '2026-11-13',
      meals: [],
      pantry: [
        { id: 7, name: 'Milk', expiresOn: '2026-11-20', consumedAt: null },
        { id: 8, name: 'Yogurt', expiresOn: '2026-11-14', consumedAt: null }, // alert day is today, 9:00 passed -> soon
        { id: 9, name: 'Old cheese', expiresOn: '2026-11-01', consumedAt: null }, // expired: no alert
        { id: 10, name: 'Eaten', expiresOn: '2026-11-20', consumedAt: 'x' },
      ],
      t,
    });
    const ids = out.map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['mw-weeklyPlanning', 'mw-shopping', 'mw-expiry-7', 'mw-expiry-8']));
    expect(ids).not.toContain('mw-expiry-9');
    expect(ids).not.toContain('mw-expiry-10');
    const milk = out.find((n) => n.id === 'mw-expiry-7')!.trigger;
    expect(milk.kind === 'date' && milk.date.getDate()).toBe(18);
    const yogurt = out.find((n) => n.id === 'mw-expiry-8')!.trigger;
    expect(yogurt.kind === 'date' && yogurt.date.getTime()).toBeGreaterThan(now.getTime());
    expect(out.find((n) => n.id === 'mw-shopping')!.trigger).toEqual({ kind: 'weekly', weekday: 7, hour: 10, minute: 0 });
  });

  it('caps the number of meal reminders', () => {
    const meals = Array.from({ length: 40 }, (_, i) => ({ id: i, day: '2026-11-15', slot: 'dinner' as const, cookedAt: null, title: `M${i}` }));
    const out = buildSchedule({ settings: { ...DEFAULT_NOTIFICATION_SETTINGS, mealPrep: { enabled: true, minutesBefore: 30 } }, now, today: '2026-11-13', meals, pantry: [], t });
    expect(out.length).toBeLessThanOrEqual(21);
  });

  it('translates notification texts', async () => {
    const fr = (await initI18n('fr', [])).t;
    const out = buildSchedule({ settings: allOn, now, today: '2026-11-13', meals: [], pantry: [], t: fr });
    expect(out.find((n) => n.id === 'mw-weeklyPlanning')!.title).not.toBe(t('notifications.planningTitle'));
  });
});

describe('notification sync (expo-notifications mocked)', () => {
  beforeEach(() => {
    scheduled.splice(0, scheduled.length);
    clock.set(() => new Date(2026, 10, 13, 10, 0));
  });
  afterAll(() => clock.set(null));

  it('replaces previous MealWise reminders but keeps cooking timers', async () => {
    const i18n = await initI18n('en', []);
    const repos = await initDatabase(await createTestDatabase());
    setRepositories(repos);
    await scheduleTimer(300, 'Timer', 'Done');
    await repos.preferences.set('notifications', allOn);
    await repos.plan.add({ day: '2026-11-14', slot: 'dinner', recipeId: 'di-beef-tacos', customTitle: null, servings: 2, note: null });
    await repos.pantry.add({ key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 1, unit: 'l', location: 'fridge', expiresOn: '2026-11-20' });
    expect(await syncNotifications(i18n.t, 'en')).toBe(4);
    expect(await syncNotifications(i18n.t, 'en')).toBe(4); // idempotent
    expect(scheduled.filter((s) => s.identifier.startsWith(NOTIFICATION_PREFIX))).toHaveLength(4);
    expect(scheduled.filter((s) => s.identifier.startsWith('mwt-'))).toHaveLength(1);

    await repos.preferences.set('notifications', DEFAULT_NOTIFICATION_SETTINGS);
    expect(await syncNotifications(i18n.t, 'en')).toBe(0);
    expect(scheduled.filter((s) => s.identifier.startsWith(NOTIFICATION_PREFIX))).toHaveLength(0);
  });

  it('schedules nothing without permission', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied', canAskAgain: false });
    expect(await applySchedule([{ id: 'mw-x', channelId: 'c', title: 't', body: 'b', trigger: { kind: 'weekly', weekday: 1, hour: 9, minute: 0 } }])).toBe(0);
  });
});

describe('monetization', () => {
  const premium = (over: Partial<EntitlementState> = {}): EntitlementState => ({
    isPremium: true,
    expiresAt: '2027-01-01T00:00:00.000Z',
    productId: 'mealwise_premium_annual',
    willRenew: true,
    verifiedAt: '2026-11-13T09:00:00.000Z',
    source: 'store',
    ...over,
  });
  const fakeProvider = (state: EntitlementState | null): SubscriptionProvider => ({
    name: 'fake',
    isConfigured: true,
    initialize: async () => undefined,
    fetchEntitlement: async () => state,
    getPlans: async () => [
      { id: 'annual', period: 'annual', priceString: '$17.99', price: 17.99, currencyCode: 'USD', hasFreeTrial: false },
      { id: 'monthly', period: 'monthly', priceString: '$2.99', price: 2.99, currencyCode: 'USD', hasFreeTrial: false },
      { id: 'lifetime', period: 'lifetime', priceString: '$29.99', price: 29.99, currencyCode: 'USD', hasFreeTrial: false },
    ],
    purchase: async () => ({ status: 'success', state: premium() }),
    restore: async () => premium({ productId: 'mealwise_premium_lifetime', expiresAt: null }),
    onChange: () => () => undefined,
  });

  beforeEach(() => {
    clock.set(() => new Date('2026-11-13T10:00:00Z'));
    useSession.setState({ entitlement: FREE_STATE, plans: [], storeAvailable: false });
  });
  afterAll(() => clock.set(null));

  it('declares the indicative prices of the brief (monthly, annual, lifetime)', () => {
    const plans = manifest.monetization.subscriptions.plans;
    expect(plans.map((p) => [p.period, p.indicativePriceUsd])).toEqual([
      ['monthly', 2.99],
      ['annual', 17.99],
      ['lifetime', 29.99],
    ]);
    expect(plans.every((p) => p.productId.startsWith('mealwise_'))).toBe(true);
  });

  it('stays free without a store and never fakes a purchase', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initMonetization(db, { ...fakeProvider(null), isConfigured: false });
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });

  it('applies store entitlement, caches it for offline use, purchases and restores', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initMonetization(db, fakeProvider(premium()));
    expect(useSession.getState().entitlement.isPremium).toBe(true);
    expect(useSession.getState().plans.map((p) => p.period)).toEqual(['annual', 'monthly', 'lifetime']);

    // Offline later: the cached state is honoured within the grace period.
    useSession.setState({ entitlement: FREE_STATE });
    await initMonetization(db, fakeProvider(null));
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'cache' });

    expect(await purchase(db, 'annual')).toMatchObject({ status: 'success' });
    expect((await restore(db))?.productId).toBe('mealwise_premium_lifetime');
  });

  it('shows banners only on browse screens, after consent and grace sessions, never to premium users', () => {
    expect(adUnits.test).toBe(true); // development builds use Google test IDs
    expect(adUnits.banner).toMatch(/^ca-app-pub-3940256099942544\//);
    expect(AD_SCREENS).not.toContain('recipe');
    expect(AD_SCREENS).not.toContain('cooking');
    expect(AD_SCREENS).not.toContain('grocery');
    // Consent not obtained in tests: never shown.
    expect(bannerAllowed({ isPremium: false, sessionCount: 10, screen: 'home' })).toBe(false);
    expect(bannerAllowed({ isPremium: true, sessionCount: 10, screen: 'home' })).toBe(false);
    expect(bannerAllowed({ isPremium: false, sessionCount: 10, screen: 'cooking' })).toBe(false);
    expect(manifest.monetization.ads.placements).toEqual(['banner']);
  });
});

describe('templates content', () => {
  const byId = new Map(BUILTIN_RECIPES.map((r) => [r.id, r]));

  it('provides the 8 required templates referencing existing recipes', () => {
    expect(BUILTIN_TEMPLATES.map((t) => t.id)).toEqual(['family', 'budget', 'quick', 'vegetarian', 'high_protein', 'student', 'mediterranean', 'busy']);
    for (const tpl of BUILTIN_TEMPLATES) {
      expect(tpl.entries.length).toBeGreaterThanOrEqual(10);
      for (const e of tpl.entries) {
        expect(e.dayOffset).toBeGreaterThanOrEqual(0);
        expect(e.dayOffset).toBeLessThan(7);
        expect(byId.has(e.recipeId ?? '')).toBe(true);
      }
    }
  });

  it('free templates only use free recipes', () => {
    for (const tpl of BUILTIN_TEMPLATES.filter((t) => !t.premium)) {
      const premiumUsed = tpl.entries.filter((e) => byId.get(e.recipeId ?? '')?.premium).map((e) => e.recipeId);
      expect({ tpl: tpl.id, premiumUsed }).toEqual({ tpl: tpl.id, premiumUsed: [] });
    }
  });

  it('vegetarian week is really vegetarian, quick week is really quick', () => {
    const veg = BUILTIN_TEMPLATES.find((t) => t.id === 'vegetarian')!;
    expect(veg.entries.every((e) => byId.get(e.recipeId!)!.categories.includes('vegetarian'))).toBe(true);
    const quick = BUILTIN_TEMPLATES.find((t) => t.id === 'quick')!;
    expect(quick.entries.every((e) => byId.get(e.recipeId!)!.prepMinutes + byId.get(e.recipeId!)!.cookMinutes <= 35)).toBe(true);
    expect(BUILTIN_TEMPLATES.filter((t) => t.premium).length).toBeGreaterThanOrEqual(2);
  });
});

describe('sharing & export', () => {
  it('renders a grocery list by aisle and CSV safely', async () => {
    const { t } = await initI18n('en', []);
    const q = (n: number | null, u: string) => `${n} ${u}`;
    const items = [
      { id: 1, listId: 1, key: 'egg', name: 'Eggs', category: 'dairy_eggs' as const, quantity: 6, unit: 'pc' as const, checked: false, price: null, manual: false, note: null, position: 0 },
      { id: 2, listId: 1, key: 'custom:x', name: 'Soap, "lemon"', category: 'household' as const, quantity: 1, unit: 'pc' as const, checked: true, price: 2.5, manual: true, note: null, position: 1 },
    ];
    const text = groceryListAsText('My list', items, q, t, { includeChecked: false });
    expect(text).toContain('Dairy, eggs & chilled');
    expect(text).toContain('☐ Eggs — 6 pc');
    expect(text).not.toContain('Soap');
    const csv = groceryListAsCsv(items, t);
    expect(csv.split('\n')[2]).toContain('"Soap, ""lemon"""');
    expect(toCsv([['a', null, 3]])).toBe('a,,3');
    expect(planAsCsv([{ id: 1, day: '2026-11-16', slot: 'dinner', recipeId: 'x', customTitle: null, servings: 2, note: null, position: 0, cookedAt: null }], new Map([[1, 'Tacos']]), t)).toContain('2026-11-16,Dinner,Tacos,2,0');
    const recipe = localizeRecipe(BUILTIN_RECIPES[0]!, 'en');
    expect(recipeAsText(recipe, 4, (n, u) => `${n}${u}`, t, 'en')).toContain(recipe.title);
  });
});

describe('regional defaults', () => {
  it('derives units, currency and week start from the device region', () => {
    expect(regionalDefaults('US', 'USD')).toEqual({ unitSystem: 'imperial', currency: 'USD', firstDayOfWeek: 'sunday' });
    expect(regionalDefaults('FR', 'EUR')).toEqual({ unitSystem: 'metric', currency: 'EUR', firstDayOfWeek: 'monday' });
    expect(regionalDefaults(null, null)).toEqual({ unitSystem: 'metric', currency: 'USD', firstDayOfWeek: 'monday' });
  });
});
