import { Button, Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { KeyValue } from '@/components/ui';
import { repos } from '@/database';
import { useData, useExercises, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { rebuildRecords } from '@/services/workoutService';
import { useSession } from '@/store/session';

/** A past workout: every set as logged. Deleting it also removes the records it produced. */
export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const ex = useExercises();
  const f = useFormat();
  const { data: s } = useData((r) => r.sessions.get(id), [id]);
  if (s === undefined) return null;
  if (!s) return <EmptyState icon="alert-circle" title={t('common.notFound')} />;

  const remove = () =>
    Alert.alert(t('history.deleteTitle'), t('history.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const r = repos();
          const ids = [...new Set(s.exercises.map((e) => e.exerciseId))];
          await r.sessions.remove(s.id);
          for (const exId of ids) await rebuildRecords(r, exId, ex.get(exId)?.tracking ?? 'weight_reps');
          useSession.getState().bump();
          router.back();
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: s.name }} />
      <Card>
        <KeyValue label={t('history.date')} value={fmt.longDay(fromDayKey(s.day))} />
        <KeyValue label={t('history.start')} value={fmt.time(new Date(s.startedAt))} />
        <KeyValue label={t('summary.duration')} value={f.duration(s.durationSec)} />
      </Card>
      {s.exercises.map((e) => {
        const exercise = ex.get(e.exerciseId);
        return (
          <Card key={e.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="subheading" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.exerciseId } })}>
                {exercise?.name ?? e.exerciseId}
              </Text>
              {e.status === 'skipped' ? <Text variant="caption" tone="subtle">{t('workout.status.skipped')}</Text> : null}
            </Row>
            {e.sets.map((x, i) => (
              <KeyValue
                key={x.id}
                label={t('workout.setN', { n: i + 1 })}
                value={
                  exercise?.tracking === 'weight_reps'
                    ? `${f.weight(x.weightKg ?? 0)} × ${x.reps ?? 0}`
                    : exercise?.tracking === 'reps'
                      ? t('units.reps', { count: x.reps ?? 0 })
                      : exercise?.tracking === 'time'
                        ? f.duration(x.durationSec)
                        : `${f.distance(x.distanceM)} · ${f.duration(x.durationSec)}`
                }
              />
            ))}
          </Card>
        );
      })}
      {s.notes ? <Text tone="muted">{s.notes}</Text> : null}
      <Button label={t('history.delete')} variant="danger" onPress={remove} />
    </Screen>
  );
}
