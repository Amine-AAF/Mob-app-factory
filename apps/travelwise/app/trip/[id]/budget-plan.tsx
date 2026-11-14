import { Button, EmptyState, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TextField } from '@/components/TextField';
import { BUDGET_CATEGORIES, type BudgetCategory } from '@/constants/domain';
import { repos } from '@/database';
import type { TripDetails } from '@/database/repositories/trips';
import { saveBudget } from '@/features/expenses/actions';
import { updateTrip } from '@/features/trips/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { fromMinor, parseAmount } from '@/utils/money';

function PlanForm({ trip, planned }: { trip: TripDetails; planned: Partial<Record<BudgetCategory, number>> }) {
  const { t } = useTranslation();
  const cur = trip.currency;
  const [total, setTotal] = useState(trip.budgetMinor != null ? String(fromMinor(trip.budgetMinor, cur)) : '');
  const [lines, setLines] = useState<Record<string, string>>(Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, planned[c] != null ? String(fromMinor(planned[c]!, cur)) : ''])));
  const [error, setError] = useState<string | null>(null);

  const parsed = Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, lines[c]?.trim() ? parseAmount(lines[c]!, cur) : null])) as Record<BudgetCategory, number | null>;
  const sum = Object.values(parsed).reduce<number>((s, v) => s + (v ?? 0), 0);
  const totalMinor = total.trim() ? parseAmount(total, cur) : null;

  const save = async () => {
    setError(null);
    if ((total.trim() && totalMinor === null) || BUDGET_CATEGORIES.some((c) => lines[c]?.trim() && parsed[c] === null)) return setError(t('expenses.errors.invalid_amount'));
    try {
      await saveBudget(trip.id, parsed);
      if (totalMinor !== trip.budgetMinor) {
        await updateTrip(trip.id, {
          ...trip,
          budgetMinor: totalMinor,
          destinations: trip.destinations,
          participants: trip.participants,
        });
      }
      router.back();
    } catch (e) {
      recordError(e, 'budget_plan');
      setError(t('tripForm.errors.generic'));
    }
  };

  return (
    <Stack gap={4}>
      <Text variant="bodySmall" tone="muted">
        {t('budget.planHint', { currency: cur })}
      </Text>
      <TextField label={t('budget.total')} keyboardType="decimal-pad" value={total} onChangeText={setTotal} testID="budget-total-input" />
      {BUDGET_CATEGORIES.map((c) => (
        <TextField key={c} label={t(`enums.budgetCategory.${c}`)} keyboardType="decimal-pad" value={lines[c] ?? ''} onChangeText={(v) => setLines({ ...lines, [c]: v })} optional optionalLabel={t('common.optional')} testID={`budget-input-${c}`} />
      ))}
      <Text variant="bodySmall" tone={totalMinor !== null && sum > totalMinor ? 'warning' : 'muted'}>
        {t('budget.categoriesSum', { amount: fmt.money(sum, cur) })}
      </Text>
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button label={t('common.save')} size="lg" onPress={save} testID="budget-save" />
    </Stack>
  );
}

export default function BudgetPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => ({ trip: await repos().trips.get(id), planned: await repos().expenses.getBudget(id) }), [id]);
  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ headerShown: true, title: t('budget.plan') }} />
      {data && !data.trip ? <EmptyState icon="alert-circle-outline" title={t('tripDetail.notFound')} /> : null}
      {data?.trip ? <PlanForm trip={data.trip} planned={data.planned} /> : null}
    </Screen>
  );
}
