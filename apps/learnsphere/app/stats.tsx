import { addDays } from '@factory/app-core';
import { Button, Row, Screen, Stat, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarChart, LimitNotice, Panel, ProgressRing, Segmented, ShareBars } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { QUIZ_BANKS } from '@/content';
import { repos } from '@/database';
import { retentionRate } from '@/features/flashcards/scheduler';
import { goalCompletionRate, goalProgress } from '@/features/goals/goals';
import { completionRate } from '@/features/planner/planner';
import { quizStats } from '@/features/quiz/engine';
import { averagePerActiveDay, learningStreak, minutesBySubject, minutesPerDay, monthOverMonth, totalMinutes, weeklyTotals, weekOverWeek, type PeriodComparison } from '@/features/stats/stats';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

function Change({ c, label }: { c: PeriodComparison; label: string }) {
  const { t } = useTranslation();
  const up = c.change != null && c.change >= 0;
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
      <Text variant="heading">{fmt.duration(c.current)}</Text>
      <Text variant="caption" tone={c.change == null ? 'subtle' : up ? 'success' : 'muted'}>
        {c.change == null ? t('stats.noComparison') : t(up ? 'stats.up' : 'stats.down', { value: fmt.percent(Math.abs(c.change)) })}
      </Text>
    </View>
  );
}

export default function Stats() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [range, setRange] = useState<'7' | '30'>('7');
  const today = clock.today();
  const { data } = useAsync(async () => {
    const r = repos();
    const since = addDays(today, -400);
    const [log, subjects, reviews, attempts, sessions, goals, activity, activeDays, maturity] = await Promise.all([
      r.planner.logSince(since),
      r.subjects.list('all'),
      r.flashcards.reviewsSince(addDays(today, -30)),
      r.quiz.attempts({ since: addDays(today, -90) }),
      r.planner.sessionsBetween(addDays(today, -30), today),
      r.goals.list(true),
      r.goals.activity(addDays(today, -40)),
      r.goals.activeDays(since),
      r.flashcards.maturity(),
    ]);
    return { log, subjects, reviews, attempts, sessions, goals, activity, activeDays, maturity };
  }, []);
  if (!data) return <Screen edges={[]}>{null}</Screen>;

  const days = range === '30' && isPremium ? 30 : FREE_LIMITS.statsDays;
  const perDay = minutesPerDay(data.log, today, days);
  const from = addDays(today, -(days - 1));
  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const bySubject = minutesBySubject(data.log, from, today).slice(0, 8);
  const streak = learningStreak(data.activeDays, today);
  const sessionRate = completionRate(data.sessions, clock.now());
  const goalRate = goalCompletionRate(data.goals.map((g) => goalProgress(g, data.activity, today)));
  const retention = retentionRate(data.reviews.map((r) => r.grade));
  const quiz = quizStats(data.attempts);
  const weekly = weeklyTotals(data.log, today, 8);

  return (
    <Screen edges={[]} testID="stats-screen">
      <RouterStack.Screen options={{ title: t('stats.title') }} />
      <Row gap={3}>
        <Stat value={fmt.number(streak.current)} label={t('stats.streak')} icon="flame-outline" tone="accent" />
        <Stat value={fmt.number(streak.longest)} label={t('stats.bestStreak')} icon="trophy-outline" tone="warning" />
        <Stat value={fmt.duration(averagePerActiveDay(data.log))} label={t('stats.avgPerDay')} icon="time-outline" />
      </Row>

      <Panel title={t('stats.studyTime')} icon="bar-chart-outline">
        <Segmented
          value={range}
          onChange={(v) => (v === '30' && !isPremium ? router.push({ pathname: '/paywall', params: { source: 'stats' } }) : setRange(v))}
          options={[
            { value: '7', label: t('stats.last7') },
            { value: '30', label: isPremium ? t('stats.last30') : `${t('stats.last30')} · ${t('premium.badge')}` },
          ]}
        />
        <Text variant="bodySmall" tone="muted">
          {t('stats.total', { value: fmt.duration(totalMinutes(data.log, from, today)) })}
        </Text>
        <BarChart data={perDay.map((d, i) => ({ label: days <= 7 ? fmt.weekdayNarrow(d.day) : i % 5 === 0 ? String(Number(d.day.slice(8))) : '', value: d.minutes }))} format={(v) => String(v)} testID="study-chart" />
        <Text variant="caption" tone="subtle">
          {t('stats.minutesAxis')}
        </Text>
      </Panel>

      <Panel title={t('stats.bySubject')} icon="pie-chart-outline">
        {bySubject.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('stats.noData')}
          </Text>
        ) : (
          <ShareBars format={fmt.duration} data={bySubject.map((b) => ({ label: (b.subjectId && subjectById.get(b.subjectId)?.name) || t('common.noSubject'), value: b.minutes, color: (b.subjectId && subjectById.get(b.subjectId)?.color) || theme.colors.textSubtle }))} />
        )}
      </Panel>

      <Panel title={t('stats.completion')} icon="checkmark-done-outline">
        <Row gap={4} style={{ justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <ProgressRing progress={sessionRate ?? 0} size={80} label={sessionRate == null ? '–' : fmt.percent(sessionRate)} />
            <Text variant="caption" tone="subtle">
              {t('stats.sessionsDone')}
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <ProgressRing progress={goalRate ?? 0} size={80} label={goalRate == null ? '–' : fmt.percent(goalRate)} color={theme.colors.success} />
            <Text variant="caption" tone="subtle">
              {t('stats.goalsMet')}
            </Text>
          </View>
        </Row>
      </Panel>

      <Panel title={t('stats.flashcards')} icon="albums-outline">
        <Row gap={3}>
          <Stat value={fmt.number(data.reviews.length)} label={t('stats.reviews30')} icon="repeat-outline" />
          <Stat value={retention == null ? '–' : fmt.percent(retention)} label={t('stats.retention')} icon="checkmark-circle-outline" tone="success" />
        </Row>
        <ShareBars
          format={(v) => fmt.number(v)}
          data={(['new', 'learning', 'young', 'mature'] as const).map((k, i) => ({ label: t(`flashcards.maturity.${k}`), value: data.maturity[k], color: [theme.colors.accent, theme.colors.warning, theme.colors.primary, theme.colors.success][i] as string }))}
        />
      </Panel>

      <Panel title={t('stats.quizzes')} icon="help-circle-outline">
        <Row gap={3}>
          <Stat value={fmt.number(quiz.attempts)} label={t('quiz.attempts')} icon="checkbox-outline" />
          <Stat value={`${quiz.average}%`} label={t('quiz.average')} icon="analytics-outline" tone="accent" />
          <Stat value={fmt.percent(quiz.accuracy)} label={t('stats.accuracy')} icon="locate-outline" tone="success" />
        </Row>
        {isPremium ? (
          <ShareBars
            format={(v) => `${v}%`}
            data={QUIZ_BANKS.map((b) => {
              const s = quizStats(data.attempts.filter((a) => a.bankId === b.id));
              return { label: t(`quiz.banks.${b.id}`), value: s.average, color: b.color };
            }).filter((x) => x.value > 0)}
          />
        ) : null}
      </Panel>

      {isPremium ? (
        <Panel title={t('stats.comparisons')} icon="swap-vertical-outline">
          <Row gap={3}>
            <Change c={weekOverWeek(data.log, today)} label={t('stats.thisWeek')} />
            <Change c={monthOverMonth(data.log, today)} label={t('stats.thisMonth')} />
          </Row>
          <BarChart data={weekly.map((w) => ({ label: fmt.day(w.weekStart, { day: 'numeric', month: 'numeric' }), value: w.minutes }))} format={(v) => (v >= 60 ? `${Math.round(v / 60)}h` : String(v))} />
          <Text variant="caption" tone="subtle">
            {t('stats.weeklyTrend')}
          </Text>
        </Panel>
      ) : (
        <LimitNotice message={t('limits.stats')} onUpgrade={() => router.push({ pathname: '/paywall', params: { source: 'stats' } })} />
      )}
      <Button size="md" variant="ghost" label={t('goals.title')} icon="flag-outline" onPress={() => router.push('/goals')} />
    </Screen>
  );
}
