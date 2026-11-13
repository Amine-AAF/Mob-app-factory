import { Card, EmptyState, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Fab, InfoNote, ItemRow } from '@/components/ui';
import { repos } from '@/database';
import { tireDistanceKm } from '@/features/deadlines/deadlines';
import { sumByCurrency } from '@/features/money/money';
import { useAsync, useFormat } from '@/hooks';
import type { TireRecord } from '@/types';

export default function VehicleTires() {
  const { t } = useTranslation();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(async () => ({ vehicle: await repos().vehicles.get(id), tires: await repos().tires.list(id) }), [id]);
  const tires = data?.tires ?? [];
  const mounted = tires.filter((x) => x.status === 'mounted');
  const others = tires.filter((x) => x.status !== 'mounted');
  const spend = sumByCurrency(tires.map((x) => (x.priceMinor ? { minor: x.priceMinor, currency: x.currency } : null)));

  const row = (x: TireRecord) => {
    const distance = tireDistanceKm(x, data?.vehicle?.odometerKm ?? null);
    return (
      <ItemRow
        key={x.id}
        icon={x.season === 'winter' ? 'snow' : x.season === 'summer' ? 'sunny' : 'partly-sunny'}
        tone={x.status === 'mounted' ? 'primary' : 'neutral'}
        title={[x.brand, x.model].filter(Boolean).join(' ')}
        subtitle={[t(`tireSeasons.${x.season}`), t(`tirePositions.${x.position}`), x.size, `${f.day(x.installedDay)}${x.removedDay ? ` → ${f.day(x.removedDay)}` : ''}`, distance !== null ? t('tires.distance', { distance: f.distance(distance) }) : null, x.status !== 'mounted' ? t(`tireStatuses.${x.status}`) : null].filter(Boolean).join(' · ')}
        value={x.priceMinor !== null ? f.money(x.priceMinor, x.currency) : null}
        onPress={() => router.push({ pathname: '/tire/edit', params: { id: x.id } })}
      />
    );
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('tires.title') }} />
      <View style={{ flex: 1 }}>
        <Screen edges={[]}>
          <InfoNote icon="information-circle-outline" text={t('tires.noWear')} />
          {data && tires.length === 0 ? <EmptyState icon="ellipse-outline" title={t('tires.empty')} /> : null}
          {mounted.length ? (
            <>
              <SectionHeader title={t('tires.current')} />
              <Card>{mounted.map(row)}</Card>
            </>
          ) : null}
          {others.length ? (
            <>
              <SectionHeader title={t('tires.storedAndHistory')} />
              <Card>{others.map(row)}</Card>
            </>
          ) : null}
          {tires.length ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" tone="muted">
                {t('tires.cost')}
              </Text>
              <Text variant="subheading">{f.totals(spend, data?.vehicle?.currency)}</Text>
            </Row>
          ) : null}
          <View style={{ height: 72 }} />
        </Screen>
        <Fab label={t('tires.add')} onPress={() => router.push({ pathname: '/tire/edit', params: { vehicleId: id } })} />
      </View>
    </>
  );
}
