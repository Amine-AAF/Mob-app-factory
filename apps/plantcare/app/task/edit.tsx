import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TASK_ICON } from '@/components/icons';
import { ChipSelect, DateField, Stepper, SwitchRow, TextField } from '@/components/forms';
import { getSpecies } from '@/content/species';
import { repos } from '@/database';
import { WATERING_SUGGESTIONS } from '@/domain/schedule';
import { PRIORITIES, TASK_TYPES, type Priority, type TaskType } from '@/domain/types';
import { parseDecimal, volumeFromMl, volumeToMl, volumeUnit } from '@/domain/units';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';

/** Create or edit a care task (watering, fertilizing, pruning, repotting…). */
export default function EditTask() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const params = useLocalSearchParams<{ plantId: string; id?: string; type?: TaskType }>();
  const editing = !!params.id;

  const [type, setType] = useState<TaskType>(params.type && (TASK_TYPES as readonly string[]).includes(params.type) ? params.type : 'watering');
  const [recurring, setRecurring] = useState(true);
  const [interval, setIntervalDays] = useState(7);
  const [nextDue, setNextDue] = useState<string | null>(clock.today());
  const [priority, setPriority] = useState<Priority>('normal');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [reminders, setReminders] = useState(true);
  const [waterNeed, setWaterNeed] = useState<'low' | 'moderate' | 'high'>('moderate');

  useEffect(() => {
    const r = repos();
    void r.plants.get(params.plantId).then((p) => {
      const sp = getSpecies(p?.speciesId);
      if (sp) setWaterNeed(sp.water);
    });
    if (!editing) return;
    void r.tasks.get(params.id!).then((task) => {
      if (!task) return;
      setType(task.type);
      setRecurring(task.intervalDays !== null);
      setIntervalDays(task.intervalDays ?? 7);
      setNextDue(task.nextDue);
      setPriority(task.priority);
      setNotes(task.notes);
      setAmount(task.amountMl ? String(volumeFromMl(task.amountMl, units)) : '');
      setReminders(task.remindersEnabled);
    });
  }, [editing, params.id, params.plantId, units]);

  const save = async () => {
    if (!nextDue) return;
    const ml = parseDecimal(amount);
    const input = {
      plantId: params.plantId,
      type,
      nextDue,
      intervalDays: recurring ? interval : null,
      priority,
      notes: notes.trim(),
      amountMl: type === 'watering' && ml !== null ? volumeToMl(ml, units) : null,
      remindersEnabled: reminders,
      active: true,
    };
    await mutate(async (r) => void (editing ? await r.tasks.update(params.id!, input) : await r.tasks.create(input)));
    router.back();
  };

  const remove = () =>
    Alert.alert(t('tasks.deleteTitle'), t('tasks.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.tasks.remove(params.id!)).then(() => router.back()) },
    ]);

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} disabled={!nextDue} testID="save-task" />}>
      <RouterStack.Screen options={{ title: editing ? t('tasks.edit') : t('tasks.add') }} />
      <Stack gap={4}>
        <ChipSelect label={t('tasks.type')} options={TASK_TYPES} value={type} onChange={setType} render={(x) => t(`taskTypes.${x}`)} icons={TASK_ICON} />
        <SwitchRow label={t('tasks.recurring')} value={recurring} onChange={setRecurring} />
        {recurring ? (
          <Stack gap={2}>
            <Stepper label={t('tasks.frequency')} value={interval} onChange={setIntervalDays} suffix={t('common.daysShort')} />
            {type === 'watering' ? (
              <>
                <Row wrap gap={2}>
                  {WATERING_SUGGESTIONS[waterNeed].map((n) => (
                    <Chip key={n} label={t('tasks.everyDays', { count: n })} selected={interval === n} onPress={() => setIntervalDays(n)} />
                  ))}
                </Row>
                <Text variant="caption" tone="muted">
                  {t('watering.noUniversalRule')}
                </Text>
              </>
            ) : null}
          </Stack>
        ) : null}
        <DateField label={recurring ? t('tasks.nextDate') : t('tasks.date')} value={nextDue} onChange={setNextDue} />
        <ChipSelect label={t('tasks.priority')} options={PRIORITIES} value={priority} onChange={setPriority} render={(x) => t(`priority.${x}`)} />
        {type === 'watering' ? <TextField label={`${t('watering.amount')} (${volumeUnit(units)})`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" optional maxLength={6} /> : null}
        {type === 'fertilizing' ? (
          <Text variant="caption" tone="muted">
            {t('soil.dosageWarning')}
          </Text>
        ) : null}
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
        <SwitchRow label={t('tasks.reminders')} subtitle={t('tasks.remindersHint')} value={reminders} onChange={setReminders} />
        {editing ? <Button variant="danger" icon="trash-outline" label={t('tasks.delete')} onPress={remove} /> : null}
      </Stack>
    </Screen>
  );
}
