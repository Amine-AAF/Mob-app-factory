import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SwitchRow, TextField } from '@/components/forms';
import { Notice } from '@/components/ui';
import { EXPENSE_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { EXPENSE_CATEGORIES, EXPENSE_FREQUENCIES, PAYMENT_METHODS, type ExpenseCategory, type ExpenseFrequency, type PaymentMethod } from '@/domain/types';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { mutate } from '@/services/mutations';

export default function RecurringEdit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const home = useActiveHome();
  const today = useToday();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [frequency, setFrequency] = useState<ExpenseFrequency>('monthly');
  const [startDate, setStartDate] = useState<string | null>(today);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [autoRecord, setAutoRecord] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .expenses.getRecurring(id)
      .then((r) => {
        if (!r) return;
        setTitle(r.title);
        setCurrency(r.currency);
        setAmount(amountInputValue(r.amountMinor, r.currency, formatLocale()));
        setCategory(r.category);
        setFrequency(r.frequency);
        setStartDate(r.startDate);
        setEndDate(r.endDate);
        setPayment(r.paymentMethod);
        setAutoRecord(r.autoRecord);
        setReminder(r.reminderEnabled);
        setActive(r.active);
        setNotes(r.notes ?? '');
      });
  }, [id]);

  const save = async () => {
    if (!home || !startDate) return;
    const amountMinor = parseAmount(amount, currency);
    if (!title.trim() || amountMinor === null || amountMinor === 0) {
      setError(t('validation.titleAndAmount'));
      return;
    }
    if (endDate && endDate < startDate) {
      Alert.alert(t('common.error'), t('validation.endBeforeStart'));
      return;
    }
    const input = { title: title.trim(), amountMinor, currency, category, frequency, startDate, endDate, paymentMethod: payment, autoRecord, reminderEnabled: reminder, active, notes: orNull(notes) };
    setSaving(true);
    try {
      if (id) await mutate(() => repos().expenses.updateRecurring(id, input, today));
      else {
        await mutate(async () => {
          await repos().expenses.createRecurring(home.id, input);
          await repos().expenses.catchUp(home.id, today);
        });
        track('expense_added', { category, recurring: true });
      }
      router.back();
    } catch (e) {
      recordError(e, 'recurring_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(() => repos().expenses.removeRecurring(id));
    router.back();
  };

  return (
    <FormScreen title={id ? t('recurring.edit') : t('recurring.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined} deleteMessage={t('recurring.deleteMessage')}>
      <TextField
        label={t('fields.title')}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        placeholder={t('recurring.placeholder')}
        error={error}
      />
      <AmountField label={t('fields.amount')} value={amount} onChangeText={setAmount} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} />
      <ChipSelect label={t('fields.category')} options={EXPENSE_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`expenseCategories.${v}`)} icon={(v) => EXPENSE_ICONS[v]} />
      <ChipSelect label={t('fields.frequency')} options={EXPENSE_FREQUENCIES} value={frequency} onChange={(v) => v && setFrequency(v)} renderLabel={(v) => t(`frequencies.${v}`)} />
      <DateField label={t('fields.firstPayment')} value={startDate} onChange={setStartDate} clearable={false} />
      {!id && startDate && startDate < today ? <Notice tone="warning">{t('recurring.pastStart')}</Notice> : null}
      <DateField label={t('fields.endDate')} value={endDate} onChange={setEndDate} optional shortcuts="none" />
      <ChipSelect label={t('fields.paymentMethod')} options={PAYMENT_METHODS} value={payment} onChange={setPayment} renderLabel={(v) => t(`paymentMethods.${v}`)} allowNone optional />
      <SwitchRow label={t('recurring.autoRecord')} subtitle={t('recurring.autoRecordHint')} value={autoRecord} onValueChange={setAutoRecord} />
      <SwitchRow label={t('fields.reminder')} value={reminder} onValueChange={setReminder} />
      {id ? <SwitchRow label={t('recurring.active')} value={active} onValueChange={setActive} /> : null}
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
