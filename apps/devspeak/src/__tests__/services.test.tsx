import { ThemeProvider } from '@factory/design-system';
import { FREE_STATE, type EntitlementState, type SubscriptionProvider } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'fs';
import { I18nextProvider } from 'react-i18next';
import path from 'path';

import { QuizRunner } from '@/components/QuizRunner';
import { brand } from '@/config/brand';
import { lessons } from '@/content';
import { initDatabase } from '@/database';
import { initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { initMonetization, purchase, restore } from '@/services/monetization';
import { useSession } from '@/store/session';

function fakeProvider(store: { state: EntitlementState | null }): SubscriptionProvider {
  return {
    name: 'fake',
    isConfigured: true,
    initialize: async () => undefined,
    fetchEntitlement: async () => store.state,
    getPlans: async () => [{ id: '$rc_monthly', period: 'monthly', priceString: '3,99 €', price: 3.99, currencyCode: 'EUR', hasFreeTrial: false }],
    purchase: async () => {
      store.state = { isPremium: true, expiresAt: '2026-07-01T00:00:00Z', productId: 'm', willRenew: true, verifiedAt: clock.now().toISOString(), source: 'store' };
      return { status: 'success', state: store.state };
    },
    restore: async () => store.state,
    onChange: () => () => undefined,
  };
}

describe('subscription state', () => {
  beforeEach(() => {
    clock.set(() => new Date('2026-06-01T12:00:00Z'));
    useSession.setState({ entitlement: FREE_STATE, plans: [], storeAvailable: false });
  });
  afterAll(() => clock.set(null));

  it('starts free, purchases premium and caches it for offline use', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const store = { state: { ...FREE_STATE, verifiedAt: clock.now().toISOString(), source: 'store' as const } as EntitlementState | null };
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().entitlement.isPremium).toBe(false);
    expect(useSession.getState().plans[0]?.priceString).toBe('3,99 €'); // localized store price, never hard-coded

    const outcome = await purchase(db, '$rc_monthly');
    expect(outcome.status).toBe('success');
    expect(useSession.getState().entitlement.isPremium).toBe(true);

    // Simulate a restart while offline: the store is unreachable.
    useSession.setState({ entitlement: FREE_STATE });
    store.state = null;
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().entitlement).toMatchObject({ isPremium: true, source: 'cache' });

    // Restore with no store answer keeps the current state.
    expect(await restore(db)).toBeNull();
  });

  it('expires a cached subscription after its end date', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const store = { state: null as EntitlementState | null };
    await initMonetization(db, fakeProvider(store));
    await purchase(db, '$rc_monthly');
    clock.set(() => new Date('2026-07-02T12:00:00Z'));
    store.state = null;
    await initMonetization(db, fakeProvider(store));
    expect(useSession.getState().entitlement.isPremium).toBe(false);
  });
});

describe('offline-first guarantees', () => {
  it('app code never calls the network directly', () => {
    const roots = [path.join(__dirname, '..'), path.join(__dirname, '..', '..', 'app')];
    const offenders: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
        else if (/\.tsx?$/.test(e.name) && /\bfetch\(|XMLHttpRequest|axios/.test(fs.readFileSync(p, 'utf8'))) offenders.push(p);
      });
    roots.forEach(walk);
    expect(offenders).toEqual([]);
  });

  it('initialises the full database without any network access', async () => {
    const original = global.fetch;
    const spy = jest.fn(() => Promise.reject(new Error('network disabled')));
    global.fetch = spy as unknown as typeof fetch;
    try {
      const r = await initDatabase(await createTestDatabase());
      expect((await r.content.getLesson('te-06'))?.vocabulary.length).toBeGreaterThan(0);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      global.fetch = original;
    }
  });
});

describe('QuizRunner component', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('lets the learner answer, shows feedback and reports the score', async () => {
    const i18n = await initI18n('en', []);
    const quiz = lessons[0]!.quiz;
    const onFinish = jest.fn();
    await render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider brand={brand} preference="light">
          <QuizRunner questions={quiz} onFinish={onFinish} />
        </ThemeProvider>
      </I18nextProvider>,
    );
    for (const q of quiz) {
      expect(screen.getByTestId('quiz-check').props.accessibilityState).toMatchObject({ disabled: true });
      await fireEvent.press(screen.getByTestId(`option-${q.correctIndex}`));
      await fireEvent.press(screen.getByTestId('quiz-check'));
      expect(screen.getByText('Correct!')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('quiz-next'));
    }
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ correct: quiz.length, total: quiz.length }));
  });

  it('shows the correct answer after a wrong choice', async () => {
    const i18n = await initI18n('fr', []);
    const q = lessons[0]!.quiz[0]!;
    const wrong = (q.correctIndex + 1) % q.options.length;
    await render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider brand={brand} preference="dark">
          <QuizRunner questions={[q]} onFinish={() => undefined} />
        </ThemeProvider>
      </I18nextProvider>,
    );
    await fireEvent.press(screen.getByTestId(`option-${wrong}`));
    await fireEvent.press(screen.getByTestId('quiz-check'));
    expect(screen.getByText(i18n.t('quiz.incorrect'))).toBeTruthy();
  });
});
