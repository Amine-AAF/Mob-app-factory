import { Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { InfoNote, KeyValue } from '@/components/ui';
import { currentBests, RECORD_KINDS_BY_TRACKING } from '@/features/performance/records';
import { useData, useExercises, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import type { PerformanceRecord, RecordKind } from '@/types';
import { groupBy } from '@/utils';

/** Personal records per exercise. The 1RM line is an estimate and labelled as such. */
export default function Records() {
  const { t } = useTranslation();
  const ex = useExercises();
  const f = useFormat();
  const { data } = useData((r) => r.records.all());
  const byExercise = useMemo(() => [...groupBy(data ?? [], (r) => r.exerciseId).entries()].map(([id, list]) => ({ id, bests: currentBests(list), last: Math.max(...list.map((x) => x.achievedAt)) })).sort((a, b) => b.last - a.last), [data]);

  const value = (kind: RecordKind, r: PerformanceRecord) =>
    kind === 'max_reps' ? t('units.reps', { count: r.value }) : kind === 'max_duration' ? f.duration(r.value) : kind === 'max_distance' ? f.distance(r.value) : kind === 'best_pace' ? f.pace(f.units.distance === 'km' ? r.value : r.value * 1.609344) : f.weight(r.value);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('records.title') }} />
      <InfoNote text={t('records.intro')} />
      {byExercise.length === 0 ? <EmptyState icon="trophy-outline" title={t('records.emptyTitle')} message={t('records.emptyBody')} /> : null}
      {byExercise.map(({ id, bests }) => {
        const e = ex.get(id);
        if (!e) return null;
        return (
          <Pressable key={id} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id } })} accessibilityRole="button">
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="subheading" style={{ flex: 1 }} numberOfLines={1}>
                  {e.name}
                </Text>
              </Row>
              {RECORD_KINDS_BY_TRACKING[e.tracking].map((k) => {
                const b = bests.get(k);
                return b ? <KeyValue key={k} label={`${t(`records.kinds.${k}`)} · ${fmt.shortDay(fromDayKey(b.day))}`} value={value(k, b)} /> : null;
              })}
            </Card>
          </Pressable>
        );
      })}
      <InfoNote text={t('records.estimateNote')} icon="calculator-outline" />
    </Screen>
  );
}
