import { Badge, Button, Card, Chip, ListRow, ProgressBar, Row, Screen, SectionHeader, Stat, Text } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { BarChart } from '@/components/charts';
import { TextField } from '@/components/fields';
import { PetFilter } from '@/components/pet';
import { budgetState, byCategory, inMonth, inYear, monthlySeries, totalsByCurrency } from '@/domain/expenses';
import { parseDecimal } from '@/domain/units';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { exportExpensesCsv } from '@/services/exports';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Expense statistics. Monthly total is free; yearly chart, category breakdown,
 * budget and CSV export are Premium. Currencies are never converted.
 */
export default function Expenses() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { currency, monthlyBudget, set } = usePreferences();
  const [petId, setPetId] = useState<string | null>(null);
  const [year, setYear] = useState(clock.now().getFullYear());
  const [budgetInput, setBudgetInput] = useState(monthlyBudget != null ? String(monthlyBudget) : '');
  const today = clock.today();
  const { data } = useData(async (r) => ({ expenses: petId ? await r.expenses.forPet(petId) : await r.expenses.all(), pets: await r.pets.listAll() }), [petId]);
  const expenses = data?.expenses ?? [];
  const month = totalsByCurrency(inMonth(expenses, today));
  const yearTotals = totalsByCurrency(inYear(expenses, year));
  const mainCurrency = yearTotals[0]?.currency ?? currency;
  const spentThisMonth = inMonth(expenses, today).filter((e) => e.currency === currency).reduce((s, e) => s + e.amount, 0);
  const budget = budgetState(spentThisMonth, monthlyBudget);

  const premiumGate = (source: string) => router.push(`/paywall?source=${source}`);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('expenses.stats') }} />
      <PetFilter pets={(data?.pets ?? []).filter((p) => !p.archived)} value={petId} onChange={setPetId} />
      <Row gap={3}>
        <Stat icon="calendar-outline" value={month[0] ? fmt.money(month[0].total, month[0].currency) : fmt.money(0, currency)} label={t('expenses.thisMonth')} />
        <Stat icon="stats-chart-outline" tone="accent" value={yearTotals[0] ? fmt.money(yearTotals[0].total, yearTotals[0].currency) : fmt.money(0, currency)} label={t('expenses.thisYear', { year })} />
      </Row>
      {month.length > 1 || yearTotals.length > 1 ? (
        <Text variant="caption" tone="subtle">
          {t('expenses.multiCurrency')}
        </Text>
      ) : null}

      {isPremium ? (
        <>
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Chip label="‹" selected={false} onPress={() => setYear(year - 1)} />
              <Text variant="subheading">{t('expenses.monthly', { year, currency: mainCurrency })}</Text>
              <Chip label="›" selected={false} onPress={() => setYear(year + 1)} />
            </Row>
            <BarChart values={monthlySeries(expenses, year, mainCurrency)} labels={Array.from({ length: 12 }, (_, i) => fmt.monthShort(i))} formatValue={(v) => fmt.number(v, 0)} accessibilityLabel={t('expenses.monthly', { year, currency: mainCurrency })} />
          </Card>
          <Card>
            <SectionHeader title={t('expenses.byCategory', { year })} />
            {byCategory(inYear(expenses, year), mainCurrency).map((c) => (
              <ListRow key={c.category} title={t(`options.expenseCategory.${c.category}`)} right={<Badge label={fmt.money(c.total, mainCurrency)} tone="neutral" />} />
            ))}
          </Card>
          <Card>
            <SectionHeader title={t('expenses.budget')} />
            <TextField label={t('expenses.monthlyBudget', { currency })} value={budgetInput} onChange={setBudgetInput} keyboardType="decimal-pad" maxLength={10} />
            <Button label={t('common.save')} size="md" variant="secondary" onPress={() => set({ monthlyBudget: parseDecimal(budgetInput) || null })} />
            {budget ? (
              <>
                <ProgressBar progress={Math.min(1, budget.ratio)} tone={budget.level === 'ok' ? 'success' : 'accent'} label={t('expenses.budget')} />
                <Text variant="bodySmall" tone={budget.level === 'over' ? 'danger' : budget.level === 'warning' ? 'warning' : 'muted'}>
                  {t(`expenses.budgetLevel.${budget.level}`, { spent: fmt.money(budget.spent, currency), budget: fmt.money(budget.budget, currency) })}
                </Text>
              </>
            ) : null}
          </Card>
          <Button
            label={t('exports.expensesCsv')}
            icon="download-outline"
            variant="secondary"
            onPress={() => exportExpensesCsv(t).catch(() => Alert.alert(t('errors.exportTitle'), t('errors.exportBody')))}
          />
        </>
      ) : (
        <Card tone="primary" onPress={() => premiumGate('expense_stats')}>
          <Text variant="subheading">{t('premium.statsTitle')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('premium.statsBody')}
          </Text>
        </Card>
      )}
      <Button label={t('records.expense.new')} icon="add" onPress={() => router.push(`/record/expense${petId ? `?petId=${petId}` : ''}`)} />
      <Button label={t('lists.expense')} variant="ghost" onPress={() => router.push(`/list/expense${petId ? `?petId=${petId}` : ''}`)} />
    </Screen>
  );
}
