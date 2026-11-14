import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SectionList, View } from 'react-native';

import { repos } from '@/database';
import { packingProgress, tripPhase } from '@/domain/packing';
import type { Trip } from '@/domain/types';
import { groupTrips } from '@/features/trips/logic';
import { TripCard } from '@/features/trips/TripCard';
import { useNewTrip } from '@/features/trips/useNewTrip';
import { useAsync } from '@/hooks/useAsync';
import { clock } from '@/services/clock';
import { Button, EmptyState, Fab, Icon, Loading, Row, SectionHeader, Text, useTheme } from '@/ui';

async function loadTrips() {
  const trips = await repos().trips.list();
  const progress = new Map(await Promise.all(trips.map(async (tr) => [tr.id, packingProgress(await repos().trips.entries(tr.id))] as const)));
  return { trips, progress };
}

export default function TripsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = clock.today();
  const { data } = useAsync(loadTrips, []);
  const newTrip = useNewTrip();

  const groups = data ? groupTrips(data.trips, today) : null;
  const sections = groups
    ? [
        { key: 'ongoing', title: t('trips.phase.ongoing'), data: groups.ongoing },
        { key: 'upcoming', title: t('trips.phase.upcoming'), data: groups.upcoming },
        { key: 'past', title: t('trips.phase.past'), data: groups.past },
      ].filter((s) => s.data.length > 0)
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <RouterStack.Screen options={{ title: t('trips.title') }} />
      {!data ? (
        <Loading />
      ) : (
        <SectionList<Trip, { key: string; title: string; data: Trip[] }>
          sections={sections}
          keyExtractor={(tr) => tr.id}
          contentContainerStyle={{ padding: theme.spacing(5), paddingBottom: theme.spacing(28), gap: theme.spacing(3) }}
          stickySectionHeadersEnabled={false}
          initialNumToRender={10}
          windowSize={7}
          ListHeaderComponent={
            <Row gap={2} style={{ alignItems: 'flex-start', marginBottom: theme.spacing(2) }}>
              <Icon name="shirt-outline" size={16} color={theme.colors.textSubtle} />
              <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
                {t('trips.intro')}
              </Text>
            </Row>
          }
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          renderItem={({ item }) => (
            <View style={{ marginTop: theme.spacing(2) }}>
              <TripCard trip={item} phase={tripPhase(item, today)} progress={data.progress.get(item.id) ?? { packed: 0, total: 0, ratio: 0 }} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="airplane-outline" title={t('trips.empty.title')} message={t('trips.empty.message')} action={<Button label={t('trips.new')} icon="add" onPress={() => void newTrip()} />} />
          }
        />
      )}
      {data && data.trips.length > 0 ? <Fab label={t('trips.new')} onPress={() => void newTrip()} testID="trips-new" /> : null}
    </View>
  );
}
