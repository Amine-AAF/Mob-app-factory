import { Card, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { TripDetails, TripSummary } from '@/database/repositories/trips';
import { useTrip } from '@/features/trips/useTrips';

import { tripDateLabel } from './TripCard';
import { TripTabBar, type TripSection } from './TripTabBar';

/** Shared frame of every trip section: header, demo notice, section tabs. */
export function TripScaffold({
  tripId,
  section,
  children,
}: {
  tripId: string;
  section: TripSection;
  children: (data: { trip: TripDetails; summary: TripSummary | null; today: string }) => ReactNode;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useTrip(tripId);

  if (data === null) {
    return (
      <Screen>
        <RouterStack.Screen options={{ headerShown: true, title: '' }} />
        <EmptyState icon="alert-circle-outline" title={t('tripDetail.notFound')} />
      </Screen>
    );
  }
  if (!data) return <Screen>{null}</Screen>;
  const { trip } = data;
  const route = trip.destinations.map((d) => d.city).join(' → ') || trip.primaryDestination;

  return (
    <Screen edges={[]} testID={`trip-${section}-screen`}>
      <RouterStack.Screen options={{ headerShown: true, title: trip.name }} />
      <Stack gap={1}>
        {route ? (
          <Row gap={1.5}>
            <Icon name="location" size={16} color={theme.colors.primary} />
            <Text variant="subheading" numberOfLines={2} style={{ flex: 1 }}>
              {route}
            </Text>
          </Row>
        ) : null}
        <Text variant="bodySmall" tone="muted">
          {tripDateLabel(trip, t)}
        </Text>
      </Stack>
      {trip.isDemo ? (
        <Card tone="accent">
          <Row gap={2}>
            <Icon name="flask-outline" size={18} color={theme.colors.accent} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t('common.demoNotice')}
            </Text>
          </Row>
        </Card>
      ) : null}
      <TripTabBar tripId={trip.id} active={section} />
      {children(data)}
    </Screen>
  );
}

/** Placeholder for sections delivered in later phases (explicit, never fake content). */
export function SectionComingSoon({ icon }: { icon: 'map-outline' | 'ticket-outline' | 'wallet-outline' | 'checkbox-outline' | 'book-outline' }) {
  const { t } = useTranslation();
  return <EmptyState icon={icon} title={t('common.comingSoon')} message={t('tripDetail.sectionNext')} />;
}
