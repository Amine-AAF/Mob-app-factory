import { Button, Card, Chip, EmptyState, Row, SectionHeader, Stack, Text } from '@factory/design-system';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BudgetOverview } from '@/components/BudgetOverview';
import { ExpenseCard } from '@/components/ExpenseCard';
import { TextField } from '@/components/TextField';
import { TripScaffold } from '@/components/TripScaffold';
import { BUDGET_CATEGORIES, type BudgetCategory } from '@/constants/domain';
import { repos } from '@/database';
import type { ExpenseSort } from '@/database/repositories/expenses';
import { budgetInsights, budgetOverview } from '@/features/budget/insights';
import { computeBalances, suggestSettlements } from '@/features/shared-expenses/split';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/utils/clock';
import { exportTripCsv } from '@/features/export/actions';
import { usePremiumGate } from '@/features/premium/usePremiumGate';

const SORTS: ExpenseSort[] = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];

/** Trip budget: plan vs spent, insights from real expenses, shared balances, filtered history. */
export default function TripBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isPremium, openPaywall } = usePremiumGate();
  const [exporting, setExporting] = useState(false);
  // No ad is shown during an export.
  const exportCsv = () => {
    if (!isPremium) return openPaywall('csv_export');
    setExporting(true);
    exportTripCsv(id, t)
      .then((res) => {
        if (res === 'unavailable') Alert.alert(t('export.unavailable'));
        if (res === 'failed') Alert.alert(t('export.failed'));
      })
      .finally(() => setExporting(false));
  };
  const [category, setCategory] = useState<BudgetCategory | null>(null);
  const [sort, setSort] = useState<ExpenseSort>('date_desc');
  const [search, setSearch] = useState('');

  const { data } = useAsync(async () => {
    const r = repos();
    const [all, planned, dayBudgets] = await Promise.all([r.expenses.list(id), r.expenses.getBudget(id), r.expenses.dayBudgets(id)]);
    return { all, planned, dayBudgets };
  }, [id]);
  const { data: filtered } = useAsync(() => repos().expenses.list(id, { category, sort, search }), [id, category, sort, search]);

  const openExpense = (expenseId?: string) => router.push({ pathname: '/trip/[id]/expense', params: expenseId ? { id, expenseId } : { id } });

  return (
    <TripScaffold tripId={id} section="budget">
      {({ trip }) => {
        if (!data) return null;
        const overview = budgetOverview(data.all, data.planned, trip.budgetMinor);
        const insights = budgetInsights(data.all, trip, overview.remainingMinor, clock.today(), data.dayBudgets);
        const people = trip.participants;
        const nameOf = (pid: string | null) => people.find((p) => p.id === pid)?.name;
        const shared = data.all.filter((e) => e.shares.length);
        const balances = computeBalances(
          people.map((p) => p.id),
          shared.map((e) => ({ tripAmountMinor: e.tripAmountMinor, amountMinor: e.amountMinor, paidBy: e.paidByParticipantId, shares: new Map(e.shares.map((s) => [s.participantId, s.shareMinor])) })),
        );
        const transfers = suggestSettlements(balances);
        const money = (m: number) => fmt.money(m, trip.currency);

        return (
          <Stack gap={3}>
            <Row gap={2} wrap>
              <Button label={t('expenses.add')} icon="add" onPress={() => openExpense()} testID="expense-add" />
              <Button label={t('budget.plan')} variant="secondary" icon="calculator-outline" onPress={() => router.push({ pathname: '/trip/[id]/budget-plan', params: { id } })} testID="budget-plan" />
              <Button label={t('converter.open')} variant="ghost" icon="swap-horizontal-outline" onPress={() => router.push({ pathname: '/converter', params: { tripId: id } })} />
              {data.all.length ? (
                <Button label={isPremium ? t('export.csv.button') : t('export.csvPremium')} variant="ghost" icon="grid-outline" loading={exporting} onPress={exportCsv} testID="expense-export-csv" />
              ) : null}
            </Row>

            <BudgetOverview overview={overview} currency={trip.currency} />

            <SectionHeader title={t('insights.title')} />
            {data.all.length === 0 ? (
              <Text variant="bodySmall" tone="subtle">
                {t('insights.empty')}
              </Text>
            ) : (
              <Card testID="budget-insights">
                {insights.biggestCategory ? (
                  <Text variant="bodySmall">
                    {t('insights.biggest', { category: t(`enums.budgetCategory.${insights.biggestCategory.category}`), percent: fmt.percent(insights.biggestCategory.share) })}
                  </Text>
                ) : null}
                {insights.averageDailyMinor !== null ? <Text variant="bodySmall">{t('insights.average', { amount: money(insights.averageDailyMinor), count: insights.daysCounted ?? 0 })}</Text> : null}
                {overview.remainingMinor !== null ? <Text variant="bodySmall">{t('insights.remaining', { amount: money(overview.remainingMinor) })}</Text> : null}
                {/* Detailed insights (daily allowance, spending by day) are part of Premium. */}
                {!isPremium ? (
                  <Button label={t('budget.detailedPremium')} variant="ghost" icon="lock-closed-outline" onPress={() => openPaywall('detailed_budget')} testID="budget-detailed-locked" />
                ) : null}
                {isPremium && insights.dailyAllowanceMinor !== null ? <Text variant="bodySmall">{t('insights.allowance', { amount: money(insights.dailyAllowanceMinor) })}</Text> : null}
                {isPremium && insights.byDay.some((d) => d.spentMinor > 0 || d.plannedMinor !== null) ? (
                  <Stack gap={1}>
                    <Text variant="label">{t('insights.byDay')}</Text>
                    {insights.byDay
                      .filter((d) => d.spentMinor > 0 || d.plannedMinor !== null)
                      .map((d) => (
                        <Row key={d.date} style={{ justifyContent: 'space-between' }}>
                          <Text variant="caption">{fmt.date(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                          <Text variant="caption" tone={d.plannedMinor !== null && d.spentMinor > d.plannedMinor ? 'danger' : 'default'}>
                            {d.plannedMinor !== null ? `${money(d.spentMinor)} / ${money(d.plannedMinor)}` : money(d.spentMinor)}
                          </Text>
                        </Row>
                      ))}
                  </Stack>
                ) : null}
              </Card>
            )}

            {people.length >= 2 ? (
              <>
                <SectionHeader title={t('shared.title')} />
                <Card testID="shared-balances">
                  {shared.length === 0 ? (
                    <Text variant="bodySmall" tone="subtle">
                      {t('shared.empty')}
                    </Text>
                  ) : (
                    <>
                      {people.map((p) => {
                        const b = balances.get(p.id) ?? 0;
                        return (
                          <Row key={p.id} style={{ justifyContent: 'space-between' }}>
                            <Text variant="bodySmall">{p.name}</Text>
                            <Text variant="bodySmall" tone={b > 0 ? 'success' : b < 0 ? 'danger' : 'muted'} style={{ fontWeight: '700' }}>
                              {b > 0 ? t('shared.getsBack', { amount: money(b) }) : b < 0 ? t('shared.owes', { amount: money(-b) }) : t('shared.settled')}
                            </Text>
                          </Row>
                        );
                      })}
                      {transfers.length ? <Text variant="label">{t('shared.suggested')}</Text> : null}
                      {transfers.map((tr) => (
                        <Text key={`${tr.from}-${tr.to}`} variant="bodySmall" testID="settlement">
                          {t('shared.transfer', { from: nameOf(tr.from), to: nameOf(tr.to), amount: money(tr.amountMinor) })}
                        </Text>
                      ))}
                      <Text variant="caption" tone="subtle">
                        {t('shared.noPayment')}
                      </Text>
                    </>
                  )}
                </Card>
              </>
            ) : null}

            <SectionHeader title={t('expenses.title')} />
            <TextField label={t('expenses.search')} value={search} onChangeText={setSearch} />
            <Row gap={2} wrap>
              <Chip label={t('expenses.allCategories')} selected={category === null} onPress={() => setCategory(null)} />
              {BUDGET_CATEGORIES.map((c) => (
                <Chip key={c} label={t(`enums.budgetCategory.${c}`)} selected={category === c} onPress={() => setCategory(c)} testID={`expense-filter-${c}`} />
              ))}
            </Row>
            <Row gap={2} wrap>
              {SORTS.map((s) => (
                <Chip key={s} label={t(`expenses.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} icon="swap-vertical-outline" />
              ))}
            </Row>
            {data.all.length === 0 ? <EmptyState icon="receipt-outline" title={t('expenses.emptyTitle')} message={t('expenses.emptyMessage')} /> : null}
            {data.all.length > 0 && filtered && filtered.length === 0 ? (
              <Text variant="bodySmall" tone="subtle">
                {t('expenses.noMatch')}
              </Text>
            ) : null}
            <Stack gap={2}>
              {(filtered ?? []).map((e) => (
                <ExpenseCard key={e.id} expense={e} tripCurrency={trip.currency} payerName={nameOf(e.paidByParticipantId)} onPress={() => openExpense(e.id)} />
              ))}
            </Stack>
          </Stack>
        );
      }}
    </TripScaffold>
  );
}
