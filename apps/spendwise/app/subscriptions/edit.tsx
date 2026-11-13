import { Button, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { SUB_ICONS } from '@/components/finance';
import { AmountInput, ChoiceChips, CurrencySelector, DateField, FormField, SelectField, Sheet, SwitchRow } from '@/components/inputs';
import { systemCategoryId } from '@/constants';
import { mutate, useCategoryName, useData } from '@/hooks';
import { ValidationError } from '@/features/transactions/validation';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useMainCurrency } from '@/store/session';
import { FREQUENCIES, SUBSCRIPTION_KINDS, type Account, type Category, type Frequency, type Subscription, type SubscriptionKind } from '@/types';
import type { DayKey } from '@/utils/dates';
import { minorToInput, parseAmount } from '@/utils/money';

const REMINDERS = ['none', '0', '1', '2', '3', '7'] as const;

interface FormData {
  sub: Subscription | null;
  categories: Category[];
  accounts: Account[];
}

export default function SubscriptionEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData(async (r) => ({
    sub: id ? await r.subscriptions.get(id) : null,
    categories: await r.categories.list({ kind: 'expense' }),
    accounts: await r.accounts.list(),
  }), [id]);
  if (!data) return null;
  return <SubscriptionForm key={id ?? 'new'} id={id} data={data} />;
}

function SubscriptionForm({ id, data }: { id: string | undefined; data: FormData }) {
  const { t } = useTranslation();
  const catName = useCategoryName();
  const mainCurrency = useMainCurrency();
  const today = clock.today();
  const s = data.sub;

  const [name, setName] = useState(() => s?.name ?? '');
  const [kind, setKind] = useState<SubscriptionKind>(() => s?.kind ?? 'streaming');
  const [price, setPrice] = useState(() => (s ? minorToInput(s.price, s.currency) : ''));
  const [currency, setCurrency] = useState(() => s?.currency ?? mainCurrency);
  const [frequency, setFrequency] = useState<Frequency>(() => s?.frequency ?? 'monthly');
  const [every, setEvery] = useState(() => (s ? String(s.interval) : '1'));
  const [startDate, setStartDate] = useState<DayKey>(() => s?.startDate ?? today);
  const [endDate, setEndDate] = useState<DayKey | null>(() => s?.endDate ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(() => (s ? s.categoryId : systemCategoryId('subscriptions')));
  const [reminder, setReminder] = useState<(typeof REMINDERS)[number]>(() =>
    s && s.reminderDays !== null && (REMINDERS as readonly string[]).includes(String(s.reminderDays)) ? (String(s.reminderDays) as (typeof REMINDERS)[number]) : 'none',
  );
  const [active, setActive] = useState(() => s?.active ?? true);
  const [notes, setNotes] = useState(() => s?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAccount, setPayAccount] = useState<string | null>(() => data.accounts.find((a) => a.currency === (s?.currency ?? mainCurrency))?.id ?? data.accounts[0]?.id ?? null);
  const [payDate, setPayDate] = useState<DayKey>(today);
  const [payError, setPayError] = useState<string | null>(null);
  const [payDone, setPayDone] = useState(false);

  const categoryOptions = useMemo(() => data.categories.map((c) => ({ value: c.id, label: catName(c), icon: c.icon as never, color: c.color })), [data, catName]);
  const accountOptions = useMemo(() => data.accounts.map((a) => ({ value: a.id, label: a.name, subtitle: a.currency, icon: a.icon as never, color: a.color })), [data]);

  const save = async () => {
    setError(null);
    const parsed = parseAmount(price, currency);
    if (!parsed.ok) return setError(t(`errors.${parsed.error}`));
    if (parsed.minor <= 0) return setError(t('errors.amount'));
    const n = Number(every);
    if (!Number.isInteger(n) || n < 1) return setError(t('errors.schedule'));
    const input = {
      name,
      kind,
      price: parsed.minor,
      currency,
      frequency,
      interval: n,
      startDate,
      endDate,
      categoryId,
      reminderDays: reminder === 'none' ? null : Number(reminder),
      active,
      notes,
    };
    setBusy(true);
    try {
      if (id) await mutate((r) => r.subscriptions.update(id, input));
      else {
        await mutate((r) => r.subscriptions.create(input));
        track('subscription_added', {});
      }
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'subscription_save');
        setError(t('common.error'));
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    if (!id) return;
    Alert.alert(t('subs.deleteTitle'), t('subs.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          mutate((r) => r.subscriptions.remove(id))
            .then(() => router.back())
            .catch((e) => recordError(e, 'subscription_delete')),
      },
    ]);
  };

  /** Creates a real expense ONLY on explicit user action. */
  const recordPayment = async () => {
    setPayError(null);
    const sub = data.sub;
    const account = data.accounts.find((a) => a.id === payAccount);
    if (!sub || !account) return setPayError(t('errors.account'));
    if (account.currency !== sub.currency) return setPayError(t('errors.currency_mismatch'));
    try {
      await mutate((r) =>
        r.transactions.create({
          type: 'expense',
          amount: sub.price,
          accountId: account.id,
          toAccountId: null,
          toAmount: null,
          categoryId: sub.categoryId ?? systemCategoryId('subscriptions'),
          date: payDate,
          time: null,
          description: sub.name,
          notes: '',
          paymentMethod: null,
        }),
      );
      track('transaction_created', { type: 'expense' });
      setPayOpen(false);
      setPayDone(true);
    } catch (e) {
      if (e instanceof ValidationError) setPayError(t(`errors.${e.code}`));
      else {
        recordError(e, 'subscription_payment');
        setPayError(t('common.error'));
      }
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={busy} testID="sub-save" />}>
      <RouterStack.Screen options={{ title: id ? t('subs.edit') : t('subs.new') }} />
      <FormField label={t('common.name')} value={name} onChangeText={setName} maxLength={60} testID="sub-name" />
      <ChoiceChips label={t('subs.kind')} options={SUBSCRIPTION_KINDS.map((k) => ({ value: k, label: t(`subs.kinds.${k}`), icon: SUB_ICONS[k] as never }))} value={kind} onChange={setKind} />
      <AmountInput label={t('subs.price')} value={price} onChange={setPrice} currency={currency} testID="sub-price" />
      <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} />
      <ChoiceChips label={t('freq.label')} options={FREQUENCIES.map((f) => ({ value: f, label: t(`freq.options.${f}`) }))} value={frequency} onChange={(f) => {
        setFrequency(f);
        if (f === 'custom' && every === '1') setEvery('30');
      }} />
      <FormField label={frequency === 'custom' ? t('freq.interval') : t('recurring.everyN')} value={every} onChangeText={(v) => setEvery(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
      <Text variant="caption" tone="muted">
        {t(`freq.${frequency}`, { count: Math.max(1, Number(every) || 1) })}
      </Text>
      <DateField label={t('subs.firstBilling')} value={startDate} onChange={(d) => d && setStartDate(d)} today={today} />
      <DateField label={t('recurring.endDate')} value={endDate} onChange={setEndDate} today={today} allowClear />
      <SelectField label={t('tx.category')} value={categoryId} options={categoryOptions} onChange={setCategoryId} searchable />
      <ChoiceChips
        label={t('subs.reminder')}
        options={REMINDERS.map((r) => ({ value: r, label: r === 'none' ? t('common.none') : t('subs.reminderDays', { count: Number(r) }) }))}
        value={reminder}
        onChange={setReminder}
      />
      <Text variant="caption" tone="muted">
        {t('subs.reminderHint')}
      </Text>
      <SwitchRow label={t('common.active')} value={active} onChange={setActive} />
      <FormField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline maxLength={500} />
      {error ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {id && data.sub ? (
        <Stack gap={2}>
          <Text variant="caption" tone="muted">
            {t('subs.recordHint')}
          </Text>
          <Button label={t('subs.recordPayment')} icon="receipt-outline" variant="secondary" onPress={() => setPayOpen(true)} disabled={!data.accounts.length} testID="sub-record" />
          {payDone ? (
            <Text tone="success" accessibilityLiveRegion="polite">
              {t('subs.paymentRecorded')}
            </Text>
          ) : null}
          <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={remove} />
        </Stack>
      ) : null}

      <Sheet visible={payOpen} onClose={() => setPayOpen(false)} title={t('subs.recordPayment')}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <SelectField label={t('tx.account')} value={payAccount} options={accountOptions} onChange={setPayAccount} />
          <DateField label={t('common.date')} value={payDate} onChange={(d) => d && setPayDate(d)} today={today} />
          {payError ? <Text tone="danger">{payError}</Text> : null}
          <Button label={t('common.confirm')} onPress={recordPayment} testID="sub-record-confirm" />
        </View>
      </Sheet>
    </Screen>
  );
}
