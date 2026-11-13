import { ThemeProvider } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Slot } from 'expo-router';
import type { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';

import Index from '../../app/index';
import TransactionScreen from '../../app/transaction';
import { BalanceCard } from '@/components/finance';
import { brand } from '@/config/brand';
import { systemCategoryId } from '@/constants';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { DEFAULT_SETTINGS } from '@/database/repositories/core';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', ['en']);
});

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider brand={brand} preference="light">
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}

const layout = () => (
  <Providers>
    <Slot />
  </Providers>
);

describe('entry routing', () => {
  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter({ _layout: layout, index: Index, onboarding: () => <Text>ONBOARDING</Text>, '(tabs)/index': () => <Text>HOME</Text> }, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });

  it('sends onboarded users to the dashboard', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ settings: { ...DEFAULT_SETTINGS, mainCurrency: 'USD' } });
    await renderRouter({ _layout: layout, index: Index, onboarding: () => <Text>ONBOARDING</Text>, '(tabs)/index': () => <Text>HOME</Text> }, { initialUrl: '/' });
    expect(await screen.findByText('HOME')).toBeTruthy();
  });

  it('re-runs onboarding when the data (main currency) was deleted', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ settings: { ...DEFAULT_SETTINGS, mainCurrency: null } });
    await renderRouter({ _layout: layout, index: Index, onboarding: () => <Text>ONBOARDING</Text>, '(tabs)/index': () => <Text>HOME</Text> }, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });
});

describe('privacy mode', () => {
  const card = () => <BalanceCard totals={{ USD: 123456 }} mainCurrency="USD" income={5000} spending={2500} excluded={0} />;

  it('shows real amounts by default and masks them all when enabled', async () => {
    usePreferences.setState({ privacyMode: false });
    await renderRouter({ _layout: layout, index: card }, { initialUrl: '/' });
    expect(await screen.findByText('$1,234.56')).toBeTruthy();
    usePreferences.setState({ privacyMode: true });
    await waitFor(() => expect(screen.queryByText('$1,234.56')).toBeNull());
    expect(screen.getAllByText('•••••').length).toBe(3);
  });
});

describe('transaction form', () => {
  let r: Repositories;
  beforeEach(async () => {
    r = await initDatabase(await createTestDatabase());
    setRepositories(r);
    useSession.setState({ dbReady: true, dataVersion: 0, settings: { ...DEFAULT_SETTINGS, mainCurrency: 'USD' } });
    usePreferences.setState({ privacyMode: false });
  });

  // sql.js + router rendering can be slow on a busy CI machine: generous explicit waits.
  const WAIT = { timeout: 20_000 };

  it('records an expense with an exact amount and the account currency', async () => {
    await r.accounts.create({ name: 'Wallet', type: 'cash', currency: 'EUR', initialBalance: 0, color: '#000000', icon: 'cash-outline' });
    await renderRouter({ _layout: layout, transaction: TransactionScreen }, { initialUrl: '/transaction?type=expense' });
    await fireEvent.changeText(await screen.findByTestId('tx-amount', {}, WAIT), '12,30');
    await fireEvent.press(screen.getByTestId('tx-category'));
    await fireEvent.press(await screen.findByText('Food & Groceries', {}, WAIT));
    await waitFor(() => expect(screen.getByLabelText(/Food & Groceries/)).toBeTruthy(), WAIT); // selected in the field
    await fireEvent.press(screen.getByTestId('tx-save'));
    await waitFor(async () => expect(await r.transactions.count()).toBe(1), WAIT);
    const [tx] = await r.transactions.list();
    expect(tx).toMatchObject({ type: 'expense', amount: 1230, currency: 'EUR', categoryId: systemCategoryId('food') });
  }, 90_000);

  it('shows a validation error and saves nothing for an invalid amount', async () => {
    await r.accounts.create({ name: 'Wallet', type: 'cash', currency: 'USD', initialBalance: 0, color: '#000000', icon: 'cash-outline' });
    await renderRouter({ _layout: layout, transaction: TransactionScreen }, { initialUrl: '/transaction?type=expense' });
    await fireEvent.changeText(await screen.findByTestId('tx-amount', {}, WAIT), '1.234');
    await fireEvent.press(screen.getByTestId('tx-save'));
    expect(await screen.findByText('Too many decimals for this currency.', {}, WAIT)).toBeTruthy();
    expect(await r.transactions.count()).toBe(0);
  }, 90_000);
});
