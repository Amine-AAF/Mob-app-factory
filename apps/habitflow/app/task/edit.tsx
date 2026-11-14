import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Chip, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, View } from 'react-native';

import { Field, Segmented, Stepper } from '@/components/ui';
import { repos } from '@/database';
import { PRIORITIES } from '@/features/planner/tasks';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { createTask, deleteTask, updateTask } from '@/services/habitService';
import type { Priority } from '@/types';
import { cleanText, formatTime } from '@/utils';

export default function TaskEditScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const { id, day } = useLocalSearchParams<{ id?: string; day?: string }>();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDay, setDueDay] = useState(day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : today);
  const [time, setTime] = useState<{ h: number; m: number } | null>(null);
  const [habitId, setHabitId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { data: habits = [] } = useAsync(() => repos().habits.list(), []);

  useEffect(() => {
    if (!id) return;
    void repos()
      .tasks.get(id)
      .then((task) => {
        if (!task) return router.back();
        setTitle(task.title);
        setNotes(task.notes ?? '');
        setPriority(task.priority);
        setDueDay(task.dueDay);
        setHabitId(task.habitId);
        if (task.time) setTime({ h: Number(task.time.slice(0, 2)), m: Number(task.time.slice(3)) });
      });
  }, [id]);

  const save = async () => {
    setSubmitted(true);
    if (!title.trim()) return;
    const input = { title: title.trim().slice(0, 120), notes: cleanText(notes), priority, dueDay, time: time ? formatTime(time.h, time.m) : null, habitId };
    try {
      if (id) await updateTask(id, input);
      else await createTask(input);
      router.back();
    } catch (e) {
      recordError(e, 'task_save');
      Alert.alert(t('common.error'));
    }
  };

  const remove = () =>
    id &&
    Alert.alert(t('planner.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('planner.delete'), style: 'destructive', onPress: async () => {
          await deleteTask(id);
          router.back();
        } },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('planner.editTitle') : t('planner.newTitle') }} />
      <Screen edges={[]} footer={<Button label={t('common.save')} icon="checkmark" onPress={() => void save()} testID="save-task" />}>
        <Field label={t('planner.taskTitle')} value={title} onChangeText={setTitle} maxLength={120} placeholder={t('planner.taskPlaceholder')} error={submitted && !title.trim() ? t('errors.titleRequired') : null} testID="task-title" />
        <Field label={t('editor.notes')} value={notes} onChangeText={setNotes} multiline maxLength={500} placeholder={t('editor.optional')} />
        <Text variant="label" tone="muted">
          {t('planner.priorityLabel')}
        </Text>
        <Segmented value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p, label: t(`planner.priority.${p}`) }))} />

        <Text variant="label" tone="muted">
          {t('planner.due')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={t('planner.today')} selected={dueDay === today} onPress={() => setDueDay(today)} />
          <Chip label={t('planner.tomorrow')} selected={dueDay === addDays(today, 1)} onPress={() => setDueDay(addDays(today, 1))} />
          <Chip label={t('planner.nextWeek')} selected={dueDay === addDays(today, 7)} onPress={() => setDueDay(addDays(today, 7))} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button label="−1" variant="ghost" size="md" onPress={() => setDueDay(addDays(dueDay, -1))} accessibilityHint={t('planner.dayEarlier')} />
          <Text variant="subheading" style={{ flex: 1, textAlign: 'center', textTransform: 'capitalize' }}>
            {fmt.longDay(fromDayKey(dueDay))}
          </Text>
          <Button label="+1" variant="ghost" size="md" onPress={() => setDueDay(addDays(dueDay, 1))} accessibilityHint={t('planner.dayLater')} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="body">{t('planner.withTime')}</Text>
          <Switch value={!!time} onValueChange={(v) => setTime(v ? { h: 9, m: 0 } : null)} accessibilityLabel={t('planner.withTime')} />
        </View>
        {time ? (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Stepper label={t('reminders.hour')} value={time.h} min={0} max={23} onChange={(h) => setTime({ ...time, h })} />
            <Stepper label={t('reminders.minute')} value={time.m} min={0} max={55} step={5} onChange={(m) => setTime({ ...time, m })} format={(v) => formatTime(0, v).slice(3)} />
          </View>
        ) : null}

        {habits.length ? (
          <Stack gap={2}>
            <Text variant="label" tone="muted">
              {t('planner.linkHabit')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label={t('planner.noLink')} selected={habitId === null} onPress={() => setHabitId(null)} />
              {habits.map((h) => (
                <Chip key={h.id} label={h.name} selected={habitId === h.id} onPress={() => setHabitId(h.id)} />
              ))}
            </View>
          </Stack>
        ) : null}
        {id ? <Button label={t('planner.delete')} icon="trash-outline" variant="danger" size="md" onPress={remove} /> : null}
      </Screen>
    </>
  );
}
