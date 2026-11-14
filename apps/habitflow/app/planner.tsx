import { addDays, fromDayKey } from '@factory/app-core';
import { Button, EmptyState, IconButton, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DailyTaskCard } from '@/components/DailyTaskCard';
import { repos } from '@/database';
import { isOverdue, reorder, sortTasks } from '@/features/planner/tasks';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { reorderTasks, toggleTask } from '@/services/habitService';

/** Light daily planner: one day at a time, manual order, overdue tasks surface on today. */
export default function PlannerScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const params = useLocalSearchParams<{ day?: string }>();
  const [day, setDay] = useState(params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : today);

  const { data: tasks } = useAsync(async () => sortTasks(await repos().tasks.forDay(day, day === today)), [day, today]);
  const label = day === today ? t('planner.today') : day === addDays(today, 1) ? t('planner.tomorrow') : fmt.longDay(fromDayKey(day));

  return (
    <>
      <RouterStack.Screen options={{ title: t('planner.title') }} />
      <Screen edges={[]} footer={<Button label={t('planner.add')} icon="add" onPress={() => router.push({ pathname: '/task/edit', params: { day } })} testID="add-task" />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton icon="chevron-back" label={t('calendar.previous')} onPress={() => setDay(addDays(day, -1))} />
          <Text variant="heading" style={{ textTransform: 'capitalize' }}>
            {label}
          </Text>
          <IconButton icon="chevron-forward" label={t('calendar.next')} onPress={() => setDay(addDays(day, 1))} />
        </View>
        {tasks && tasks.length === 0 ? <EmptyState icon="checkbox-outline" title={t('planner.emptyTitle')} message={t('planner.emptyBody')} /> : null}
        <Stack gap={2}>
          {(tasks ?? []).map((task) => (
            <DailyTaskCard
              key={task.id}
              task={task}
              overdue={isOverdue(task, today)}
              onToggle={() => void toggleTask(task.id, !task.done)}
              onOpen={() => router.push({ pathname: '/task/edit', params: { id: task.id } })}
              onMove={(dir) => void reorderTasks(reorder(tasks ?? [], task.id, dir))}
            />
          ))}
        </Stack>
      </Screen>
    </>
  );
}
