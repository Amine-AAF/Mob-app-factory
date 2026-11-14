import { Card, ListRow, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BarChart, MetricCard } from '@/components/charts';
import { totals, weeklyFrequency } from '@/features/stats/stats';
import { useData, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { loadProgress } from '@/services/progressService';
import { useIsPremium, useSession } from '@/store/session';

/** Progress hub: quick overview + entry points to statistics, records, body, cardio, goals and history. */
export default function Progress() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const f = useFormat();
  const { data } = useData(async (r) => ({ progress: await loadProgress(r, { premium }), weight: await r.body.latest('weight') }), [premium, today]);
  const freq = useMemo(() => (data ? weeklyFrequency(data.progress.sessions, today, 8) : []), [data, today]);
  if (!data) return <Screen>{null}</Screen>;
  const tot = totals(data.progress.sessions, data.progress.cardio);

  return (
    <Screen testID="progress">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.progress')}
      </Text>
      <Row gap={3}>
        <MetricCard icon="barbell" value={String(tot.sessions)} label={premium ? t('progress.totalWorkouts') : t('progress.workouts90')} />
        <MetricCard icon="time" value={f.minutes(tot.minutes)} label={t('progress.totalTime')} tone="accent" />
      </Row>
      <Card>
        <Text variant="subheading">{t('progress.weeklyFrequency')}</Text>
        <BarChart
          data={freq.map((w, i) => ({ label: fmt.shortDay(fromDayKey(w.weekStart)), value: w.sessions || null, highlight: i === freq.length - 1 }))}
          summary={t('progress.frequencyA11y', { values: freq.map((w) => w.sessions).join(', ') })}
        />
      </Card>
      <SectionHeader title={t('progress.explore')} />
      <Card>
        <ListRow icon="stats-chart-outline" title={t('stats.title')} subtitle={t('progress.statsSub')} onPress={() => router.push('/stats')} testID="open-stats" />
        <ListRow icon="trophy-outline" title={t('records.title')} subtitle={t('progress.recordsSub')} onPress={() => router.push('/records')} />
        <ListRow icon="body-outline" title={t('body.title')} subtitle={data.weight ? t('progress.lastWeight', { value: f.weight(data.weight.value) }) : t('progress.bodySub')} onPress={() => router.push('/body')} />
        <ListRow icon="walk-outline" title={t('cardio.title')} subtitle={t('progress.cardioSub', { count: data.progress.cardio.length })} onPress={() => router.push('/cardio')} />
        <ListRow icon="flag-outline" title={t('goals.title')} subtitle={t('progress.goalsSub')} onPress={() => router.push('/goals')} />
        <ListRow icon="time-outline" title={t('history.title')} subtitle={t('progress.historySub')} onPress={() => router.push('/history')} />
      </Card>
    </Screen>
  );
}
