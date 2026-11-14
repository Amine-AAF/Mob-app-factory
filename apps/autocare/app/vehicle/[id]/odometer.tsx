import { Button, Card, EmptyState, IconButton, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { InfoNote, ItemRow } from '@/components/ui';
import { repos } from '@/database';
import { deriveOdometer } from '@/features/reminders/plan';
import { useAsync, useFormat, useToday } from '@/hooks';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';

export default function OdometerHistory() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(async () => ({ vehicle: await repos().vehicles.get(id), readings: await repos().odometer.list(id) }), [id]);
  const odo = data?.vehicle ? deriveOdometer({ vehicle: data.vehicle, readings: data.readings }, today) : null;
  const readings = [...(data?.readings ?? [])].reverse();

  const remove = (readingId: string) =>
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().odometer.remove(readingId, clock.now());
          afterWrite();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: t('odometer.history') }} />
      <Screen edges={[]}>
        <Card>
          <Text variant="title">{f.distance(odo?.knownKm)}</Text>
          <Text variant="bodySmall" tone="muted">
            {odo?.rate ? t('odometer.rate', { distance: f.distance(odo.rate.kmPerDay * 30.44) }) : t('odometer.noRate')}
          </Text>
          <InfoNote text={t('odometer.estimateNote')} />
        </Card>
        <Button label={t('odometer.title')} icon="add" onPress={() => router.push({ pathname: '/odometer', params: { vehicleId: id } })} />
        {data && readings.length === 0 ? <EmptyState icon="analytics-outline" title={t('odometer.empty')} /> : null}
        {readings.length ? (
          <Card>
            {readings.map((r) => (
              <ItemRow
                key={r.id}
                icon="speedometer-outline"
                tone={r.source === 'manual' ? 'primary' : 'neutral'}
                title={f.distance(r.odometerKm)}
                subtitle={`${f.day(r.day)} · ${t(`odometer.sources.${r.source}`)}`}
                badge={r.source === 'manual' || r.source === 'purchase' ? <IconButton icon="trash-outline" label={t('common.delete')} tone="danger" size={18} onPress={() => remove(r.id)} /> : null}
              />
            ))}
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
