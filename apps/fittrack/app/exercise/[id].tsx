import { Badge, Button, Card, EmptyState, IconButton, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { LineChart } from '@/components/charts';
import { InfoNote, KeyValue, PremiumGate, Segmented } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { isPremiumExercise } from '@/features/library/library';
import { currentBests, progression, RECORD_KINDS_BY_TRACKING } from '@/features/performance/records';
import { useData, useExercises, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium, useSession } from '@/store/session';
import type { RecordKind } from '@/types';

type Metric = 'weight' | 'reps' | 'est1rm' | 'volume' | 'duration' | 'distance';

/** Exercise sheet: how-to (steps, cues, mistakes, variations) + the user's performance history and records. */
export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const premium = useIsPremium();
  const ex = useExercises();
  const f = useFormat();
  const e = ex.byId.get(id);
  const [tab, setTab] = useState<'guide' | 'history'>('guide');
  const { data } = useData(
    async (r) => {
      const since = premium ? undefined : addDays(clock.today(), -FREE_LIMITS.historyDays);
      const [facts, records, favorites] = await Promise.all([r.sessions.setFacts({ exerciseId: id, since }), r.records.forExercise(id), r.exercises.favorites()]);
      return { points: progression(facts), lastSets: facts.slice(-12).reverse(), bests: currentBests(records), favorite: favorites.includes(id) };
    },
    [id, premium],
  );
  const metrics: Metric[] = useMemo(() => {
    if (!e) return [];
    return e.tracking === 'weight_reps' ? ['weight', 'est1rm', 'reps', 'volume'] : e.tracking === 'reps' ? ['reps'] : e.tracking === 'time' ? ['duration'] : ['distance', 'duration'];
  }, [e]);
  const [metric, setMetric] = useState<Metric | null>(null);
  if (!e) return <EmptyState icon="alert-circle" title={t('common.notFound')} />;
  const m = metric ?? metrics[0]!;

  const recordLabel = (kind: RecordKind, v: number) => {
    switch (kind) {
      case 'max_weight':
      case 'est_1rm':
        return f.weight(v);
      case 'max_volume':
        return f.weight(v);
      case 'max_reps':
        return t('units.reps', { count: v });
      case 'max_duration':
        return f.duration(v);
      case 'max_distance':
        return f.distance(v);
      case 'best_pace':
        return f.pace(f.units.distance === 'km' ? v : v * 1.609344);
    }
  };

  const series = (data?.points ?? [])
    .map((p) => ({ label: fmt.shortDay(fromDayKey(p.day)), value: { weight: p.maxWeight, reps: p.maxReps, est1rm: p.est1rm, volume: p.volume || null, duration: p.maxDuration, distance: p.maxDistance }[m] }))
    .filter((p): p is { label: string; value: number } => p.value !== null && p.value !== undefined);
  const formatMetric = (v: number) => (m === 'reps' ? String(Math.round(v)) : m === 'duration' ? f.duration(v) : m === 'distance' ? f.distance(v) : f.weight(v));
  const locked = !premium && isPremiumExercise(e);

  const toggleFavorite = async () => {
    await repos().exercises.toggleFavorite(e.id);
    useSession.getState().bump();
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: e.name,
          headerRight: () => <IconButton icon={data?.favorite ? 'star' : 'star-outline'} tone={data?.favorite ? 'accent' : 'default'} label={data?.favorite ? t('exercise.unfavorite') : t('exercise.favorite')} onPress={() => void toggleFavorite()} />,
        }}
      />
      <Row wrap gap={2}>
        <Badge label={t(`categories.${e.category}`)} tone="primary" />
        <Badge label={t(`levels.${e.level}`)} tone="neutral" />
        {e.equipment.map((q) => (
          <Badge key={q} label={t(`equipment.${q}`)} tone="neutral" />
        ))}
        {e.source === 'custom' ? <Badge label={t('exercise.custom')} tone="accent" /> : null}
      </Row>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'guide', label: t('exercise.guide') }, { value: 'history', label: t('exercise.history') }]} />

      {tab === 'guide' ? (
        <>
          {e.description ? <Text>{e.description}</Text> : null}
          <Card>
            <KeyValue label={t('exercise.primary')} value={t(`muscles.${e.primary}`)} />
            {e.secondary.length ? <KeyValue label={t('exercise.secondary')} value={e.secondary.map((s) => t(`muscles.${s}`)).join(', ')} /> : null}
            <KeyValue label={t('exercise.tracking')} value={t(`tracking.${e.tracking}`)} />
          </Card>
          {locked ? (
            <PremiumGate title={t('premium.advancedLibraryTitle')} message={t('premium.advancedLibraryBody')} source="advanced_exercise" />
          ) : (
            <>
              {e.steps.length ? (
                <>
                  <SectionHeader title={t('exercise.steps')} />
                  <Card>
                    {e.steps.map((s, i) => (
                      <Row key={i} gap={3} style={{ alignItems: 'flex-start' }}>
                        <Badge label={String(i + 1)} tone="primary" />
                        <Text variant="bodySmall" style={{ flex: 1 }}>
                          {s}
                        </Text>
                      </Row>
                    ))}
                  </Card>
                </>
              ) : null}
              {e.tips.length ? (
                <>
                  <SectionHeader title={t('exercise.tips')} />
                  <Card tone="alt">
                    {e.tips.map((s, i) => (
                      <Text key={i} variant="bodySmall">{`• ${s}`}</Text>
                    ))}
                  </Card>
                </>
              ) : null}
              {e.mistakes.length ? (
                <>
                  <SectionHeader title={t('exercise.mistakes')} />
                  <Card tone="alt">
                    {e.mistakes.map((s, i) => (
                      <Text key={i} variant="bodySmall">{`• ${s}`}</Text>
                    ))}
                  </Card>
                </>
              ) : null}
              {e.easier || e.harder ? (
                <>
                  <SectionHeader title={t('exercise.variations')} />
                  <Card>
                    {e.easier ? (
                      <Text variant="bodySmall" onPress={e.easierId ? () => router.push({ pathname: '/exercise/[id]', params: { id: e.easierId! } }) : undefined}>
                        {`${t('exercise.easier')}: ${e.easier}`}
                      </Text>
                    ) : null}
                    {e.harder ? (
                      <Text variant="bodySmall" onPress={e.harderId ? () => router.push({ pathname: '/exercise/[id]', params: { id: e.harderId! } }) : undefined}>
                        {`${t('exercise.harder')}: ${e.harder}`}
                      </Text>
                    ) : null}
                  </Card>
                </>
              ) : null}
            </>
          )}
          <InfoNote text={t('exercise.safety')} icon="medkit-outline" />
          {e.source === 'custom' ? (
            <Button
              label={t('exercise.deleteCustom')}
              variant="danger"
              onPress={() =>
                Alert.alert(t('exercise.deleteCustom'), t('exercise.deleteCustomBody'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                      await repos().exercises.deleteCustom(e.id);
                      useSession.getState().bump();
                      router.back();
                    },
                  },
                ])
              }
            />
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader title={t('exercise.records')} />
          <Card>
            {RECORD_KINDS_BY_TRACKING[e.tracking].map((kind) => {
              const b = data?.bests.get(kind);
              return <KeyValue key={kind} label={t(`records.kinds.${kind}`)} value={b ? recordLabel(kind, b.value) : '—'} />;
            })}
            {e.tracking === 'weight_reps' ? <InfoNote text={t('records.estimateNote')} icon="calculator-outline" /> : null}
          </Card>
          {metrics.length > 1 ? <Segmented value={m} onChange={setMetric} options={metrics.map((x) => ({ value: x, label: t(`exercise.metric.${x}`) }))} /> : null}
          {series.length >= 2 ? (
            <Card>
              <LineChart points={series} summary={t('exercise.chartA11y', { metric: t(`exercise.metric.${m}`), count: series.length })} formatValue={formatMetric} dashed={m === 'est1rm'} />
              {m === 'est1rm' ? <Text variant="caption" tone="subtle">{t('records.estimateShort')}</Text> : null}
            </Card>
          ) : (
            <EmptyState icon="analytics-outline" title={t('exercise.noHistoryTitle')} message={t('exercise.noHistoryBody')} />
          )}
          {data?.lastSets.length ? (
            <>
              <SectionHeader title={t('exercise.lastSets')} />
              <Card>
                {data.lastSets.map((s) => (
                  <KeyValue
                    key={s.setId}
                    label={fmt.shortDay(fromDayKey(s.day))}
                    value={
                      e.tracking === 'weight_reps'
                        ? `${f.weight(s.weightKg ?? 0)} × ${s.reps ?? 0}`
                        : e.tracking === 'reps'
                          ? t('units.reps', { count: s.reps ?? 0 })
                          : e.tracking === 'time'
                            ? f.duration(s.durationSec)
                            : `${f.distance(s.distanceM)} · ${f.duration(s.durationSec)}`
                    }
                  />
                ))}
              </Card>
            </>
          ) : null}
          {!premium ? <Text variant="caption" tone="subtle">{t('premium.historyLimited', { days: FREE_LIMITS.historyDays })}</Text> : null}
        </>
      )}
    </Screen>
  );
}
