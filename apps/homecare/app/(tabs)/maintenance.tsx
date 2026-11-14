import { Badge, Button, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { Segmented } from '@/components/forms';
import { AdBanner } from '@/components/media';
import { MonthCalendar } from '@/components/MonthCalendar';
import { DueBadge, Fab, ItemRow, PriorityBadge, ScreenHeader, SearchBar } from '@/components/ui';
import { HOUSEHOLD_ICONS, MAINTENANCE_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { dueStatus, type DueStatus } from '@/domain/recurrence';
import type { HouseholdTask, MaintenanceTask } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';

type Mode = 'maintenance' | 'household';
type View_ = 'list' | 'calendar';

const GROUPS: DueStatus[] = ['overdue', 'today', 'soon', 'upcoming', 'none'];

function groupBy<T>(items: T[], due: (i: T) => string | null, today: string): Record<DueStatus, T[]> {
  const out: Record<DueStatus, T[]> = { overdue: [], today: [], soon: [], upcoming: [], done: [], none: [] };
  for (const i of items) out[dueStatus(due(i), today)].push(i);
  return out;
}

export default function MaintenanceTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ tab?: string }>();
  const home = useActiveHome();
  const today = useToday();
  const [mode, setMode] = useState<Mode>(params.tab === 'household' ? 'household' : 'maintenance');
  const [view, setView] = useState<View_>('list');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(today);

  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [tasks, chores, members] = await Promise.all([r.maintenance.list(home.id, { search }), r.household.list(home.id, { open: true, search }), r.household.listMembers(home.id)]);
    return { tasks, chores, members: new Map(members.map((m) => [m.id, m])) };
  }, [home?.id, search]);

  const quickDone = (task: HouseholdTask) =>
    mutate(() => repos().household.complete(task.id, today)).catch(() => Alert.alert(t('common.error'), t('common.saveFailed')));

  const marks: Record<string, string[]> = {};
  for (const task of data?.tasks ?? []) if (task.nextDue) (marks[task.nextDue] ??= []).push(task.nextDue < today ? theme.colors.danger : theme.colors.primary);
  for (const c of data?.chores ?? []) if (c.dueDate) (marks[c.dueDate] ??= []).push(theme.colors.accent);

  const taskRow = (task: MaintenanceTask) => (
    <ItemRow
      key={task.id}
      icon={MAINTENANCE_ICONS[task.category]}
      title={task.title}
      subtitle={[t(`frequencies.${task.frequency}`), task.estimatedMinutes ? t('common.minutes', { count: task.estimatedMinutes }) : null].filter(Boolean).join(' · ')}
      meta={task.priority === 'high' || task.priority === 'urgent' ? <PriorityBadge priority={task.priority} /> : undefined}
      right={<DueBadge status={dueStatus(task.nextDue, today)} date={task.nextDue} today={today} />}
      onPress={() => router.push(`/maintenance/${task.id}`)}
    />
  );

  const choreRow = (c: HouseholdTask) => {
    const member = c.assigneeId ? data?.members.get(c.assigneeId) : undefined;
    return (
      <ItemRow
        key={c.id}
        icon={HOUSEHOLD_ICONS[c.category]}
        tint={theme.colors.accent}
        title={c.title}
        subtitle={[c.recurrence !== 'once' ? t(`recurrences.${c.recurrence}`) : null, member?.name].filter(Boolean).join(' · ') || t(`householdCategories.${c.category}`)}
        right={
          <Row gap={2}>
            <DueBadge status={dueStatus(c.dueDate, today)} date={c.dueDate} today={today} />
            <IconButton icon="checkmark-circle-outline" tone="primary" label={t('household.markDone')} onPress={() => void quickDone(c)} />
          </Row>
        }
        onPress={() => router.push(`/household/${c.id}`)}
      />
    );
  };

  if (!home) return <Screen><EmptyState icon="home-outline" title={t('dashboard.noHome')} /></Screen>;

  const tasks = data?.tasks ?? [];
  const chores = data?.chores ?? [];
  const dayTasks = selectedDay ? tasks.filter((x) => x.nextDue === selectedDay) : [];
  const dayChores = selectedDay ? chores.filter((x) => x.dueDate === selectedDay) : [];
  const grouped = mode === 'maintenance' ? groupBy(tasks, (x) => x.nextDue, today) : groupBy(chores, (x) => x.dueDate, today);

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="maintenance-tab">
        <ScreenHeader
          title={t('tabs.maintenance')}
          right={
            <>
              <IconButton icon={view === 'list' ? 'calendar-outline' : 'list-outline'} label={t(view === 'list' ? 'maintenance.calendarView' : 'maintenance.listView')} onPress={() => setView(view === 'list' ? 'calendar' : 'list')} />
              <IconButton icon="time-outline" label={t('history.title')} onPress={() => router.push('/history')} />
              {mode === 'household' ? <IconButton icon="people-outline" label={t('members.title')} onPress={() => router.push('/household/members')} /> : null}
            </>
          }
        />
        <Segmented options={['maintenance', 'household'] as const} value={mode} onChange={setMode} renderLabel={(m) => t(`maintenance.modes.${m}`)} />

        {view === 'calendar' ? (
          <>
            <MonthCalendar month={month} onMonthChange={setMonth} selected={selectedDay} onSelect={setSelectedDay} marks={marks} />
            <SectionHeader title={selectedDay ? fmt.day(selectedDay, 'long') : ''} />
            {dayTasks.length + dayChores.length === 0 ? (
              <Text variant="bodySmall" tone="muted">
                {t('maintenance.nothingThatDay')}
              </Text>
            ) : null}
            <Stack gap={2}>
              {dayTasks.map(taskRow)}
              {dayChores.map(choreRow)}
            </Stack>
          </>
        ) : (
          <>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('maintenance.search')} />
            {mode === 'maintenance' && data && tasks.length === 0 && !search ? (
              <EmptyState
                icon="construct-outline"
                title={t('maintenance.emptyTitle')}
                message={t('maintenance.emptyMessage')}
                action={<Button label={t('maintenance.browseTemplates')} icon="sparkles-outline" onPress={() => router.push('/maintenance/templates')} />}
              />
            ) : null}
            {mode === 'household' && data && chores.length === 0 && !search ? (
              <EmptyState icon="checkbox-outline" title={t('household.emptyTitle')} message={t('household.emptyMessage')} />
            ) : null}
            {mode === 'maintenance' && tasks.length > 0 ? (
              <Button label={t('maintenance.browseTemplates')} icon="sparkles-outline" variant="secondary" size="md" onPress={() => router.push('/maintenance/templates')} />
            ) : null}
            {GROUPS.map((g) => {
              const list = (grouped[g] as (MaintenanceTask | HouseholdTask)[]) ?? [];
              if (list.length === 0) return null;
              return (
                <Stack key={g} gap={2}>
                  <Row gap={2}>
                    <Badge label={t(`maintenance.groups.${g}`)} tone={g === 'overdue' ? 'danger' : g === 'today' || g === 'soon' ? 'warning' : g === 'none' ? 'neutral' : 'primary'} />
                    <Text variant="caption" tone="subtle">
                      {list.length}
                    </Text>
                  </Row>
                  {mode === 'maintenance' ? (list as MaintenanceTask[]).map(taskRow) : (list as HouseholdTask[]).map(choreRow)}
                </Stack>
              );
            })}
          </>
        )}
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab
        label={mode === 'maintenance' ? t('maintenance.add') : t('household.add')}
        testID="add-task"
        onPress={() => router.push(mode === 'maintenance' ? '/maintenance/edit' : '/household/edit')}
      />
    </View>
  );
}
