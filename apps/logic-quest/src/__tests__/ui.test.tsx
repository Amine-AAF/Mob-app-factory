import { contrastRatio, createTheme, ThemeProvider } from '@factory/design-system';
import { FREE_STATE, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen as routerScreen } from 'expo-router/testing-library';
import fs from 'fs';
import path from 'path';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';

import Index from '../../app/index';
import { ChallengeView } from '@/components/ChallengeView';
import { brand } from '@/config/brand';
import { CHALLENGES } from '@/content';
import { initDatabase } from '@/database';
import { correctAnswer, describeChallenge, startSession, submitAnswer, type Challenge, type PatternChallenge, type SequenceChallenge } from '@/engine';
import { contentTranslator, initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { dailyFor } from '@/services/dailyService';
import { initMonetization, purchase, restore } from '@/services/monetization';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { BOARD_SURFACE, CATEGORY_META, GLYPH_COLORS } from '@/theme/game';

/* ------------------------------------------------------------ design system */

describe('Logic Quest theme', () => {
  it.each(['light', 'dark'] as const)('meets WCAG AA contrast in %s mode', (scheme) => {
    const t = createTheme(brand, scheme);
    expect(contrastRatio(t.colors.text, t.colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t.colors.onPrimary, t.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.primary, t.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.accent, t.colors.surface)).toBeGreaterThanOrEqual(3);
  });

  it.each(['light', 'dark'] as const)('keeps every glyph and category color visible (≥ 3:1) in %s mode', (scheme) => {
    for (const color of Object.values(GLYPH_COLORS[scheme])) expect(contrastRatio(color, BOARD_SURFACE[scheme])).toBeGreaterThanOrEqual(3);
    for (const meta of Object.values(CATEGORY_META)) expect(contrastRatio(meta[scheme], createTheme(brand, scheme).colors.surfaceAlt)).toBeGreaterThanOrEqual(3);
  });
});

/* -------------------------------------------------------------- navigation */

describe('entry routing', () => {
  const routes = {
    _layout: () => (
      <ThemeProvider brand={brand} preference="light">
        <Slot />
      </ThemeProvider>
    ),
    index: Index,
    'onboarding/index': () => <Text>ONBOARDING</Text>,
    '(tabs)/index': () => <Text>HOME</Text>,
  };

  it('sends new players to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await routerScreen.findByText('ONBOARDING')).toBeTruthy();
  });

  it('sends onboarded players to the dashboard', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await routerScreen.findByText('HOME')).toBeTruthy();
  });
});

/* --------------------------------------------------------------- gameplay */

async function mount(c: Challenge, phase: 'answering' | 'correct' | 'failed' = 'answering', onSubmit = jest.fn(), lng = 'en') {
  const i18n = await initI18n(lng, []);
  const ct = contentTranslator(i18n, lng);
  const text = describeChallenge(c, ct);
  await render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider brand={brand} preference="light">
        <ChallengeView challenge={c} text={text} ct={ct} phase={phase} lastAnswer={null} relaxed={false} replayToken={0} onSubmit={onSubmit} />
      </ThemeProvider>
    </I18nextProvider>,
  );
  return { onSubmit, text };
}

describe('challenge view', () => {
  it('collects a keypad answer that the engine validates', async () => {
    const c = CHALLENGES.find((x): x is SequenceChallenge => x.category === 'sequence' && x.input === 'keypad' && x.answer > 0)!;
    const { onSubmit } = await mount(c);
    expect(screen.getByTestId('submit').props.accessibilityState).toMatchObject({ disabled: true });
    for (const digit of String(c.answer)) await fireEvent.press(screen.getByTestId(`key-${digit}`));
    await fireEvent.press(screen.getByTestId('submit'));
    const answer = onSubmit.mock.calls[0]![0];
    expect(answer).toEqual({ kind: 'number', value: c.answer });
    const s = startSession({ mode: 'standard', challengeIds: [c.id], timeLimitMs: null, maxAttempts: 2 }, 0);
    expect(submitAnswer(s, c, answer, 10).correct).toBe(true);
  });

  it('never displays the answer before submission, and shows it afterwards', async () => {
    const c = CHALLENGES.find((x): x is SequenceChallenge => x.category === 'sequence' && x.input === 'keypad' && x.answer > 1000)!;
    await mount(c, 'answering');
    expect(screen.queryByText(String(c.answer))).toBeNull();
    screen.unmount();
    await mount(c, 'failed');
    expect(screen.getByText(String(c.answer))).toBeTruthy();
  });

  it('lets the player pick a pattern option', async () => {
    const c = CHALLENGES.find((x): x is PatternChallenge => x.category === 'pattern')!;
    const { onSubmit } = await mount(c, 'answering', jest.fn(), 'fr');
    const right = correctAnswer(c) as { kind: 'option'; index: number };
    await fireEvent.press(screen.getByTestId(`option-${right.index}`));
    await fireEvent.press(screen.getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledWith(right);
  });

  it('renders logic puzzles with their clues in Spanish', async () => {
    const c = CHALLENGES.find((x) => x.category === 'deduction' && x.spec.type === 'grid')!;
    const { text } = await mount(c, 'answering', jest.fn(), 'es');
    expect(screen.getByText(text.prompt[0]!)).toBeTruthy();
    expect(text.prompt.join(' ')).toMatch(/[¿?]/);
  });

  it('starts a memory round only when the player is ready', async () => {
    const c = CHALLENGES.find((x) => x.category === 'memory' && x.spec.kind === 'number')!;
    await mount(c);
    expect(screen.getByTestId('memory-start')).toBeTruthy();
    expect(screen.queryByTestId('submit')).toBeNull();
  });
});

/* ------------------------------------------------------------ monetization */

function fakeProvider(store: { state: EntitlementState | null }): SubscriptionProvider {
  return {
    name: 'fake',
    isConfigured: true,
    initialize: async () => undefined,
    fetchEntitlement: async () => store.state,
    getPlans: async () => [
      { id: '$rc_monthly', period: 'monthly', priceString: '2,99 €', price: 2.99, currencyCode: 'EUR', hasFreeTrial: false },
      { id: '$rc_annual', period: 'annual', priceString: '14,99 €', price: 14.99, currencyCode: 'EUR', hasFreeTrial: true },
      { id: '$rc_lifetime', period: 'lifetime', priceString: '3,99 €', price: 3.99, currencyCode: 'EUR', hasFreeTrial: false },
    ],
    purchase: async (planId) => {
      const removeAds = planId === '$rc_lifetime';
      store.state = {
        isPremium: !removeAds || !!store.state?.isPremium,
        expiresAt: removeAds ? null : '2026-12-13T00:00:00Z',
        productId: planId,
        willRenew: !removeAds,
        verifiedAt: clock.now().toISOString(),
        source: 'store',
        activeEntitlements: removeAds ? ['no_ads'] : ['premium'],
      };
      return { status: 'success', state: store.state };
    },
    restore: async () => store.state,
    onChange: () => () => undefined,
  };
}

describe('monetization state', () => {
  beforeEach(() => {
    clock.set(() => new Date('2026-11-13T12:00:00Z'));
    useSession.setState({ entitlement: FREE_STATE, adsRemoved: false, plans: [], storeAvailable: false });
  });
  afterAll(() => clock.set(null));

  it('loads localized store prices and never grants premium without a purchase', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initMonetization(db, fakeProvider({ state: { ...FREE_STATE, verifiedAt: clock.now().toISOString(), source: 'store' } }));
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(useSession.getState().plans.map((p) => p.priceString)).toEqual(['2,99 €', '14,99 €', '3,99 €']);
  });

  it('buys premium, caches it offline, and expires it after the end date', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const store = { state: null as EntitlementState | null };
    await initMonetization(db, fakeProvider(store));
    expect((await purchase(db, '$rc_monthly')).status).toBe('success');
    expect(useSession.getState().entitlement.isPremium).toBe(true);

    useSession.setState({ entitlement: FREE_STATE });
    store.state = null; // offline restart
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'cache' });

    clock.set(() => new Date('2026-12-14T12:00:00Z'));
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(await restore(db)).toBeNull();
  });

  it('handles the one-time ad removal separately from Premium', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const store = { state: null as EntitlementState | null };
    await initMonetization(db, fakeProvider(store));
    await purchase(db, '$rc_lifetime');
    expect(useSession.getState()).toMatchObject({ adsRemoved: true });
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    useSession.setState({ adsRemoved: false });
    store.state = null; // offline: the non-consumable stays trusted
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().adsRemoved).toBe(true);
  });
});

/* ----------------------------------------------------------------- offline */

describe('offline-first guarantees', () => {
  it('app code never calls the network directly', () => {
    const roots = [path.join(__dirname, '..'), path.join(__dirname, '..', '..', 'app')];
    const offenders: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
        else if (/\.tsx?$/.test(e.name) && /\bfetch\(|XMLHttpRequest|axios|WebSocket/.test(fs.readFileSync(p, 'utf8'))) offenders.push(p);
      });
    roots.forEach(walk);
    expect(offenders).toEqual([]);
  });

  it('boots the database and generates the daily challenge with the network disabled', async () => {
    const original = global.fetch;
    const spy = jest.fn(() => Promise.reject(new Error('network disabled')));
    global.fetch = spy as unknown as typeof fetch;
    try {
      const r = await initDatabase(await createTestDatabase());
      expect(await r.content.count()).toBe(CHALLENGES.length);
      expect(dailyFor('2026-11-20').challenge.id).toBe('daily-2026-11-20');
      expect(spy).not.toHaveBeenCalled();
    } finally {
      global.fetch = original;
    }
  });
});
