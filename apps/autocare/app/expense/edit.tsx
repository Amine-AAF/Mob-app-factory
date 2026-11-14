import { Button, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AttachmentList, useAttachments } from '@/components/Attachments';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, PremiumGate, readNumber, VehicleChooser } from '@/components/ui';
import { EXPENSE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { nextOccurrence } from '@/features/expenses/aggregate';
import { toMinor } from '@/features/money/money';
import { canAddExpense, FREE_LIMITS } from '@/features/premium/limits';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { currencyFor, pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError, track } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { EXPENSE_CATEGORIES, RECURRENCES, type ExpenseCategory, type Recurrence } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay, monthKey } from '@/utils/dates';

/** Quick expense entry: amount + category are enough; everything else is optional. */
export default function ExpenseEdit() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const premium = useIsPremium();
  const units = usePreferences((s) => s.units);
  const { id, vehicleId: vParam, insuranceId, category: catParam } = useEditorParams() as { id?: string; vehicleId?: string; insuranceId?: string; category?: ExpenseCategory };
  const { data } = useAsync(
    async () => ({
      vehicles: await repos().vehicles.list(),
      existing: id ? await repos().expenses.get(id) : null,
      monthCount: await repos().expenses.countInMonth(monthKey(today)),
      policy: insuranceId ? await repos().insurance.get(insuranceId) : null,
    }),
    [id, insuranceId, today],
  );

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>(catParam ?? (insuranceId ? 'insurance' : 'parking'));
  const [day, setDay] = useState(today);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(usePreferences.getState().currency);
  const [vendor, setVendor] = useState('');
  const [odometer, setOdometer] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const attachments = useAttachments('expense_id', id, 'invoice');
  const { discard } = attachments;
  // Picked-but-unsaved files are removed when the form closes (committed ones were already taken).
  useEffect(() => discard, [discard]);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    const vId = e?.vehicleId ?? data.policy?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    if (e) {
      setCategory(e.category);
      setDay(e.day);
      setAmount(String(e.amountMinor / 100));
      setCurrency(e.currency);
      setVendor(e.vendor ?? '');
      setOdometer(e.odometerKm === null ? '' : String(Math.round(kmToDistance(e.odometerKm, units.distance))));
      setRecurrence(e.recurrence);
      setNotes(e.notes ?? '');
    } else if (data.policy) {
      setCurrency(data.policy.currency);
      setVendor(data.policy.insurer);
      if (data.policy.premiumMinor) setAmount(String(data.policy.premiumMinor / 100));
    } else {
      setCurrency(currencyFor(data.vehicles.find((v) => v.id === vId)));
    }
    setLoaded(true);
  }

  if (!id && data && !canAddExpense(premium, data.monthCount)) {
    return (
      <View style={{ padding: 20 }}>
        <RouterStack.Screen options={{ title: t('expenses.new') }} />
        <PremiumGate reason="expenses" title={t('expenses.limitTitle')} body={t('expenses.limitBody', { count: FREE_LIMITS.expensesPerMonth })} />
      </View>
    );
  }

  const amountN = readNumber(amount);
  const odo = readNumber(odometer);
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    amount: amountN === null ? t('common.required') : !(amountN >= 0) ? t('common.invalidNumber') : null,
    day: !isValidDay(day) ? t('common.invalidDate') : null,
    odometer: odo !== null && !(odo >= 0) ? t('common.invalidNumber') : null,
  };
  const show = (e: string | null) => (submitted ? e : null);
  const generated = !!data?.existing?.recurringParentId;

  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !vehicleId || amountN === null) {
      feedback.warning();
      return;
    }
    setSaving(true);
    try {
      const savedId = await repos().expenses.save(
        {
          id: id ?? undefined,
          vehicleId,
          category,
          day,
          amountMinor: toMinor(amountN),
          currency,
          vendor: cleanText(vendor, 120),
          odometerKm: odo === null ? null : distanceToKm(odo, units.distance),
          notes: cleanText(notes, 2000),
          recurrence: generated ? 'none' : recurrence,
          recurringParentId: data?.existing?.recurringParentId ?? null,
          insuranceId: data?.existing?.insuranceId ?? insuranceId ?? null,
        },
        clock.now(),
      );
      await attachments.commit(savedId, vehicleId, cleanText(vendor) ?? t(`expenseCategories.${category}`));
      if (recurrence !== 'none') await repos().expenses.materializeRecurring(today, clock.now());
      if (!id) track('expense_added', { category });
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'expense_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().expenses.remove(id!, clock.now());
          afterWrite();
          router.back();
        },
      },
    ]);

  const next = recurrence !== 'none' && isValidDay(day) ? nextOccurrence({ day, recurrence }, today) : null;

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('expenses.editTitle') : t('expenses.new') }} />
      <FormScreen onSave={() => void save()} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        {show(errors.vehicle) ? (
          <Text variant="caption" tone="danger">
            {errors.vehicle}
          </Text>
        ) : null}
        <NumberField label={t('common.amount')} value={amount} onChange={setAmount} suffix={currency} error={show(errors.amount)} autoFocus={!id} testID="expense-amount" />
        <ChoiceChips label={t('expenses.category')} value={category} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`expenseCategories.${c}`), icon: EXPENSE_ICONS[c] }))} onChange={setCategory} />
        {category === 'fuel' || category === 'maintenance' ? <InfoNote text={t('expenses.allSources')} /> : null}
        <DateField label={t('common.date')} value={day} onChange={setDay} error={show(errors.day)} />
        <Field label={`${t('expenses.vendor')} (${t('common.optional')})`} value={vendor} onChangeText={setVendor} />
        {!generated ? (
          <ChoiceChips label={t('expenses.recurrence')} value={recurrence} options={RECURRENCES.map((r) => ({ value: r, label: t(`recurrences.${r}`) }))} onChange={setRecurrence} />
        ) : (
          <InfoNote icon="repeat" text={t('expenses.generated')} />
        )}
        {recurrence !== 'none' ? <InfoNote icon="repeat" text={`${t('expenses.recurrenceHint')}${next ? ` ${t('expenses.nextOccurrence', { date: f.day(next) })}` : ''}`} /> : null}
        <NumberField label={`${t('common.odometer')} (${t('common.optional')})`} value={odometer} onChange={setOdometer} suffix={f.distanceUnit} error={show(errors.odometer)} />
        <AttachmentList state={attachments} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
        {data?.policy ? <InfoNote icon="shield-checkmark-outline" text={`${t('expenses.insuranceLink')}: ${data.policy.insurer}`} /> : null}
      </FormScreen>
    </>
  );
}
