import { Button, Card, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { CURRENCY_CODES, isCurrencyCode, type CurrencyCode } from '@/constants/currencies';
import { BUDGET_CATEGORIES, SPLIT_MODES, type BudgetCategory, type SplitMode } from '@/constants/domain';
import { repos } from '@/database';
import { ExpenseValidationError, type ExpenseWithShares } from '@/database/repositories/expenses';
import type { TripDetails } from '@/database/repositories/trips';
import { formatRate, type RateQuote } from '@/features/currency/rates';
import { createExpense, deleteExpense, saveRate, updateExpense } from '@/features/expenses/actions';
import { useAsync } from '@/hooks/useAsync';
import { currentLanguage, fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/utils/clock';
import { convertMinor, fromMinor, parseAmount, parseRate } from '@/utils/money';

const PAYMENT_LABELS = ['cash', 'card', 'transfer', 'other'] as const;

function ExpenseForm({ trip, expense, savedRates }: { trip: TripDetails; expense: ExpenseWithShares | null; savedRates: Map<string, RateQuote | null> }) {
  const { t } = useTranslation();
  const tripCurrency = trip.currency;
  const people = trip.participants;
  const today = clock.today();
  const defaultDate = trip.startDate && trip.endDate ? (today < trip.startDate ? trip.startDate : today > trip.endDate ? trip.endDate : today) : today;

  const [amount, setAmount] = useState(expense ? String(fromMinor(expense.amountMinor, expense.currency)) : '');
  const [currency, setCurrency] = useState<CurrencyCode>(expense && isCurrencyCode(expense.currency) ? expense.currency : isCurrencyCode(tripCurrency) ? tripCurrency : 'USD');
  const initialQuote = (c: string) => savedRates.get(c) ?? null;
  const [rate, setRate] = useState(expense && expense.currency !== tripCurrency ? String(expense.rateToTrip) : '');
  const [rememberRate, setRememberRate] = useState(true);
  const [category, setCategory] = useState<BudgetCategory>(expense?.category ?? 'food');
  const [date, setDate] = useState(expense?.date ?? defaultDate);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [city, setCity] = useState(expense?.city ?? '');
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod ?? '');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [paidBy, setPaidBy] = useState<string | null>(expense?.paidByParticipantId ?? people.find((p) => p.isSelf)?.id ?? null);
  const [splitMode, setSplitMode] = useState<SplitMode>(expense?.splitMode ?? 'none');
  const [sharedWith, setSharedWith] = useState<string[]>(expense?.shares.length ? expense.shares.map((s) => s.participantId) : people.map((p) => p.id));
  const [custom, setCustom] = useState<Record<string, string>>(
    Object.fromEntries((expense?.shares ?? []).map((s) => [s.participantId, String(fromMinor(s.shareMinor, expense!.currency))])),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const foreign = currency !== tripCurrency;
  const saved = foreign ? initialQuote(currency) : null;
  const effectiveRate = foreign ? (rate.trim() ? parseRate(rate) : (saved?.rate ?? null)) : 1;
  const amountMinor = amount.trim() ? parseAmount(amount, currency) : null;
  const preview = amountMinor !== null && effectiveRate ? convertMinor(amountMinor, currency, tripCurrency, effectiveRate) : null;
  const customTotal = Object.values(custom).reduce((s, v) => s + (parseAmount(v || '0', currency) ?? 0), 0);

  const save = async () => {
    setError(null);
    if (amountMinor === null) return setError(t('expenses.errors.invalid_amount'));
    if (foreign && !effectiveRate) return setError(t('expenses.errors.invalid_rate'));
    const customShares = splitMode === 'custom' ? Object.fromEntries(Object.entries(custom).map(([pid, v]) => [pid, parseAmount(v || '0', currency) ?? -1])) : undefined;
    const input = {
      amountMinor,
      currency,
      rateToTrip: effectiveRate ?? undefined,
      category,
      date,
      description,
      city,
      paymentMethod,
      notes,
      paidBy,
      splitMode,
      sharedWith,
      customShares,
    };
    setSaving(true);
    try {
      if (expense) await updateExpense(expense.id, input);
      else await createExpense(trip.id, input);
      // A newly typed rate is kept for this trip, with today's date and "manual" source.
      if (foreign && rate.trim() && rememberRate && effectiveRate) await saveRate({ base: currency, quote: tripCurrency, rate: effectiveRate, rateDate: today, tripId: trip.id });
      router.back();
    } catch (e) {
      if (e instanceof ExpenseValidationError) setError(t(`expenses.errors.${e.code}`));
      else {
        recordError(e, 'expense_form');
        setError(t('tripForm.errors.generic'));
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('expenses.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => expense && deleteExpense(expense.id).then(() => router.back()) },
    ]);

  return (
    <Stack gap={4}>
      <TextField label={t('expenses.amount')} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} testID="expense-amount" />
      <ChoiceChips label={t('expenses.currency')} options={CURRENCY_CODES} value={currency} onChange={setCurrency} labelOf={(c) => c} testID="expense-currency" />
      {foreign ? (
        <Card tone="alt" testID="expense-rate-card">
          <TextField
            label={t('expenses.rate', { from: currency, to: tripCurrency })}
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
            placeholder={saved ? formatRate(saved.rate, currentLanguage()) : undefined}
            testID="expense-rate"
          />
          <Text variant="caption" tone="muted">
            {saved && !rate.trim()
              ? t('expenses.usingSavedRate', { date: saved.rateDate ? fmt.date(saved.rateDate) : '—' })
              : saved
                ? t('expenses.savedRateAvailable', { rate: formatRate(saved.rate, currentLanguage()), date: saved.rateDate ? fmt.date(saved.rateDate) : '—' })
                : t('expenses.noSavedRate')}
          </Text>
          {rate.trim() ? (
            <Row gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t('expenses.rememberRate')}
              </Text>
              <Switch value={rememberRate} onValueChange={setRememberRate} accessibilityLabel={t('expenses.rememberRate')} />
            </Row>
          ) : null}
          {preview !== null ? <Text variant="subheading">{`≈ ${fmt.money(preview, tripCurrency)}`}</Text> : null}
          <Text variant="caption" tone="subtle">
            {t('converter.bankWarning')}
          </Text>
        </Card>
      ) : null}
      <ChoiceChips label={t('expenses.category')} options={BUDGET_CATEGORIES} value={category} onChange={setCategory} labelOf={(c) => t(`enums.budgetCategory.${c}`)} testID="expense-category" />
      <DateField label={t('expenses.date')} value={date} onChange={(d) => d && setDate(d)} testID="expense-date" />
      <TextField label={t('expenses.description')} value={description} onChangeText={setDescription} maxLength={200} optional optionalLabel={t('common.optional')} testID="expense-description" />
      <Stack gap={2}>
        <TextField label={t('expenses.city')} value={city} onChangeText={setCity} optional optionalLabel={t('common.optional')} />
        {trip.destinations.length ? (
          <Row gap={2} wrap>
            {trip.destinations.map((d) => (
              <Chip key={d.id} label={d.city} selected={city === d.city} onPress={() => setCity(d.city)} />
            ))}
          </Row>
        ) : null}
      </Stack>
      <Stack gap={2}>
        <TextField label={t('expenses.paymentMethod')} hint={t('expenses.paymentHint')} value={paymentMethod} onChangeText={setPaymentMethod} maxLength={60} optional optionalLabel={t('common.optional')} />
        <Row gap={2} wrap>
          {PAYMENT_LABELS.map((p) => (
            <Chip key={p} label={t(`expenses.payment.${p}`)} selected={paymentMethod === t(`expenses.payment.${p}`)} onPress={() => setPaymentMethod(t(`expenses.payment.${p}`))} />
          ))}
        </Row>
      </Stack>

      {people.length ? (
        <Stack gap={2}>
          <Text variant="label">{t('expenses.paidByLabel')}</Text>
          <Row gap={2} wrap>
            {people.map((p) => (
              <Chip key={p.id} label={p.name} selected={paidBy === p.id} onPress={() => setPaidBy(paidBy === p.id ? null : p.id)} testID={`expense-payer-${p.position}`} />
            ))}
          </Row>
        </Stack>
      ) : null}
      {people.length >= 2 ? (
        <Stack gap={2}>
          <ChoiceChips label={t('expenses.split')} options={SPLIT_MODES} value={splitMode} onChange={setSplitMode} labelOf={(m) => t(`expenses.splitMode.${m}`)} testID="expense-split" />
          {splitMode === 'equal' ? (
            <Row gap={2} wrap>
              {people.map((p) => {
                const on = sharedWith.includes(p.id);
                return <Chip key={p.id} label={p.name} selected={on} icon={on ? 'checkmark' : undefined} onPress={() => setSharedWith(on ? sharedWith.filter((x) => x !== p.id) : [...sharedWith, p.id])} />;
              })}
            </Row>
          ) : null}
          {splitMode === 'custom' ? (
            <Stack gap={2}>
              {people.map((p) => (
                <TextField key={p.id} label={p.name} keyboardType="decimal-pad" value={custom[p.id] ?? ''} onChangeText={(v) => setCustom({ ...custom, [p.id]: v })} testID={`expense-share-${p.position}`} />
              ))}
              <Text variant="caption" tone={amountMinor !== null && customTotal === amountMinor ? 'success' : 'warning'}>
                {t('expenses.customTotal', { total: fmt.money(customTotal, currency), amount: fmt.money(amountMinor ?? 0, currency) })}
              </Text>
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      <TextField label={t('expenses.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {error ? (
        <Text tone="danger" testID="expense-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} loading={saving} testID="expense-save" />
      {expense ? <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} /> : null}
    </Stack>
  );
}

export default function ExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId?: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => {
    const r = repos();
    const [trip, expense] = await Promise.all([r.trips.get(id), expenseId ? r.expenses.get(expenseId) : Promise.resolve(null)]);
    const savedRates = new Map<string, RateQuote | null>();
    if (trip) for (const c of CURRENCY_CODES) if (c !== trip.currency) savedRates.set(c, await r.currency.findRate(c, trip.currency, trip.id));
    return { trip, expense, savedRates };
  }, [id, expenseId]);
  const missing = data && (!data.trip || (expenseId && !data.expense));
  return (
    <Screen edges={[]} testID="expense-screen">
      <RouterStack.Screen options={{ headerShown: true, title: expenseId ? t('expenses.editTitle') : t('expenses.newTitle') }} />
      {missing ? <EmptyState icon="alert-circle-outline" title={t('expenses.errors.not_found')} /> : null}
      {data?.trip && !missing ? <ExpenseForm key={data.expense?.id ?? 'new'} trip={data.trip} expense={data.expense} savedRates={data.savedRates} /> : null}
    </Screen>
  );
}
