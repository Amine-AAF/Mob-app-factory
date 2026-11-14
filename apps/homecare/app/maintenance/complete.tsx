import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, intOrNull, orNull } from '@/components/FormScreen';
import { AmountField, DateField, PickerSheet, SwitchRow, TextField } from '@/components/forms';
import { Notice } from '@/components/ui';
import { repos } from '@/database';
import { COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { nextDueAfterCompletion } from '@/domain/recurrence';
import type { MaintenanceTask } from '@/domain/types';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { mutate } from '@/services/mutations';

/** "Mark as done": date, actual cost/time, notes; optionally logs the cost as an expense. No ads here. */
export default function CompleteMaintenance() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const home = useActiveHome();
  const today = useToday();
  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [doneOn, setDoneOn] = useState<string | null>(today);
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [asExpense, setAsExpense] = useState(true);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void repos()
      .maintenance.get(id)
      .then((m) => {
        setTask(m);
        if (m?.currency) setCurrency(m.currency);
      });
  }, [id]);

  const next = task && doneOn ? nextDueAfterCompletion(doneOn, task) : null;

  const save = async () => {
    if (!task || !doneOn || !home) return;
    if (doneOn > today) {
      Alert.alert(t('common.error'), t('validation.futureCompletion'));
      return;
    }
    const costMinor = cost.trim() ? parseAmount(cost, currency) : null;
    setSaving(true);
    try {
      await mutate(async () => {
        await repos().maintenance.complete(task.id, { doneOn, costMinor, currency, durationMinutes: intOrNull(minutes), notes: orNull(notes) });
        if (asExpense && costMinor) {
          await repos().expenses.create(task.homeId, { category: 'maintenance', title: task.title, amountMinor: costMinor, currency, spentOn: doneOn, paymentMethod: null, assetId: task.assetId, roomId: task.roomId, documentId: null, notes: null });
        }
      });
      track('maintenance_completed', { category: task.category, from_template: !!task.templateId });
      router.back();
    } catch (e) {
      recordError(e, 'maintenance_complete');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <FormScreen title={t('maintenance.markDone')} onSave={save} saving={saving} saveLabel={t('maintenance.confirmDone')} canSave={!!task && !!doneOn}>
      {task ? <Notice icon="construct-outline">{task.title}</Notice> : null}
      <DateField label={t('fields.doneOn')} value={doneOn} onChange={setDoneOn} clearable={false} shortcuts="past" />
      <AmountField label={t('fields.actualCost')} value={cost} onChangeText={setCost} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      {cost.trim() ? <SwitchRow label={t('maintenance.addAsExpense')} value={asExpense} onValueChange={setAsExpense} /> : null}
      <TextField label={t('fields.durationMinutes')} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" optional maxLength={4} />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      {task ? <Notice tone="success" icon="calendar-outline">{next ? t('maintenance.nextWillBe', { date: fmt.day(next, 'long') }) : t('maintenance.oneOffDone')}</Notice> : null}
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
