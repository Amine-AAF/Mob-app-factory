import { Button, Card, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking } from 'react-native';

import { ChoiceChips, DateField, SelectField, TextField } from '@/components/forms';
import { confirmDelete, Notice, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { validateExpense } from '@/domain/budget';
import { COMMON_CURRENCIES, convertExplicit, minorToInput, parseAmount } from '@/domain/money';
import { BUDGET_CATEGORIES, PAYMENT_STATUSES, type BudgetCategory, type ExpenseInput, type PaymentStatus } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { deleteOwnedFile } from '@/services/files';
import { pickDocument } from '@/services/sharing';

export default function ExpenseForm() {
  const { t } = useTranslation();
  const { id, expenseId, vendorId } = useLocalSearchParams<{ id: string; expenseId?: string; vendorId?: string }>();
  const { data: snap } = useSnapshot(id);
  const cur = snap?.event.currency ?? 'USD';
  const [form, setForm] = useState<ExpenseInput>({
    eventId: id, category: 'venue', title: '', vendorId: vendorId ?? null, estimatedMinor: 0, actualMinor: 0, currency: '',
    fxRate: null, dueDate: null, paymentDate: null, paymentStatus: 'unpaid', receiptUri: null, notes: '',
  });
  const [estimated, setEstimated] = useState('');
  const [actual, setActual] = useState('');
  const [rate, setRate] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Empty currency = not chosen yet: new records default to the event currency.
  const currency = form.currency || snap?.event.currency || 'USD';

  useEffect(() => {
    if (!expenseId) return;
    void repos()
      .budget.getExpense(expenseId)
      .then((x) => {
        if (!x) return;
        const { id: _i, createdAt: _c, ...rest } = x;
        setForm(rest);
        setEstimated(minorToInput(x.estimatedMinor, x.currency));
        setActual(minorToInput(x.actualMinor, x.currency));
        setRate(x.fxRate != null ? String(x.fxRate) : '');
      });
  }, [expenseId]);

  const patch = (p: Partial<ExpenseInput>) => setForm((f) => ({ ...f, ...p }));
  const foreign = currency !== cur;
  const rateValue = rate.trim() ? Number(rate.replace(',', '.')) : null;
  const preview = foreign && rateValue ? convertExplicit({ amountMinor: Math.max(parseAmount(actual, currency) ?? 0, parseAmount(estimated, currency) ?? 0), currency: currency }, cur, rateValue) : null;

  const save = async () => {
    const est = estimated.trim() ? parseAmount(estimated, currency) : 0;
    const act = actual.trim() ? parseAmount(actual, currency) : 0;
    const next: ExpenseInput = { ...form, currency, estimatedMinor: est ?? -1, actualMinor: act ?? -1, fxRate: foreign ? rateValue : null };
    if (next.paymentStatus === 'paid' && !next.paymentDate) next.paymentDate = new Date().toISOString().slice(0, 10);
    const errs = validateExpense(next, cur);
    setErrors(errs);
    if (errs.length) return;
    try {
      if (expenseId) await mutate((r) => r.budget.updateExpense(expenseId, next));
      else await mutate((r) => r.budget.addExpense(next));
      router.back();
    } catch {
      Alert.alert(t('errors.saveFailed'));
    }
  };

  const attach = async () => {
    const uri = await pickDocument('receipts');
    if (uri) {
      deleteOwnedFile(form.receiptUri);
      patch({ receiptUri: uri });
    }
  };

  const err = (k: string) => (errors.includes(k) ? t(`errors.expense.${k}`) : null);

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="expense-save" />}>
      <ScreenTitle title={expenseId ? t('expense.edit') : t('budget.addExpense')} />
      <TextField label={t('expense.title')} value={form.title} onChangeText={(title) => patch({ title })} error={err('title')} testID="expense-title" />
      <SelectField<BudgetCategory> label={t('budget.category')} value={form.category} options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: t(`budgetCategory.${c}`) }))} onChange={(c) => c && patch({ category: c })} />
      <SelectField label={t('expense.vendor')} value={form.vendorId} optional placeholder={t('expense.noVendor')} options={(snap?.vendors ?? []).map((v) => ({ value: v.id, label: v.name, hint: t(`vendorCategory.${v.category}`) }))} onChange={(vendorId) => patch({ vendorId })} icon="storefront-outline" />
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('expense.estimated')} value={estimated} onChangeText={setEstimated} keyboardType="decimal-pad" error={err('amount')} />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('expense.actual')} value={actual} onChangeText={setActual} keyboardType="decimal-pad" />
        </Stack>
      </Row>
      <SelectField label={t('expense.currency')} value={currency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => c && patch({ currency: c })} searchable icon="cash-outline" />
      {foreign ? (
        <Card tone="alt">
          <Notice tone="warning" icon="swap-horizontal">
            {t('expense.foreignNote', { from: currency, to: cur })}
          </Notice>
          <TextField label={t('expense.fxRate')} hint={t('expense.fxRateHint', { from: currency, to: cur })} value={rate} onChangeText={setRate} keyboardType="decimal-pad" error={err('fxRate')} />
          {preview ? <Text variant="bodySmall" tone="muted">{`≈ ${fmt.money(preview.amountMinor, cur)}`}</Text> : null}
        </Card>
      ) : null}
      <ChoiceChips<PaymentStatus> label={t('expense.status')} value={form.paymentStatus} onChange={(paymentStatus) => patch({ paymentStatus })} options={PAYMENT_STATUSES.map((s) => ({ value: s, label: t(`payment.${s}`) }))} />
      <DateField label={t('expense.due')} value={form.dueDate} onChange={(dueDate) => patch({ dueDate })} optional />
      <DateField label={t('expense.paidOn')} value={form.paymentDate} onChange={(paymentDate) => patch({ paymentDate })} optional />
      <TextField label={t('expense.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline />
      <Card>
        <Text variant="label" tone="muted">
          {t('expense.receipt')}
        </Text>
        {form.receiptUri ? (
          form.receiptUri.endsWith('.pdf') ? (
            <Button size="md" variant="secondary" icon="document-outline" label={t('expense.openReceipt')} onPress={() => void Linking.openURL(form.receiptUri!).catch(() => Alert.alert(t('share.failed')))} />
          ) : (
            <Image source={{ uri: form.receiptUri }} style={{ height: 160, borderRadius: 10 }} resizeMode="cover" accessibilityLabel={t('expense.receipt')} />
          )
        ) : (
          <Text variant="caption" tone="subtle">
            {t('expense.receiptHint')}
          </Text>
        )}
        <Row gap={2}>
          <Button size="md" variant="secondary" icon="attach" label={form.receiptUri ? t('expense.replaceReceipt') : t('expense.attachReceipt')} onPress={() => void attach()} />
          {form.receiptUri ? <Button size="md" variant="ghost" label={t('common.remove')} onPress={() => patch({ receiptUri: null })} /> : null}
        </Row>
      </Card>
      {expenseId ? (
        <Button
          variant="danger"
          label={t('expense.delete')}
          onPress={() =>
            confirmDelete(t, form.title, () => {
              deleteOwnedFile(form.receiptUri);
              void mutate((r) => r.budget.removeExpense(expenseId)).then(() => router.back());
            })
          }
        />
      ) : null}
    </Screen>
  );
}
