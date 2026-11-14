import { Button, Card, IconButton, Row, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { IconBubble } from '@/components/finance';
import { AmountInput, CurrencySelector, SelectField } from '@/components/inputs';
import { FREE_LIMITS } from '@/constants';
import type { Repositories } from '@/database';
import type { Category } from '@/types';
import { ValidationError } from '@/features/transactions/validation';
import { mutate, useCategoryName, useData } from '@/hooks';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { canAdd } from '@/services/premium';
import { useIsPremium, useMainCurrency } from '@/store/session';
import { MONTH_KEY, monthOf } from '@/utils/dates';
import { minorToInput, parseAmount } from '@/utils/money';

interface LimitRow {
  categoryId: string;
  value: string;
}

interface BudgetFormData {
  existing: Awaited<ReturnType<Repositories['budgets']['getByMonth']>>;
  categories: Category[];
}

export default function BudgetEdit() {
  const params = useLocalSearchParams<{ month?: string }>();
  const month = params.month && MONTH_KEY.test(params.month) ? params.month : monthOf(clock.today());
  const { data } = useData<BudgetFormData>(async (r) => ({ existing: await r.budgets.getByMonth(month), categories: await r.categories.list({ kind: 'expense' }) }), [month]);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  return <BudgetForm key={month} month={month} data={data} />;
}

function BudgetForm({ month, data }: { month: string; data: BudgetFormData }) {
  const { t } = useTranslation();
  const catName = useCategoryName();
  const main = useMainCurrency();
  const isPremium = useIsPremium();
  const b = data.existing;
  const [currency, setCurrency] = useState(b?.budget.currency ?? main);
  const [total, setTotal] = useState(() => (b && b.budget.totalLimit !== null ? minorToInput(b.budget.totalLimit, b.budget.currency) : ''));
  const [rows, setRows] = useState<LimitRow[]>(() => (b ? b.limits.map((l) => ({ categoryId: l.categoryId, value: minorToInput(l.limit, b.budget.currency) })) : []));
  const [picker, setPicker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = new Map(data.categories.map((c) => [c.id, c]));
  const available = (data?.categories ?? []).filter((c) => !rows.some((r) => r.categoryId === c.id));

  function addRow(categoryId: string) {
    if (!canAdd('categoryBudgets', rows.length, isPremium)) {
      router.push('/paywall?source=budgets');
      return;
    }
    setRows([...rows, { categoryId, value: '' }]);
    setPicker(null);
  }

  async function save() {
    setError(null);
    let totalLimit: number | null = null;
    if (total.trim()) {
      const p = parseAmount(total, currency);
      if (!p.ok) return setError(t(`errors.${p.error}`));
      totalLimit = p.minor;
    }
    const limits: { categoryId: string; limit: number }[] = [];
    for (const row of rows) {
      const p = parseAmount(row.value, currency);
      if (!p.ok) return setError(`${catName(categories.get(row.categoryId))}: ${t(`errors.${p.error}`)}`);
      limits.push({ categoryId: row.categoryId, limit: p.minor });
    }
    if (totalLimit === null && limits.length === 0) return setError(t('errors.amount'));
    try {
      const isNew = !data?.existing;
      await mutate((r) => r.budgets.save(month, { currency, totalLimit, limits }));
      if (isNew) track('budget_created', { copied: false });
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'budget_save');
        setError(t('common.error'));
      }
    }
  }

  function remove() {
    Alert.alert(t('budgets.delete'), t('budgets.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => mutate((r) => r.budgets.remove(month)).then(() => router.back()) },
    ]);
  }

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="budget-save" />}>
      <RouterStack.Screen options={{ title: data?.existing ? t('budgets.edit') : t('budgets.create') }} />
      <Text variant="subheading">{month}</Text>
      <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} />
      <AmountInput label={`${t('budgets.totalLimit')} · ${t('common.optional')}`} value={total} onChange={setTotal} currency={currency} testID="budget-total" />
      <Text variant="caption" tone="muted">
        {t('budgets.totalLimitHint')}
      </Text>

      <Text variant="heading">{t('budgets.byCategory')}</Text>
      {rows.map((row, i) => {
        const c = categories.get(row.categoryId);
        return (
          <Card key={row.categoryId}>
            <Row gap={3}>
              {c ? <IconBubble icon={c.icon} color={c.color} size={34} /> : null}
              <Text style={{ flex: 1 }}>{catName(c)}</Text>
              <IconButton icon="close" label={t('common.delete')} onPress={() => setRows(rows.filter((_, j) => j !== i))} />
            </Row>
            <AmountInput label={t('budgets.limit')} value={row.value} onChange={(v) => setRows(rows.map((r, j) => (j === i ? { ...r, value: v } : r)))} currency={currency} />
          </Card>
        );
      })}
      {available.length ? (
        <SelectField
          label={t('budgets.addCategory')}
          value={picker}
          searchable
          options={available.map((c) => ({ value: c.id, label: catName(c), icon: c.icon as never, color: c.color }))}
          onChange={addRow}
          placeholder={t('budgets.addCategory')}
          testID="budget-add-category"
        />
      ) : null}
      {!isPremium ? (
        <Text variant="caption" tone="muted">
          {t('budgets.freeLimit', { count: FREE_LIMITS.categoryBudgets })}
        </Text>
      ) : null}
      {error ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {data?.existing ? (
        <View>
          <Button label={t('budgets.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} />
        </View>
      ) : null}
    </Screen>
  );
}
