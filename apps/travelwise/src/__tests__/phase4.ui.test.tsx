import { ThemeProvider } from '@factory/design-system';
import { render, screen } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { BudgetOverview } from '@/components/BudgetOverview';
import { ExpenseCard } from '@/components/ExpenseCard';
import { brand } from '@/config/brand';
import type { ExpenseWithShares } from '@/database/repositories/expenses';
import { budgetOverview } from '@/features/budget/insights';
import { initI18n } from '@/i18n';

let i18n: I18n;
async function wrap(node: ReactNode, scheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider brand={brand} preference={scheme}>
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </ThemeProvider>,
  );
}

const expense: ExpenseWithShares = {
  id: 'e1',
  tripId: 't',
  amountMinor: 15000,
  currency: 'MAD',
  tripAmountMinor: 1382,
  rateToTrip: 0.0921,
  category: 'shopping',
  date: '2026-07-31',
  description: 'Market',
  city: 'Marrakesh',
  paymentMethod: 'Cash',
  notes: '',
  paidByParticipantId: 'p1',
  splitMode: 'equal',
  shares: [
    { expenseId: 'e1', participantId: 'p1', shareMinor: 7500 },
    { expenseId: 'e1', participantId: 'p2', shareMinor: 7500 },
  ],
  createdAt: '',
  updatedAt: '',
};

beforeAll(async () => {
  i18n = await initI18n('en', []);
  (await wrap(<ExpenseCard expense={expense} tripCurrency="EUR" onPress={() => undefined} />)).unmount();
}, 180_000);

describe('ExpenseCard', () => {
  it.each(['light', 'dark'] as const)('shows the original amount and its trip-currency equivalent (%s)', async (scheme) => {
    await wrap(<ExpenseCard expense={expense} tripCurrency="EUR" payerName="Ana" onPress={() => undefined} />, scheme);
    expect(screen.getByText('Market')).toBeTruthy();
    expect(screen.getByText(/MAD\s?150\.00/)).toBeTruthy();
    expect(screen.getByText('≈ €13.82')).toBeTruthy();
    expect(screen.getByText(/paid by Ana/)).toBeTruthy();
    expect(screen.getByText('Shared by 2')).toBeTruthy();
  });
});

describe('BudgetOverview', () => {
  it('shows remaining budget and per-category lines', async () => {
    const o = budgetOverview([{ category: 'food', tripAmountMinor: 6000 }], { food: 5000 }, 20000);
    await wrap(<BudgetOverview overview={o} currency="EUR" />);
    expect(screen.getByText('€60.00')).toBeTruthy();
    expect(screen.getByText('€140.00 left')).toBeTruthy();
    expect(screen.getByText('€60.00 / €50.00')).toBeTruthy();
  });

  it('shows the overspend and explains when no budget is planned', async () => {
    await wrap(<BudgetOverview overview={budgetOverview([{ category: 'food', tripAmountMinor: 6000 }], {}, 5000)} currency="EUR" />);
    expect(screen.getByText('€10.00 over budget')).toBeTruthy();
    await wrap(<BudgetOverview overview={budgetOverview([], {}, null)} currency="EUR" />);
    expect(screen.getByText('No budget planned yet. Set one to follow what is left.')).toBeTruthy();
  });
});
