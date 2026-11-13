import { Button, Card, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { AmountInput, ChoiceChips, DateField, FormField, SelectField, Segmented, SwitchRow } from '@/components/inputs';
import { ValidationError } from '@/features/transactions/validation';
import { mutate, useCategoryName, useData } from '@/hooks';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { FREQUENCIES, type Account, type Category, type Transaction, PAYMENT_METHODS, TRANSACTION_TYPES, type Frequency, type PaymentMethod, type TransactionType } from '@/types';
import { TIME_KEY } from '@/utils/dates';
import { minorToInput, parseAmount } from '@/utils/money';

/**
 * Create / edit a transaction. No ad is ever shown on this screen.
 * Params: ?type=expense|income|transfer|refund|adjustment  ·  ?id=<tx id> to edit.
 */
interface FormData {
  accounts: Account[];
  categories: Category[];
  existing: Transaction | null;
}

export default function TransactionScreen() {
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const editingId = params.id ?? null;
  const { data } = useData<FormData>(async (r) => {
    const [accounts, categories, existing] = await Promise.all([r.accounts.list(), r.categories.list({}), editingId ? r.transactions.get(editingId) : null]);
    return { accounts, categories, existing };
  }, [editingId]);
  const initialType = (TRANSACTION_TYPES as readonly string[]).includes(params.type ?? '') ? (params.type as TransactionType) : 'expense';
  // The form mounts once its data is loaded, so every field starts from the stored values.
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  return <TransactionForm key={editingId ?? 'new'} data={data} editingId={editingId} initialType={initialType} />;
}

function TransactionForm({ data, editingId, initialType }: { data: FormData; editingId: string | null; initialType: TransactionType }) {
  const { t } = useTranslation();
  const catName = useCategoryName();
  const today = clock.today();
  const tx = data.existing;
  const toInit = tx ? data.accounts.find((a) => a.id === tx.toAccountId) : undefined;

  const [type, setType] = useState<TransactionType>(tx?.type ?? initialType);
  const [amount, setAmount] = useState(() => (tx ? minorToInput(tx.amount, tx.currency) : ''));
  const [toAmount, setToAmount] = useState(() => (tx && tx.toAmount !== null && toInit ? minorToInput(tx.toAmount, toInit.currency) : ''));
  const [accountId, setAccountId] = useState<string | null>(tx ? tx.accountId : (data.accounts[0]?.id ?? null));
  const [toAccountId, setToAccountId] = useState<string | null>(tx ? tx.toAccountId : (data.accounts[1]?.id ?? null));
  const [categoryId, setCategoryId] = useState<string | null>(tx?.categoryId ?? null);
  const [date, setDate] = useState(tx?.date ?? today);
  const [time, setTime] = useState(tx?.time ?? '');
  const [description, setDescription] = useState(tx?.description ?? '');
  const [notes, setNotes] = useState(tx?.notes ?? '');
  const [payment, setPayment] = useState<PaymentMethod | null>(tx?.paymentMethod ?? null);
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [more, setMore] = useState(Boolean(tx && (tx.notes || tx.time || tx.paymentMethod)));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const account = data?.accounts.find((a) => a.id === accountId);
  const toAccount = data?.accounts.find((a) => a.id === toAccountId);
  const currency = account?.currency ?? 'USD';
  const crossCurrency = type === 'transfer' && !!toAccount && toAccount.currency !== currency;
  const kind = type === 'income' ? 'income' : 'expense';
  const categoryOptions = data.categories.filter((c) => c.kind === kind).map((c) => ({ value: c.id, label: catName(c), icon: c.icon as never, color: c.color }));
  // A category of the other kind (after switching expense <-> income) is ignored.
  const effectiveCategory = categoryId && categoryOptions.some((o) => o.value === categoryId) ? categoryId : null;

  const title = editingId ? t('tx.edit') : t(`tx.new${type[0]!.toUpperCase()}${type.slice(1)}`);

  async function save() {
    setError(null);
    const parsed = parseAmount(amount, currency, { allowNegative: type === 'adjustment' });
    if (!parsed.ok) return setError(t(`errors.${parsed.error}`));
    if (parsed.minor === 0) return setError(t('errors.amount'));
    let to: number | null = null;
    if (crossCurrency) {
      const p = parseAmount(toAmount, toAccount!.currency);
      if (!p.ok || p.minor <= 0) return setError(t('errors.to_amount'));
      to = p.minor;
    }
    if (time && !TIME_KEY.test(time)) return setError(t('errors.time'));
    const input = {
      type,
      amount: parsed.minor,
      accountId: accountId ?? '',
      toAccountId: type === 'transfer' ? toAccountId : null,
      toAmount: to,
      categoryId: type === 'transfer' || type === 'adjustment' ? null : effectiveCategory,
      date,
      time: time || null,
      description,
      notes,
      paymentMethod: payment,
    };
    setSaving(true);
    try {
      if (editingId) await mutate((r) => r.transactions.update(editingId, input));
      else {
        await mutate(async (r) => {
          const created = await r.transactions.create(input);
          if (repeat && type !== 'refund' && type !== 'adjustment') {
            // This transaction becomes the rule's first occurrence: no duplicate for that date.
            const rule = await r.recurring.create({
              type,
              amount: input.amount,
              accountId: input.accountId,
              toAccountId: input.toAccountId,
              categoryId: input.categoryId,
              description,
              frequency,
              interval: 1,
              startDate: date,
              endDate: null,
              autoPost: true,
              active: true,
            });
            await r.recurring.attachExisting(rule.id, date, created.id);
          }
        });
        track('transaction_created', { type });
      }
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'tx_save');
        setError(t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editingId) return;
    Alert.alert(t('tx.deleteTitle'), t('tx.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          mutate((r) => r.transactions.remove(editingId))
            .then(() => router.back())
            .catch((e) => recordError(e, 'tx_delete')),
      },
    ]);
  }

  async function duplicate() {
    if (!editingId) return;
    try {
      await mutate((r) => r.transactions.duplicate(editingId, today));
      Alert.alert(t('tx.duplicated'));
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else recordError(e, 'tx_duplicate');
    }
  }

  if (data && data.accounts.length === 0)
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        <Text>{t('tx.needAccount')}</Text>
        <Button label={t('accounts.new')} icon="add" onPress={() => router.replace('/accounts/edit')} />
      </Screen>
    );

  const accountOptions = (data?.accounts ?? []).map((a) => ({ value: a.id, label: a.name, subtitle: a.currency, icon: a.icon as never, color: a.color }));

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={saving} testID="tx-save" />}>
      <RouterStack.Screen options={{ title }} />
      {!editingId || data?.existing ? (
        <Segmented
          options={(['expense', 'income', 'transfer'] as const).map((k) => ({ value: k, label: t(`tx.types.${k}`) }))}
          value={type === 'refund' || type === 'adjustment' ? 'expense' : type}
          onChange={(v) => setType(v)}
        />
      ) : null}
      <Row gap={2}>
        {(['refund', 'adjustment'] as const).map((k) => (
          <Button key={k} label={t(`tx.types.${k}`)} size="md" variant={type === k ? 'primary' : 'ghost'} onPress={() => setType(type === k ? 'expense' : k)} />
        ))}
      </Row>
      {type === 'transfer' || type === 'refund' || type === 'adjustment' ? (
        <Card tone="alt">
          <Text variant="bodySmall" tone="muted">
            {t(`tx.typeHelp.${type}`)}
          </Text>
        </Card>
      ) : null}

      <AmountInput label={t('common.amount')} value={amount} onChange={setAmount} currency={currency} error={error} testID="tx-amount" autoFocus={!editingId} />

      <SelectField label={type === 'transfer' ? t('tx.fromAccount') : t('tx.account')} value={accountId} options={accountOptions} onChange={setAccountId} testID="tx-account" />
      {type === 'transfer' ? (
        accountOptions.length < 2 ? (
          <Text tone="warning">{t('tx.noOtherAccount')}</Text>
        ) : (
          <>
            <SelectField label={t('tx.toAccount')} value={toAccountId} options={accountOptions.filter((o) => o.value !== accountId)} onChange={setToAccountId} testID="tx-to-account" />
            {crossCurrency ? <AmountInput label={t('tx.toAmount')} value={toAmount} onChange={setToAmount} currency={toAccount!.currency} /> : null}
          </>
        )
      ) : null}
      {type !== 'transfer' && type !== 'adjustment' ? <SelectField label={t('tx.category')} value={effectiveCategory} options={categoryOptions} onChange={setCategoryId} searchable testID="tx-category" /> : null}

      <DateField label={t('common.date')} value={date} onChange={(d) => d && setDate(d)} today={today} testID="tx-date" />
      <FormField label={t('common.description')} value={description} onChangeText={setDescription} maxLength={200} testID="tx-description" />

      {more ? (
        <Stack gap={4}>
          <FormField label={`${t('tx.time')} · ${t('common.optional')}`} value={time} onChangeText={setTime} placeholder="18:30" keyboardType="numbers-and-punctuation" maxLength={5} />
          <ChoiceChips label={t('tx.paymentMethod')} options={PAYMENT_METHODS.map((p) => ({ value: p, label: t(`tx.payment.${p}`) }))} value={payment} onChange={(p) => setPayment(p === payment ? null : p)} />
          <FormField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline maxLength={1000} />
        </Stack>
      ) : (
        <Button label={t('tx.more')} variant="ghost" size="md" icon="chevron-down" onPress={() => setMore(true)} />
      )}

      {!editingId && type !== 'refund' && type !== 'adjustment' ? (
        <Card tone="alt">
          <SwitchRow label={t('tx.repeat')} description={t('tx.repeatHint')} value={repeat} onChange={setRepeat} />
          {repeat ? <ChoiceChips options={FREQUENCIES.filter((f) => f !== 'custom').map((f) => ({ value: f, label: t(`freq.options.${f}`) }))} value={frequency} onChange={setFrequency} /> : null}
        </Card>
      ) : null}

      {editingId ? (
        <Row gap={2}>
          <Button label={t('common.duplicate')} icon="copy-outline" variant="secondary" size="md" onPress={duplicate} />
          <Button label={t('common.delete')} icon="trash-outline" variant="danger" size="md" onPress={remove} testID="tx-delete" />
        </Row>
      ) : null}
    </Screen>
  );
}
