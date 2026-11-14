import { Button, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdBanner } from '@/components/AdBanner';
import { TripCard } from '@/components/TripCard';
import { usePremiumGate } from '@/features/premium/usePremiumGate';
import { useTripsOverview } from '@/features/trips/useTrips';
import { maybeShowInterstitial } from '@/services/ads';

type Filter = 'active' | 'past' | 'archived';

export default function TripsScreen() {
  const { t } = useTranslation();
  const { data } = useTripsOverview();
  const { startNewTrip } = usePremiumGate();
  useFocusEffect(
    useCallback(() => {
      maybeShowInterstitial().catch(() => undefined);
    }, []),
  );
  const [filter, setFilter] = useState<Filter>('active');
  const b = data?.buckets;
  const list = !b ? [] : filter === 'active' ? [...b.ongoing, ...b.upcoming] : filter === 'past' ? b.completed : b.archived;
  const emptyKey = filter === 'active' ? 'trips.emptyActive' : filter === 'past' ? 'trips.emptyPast' : 'trips.emptyArchived';

  return (
    <Screen testID="trips-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('trips.title')}
        </Text>
        <Button label={t('trips.new')} icon="add" onPress={() => startNewTrip()} testID="trips-new" />
      </Row>
      <Row gap={2} wrap>
        <Chip label={t('trips.filterActive')} selected={filter === 'active'} onPress={() => setFilter('active')} />
        <Chip label={t('trips.filterPast')} selected={filter === 'past'} onPress={() => setFilter('past')} />
        <Chip label={t('trips.filterArchived')} selected={filter === 'archived'} onPress={() => setFilter('archived')} />
      </Row>
      {data && list.length === 0 ? <EmptyState icon="airplane-outline" title={t(emptyKey)} /> : null}
      <Stack gap={3}>
        {data
          ? list.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                route={data.routes.get(trip.id) ?? []}
                summary={data.summaries.get(trip.id)}
                today={data.today}
                compact={filter !== 'active'}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
              />
            ))
          : null}
      </Stack>
      <AdBanner screen="trips" />
    </Screen>
  );
}
