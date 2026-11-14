import { Card, EmptyState, ListRow, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BarChart, DistributionBars, MetricCard } from '@/components/charts';
import { AdBanner, InfoNote, KeyValue, PremiumGate } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { averagePerWeek, categoryDistribution, monthly, topExercises, totals, weeklyFrequency, yearly } from '@/features/stats/stats';
import { useData, useExercises, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { loadProgress, recordDays } from '@/services/progressService';
import { useIsPremium, useSession } from '@/store/session';

/**
 * Statistics. Free: totals, 8-week frequency, top exercises (last 90 days).
 * Premium: full history, monthly & yearly evolution, muscle-group distribution, records.
 * Everything is computed from logged data only.
 */
export default function Stats() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const ex = useExercises();
  const f = useFormat();
  const { data } = useData(
    async (r) => {
      const progress = await loadProgress(r, { premium });
      const since = premium ? undefined : addDays(clock.today(), -FREE_LIMITS.historyDays);
      return { progress, facts: await r.sessions.setFacts({ since }) };
    },
    [premium, today],
  );
  const s = useMemo(() => {
    if (!data) return null;
    const { sessions, cardio, records } = data.progress;
    return {
      totals: totals(sessions, cardio),
      perWeek: averagePerWeek(sessions, today),
      weekly: weeklyFrequency(sessions, today, premium ? 12 : 8),
      months: monthly(sessions, cardio, today, 12),
      years: yearly(sessions, cardio),
      top: topExercises(data.facts, premium ? 10 : 3),
      dist: categoryDistribution(data.facts),
      records: recordDays(records).length,
    };
  }, [data, today, premium]);
  if (!s || !data) return null;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('stats.title') }} />
      {s.totals.sessions + s.totals.cardio === 0 ? <EmptyState icon="stats-chart-outline" title={t('stats.emptyTitle')} message={t('stats.emptyBody')} /> : null}
      <Row gap={3}>
        <MetricCard icon="barbell" value={String(s.totals.sessions)} label={t('stats.workouts')} />
        <MetricCard icon="walk" value={String(s.totals.cardio)} label={t('stats.cardio')} tone="accent" />
      </Row>
      <Row gap={3}>
        <MetricCard icon="time" value={f.minutes(s.totals.minutes)} label={t('stats.totalTime')} tone="success" />
        <MetricCard icon="repeat" value={s.perWeek === null ? '—' : fmt.number(s.perWeek, 1)} label={t('stats.perWeek')} tone="warning" />
      </Row>
      <Card>
        <Text variant="subheading">{t('stats.weekly')}</Text>
        <BarChart data={s.weekly.map((w, i) => ({ label: fmt.shortDay(fromDayKey(w.weekStart)), value: w.sessions || null, highlight: i === s.weekly.length - 1 }))} summary={t('progress.frequencyA11y', { values: s.weekly.map((w) => w.sessions).join(', ') })} />
      </Card>
      <SectionHeader title={t('stats.topExercises')} />
      <Card>
        {s.top.length ? (
          s.top.map((x) => <ListRow key={x.exerciseId} title={ex.get(x.exerciseId)?.name ?? x.exerciseId} subtitle={t('stats.topRow', { sessions: x.sessions, sets: x.sets })} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: x.exerciseId } })} />)
        ) : (
          <Text tone="subtle">{t('stats.noData')}</Text>
        )}
      </Card>

      {premium ? (
        <>
          <SectionHeader title={t('stats.distribution')} />
          <Card>
            {s.dist.length ? (
              <DistributionBars rows={s.dist.map((d) => ({ label: t(`categories.${d.category}`), ratio: d.ratio, value: fmt.percent(d.ratio) }))} summary={t('stats.distributionA11y')} />
            ) : (
              <Text tone="subtle">{t('stats.noData')}</Text>
            )}
            <InfoNote text={t('stats.distributionNote')} />
          </Card>
          <SectionHeader title={t('stats.monthly')} />
          <Card>
            <BarChart data={s.months.map((m, i) => ({ label: fmt.monthShort(fromDayKey(`${m.month}-01`)), value: m.sessions + m.cardio || null, highlight: i === s.months.length - 1 }))} summary={t('stats.monthlyA11y')} />
          </Card>
          <SectionHeader title={t('stats.yearly')} />
          <Card>
            {s.years.length ? s.years.map((y) => <KeyValue key={y.year} label={y.year} value={t('stats.yearRow', { sessions: y.sessions, hours: Math.round(y.minutes / 60), days: y.activeDays })} />) : <Text tone="subtle">{t('stats.noData')}</Text>}
          </Card>
          <Card>
            <KeyValue label={t('stats.recordsBeaten')} value={String(s.records)} />
          </Card>
        </>
      ) : (
        <PremiumGate title={t('premium.detailedStatsTitle')} message={t('premium.detailedStatsBody')} source="stats" />
      )}
      {data.progress.limited ? <Text variant="caption" tone="subtle">{t('premium.historyLimited', { days: FREE_LIMITS.historyDays })}</Text> : null}
      <InfoNote text={t('stats.honesty')} />
      <AdBanner screen="statistics" />
    </Screen>
  );
}
