import { Card, EmptyState, Icon, ProgressBar, Row, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ChoiceChips, MonthCalendar, MultiChips } from '@/components/forms';
import { groupByBucket, isOverdue, taskProgress, tasksByDate, toggleDone, type TaskBucket } from '@/domain/tasks';
import { localToday } from '@/domain/time';
import { TASK_PRIORITIES, type Task, type TaskPriority } from '@/domain/types';
import { mutate } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

export function TaskRow({ task, eventName, today }: { task: Task; eventName?: string; today: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const done = task.status === 'completed';
  const overdue = isOverdue(task, today);
  const meta = [eventName, task.dueDate ? fmt.dayShort(task.dueDate) : null, task.assignee || null].filter(Boolean).join(' · ');
  return (
    <Row gap={3} style={{ minHeight: 56, paddingVertical: 4 }}>
      <Pressable
        onPress={() => void mutate((r) => r.tasks.update(task.id, { status: toggleDone(task.status) }))}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={task.title}
        hitSlop={8}
      >
        <Icon name={done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={done ? theme.colors.success : task.priority === 'high' ? theme.colors.danger : theme.colors.textMuted} />
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: '/event/[id]/task', params: { id: task.eventId, taskId: task.id } })} accessibilityRole="button" style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ textDecorationLine: done ? 'line-through' : 'none', opacity: done || task.status === 'cancelled' ? 0.6 : 1 }}>
          {task.title}
        </Text>
        {meta ? (
          <Text variant="caption" tone={overdue ? 'danger' : 'muted'} numberOfLines={1}>
            {overdue ? `${t('tasks.overdue')} · ${meta}` : meta}
          </Text>
        ) : null}
      </Pressable>
      {task.status === 'in_progress' ? <Icon name="play-circle-outline" size={18} color={theme.colors.primary} /> : null}
    </Row>
  );
}

const BUCKETS: TaskBucket[] = ['overdue', 'today', 'week', 'later', 'undated', 'done'];

export function TaskBoard({ tasks, eventNames }: { tasks: readonly Task[]; eventNames?: ReadonlyMap<string, string> }) {
  const { t } = useTranslation();
  const today = localToday(clock.now());
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [month, setMonth] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) });
  const [day, setDay] = useState<string>(today);

  const filtered = tasks.filter((x) => (priorities.length ? priorities.includes(x.priority) : true));
  const progress = taskProgress(tasks);
  const buckets = groupByBucket(filtered, today);
  const byDate = tasksByDate(filtered);
  const marks = new Map<string, 'normal' | 'alert'>([...byDate.entries()].map(([d, list]) => [d, list.some((x) => isOverdue(x, today)) ? 'alert' : 'normal']));

  if (tasks.length === 0) return <EmptyState icon="checkbox-outline" title={t('tasks.emptyTitle')} message={t('tasks.emptyBody')} />;

  return (
    <Stack gap={3}>
      <Card tone="alt">
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('tasks.progress')}</Text>
          <Text variant="subheading" tone="primary">
            {fmt.percent(progress.ratio)}
          </Text>
        </Row>
        <ProgressBar progress={progress.ratio} tone="success" label={t('tasks.progress')} />
        <Text variant="caption" tone="muted">
          {t('tasks.progressLine', { done: progress.done, total: progress.total, percent: fmt.percent(progress.ratio) })}
        </Text>
      </Card>
      <ChoiceChips value={view} onChange={setView} options={[{ value: 'list', label: t('tasks.view.list') }, { value: 'calendar', label: t('tasks.view.calendar') }]} icons={{ list: 'list', calendar: 'calendar' }} />
      <MultiChips values={priorities} onChange={setPriorities} options={TASK_PRIORITIES.map((p) => ({ value: p, label: t(`priority.${p}`) }))} />

      {view === 'calendar' ? (
        <>
          <Card>
            <MonthCalendar month={month} onMonthChange={setMonth} selected={day} onSelect={setDay} marks={marks} today={today} />
          </Card>
          <SectionHeader title={fmt.day(day, 'full')} />
          <Card>
            {(byDate.get(day) ?? []).length === 0 ? (
              <Text tone="muted">{t('tasks.nothingThatDay')}</Text>
            ) : (
              (byDate.get(day) ?? []).map((task) => <TaskRow key={task.id} task={task} eventName={eventNames?.get(task.eventId)} today={today} />)
            )}
          </Card>
        </>
      ) : (
        BUCKETS.filter((b) => buckets[b].length > 0 && (b !== 'done' || showDone)).map((b) => (
          <View key={b}>
            <SectionHeader title={`${t(`tasks.bucket.${b}`)} (${buckets[b].length})`} />
            <Card>
              {buckets[b].map((task) => (
                <TaskRow key={task.id} task={task} eventName={eventNames?.get(task.eventId)} today={today} />
              ))}
            </Card>
          </View>
        ))
      )}
      {view === 'list' && buckets.done.length ? (
        <Pressable onPress={() => setShowDone((v) => !v)} accessibilityRole="button" style={{ alignSelf: 'center', padding: 8 }}>
          <Text tone="primary" style={{ fontWeight: '700' }}>
            {showDone ? t('tasks.hideDone') : t('tasks.showDone', { count: buckets.done.length })}
          </Text>
        </Pressable>
      ) : null}
    </Stack>
  );
}
