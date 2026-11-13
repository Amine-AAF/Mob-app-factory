import { Badge, Card, Icon, ProgressBar, Row, Stack, Text, mix, useTheme } from '@factory/design-system';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import type { TripSummary } from '@/database/repositories/trips';
import { effectiveStatus, preparationProgress, tripTiming } from '@/features/trips/status';
import { fmt } from '@/i18n';
import type { Trip } from '@/types/models';

const STATUS_TONE = { planning: 'neutral', upcoming: 'primary', ongoing: 'success', completed: 'accent', archived: 'neutral' } as const;

/** Deterministic hue per trip so cards without a photo stay recognisable. */
export function coverTint(seed: string, base: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const partners = ['#0EA5E9', '#F97316', '#8B5CF6', '#10B981', '#E11D48', '#F59E0B'];
  return mix(base, partners[h % partners.length]!, 0.45);
}

export function tripDateLabel(trip: Pick<Trip, 'startDate' | 'endDate'>, t: TFunction): string {
  if (trip.startDate && trip.endDate) return t('common.dateRange', { start: fmt.shortDate(trip.startDate), end: fmt.date(trip.endDate) });
  if (trip.startDate) return fmt.date(trip.startDate);
  return t('common.noDates');
}

export function TripProgress({ progress }: { progress: number | null }) {
  const { t } = useTranslation();
  if (progress === null) {
    return (
      <Text variant="caption" tone="subtle">
        {t('tripCard.noPreparationData')}
      </Text>
    );
  }
  const percent = fmt.percent(progress);
  return (
    <Stack gap={1}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {t('tripCard.preparation')}
        </Text>
        <Text variant="caption" style={{ fontWeight: '700' }}>
          {percent}
        </Text>
      </Row>
      <ProgressBar progress={progress} tone={progress >= 1 ? 'success' : 'primary'} label={t('a11y.tripProgress', { percent })} />
    </Stack>
  );
}

export function TripCard({ trip, route, summary, today, onPress, compact }: { trip: Trip; route: string[]; summary?: TripSummary; today: string; onPress: () => void; compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const status = effectiveStatus(trip, today);
  const timing = tripTiming(trip, today);
  const routeLabel = route.length ? route.join(' → ') : trip.primaryDestination;
  const timingLabel =
    status === 'ongoing' && timing.currentDay && timing.days
      ? t('tripCard.dayOf', { current: timing.currentDay, total: timing.days })
      : timing.daysToGo === 0
        ? t('tripCard.departsToday')
        : timing.daysToGo !== null
          ? t('tripCard.daysToGo', { count: timing.daysToGo })
          : null;
  const progress = summary ? preparationProgress(summary) : null;
  const tint = coverTint(trip.id, theme.colors.primary);

  return (
    <Card onPress={onPress} accessibilityLabel={t('a11y.openTrip', { name: trip.name })} style={{ padding: 0, overflow: 'hidden', gap: 0 }} testID={`trip-card-${trip.id}`}>
      <View style={{ height: compact ? 64 : 104, backgroundColor: tint, justifyContent: 'flex-end', padding: theme.spacing(3) }}>
        {trip.coverUri ? <Image source={{ uri: trip.coverUri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
        {!trip.coverUri ? <Icon name="airplane" size={compact ? 22 : 34} color="rgba(255,255,255,0.55)" style={{ position: 'absolute', right: 14, top: 12 }} /> : null}
        <Row gap={2}>
          <Badge label={t(`enums.tripStatus.${status}`)} tone={STATUS_TONE[status]} />
          {trip.isDemo ? <Badge label={t('common.demo')} tone="warning" icon="flask-outline" /> : null}
        </Row>
      </View>
      <Stack gap={2} style={{ padding: theme.spacing(4) }}>
        <Text variant="heading" numberOfLines={1}>
          {trip.name}
        </Text>
        {routeLabel ? (
          <Row gap={1.5}>
            <Icon name="location-outline" size={14} color={theme.colors.textMuted} />
            <Text variant="bodySmall" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
              {routeLabel}
            </Text>
          </Row>
        ) : null}
        <Row style={{ justifyContent: 'space-between' }} wrap>
          <Text variant="bodySmall">{tripDateLabel(trip, t)}</Text>
          {timingLabel ? (
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
              {timingLabel}
            </Text>
          ) : null}
        </Row>
        {!compact && status !== 'completed' && status !== 'archived' ? <TripProgress progress={progress} /> : null}
      </Stack>
    </Card>
  );
}
