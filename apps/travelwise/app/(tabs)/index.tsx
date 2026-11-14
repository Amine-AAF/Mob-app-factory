import { Button, Card, EmptyState, FadeIn, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { TripCard } from '@/components/TripCard';
import { useTripsOverview } from '@/features/trips/useTrips';

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 72,
        alignItems: 'center',
        gap: 6,
        paddingVertical: theme.spacing(3),
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={22} color={theme.colors.primary} />
      <Text variant="caption" center numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function WhyRow({ icon, text }: { icon: IconName; text: string }) {
  const theme = useTheme();
  return (
    <Row gap={3} style={{ alignItems: 'flex-start' }}>
      <Icon name={icon} size={18} color={theme.colors.primary} />
      <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
        {text}
      </Text>
    </Row>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data } = useTripsOverview();
  const buckets = data?.buckets;
  const hasTrips = !!data && data.trips.length > 0;
  const open = (id: string) => router.push({ pathname: '/trip/[id]', params: { id } });
  const card = (id: string, compact?: boolean) => {
    const trip = data!.trips.find((x) => x.id === id)!;
    return <TripCard key={id} trip={trip} route={data!.routes.get(id) ?? []} summary={data!.summaries.get(id)} today={data!.today} onPress={() => open(id)} compact={compact} />;
  };

  return (
    <Screen testID="home-screen">
      <Stack gap={1}>
        <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
          {t('app.name')}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {t('home.title')}
        </Text>
      </Stack>

      {data && !hasTrips ? (
        <FadeIn>
          <Card>
            <EmptyState
              icon="earth-outline"
              title={t('home.emptyTitle')}
              message={t('home.emptyMessage')}
              action={<Button label={t('home.createTrip')} icon="add" onPress={() => router.push('/trip/new')} testID="home-create-trip" />}
            />
          </Card>
          <Stack gap={3} style={{ marginTop: 16 }}>
            <SectionHeader title={t('home.why')} />
            <WhyRow icon="cloud-offline-outline" text={t('home.whyOffline')} />
            <WhyRow icon="lock-closed-outline" text={t('home.whyPrivate')} />
            <WhyRow icon="albums-outline" text={t('home.whyAllInOne')} />
          </Stack>
        </FadeIn>
      ) : null}

      {hasTrips && buckets ? (
        <>
          <SectionHeader title={t('home.quickActions')} />
          <Row gap={2} wrap>
            <QuickAction icon="add-circle-outline" label={t('home.actionNewTrip')} onPress={() => router.push('/trip/new')} />
            <QuickAction icon="airplane-outline" label={t('home.actionAllTrips')} onPress={() => router.push('/(tabs)/trips')} />
            <QuickAction icon="wallet-outline" label={t('home.actionBudget')} onPress={() => router.push('/(tabs)/budget')} />
            <QuickAction icon="map-outline" label={t('home.actionPlaces')} onPress={() => router.push('/(tabs)/places')} />
            <QuickAction icon="folder-open-outline" label={t('home.actionDocuments')} onPress={() => router.push('/documents')} />
          </Row>

          {buckets.ongoing.length ? (
            <>
              <SectionHeader title={t('home.ongoing')} />
              {buckets.ongoing.map((trip) => card(trip.id))}
            </>
          ) : null}

          {buckets.upcoming.length ? (
            <>
              <SectionHeader title={t('home.upcoming')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/trips')} />
              {buckets.upcoming.slice(0, 3).map((trip) => card(trip.id))}
            </>
          ) : null}

          {buckets.completed.length ? (
            <>
              <SectionHeader title={t('home.recent')} />
              {buckets.completed.slice(0, 2).map((trip) => card(trip.id, true))}
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
