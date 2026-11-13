import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Divider, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { View } from 'react-native';

import { PremiumGate } from '@/components/cards';
import { Bar, Field, Note } from '@/components/ui';
import { repos } from '@/database';
import { compareBudget, formatMoney, monthlyHistory, parseAmount, weekSpent } from '@/domain/budget';
import { weekStart } from '@/domain/planner';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

/** Weekly food budget vs. amounts actually spent (entered by the user). */
export default function Budget() {
  const { t, lng, currency } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const today = clock.today();
  const start = weekStart(today, firstDay);
  const [budgetInput, setBudgetInput] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data } = useAsync(async () => {
    const budget = await repos().preferences.get<number | null>('weeklyBudget', null);
    const expenses = await repos().budget.expenses(addDays(today, -200), addDays(today, 7));
    return { budget, expenses };
  }, [today]);

  const spent = data ? weekSpent(data.expenses, start) : 0;
  const cmp = compareBudget(data?.budget ?? null, spent);
  const money = (n: number) => formatMoney(n, currency, lng);
  const history = data ? monthlyHistory(data.expenses, today, 6) : [];
  const maxMonth = Math.max(1, ...history.map((h) => h.total));
  const color = cmp.status === 'over' ? theme.colors.danger : cmp.status === 'near' ? theme.colors.warning : theme.colors.success;

  const saveBudget = async () => {
    const value = budgetInput?.trim() ? parseAmount(budgetInput) : null;
    await repos().preferences.set('weeklyBudget', value);
    setBudgetInput(null);
    dataChanged();
  };

  const addExpense = async () => {
    const value = parseAmount(amount);
    if (value === null || value <= 0) return;
    await repos().budget.addExpense(today, value, note);
    setAmount('');
    setNote('');
    dataChanged();
  };

  return (
    <Screen edges={[]}>
      <Card>
        <Text variant="label" tone="muted">
          {t('budget.thisWeek')}
        </Text>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text variant="title">{money(spent)}</Text>
          <Text variant="bodySmall" tone="muted">
            {data?.budget ? t('budget.ofBudget', { budget: money(data.budget) }) : t('budget.noBudget')}
          </Text>
        </Row>
        {cmp.ratio !== null ? <Bar ratio={cmp.ratio} color={color} height={12} /> : null}
        {cmp.remaining !== null ? (
          <Text variant="bodySmall" style={{ color }}>
            {cmp.remaining >= 0 ? t('budget.remaining', { amount: money(cmp.remaining) }) : t('budget.over', { amount: money(-cmp.remaining) })}
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text variant="subheading">{t('budget.weeklyBudget')}</Text>
        <Row gap={2}>
          <Field value={budgetInput ?? (data?.budget ? String(data.budget) : '')} onChangeText={setBudgetInput} keyboardType="decimal-pad" placeholder={t('budget.budgetPlaceholder', { currency })} style={{ flex: 1 }} testID="budget-input" />
          <Button label={t('common.save')} size="md" onPress={saveBudget} disabled={budgetInput === null} />
        </Row>
      </Card>

      <Card>
        <Text variant="subheading">{t('budget.addExpense')}</Text>
        <Row gap={2}>
          <Field value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={t('budget.amount', { currency })} style={{ width: 120 }} testID="expense-amount" />
          <Field value={note} onChangeText={setNote} placeholder={t('budget.notePlaceholder')} style={{ flex: 1 }} maxLength={60} />
        </Row>
        <Button label={t('budget.add')} size="md" icon="add" onPress={addExpense} disabled={!parseAmount(amount)} testID="expense-add" />
        <Text variant="caption" tone="subtle">
          {t('budget.listHint')}
        </Text>
      </Card>

      <SectionHeader title={t('budget.recent')} />
      <Card>
        {data?.expenses.length ? (
          data.expenses.slice(0, 15).map((e, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider /> : null}
              <Row gap={2} style={{ minHeight: 44 }}>
                <View style={{ flex: 1 }}>
                  <Text>{e.note ?? (e.listId ? t('budget.fromList') : t('budget.expense'))}</Text>
                  <Text variant="caption" tone="muted">
                    {fmt.date(fromDayKey(e.day))}
                  </Text>
                </View>
                <Text variant="subheading">{money(e.amount)}</Text>
                <IconButton
                  icon="trash-outline"
                  size={18}
                  label={t('common.delete')}
                  onPress={async () => {
                    await repos().budget.removeExpense(e.id);
                    dataChanged();
                  }}
                />
              </Row>
            </View>
          ))
        ) : (
          <Text tone="muted">{t('budget.noExpenses')}</Text>
        )}
      </Card>

      <SectionHeader title={t('budget.monthly')} />
      {isPremium ? (
        <Card>
          <Stack gap={2}>
            {history.map((h) => (
              <Row key={h.month} gap={2}>
                <Text variant="caption" tone="muted" style={{ width: 72, textTransform: 'capitalize' }}>
                  {fmt.date(fromDayKey(`${h.month}-01`), { month: 'short', year: '2-digit' })}
                </Text>
                <View style={{ flex: 1 }}>
                  <Bar ratio={h.total / maxMonth} color={theme.colors.primary} />
                </View>
                <Text variant="caption" style={{ width: 86, textAlign: 'right' }}>
                  {money(h.total)}
                </Text>
              </Row>
            ))}
          </Stack>
        </Card>
      ) : (
        <PremiumGate title={t('premium.budgetTitle')} message={t('premium.budgetBody')} source="budget_history" />
      )}
      <Note>{t('budget.disclaimer')}</Note>
    </Screen>
  );
}
