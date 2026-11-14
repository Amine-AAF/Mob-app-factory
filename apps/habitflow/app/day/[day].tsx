import { fromDayKey } from '@factory/app-core';
import { Button, Card, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DailyTaskCard } from '@/components/DailyTaskCard';
import { DayHabitList } from '@/components/DayHabitList';
import { Field, HabitIcon } from '@/components/ui';
import { loadSnapshot, repos } from '@/database';
import { sortTasks } from '@/features/planner/tasks';
import { habitsForDay, indexLogs, summarizeDay, type DueHabit } from '@/features/tracking/progress';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { setNote, toggleTask } from '@/services/habitService';
import { cleanText } from '@/utils';

/**
 * Detail of one day: its habits (editable explicitly, including past days),
 * daily notes and planner tasks. Future days are read-only.
 */
export default function DayScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const { day, focus } = useLocalSearchParams<{ day: string; focus?: string }>();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(day ?? '');
  const [editing, setEditing] = useState<string | null>(focus ?? null);

  const { data } = useAsync(async () => {
    if (!valid) return null;
    const snapshot = await loadSnapshot(repos().db);
    const idx = indexLogs(snapshot.logs);
    return { due: habitsForDay(snapshot, day, idx), summary: summarizeDay(snapshot, day, today, idx), tasks: sortTasks(await repos().tasks.forDay(day, false)) };
  }, [day, today]);

  if (!valid || data === null) return null;
  const future = day > today;
  const past = day < today;

  return (
    <>
      <RouterStack.Screen options={{ title: fmt.longDay(fromDayKey(day)) }} />
      <Screen edges={[]}>
        {past ? (
          <Card tone="alt">
            <Text variant="bodySmall" tone="muted">
              {t('day.pastNotice')}
            </Text>
          </Card>
        ) : null}
        {data ? (
          <Text variant="subheading">
            {data.summary.expected ? t('today.completedCount', { done: data.summary.completed, total: data.summary.expected }) : t('today.nothingScheduled')}
          </Text>
        ) : null}

        {data && !future ? <DayHabitList day={day} due={data.due} /> : null}
        {future ? (
          <Text tone="muted">{t('day.future')}</Text>
        ) : null}

        {data && !future && data.due.length ? (
          <Stack gap={2}>
            <SectionHeader title={t('day.notes')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {data.due.map((d) => (
                <Button key={d.habit.id} label={d.habit.name} variant={editing === d.habit.id ? 'primary' : 'secondary'} size="md" onPress={() => setEditing(d.habit.id)} />
              ))}
            </View>
            {editing && data.due.some((d) => d.habit.id === editing) ? <NoteEditor key={editing} day={day} due={data.due.find((d) => d.habit.id === editing)!} /> : null}
          </Stack>
        ) : null}

        <Stack gap={2}>
          <SectionHeader title={t('today.plannerTitle')} action={t('today.openPlanner')} onAction={() => router.push({ pathname: '/planner', params: { day } })} />
          {data?.tasks.length ? (
            data.tasks.map((task) => <DailyTaskCard key={task.id} task={task} onToggle={() => void toggleTask(task.id, !task.done)} onOpen={() => router.push({ pathname: '/task/edit', params: { id: task.id } })} />)
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('planner.empty')}
            </Text>
          )}
        </Stack>
      </Screen>
    </>
  );
}

/** Note of one habit for one day. Keyed by habit so its draft starts from the saved note. */
function NoteEditor({ day, due }: { day: string; due: DueHabit }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(due.log?.note ?? '');
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <HabitIcon icon={due.habit.icon} color={due.habit.color} size={24} />
        <Text variant="subheading">{due.habit.name}</Text>
      </View>
      <Field label={t('day.note')} value={draft} onChangeText={setDraft} multiline maxLength={500} placeholder={t('day.notePlaceholder')} />
      <Button label={t('common.save')} size="md" onPress={() => void setNote(due.habit.id, day, cleanText(draft))} testID="save-note" />
    </Card>
  );
}
