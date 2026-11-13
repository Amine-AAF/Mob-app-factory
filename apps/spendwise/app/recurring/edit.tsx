import { Button, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { AmountInput, ChoiceChips, DateField, FormField, Segmented, SelectField, SwitchRow } from '@/components/inputs';
import { mutate, useCategoryName, useData } from '@/hooks';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { ValidationError } from '@/features/transactions/validation';
import { FREQUENCIES, type Account, type Category, type Frequency, type RecurringRule } from '@/types';
import type { DayKey } from '@/utils/dates';
import { minorToInput, parseAmount } from '@/utils/money';

type RuleType = RecurringRule['type'];

interface FormData {
  accounts: Account[];
  categories: Category[];
  rule: RecurringRule | null;
}

export default function RecurringEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData(async (r) => ({
    accounts: await r.accounts.list(),
    categories: await r.categories.list(),
    rule: id ? await r.recurring.get(id) : null,
  }), [id]);
  if (!data) return null;
  return <RecurringForm key={id ?? 'new'} id={id} data={data} />;
}

function RecurringForm({ id, data }: { id: string | undefined; data: FormData }) {
  const { t } = useTranslation();
  const catName = useCategoryName();
  const today = clock.today();
  const rule = data.rule;

  const [type, setType] = useState<RuleType>(() => rule?.type ?? 'expense');
  const [amount, setAmount] = useState(() => (rule ? minorToInput(rule.amount, rule.currency) : ''));
  const [accountId, setAccountId] = useState<string | null>(() => rule?.accountId ?? data.accounts[0]?.id ?? null);
  const [toAccountId, setToAccountId] = useState<string | null>(() => rule?.toAccountId ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(() => rule?.categoryId ?? null);
  const [description, setDescription] = useState(() => rule?.description ?? '');
  const [frequency, setFrequency] = useState<Frequency>(() => rule?.frequency ?? 'monthly');
  const [every, setEvery] = useState(() => (rule ? String(rule.interval) : '1'));
  const [startDate, setStartDate] = useState<DayKey>(() => rule?.startDate ?? today);
  const [endDate, setEndDate] = useState<DayKey | null>(() => rule?.endDate ?? null);
  const [autoPost, setAutoPost] = useState(() => rule?.autoPost ?? true);
  const [active, setActive] = useState(() => rule?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const account = data.accounts.find((a) => a.id === accountId);
  const currency = account?.currency ?? 'USD';
  const kind = type === 'income' ? 'income' : 'expense';
  const accountOptions = useMemo(() => data.accounts.map((a) => ({ value: a.id, label: a.name, subtitle: a.currency, icon: a.icon as never, color: a.color })), [data]);
  const categoryOptions = useMemo(
    () => data.categories.filter((c) => c.kind === kind).map((c) => ({ value: c.id, label: catName(c), icon: c.icon as never, color: c.color })),
    [data, kind, catName],
  );

  const save = async () => {
    setError(null);
    const parsed = parseAmount(amount, currency);
    if (!parsed.ok) return setError(t(`errors.${parsed.error}`));
    if (parsed.minor <= 0) return setError(t('errors.amount'));
    if (!accountId) return setError(t('errors.account'));
    const n = Number(every);
    if (!Number.isInteger(n) || n < 1) return setError(t('errors.schedule'));
    const input = {
      type,
      amount: parsed.minor,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : null,
      categoryId: type === 'transfer' ? null : categoryId,
      description,
      frequency,
      interval: n,
      startDate,
      endDate,
      autoPost,
      active,
    };
    setBusy(true);
    try {
      await mutate(async (r) => {
        if (id) await r.recurring.update(id, input);
        else await r.recurring.create(input);
      });
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'recurring_save');
        setError(t('common.error'));
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    if (!id) return;
    Alert.alert(t('recurring.deleteTitle'), t('recurring.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          mutate((r) => r.recurring.remove(id))
            .then(() => router.back())
            .catch((e) => recordError(e, 'recurring_delete')),
      },
    ]);
  };

  if (data.accounts.length === 0) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('recurring.new') }} />
        <Text>{t('tx.needAccount')}</Text>
        <Button label={t('home.addFirstAccount')} onPress={() => router.replace('/accounts/edit')} />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={busy} testID="recurring-save" />}>
      <RouterStack.Screen options={{ title: id ? t('recurring.edit') : t('recurring.new') }} />
      <Segmented
        options={(['expense', 'income', 'transfer'] as const).map((v) => ({ value: v, label: t(`tx.types.${v}`) }))}
        value={type}
        onChange={(v) => {
          setType(v);
          setCategoryId(null);
        }}
      />
      <AmountInput label={t('common.amount')} value={amount} onChange={setAmount} currency={currency} testID="recurring-amount" />
      <SelectField label={type === 'transfer' ? t('tx.fromAccount') : t('tx.account')} value={accountId} options={accountOptions} onChange={setAccountId} />
      {type === 'transfer' ? (
        <SelectField label={t('tx.toAccount')} value={toAccountId} options={accountOptions.filter((o) => o.value !== accountId)} onChange={setToAccountId} />
      ) : (
        <SelectField label={t('tx.category')} value={categoryId} options={categoryOptions} onChange={setCategoryId} searchable />
      )}
      <FormField label={t('common.description')} value={description} onChangeText={setDescription} maxLength={200} />
      <ChoiceChips label={t('freq.label')} options={FREQUENCIES.map((f) => ({ value: f, label: t(`freq.options.${f}`) }))} value={frequency} onChange={(f) => {
        setFrequency(f);
        if (f === 'custom' && every === '1') setEvery('2');
      }} />
      <FormField label={frequency === 'custom' ? t('freq.interval') : t('recurring.everyN')} value={every} onChangeText={(v) => setEvery(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
      <Text variant="caption" tone="muted">
        {t(`freq.${frequency}`, { count: Math.max(1, Number(every) || 1) })}
      </Text>
      <DateField label={t('recurring.startDate')} value={startDate} onChange={(d) => d && setStartDate(d)} today={today} />
      <DateField label={t('recurring.endDate')} value={endDate} onChange={setEndDate} today={today} allowClear />
      <Stack gap={1}>
        <SwitchRow label={t('recurring.autoPost')} description={autoPost ? t('recurring.autoPostOn') : t('recurring.autoPostOff')} value={autoPost} onChange={setAutoPost} testID="recurring-autopost" />
        <SwitchRow label={t('common.active')} value={active} onChange={setActive} />
      </Stack>
      <Text variant="caption" tone="muted">
        {t('recurring.editHint')}
      </Text>
      {error ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {id ? <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={remove} /> : null}
    </Screen>
  );
}
