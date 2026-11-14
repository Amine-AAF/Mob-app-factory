import { router } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { tripNights, type packingProgress, type TripPhase } from '@/domain/packing';
import type { Trip } from '@/domain/types';
import { fmt } from '@/i18n';
import { Badge, Card, Icon, ProgressBar, Row, Stack, Text, useTheme } from '@/ui';

export function tripDates(trip: Pick<Trip, 'departureDate' | 'returnDate'>): string {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' } as const;
  return trip.departureDate === trip.returnDate ? fmt.day(trip.departureDate, opts) : `${fmt.day(trip.departureDate, opts)} – ${fmt.day(trip.returnDate, opts)}`;
}

export const TripCard = memo(function TripCard({ trip, phase, progress }: { trip: Trip; phase: TripPhase; progress: ReturnType<typeof packingProgress> }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const nights = tripNights(trip);
  const phaseLabel = phase === 'ongoing' ? t('trips.phase.ongoing') : phase === 'upcoming' ? t('trips.phase.upcoming') : t('trips.phase.past');
  return (
    <Card onPress={() => router.push({ pathname: '/trips/[id]', params: { id: trip.id } })} accessibilityLabel={`${trip.destination}, ${tripDates(trip)}`} style={phase === 'past' ? { opacity: 0.8 } : undefined}>
      <Row>
        <Icon name="airplane-outline" size={20} color={theme.colors.textMuted} />
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={1}>
            {trip.destination}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {`${tripDates(trip)} · ${t('trips.nights', { count: nights })}`}
          </Text>
        </Stack>
        <Badge label={phaseLabel} tone={phase === 'ongoing' ? 'success' : phase === 'upcoming' ? 'accent' : 'neutral'} />
      </Row>
      {progress.total > 0 ? (
        <Stack gap={1}>
          <ProgressBar progress={progress.ratio} tone={progress.ratio >= 1 ? 'success' : 'accent'} label={t('trips.progress', { packed: progress.packed, total: progress.total })} />
          <Text variant="caption" tone="subtle">
            {t('trips.progress', { packed: progress.packed, total: progress.total })}
          </Text>
        </Stack>
      ) : (
        <Text variant="caption" tone="subtle">
          {t('trips.emptyChecklist')}
        </Text>
      )}
    </Card>
  );
});
