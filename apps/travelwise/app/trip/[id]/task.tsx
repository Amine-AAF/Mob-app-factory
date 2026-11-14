import { Button, Card, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { TimeField } from '@/components/TimeField';
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from '@/constants/domain';
import { repos } from '@/database';
import { TaskValidationError } from '@/database/repositories/checklists';
import { deleteTask, updateTask } from '@/features/checklists/actions';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { askReminderPermission, isFutureInstant, reminderInstant } from '@/services/reminders';
import type { ChecklistItem } from '@/types/models';
import { clock } from '@/utils/clock';
import { toDayKey } from '@factory/app-core';

function localParts(instant: string | null): { date: string | null; time: string | null } {
  if (!instant) return { date: null, time: null };
  const d = new Date(instant);
  return { date: toDayKey(d), time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
}

function TaskForm({ item, tripName }: { item: ChecklistItem; tripName: string }) {
  const { t } = useTranslation();
  const initial = localParts(item.reminderAt);
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes);
  const [dueDate, setDueDate] = useState(item.dueDate);
  const [priority, setPriority] = useState<Priority>(item.priority);
  const [status, setStatus] = useState<TaskStatus>(item.status);
  const [reminderDate, setReminderDate] = useState(initial.date);
  const [reminderTime, setReminderTime] = useState(initial.time ?? '09:00');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    let reminderAt: string | null = null;
    if (reminderDate) {
      if (!reminderTime) return setError(t('timeField.invalid'));
      reminderAt = reminderInstant(reminderDate, reminderTime);
      if (!isFutureInstant(reminderAt)) return setError(t('tasks.reminderPast'));
      // Android 13+: the notification permission is asked only when a reminder is set.
      const perm = await askReminderPermission(t('tasks.channelName'));
      if (perm !== 'granted') Alert.alert(t('tasks.permissionDenied'));
    }
    try {
      await updateTask(item.id, { title, notes, dueDate, priority, status, reminderAt }, t('tasks.reminderHeading', { trip: tripName }));
      router.back();
    } catch (e) {
      if (e instanceof TaskValidationError) setError(t(`tasks.errors.${e.code}`));
      else {
        recordError(e, 'task_form');
        setError(t('tripForm.errors.generic'));
      }
    }
  };

  return (
    <Stack gap={4}>
      <TextField label={t('tasks.title')} value={title} onChangeText={setTitle} maxLength={160} testID="task-title" />
      <DateField label={t('tasks.dueDate')} value={dueDate} onChange={setDueDate} optional />
      <ChoiceChips label={t('tasks.priority')} options={PRIORITIES} value={priority} onChange={setPriority} labelOf={(p) => t(`enums.priority.${p}`)} />
      <ChoiceChips label={t('tasks.status')} options={TASK_STATUSES} value={status} onChange={setStatus} labelOf={(s) => t(`enums.taskStatus.${s}`)} />
      <Card tone="alt">
        <Text variant="subheading">{t('tasks.reminder')}</Text>
        <Text variant="caption" tone="muted">
          {t('tasks.reminderHint')}
        </Text>
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Stack gap={0} style={{ flex: 1.3 }}>
            <DateField label={t('tasks.reminderDate')} value={reminderDate} min={clock.today()} onChange={setReminderDate} optional testID="task-reminder-date" />
          </Stack>
          <Stack gap={0} style={{ flex: 1 }}>
            <TimeField label={t('tasks.reminderTime')} value={reminderTime} onChange={(v) => setReminderTime(v ?? '')} />
          </Stack>
        </Row>
      </Card>
      <TextField label={t('tasks.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {error ? (
        <Text tone="danger" testID="task-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} testID="task-save" />
      <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={() => deleteTask(item.id).then(() => router.back())} />
    </Stack>
  );
}

export default function TaskScreen() {
  const { id, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => ({ item: await repos().checklists.get(taskId), trip: await repos().trips.get(id) }), [id, taskId]);
  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ headerShown: true, title: t('tasks.editTitle') }} />
      {data && (!data.item || !data.trip) ? <EmptyState icon="alert-circle-outline" title={t('tasks.errors.not_found')} /> : null}
      {data?.item && data.trip ? <TaskForm item={data.item} tripName={data.trip.name} /> : null}
    </Screen>
  );
}
