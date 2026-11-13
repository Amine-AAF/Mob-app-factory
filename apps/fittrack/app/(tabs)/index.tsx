import { Badge, Button, Card, EmptyState, Icon, ListRow, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { MetricCard, ProgressRing } from '@/components/charts';
import { repos } from '@/database';
import { goalProgress } from '@/features/goals/goals';
import { nextPlanned } from '@/features/planner/plan';
import { activeDays, dayStreak, thisWeek, weekStreak } from '@/features/stats/stats';
import { elapsedMs } from '@/features/workout/engine';
import { formatDuration } from '@/features/units';
import { useData, useExercises, useFormat, useNow } from '@/hooks';
import { fmt } from '@/i18n';
import { goalContext, loadProgress } from '@/services/progressService';
import { discard, startFromProgramDay, WorkoutError } from '@/services/workoutService';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

/** Home dashboard: what's next, this week, goals, recent performances, quick start. */
export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = useSession((s) => s.today);
  const premium = useIsPremium();
  const weeklyTarget = usePreferences((s) => s.weeklyTarget);
  const f = useFormat();
  const ex = useExercises();
  const now = useNow(1000);

  const { data } = useData(
    async (r) => {
      const [progress, active, entries, routine, routineStart, programs, goals, favorites, recentSessions] = await Promise.all([
        loadProgress(r, { premium }),
        r.sessions.active(),
        r.planner.entries(today, addDays(today, 14)),
        r.planner.routine(),
        r.settings.get<string | null>('routine_start', null),
        r.programs.list(),
        r.goals.list(),
        r.exercises.favorites(),
        r.sessions.completedWithExercises({ limit: 3 }),
      ]);
      return { progress, active, next: nextPlanned(today, entries, routine, routineStart), programs, goals, favorites, recentSessions };
    },
    [today, premium],
  );

  const week = useMemo(() => (data ? thisWeek(data.progress.sessions, data.progress.cardio, today) : null), [data, today]);
  const days = useMemo(() => (data ? activeDays(data.progress.sessions, data.progress.cardio) : new Set<string>()), [data]);
  const streak = dayStreak(days, today);
  const wStreak = weekStreak(days, today, weeklyTarget);

  if (!data || !week) return <Screen>{null}</Screen>;
  const { active, next, programs } = data;
  const nextProgram = next?.programId ? programs.find((p) => p.id === next.programId) : null;
  const nextDay = nextProgram?.days.find((d) => d.id === next?.programDayId) ?? nextProgram?.days[0];
  const currentProgram = programs[0];
  const activeGoals = data.goals.filter((g) => g.active).slice(0, 3);
  const ctx = goalContext(data.progress);

  const start = async (programId: string, dayId: string) => {
    try {
      await startFromProgramDay(repos(), programId, dayId);
      router.push('/workout/active');
    } catch (e) {
      if (e instanceof WorkoutError && e.code === 'already_active') router.push('/workout/active');
      else if (e instanceof WorkoutError && e.code === 'empty') Alert.alert(t('workout.emptyTitle'), t('workout.emptyBody'));
    }
  };

  return (
    <Screen testID="home">
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            {fmt.longDay(fromDayKey(today))}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {t('home.title')}
          </Text>
        </Stack>
        <ProgressRing ratio={Math.min(1, week.sessions / Math.max(1, weeklyTarget))} size={58} label={t('home.weekRingA11y', { done: week.sessions, target: weeklyTarget })}>
          <Text variant="subheading">{`${week.sessions}/${weeklyTarget}`}</Text>
        </ProgressRing>
      </Row>

      {active ? (
        <Card tone="primary" onPress={() => router.push('/workout/active')} accessibilityLabel={t('home.resumeA11y', { name: active.name })} testID="resume-card">
          <Row gap={2}>
            <Icon name="play-circle" size={28} color={theme.colors.primary} />
            <Stack gap={0} style={{ flex: 1 }}>
              <Text variant="subheading">{t('home.inProgress')}</Text>
              <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                {`${active.name} · ${formatDuration(elapsedMs(active, now) / 1000)}${active.status === 'paused' ? ` · ${t('workout.paused')}` : ''}`}
              </Text>
            </Stack>
          </Row>
          <Row>
            <View style={{ flex: 1 }}>
              <Button label={t('home.resume')} size="md" onPress={() => router.push('/workout/active')} />
            </View>
            <Button
              label={t('common.discard')}
              size="md"
              variant="ghost"
              onPress={() =>
                Alert.alert(t('workout.discardTitle'), t('workout.discardBody'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.discard'), style: 'destructive', onPress: () => void discard(repos(), active.id) },
                ])
              }
            />
          </Row>
        </Card>
      ) : (
        <Card>
          <Text variant="label" tone="muted">
            {t('home.nextSession')}
          </Text>
          {next && next.kind === 'workout' && nextProgram && nextDay ? (
            <>
              <Text variant="heading">{nextProgram.days.length > 1 ? `${nextProgram.name} · ${nextDay.name}` : nextProgram.name}</Text>
              <Text variant="bodySmall" tone="muted">
                {next.day === today ? t('home.today') : fmt.longDay(fromDayKey(next.day))}
                {` · ${t('home.exerciseCount', { count: nextDay.exercises.length })}`}
              </Text>
              <Button label={t('home.startNow')} icon="play" onPress={() => void start(nextProgram.id, nextDay.id)} testID="start-next" />
            </>
          ) : currentProgram && currentProgram.days[0] ? (
            <>
              <Text variant="heading">{currentProgram.name}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('home.noPlanned')}
              </Text>
              <Row>
                <View style={{ flex: 1 }}>
                  <Button label={t('home.startProgram')} icon="play" size="md" onPress={() => void start(currentProgram.id, currentProgram.days[0]!.id)} />
                </View>
                <Button label={t('home.plan')} size="md" variant="secondary" onPress={() => router.push('/(tabs)/planner')} />
              </Row>
            </>
          ) : (
            <>
              <Text>{t('home.noProgram')}</Text>
              <Row>
                <View style={{ flex: 1 }}>
                  <Button label={t('home.browseTemplates')} size="md" onPress={() => router.push({ pathname: '/(tabs)/workouts', params: { tab: 'templates' } })} />
                </View>
              </Row>
            </>
          )}
          <Button label={t('home.quickStart')} variant="ghost" icon="flash" size="md" onPress={() => router.push({ pathname: '/exercise/pick', params: { mode: 'quick' } })} testID="quick-start" />
        </Card>
      )}

      <Row gap={3} wrap>
        <MetricCard icon="checkmark-done" value={String(week.sessions)} label={t('home.sessionsThisWeek')} />
        <MetricCard icon="time" value={f.minutes(week.minutes)} label={t('home.timeThisWeek')} tone="accent" />
      </Row>
      <Row gap={3} wrap>
        <MetricCard icon="flame" value={t('home.days', { count: streak.current })} label={t('home.activeStreak')} tone="warning" />
        <MetricCard icon="calendar" value={t('home.weeks', { count: wStreak.current })} label={t('home.weekStreak', { count: weeklyTarget })} tone="success" />
      </Row>
      <Text variant="caption" tone="subtle">
        {t('home.restNote')}
      </Text>

      {activeGoals.length ? (
        <>
          <SectionHeader title={t('home.goals')} action={t('common.seeAll')} onAction={() => router.push('/goals')} />
          <Card>
            {activeGoals.map((g) => {
              const p = goalProgress(g, ctx);
              return (
                <Stack key={g.id} gap={1}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text variant="bodySmall">{t(`goalKinds.${g.kind}`, { name: g.exerciseId ? (ex.get(g.exerciseId)?.name ?? '') : '' })}</Text>
                    <Text variant="bodySmall" tone={p.reached ? 'success' : 'muted'}>{`${fmt.number(p.current)} / ${fmt.number(p.target)}`}</Text>
                  </Row>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceAlt }}>
                    <View style={{ height: 6, borderRadius: 3, width: `${Math.round(p.ratio * 100)}%`, backgroundColor: p.reached ? theme.colors.success : theme.colors.primary }} />
                  </View>
                </Stack>
              );
            })}
          </Card>
        </>
      ) : null}

      <SectionHeader title={t('home.recent')} action={t('common.seeAll')} onAction={() => router.push('/history')} />
      {data.recentSessions.length ? (
        <Card>
          {data.recentSessions.map((s) => (
            <ListRow
              key={s.id}
              icon="barbell-outline"
              title={s.name}
              subtitle={`${fmt.shortDay(fromDayKey(s.day))} · ${f.duration(s.durationSec)} · ${t('home.setCount', { count: s.exercises.reduce((a, e) => a + e.sets.length, 0) })}`}
              onPress={() => router.push({ pathname: '/session/[id]', params: { id: s.id } })}
            />
          ))}
        </Card>
      ) : (
        <EmptyState icon="barbell-outline" title={t('home.noHistoryTitle')} message={t('home.noHistoryBody')} />
      )}

      {data.favorites.length ? (
        <>
          <SectionHeader title={t('home.favorites')} />
          <Row wrap gap={2}>
            {data.favorites.slice(0, 8).map((id) => (
              <Badge key={id} label={ex.get(id)?.name ?? id} tone="neutral" icon="star" />
            ))}
          </Row>
        </>
      ) : null}

      <SectionHeader title={t('home.shortcuts')} />
      <Row gap={3} wrap>
        <MetricCard icon="timer-outline" value={t('home.timers')} label={t('home.timersSub')} onPress={() => router.push('/tools')} />
        <MetricCard icon="walk-outline" value={t('home.cardio')} label={t('home.cardioSub')} tone="accent" onPress={() => router.push('/cardio/edit')} />
      </Row>
    </Screen>
  );
}
