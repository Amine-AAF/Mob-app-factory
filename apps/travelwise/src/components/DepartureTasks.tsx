import { Badge, Button, Card, Chip, Icon, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { repos } from '@/database';
import { taskProgress } from '@/database/repositories/checklists';
import type { TripDetails } from '@/database/repositories/trips';
import { addSuggestedTasks, addTask, setTaskStatus } from '@/features/checklists/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/utils/clock';

import { TextField } from './TextField';

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

/** Pre-departure checklist with progress, suggestions and reminders. */
export function DepartureTasks({ trip }: { trip: TripDetails }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { data: items } = useAsync(() => repos().checklists.items(trip.id), [trip.id]);
  const [title, setTitle] = useState('');
  const [international, setInternational] = useState(trip.destinations.some((d) => !!d.countryCode) || !!trip.countryCode);
  const today = clock.today();
  const heading = t('tasks.reminderHeading', { trip: trip.name });
  const listName = t('tasks.listName');
  const progress = items ? taskProgress(items) : null;
  const fail = (e: unknown) => {
    recordError(e, 'tasks');
    Alert.alert(t('tripForm.errors.generic'));
  };

  return (
    <Stack gap={3} testID="departure-tasks">
      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="alert-circle-outline" size={18} color={theme.colors.warning} />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {t('tasks.officialDisclaimer')}
          </Text>
        </Row>
      </Card>
      {progress !== null ? (
        <Stack gap={1}>
          <Text variant="bodySmall" tone="muted">
            {t('tasks.progress', { percent: fmt.percent(progress) })}
          </Text>
          <ProgressBar progress={progress} tone={progress >= 1 ? 'success' : 'primary'} label={t('tasks.progress', { percent: fmt.percent(progress) })} />
        </Stack>
      ) : null}
      {(items ?? []).map((item) => {
        const done = item.status === 'done';
        const overdue = !done && item.dueDate && item.dueDate < today;
        return (
          <Row key={item.id} gap={2} style={{ minHeight: 48 }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={item.title}
              testID={`task-${item.id}`}
              onPress={() => setTaskStatus(trip.id, item.id, done ? 'todo' : 'done', heading).catch(fail)}
              style={{ flex: 1, flexDirection: 'row', gap: theme.spacing(3), alignItems: 'center', paddingVertical: theme.spacing(1.5) }}
            >
              <Icon name={done ? 'checkmark-circle' : item.status === 'in_progress' ? 'ellipse-outline' : 'radio-button-off'} size={24} color={done ? theme.colors.success : theme.colors.textMuted} />
              <Stack gap={0.5} style={{ flex: 1 }}>
                <Text style={done ? { textDecorationLine: 'line-through', color: theme.colors.textMuted } : undefined}>{item.title}</Text>
                <Row gap={2} wrap>
                  {item.dueDate ? <Badge label={t('tasks.due', { date: fmt.shortDate(item.dueDate) })} tone={overdue ? 'danger' : 'neutral'} icon="calendar-outline" /> : null}
                  {!done ? <Badge label={t(`enums.priority.${item.priority}`)} tone={PRIORITY_TONE[item.priority]} /> : null}
                  {item.reminderAt && item.notificationId && !done ? <Badge label={t('tasks.reminderSet')} tone="primary" icon="notifications-outline" /> : null}
                </Row>
              </Stack>
            </Pressable>
            <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/trip/[id]/task', params: { id: trip.id, taskId: item.id } })} size={18} />
          </Row>
        );
      })}
      <Row gap={2} style={{ alignItems: 'flex-end' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <TextField label={t('tasks.newTask')} value={title} onChangeText={setTitle} testID="task-new-title" />
        </Stack>
        <Button
          label={t('common.add')}
          icon="add"
          disabled={!title.trim()}
          onPress={() =>
            addTask(trip.id, listName, { title }, heading)
              .then(() => setTitle(''))
              .catch(fail)
          }
          testID="task-add"
        />
      </Row>
      <Row gap={2} wrap>
        <Chip label={t('tasks.international')} selected={international} icon={international ? 'checkmark' : undefined} onPress={() => setInternational(!international)} />
        <Button
          label={t('tasks.addSuggested')}
          variant="secondary"
          icon="sparkles-outline"
          testID="tasks-suggested"
          onPress={() =>
            addSuggestedTasks(trip.id, listName, i18n.language, { international, startDate: trip.startDate, today })
              .then((n) => Alert.alert(t('tasks.suggestedAdded', { count: n })))
              .catch(fail)
          }
        />
      </Row>
    </Stack>
  );
}
