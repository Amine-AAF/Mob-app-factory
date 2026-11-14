import { addDays, fromDayKey, startOfWeek } from '@factory/app-core';
import { Button, Card, Icon, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { WeeklyCalendar } from '@/components/calendar';
import { DailyTaskCard } from '@/components/DailyTaskCard';
import { DayHabitList } from '@/components/DayHabitList';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedBar, Fab, Toast } from '@/components/ui';
import { loadSnapshot, repos } from '@/database';
import { levelInfo, weeklyGoalProgress } from '@/features/gamification/rewards';
import { isOverdue, sortTasks } from '@/features/planner/tasks';
import { buildInsights } from '@/features/statistics/insights';
import { overview } from '@/features/statistics/stats';
import { habitsForDay, indexLogs } from '@/features/tracking/progress';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { toggleTask } from '@/services/habitService';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

const POSITIVE_KEYS = ['today.cheer.1', 'today.cheer.2', 'today.cheer.3', 'today.cheer.4'];

export default function TodayScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = useToday();
  const prefs = usePreferences();
  const [toast, setToast] = useState<string | null>(null);

  const { data } = useAsync(async () => {
    const r = repos();
    const snapshot = await loadSnapshot(r.db);
    const o = overview(snapshot, today);
    const [tasks, xp] = await Promise.all([r.tasks.forDay(today, true), r.logs.totalXp()]);
    return { snapshot, o, due: habitsForDay(snapshot, today, indexLogs(snapshot.logs)), tasks: sortTasks(tasks), xp, activeHabits: snapshot.habits.filter((h) => !h.archivedOn).length };
  }, [today]);

  // Badge unlocks are announced once, politely (store subscription, not a render-time effect).
  useEffect(
    () =>
      useSession.subscribe((s) => {
        if (!s.pendingAchievements.length) return;
        const ids = useSession.getState().takeAchievements();
        if (ids[0]) setToast(t('badges.unlocked', { name: t(`badges.items.${ids[0]}.name`) }));
      }),
    [t],
  );

  const onCompleted = useCallback(
    (xp: number) => {
      const cheer = t(POSITIVE_KEYS[Math.floor(clock.now().getTime() / 1000) % POSITIVE_KEYS.length]!);
      setToast(xp > 0 ? t('today.cheerXp', { cheer, xp }) : cheer);
    },
    [t],
  );

  const hour = clock.now().getHours();
  const greeting = hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const summary = data?.o.today;
  const percent = summary && summary.expected ? Math.round(summary.ratio * 100) : 0;
  const monday = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i);
    const s = data?.o.last7.find((d) => d.day === day);
    return { day, state: s?.state ?? 'none', ratio: s?.ratio ?? 0 };
  });
  const level = levelInfo(data?.xp ?? 0);
  const goal = weeklyGoalProgress(data?.o.thisWeek ?? null, prefs.weeklyGoalPercent);
  const insight = data ? buildInsights(data.o)[0] : undefined;
  const streaks = data ? new Map([...data.o.perHabit].map(([id, s]) => [id, s.streak])) : undefined;

  const openCreate = () =>
    Alert.alert(t('today.createTitle'), undefined, [
      { text: t('today.createHabit'), onPress: () => router.push('/habit/edit') },
      { text: t('today.createFromTemplate'), onPress: () => router.push('/templates') },
      { text: t('today.createTask'), onPress: () => router.push({ pathname: '/task/edit', params: { day: today } }) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="today-screen">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">
              {fmt.longDay(fromDayKey(today))}
            </Text>
            <Text variant="title">{t(`today.greeting.${greeting}`)}</Text>
          </View>
          <Card onPress={() => router.push('/achievements')} style={{ paddingVertical: 6, paddingHorizontal: 10 }} accessibilityLabel={t('today.levelA11y', { level: level.level, xp: data?.xp ?? 0 })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="star" size={14} color={theme.colors.accent} />
              <Text variant="caption">{t('today.level', { level: level.level })}</Text>
            </View>
          </Card>
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <ProgressRing progress={summary?.ratio ?? 0} size={112} thickness={9} accessibilityLabel={t('today.progressA11y', { percent })}>
              <Text variant="title">{`${percent}%`}</Text>
              <Text variant="caption" tone="muted">
                {t('today.done')}
              </Text>
            </ProgressRing>
            <View style={{ flex: 1, gap: 8 }}>
              <Text variant="subheading">{t('today.progressTitle')}</Text>
              <Text variant="bodySmall" tone="muted">
                {summary?.expected ? t('today.completedCount', { done: summary.completed, total: summary.expected }) : t('today.nothingScheduled')}
              </Text>
              {summary?.expected ? (
                <Text variant="bodySmall" tone={summary.completed === summary.expected ? 'success' : 'muted'}>
                  {summary.completed === summary.expected ? t('today.allDone') : t('today.remaining', { count: summary.expected - summary.completed })}
                </Text>
              ) : null}
              <AnimatedBar progress={summary?.ratio ?? 0} label={t('today.progressA11y', { percent })} />
            </View>
          </View>
        </Card>

        <WeeklyCalendar days={week} selected={today} today={today} onSelect={(d) => d !== today && router.push({ pathname: '/day/[day]', params: { day: d } })} />

        <SectionHeader title={t('today.habitsTitle')} action={t('today.seeAll')} onAction={() => router.push('/(tabs)/habits')} />
        {data ? <DayHabitList day={today} due={data.due} streaks={streaks} onCompleted={onCompleted} emptyAction={data.activeHabits === 0} /> : null}

        {data && data.activeHabits > 0 ? (
          <Card tone="alt">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="subheading">{t('today.weeklyGoal', { percent: prefs.weeklyGoalPercent })}</Text>
              <Text variant="subheading" tone={goal.reached ? 'success' : 'primary'}>{`${goal.percent}%`}</Text>
            </View>
            <AnimatedBar progress={goal.percent / Math.max(1, prefs.weeklyGoalPercent)} color={goal.reached ? theme.colors.success : undefined} height={8} label={t('today.weeklyGoal', { percent: prefs.weeklyGoalPercent })} />
            <Text variant="caption" tone="muted">
              {goal.reached ? t('today.goalReached') : t('today.goalHint')}
            </Text>
          </Card>
        ) : null}

        {prefs.showPlannerOnToday ? (
          <Stack gap={3}>
            <SectionHeader title={t('today.plannerTitle')} action={t('today.openPlanner')} onAction={() => router.push({ pathname: '/planner', params: { day: today } })} />
            {data && data.tasks.length ? (
              data.tasks.slice(0, 4).map((task) => (
                <DailyTaskCard key={task.id} task={task} overdue={isOverdue(task, today)} onToggle={() => void toggleTask(task.id, !task.done)} onOpen={() => router.push({ pathname: '/task/edit', params: { id: task.id } })} />
              ))
            ) : (
              <Button label={t('today.addTask')} icon="add" variant="ghost" size="md" onPress={() => router.push({ pathname: '/task/edit', params: { day: today } })} />
            )}
          </Stack>
        ) : null}

        {prefs.showInsightOnToday && insight ? (
          <Card onPress={() => router.push('/(tabs)/insights')} tone="primary">
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="bulb-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t(insight.key, insight.params)}
              </Text>
            </View>
          </Card>
        ) : null}
        <View style={{ height: 64 }} />
      </Screen>
      <Fab onPress={openCreate} label={t('today.createTitle')} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}
