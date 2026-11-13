import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SelectField, TextField } from '@/components/forms';
import { EXPENSE_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, type Asset, type ExpenseCategory, type HomeDocument, type PaymentMethod, type Room } from '@/domain/types';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { mutate } from '@/services/mutations';

export default function ExpenseEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; assetId?: string }>();
  const id = params.id;
  const home = useActiveHome();
  const today = useToday();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [docs, setDocs] = useState<HomeDocument[]>([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [title, setTitle] = useState('');
  const [spentOn, setSpentOn] = useState<string | null>(today);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [assetId, setAssetId] = useState<string | null>(params.assetId ?? null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().assets.list(home.id).then(setAssets);
    void repos().homes.listRooms(home.id).then(setRooms);
    void repos().documents.list(home.id).then(setDocs);
    if (!id) return;
    void repos()
      .expenses.get(id)
      .then((e) => {
        if (!e) return;
        setCurrency(e.currency);
        setAmount(amountInputValue(e.amountMinor, e.currency, formatLocale()));
        setCategory(e.category);
        setTitle(e.title ?? '');
        setSpentOn(e.spentOn);
        setPayment(e.paymentMethod);
        setAssetId(e.assetId);
        setRoomId(e.roomId);
        setDocumentId(e.documentId);
        setNotes(e.notes ?? '');
      });
  }, [id, home]);

  const save = async () => {
    if (!home || !spentOn) return;
    const amountMinor = parseAmount(amount, currency);
    if (amountMinor === null || amountMinor === 0) {
      setError(t('validation.amount'));
      return;
    }
    const input = { amountMinor, currency, category, title: orNull(title), spentOn, paymentMethod: payment, assetId, roomId, documentId, notes: orNull(notes) };
    setSaving(true);
    try {
      if (id) await mutate(() => repos().expenses.update(id, input));
      else {
        await mutate(() => repos().expenses.create(home.id, input));
        track('expense_added', { category, recurring: false });
      }
      router.back();
    } catch (e) {
      recordError(e, 'expense_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(() => repos().expenses.remove(id));
    router.back();
  };

  return (
    <FormScreen title={id ? t('expenses.edit') : t('expenses.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined}>
      <AmountField
        label={t('fields.amount')}
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          setError(null);
        }}
        currency={currency}
        onPressCurrency={() => setCurrencyOpen(true)}
        error={error}
        testID="expense-amount"
      />
      <ChipSelect label={t('fields.category')} options={EXPENSE_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`expenseCategories.${v}`)} icon={(v) => EXPENSE_ICONS[v]} testIDPrefix="cat" />
      <TextField label={t('fields.title')} value={title} onChangeText={setTitle} optional placeholder={t(`expenseCategories.${category}`)} />
      <DateField label={t('fields.date')} value={spentOn} onChange={setSpentOn} clearable={false} shortcuts="past" />
      <ChipSelect label={t('fields.paymentMethod')} options={PAYMENT_METHODS} value={payment} onChange={setPayment} renderLabel={(v) => t(`paymentMethods.${v}`)} allowNone optional />
      <SelectField label={t('fields.asset')} options={assets.map((a) => a.id)} value={assetId} renderLabel={(v) => assets.find((a) => a.id === v)?.name ?? ''} onChange={setAssetId} allowNone noneLabel={t('common.noAsset')} icon="cube-outline" optional />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      <SelectField label={t('fields.receipt')} options={docs.map((d) => d.id)} value={documentId} renderLabel={(v) => docs.find((d) => d.id === v)?.title ?? ''} onChange={setDocumentId} allowNone noneLabel={t('common.none')} icon="receipt-outline" optional />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
