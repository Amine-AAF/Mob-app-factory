import { Button, Card, ProgressBar, Row, Stack, Stat, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TripProgress } from '@/components/TripCard';
import { TripHighlights } from '@/components/TripHighlights';
import { TripScaffold } from '@/components/TripScaffold';
import { archiveTrip, deleteTrip, duplicateTrip, unarchiveTrip } from '@/features/trips/actions';
import { effectiveStatus, preparationProgress, tripTiming } from '@/features/trips/status';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { budgetRatio } from '@/utils/money';

export default function TripOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  const run = (fn: () => Promise<unknown>, after?: () => void) =>
    fn()
      .then(after)
      .catch((e) => {
        recordError(e, 'trip_action');
        Alert.alert(t('tripForm.errors.generic'));
      });

  return (
    <TripScaffold tripId={id} section="overview">
      {({ trip, summary, today }) => {
        const status = effectiveStatus(trip, today);
        const timing = tripTiming(trip, today);
        const spent = summary?.spentMinor ?? 0;
        const ratio = budgetRatio(spent, trip.budgetMinor);
        const tasksLeft = summary ? summary.tasksTotal - summary.tasksDone : 0;
        const timingLabel =
          status === 'ongoing' && timing.currentDay && timing.days
            ? t('tripCard.dayOf', { current: timing.currentDay, total: timing.days })
            : timing.daysToGo === 0
              ? t('tripCard.departsToday')
              : timing.daysToGo !== null
                ? t('tripCard.daysToGo', { count: timing.daysToGo })
                : status === 'completed'
                  ? t('tripCard.ended')
                  : null;

        const confirmDelete = () =>
          Alert.alert(t('tripDetail.deleteTitle'), t('tripDetail.deleteMessage'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('tripDetail.deleteConfirm'), style: 'destructive', onPress: () => run(() => deleteTrip(trip.id), () => router.replace('/(tabs)/trips')) },
          ]);

        return (
          <Stack gap={4}>
            <Card tone="primary">
              <Row style={{ justifyContent: 'space-between' }} wrap>
                <Text variant="subheading">{t(`enums.tripStatus.${status}`)}</Text>
                {timingLabel ? (
                  <Text variant="subheading" tone="primary">
                    {timingLabel}
                  </Text>
                ) : null}
              </Row>
              <Text variant="bodySmall" tone="muted">
                {t(`enums.tripType.${trip.tripType}`)}
                {trip.participants.length ? ` · ${t('common.travellers', { count: trip.participants.length })}` : ''}
              </Text>
            </Card>

            <Row gap={2}>
              <Stat icon="moon-outline" value={timing.nights !== null ? fmt.number(timing.nights) : '—'} label={t('common.nights', { count: timing.nights ?? 0 })} />
              <Stat icon="location-outline" value={fmt.number(summary?.destinations ?? 0)} label={t('common.destinations', { count: summary?.destinations ?? 0 })} tone="accent" />
            </Row>
            <Row gap={2}>
              <Stat icon="walk-outline" value={fmt.number(summary?.activities ?? 0)} label={t('common.activities', { count: summary?.activities ?? 0 })} tone="success" />
              <Stat icon="ticket-outline" value={fmt.number(summary?.bookings ?? 0)} label={t('common.bookings', { count: summary?.bookings ?? 0 })} tone="warning" />
            </Row>

            <TripHighlights tripId={trip.id} today={today} />

            <Card>
              <TripProgress progress={summary ? preparationProgress(summary) : null} />
              {tasksLeft > 0 ? (
                <Text variant="caption" tone="muted">
                  {t('tripDetail.tasksLeft', { count: tasksLeft })}
                </Text>
              ) : null}
            </Card>

            <Card onPress={() => router.replace({ pathname: '/trip/[id]/budget', params: { id: trip.id } })} accessibilityLabel={t('tripDetail.budgetSpent')}>
              <Text variant="label">{t('tripDetail.budgetSpent')}</Text>
              {trip.budgetMinor !== null ? (
                <>
                  <Text variant="subheading">{t('tripDetail.budgetSpentValue', { spent: fmt.money(spent, trip.currency), planned: fmt.money(trip.budgetMinor, trip.currency) })}</Text>
                  <ProgressBar progress={ratio ?? 0} tone={ratio !== null && ratio > 1 ? 'accent' : 'primary'} label={t('tripDetail.budgetSpent')} />
                </>
              ) : (
                <Text variant="bodySmall" tone="muted">
                  {t('tripDetail.noBudget')}
                </Text>
              )}
            </Card>

            {trip.description ? (
              <Card>
                <Text variant="label">{t('tripDetail.description')}</Text>
                <Text variant="bodySmall">{trip.description}</Text>
              </Card>
            ) : null}

            <Row gap={2} wrap>
              <Button label={t('documents.title')} icon="folder-open-outline" variant="secondary" onPress={() => router.push({ pathname: '/documents', params: { tripId: trip.id } })} testID="trip-documents" />
              <Button label={t('places.addForTrip')} icon="location-outline" variant="secondary" onPress={() => router.push({ pathname: '/place', params: { tripId: trip.id } })} />
            </Row>

            <Stack gap={2}>
              <Button label={t('common.edit')} icon="create-outline" variant="secondary" onPress={() => router.push({ pathname: '/trip/[id]/edit', params: { id: trip.id } })} testID="trip-edit" />
              <Button
                label={t('common.duplicate')}
                icon="copy-outline"
                variant="secondary"
                testID="trip-duplicate"
                onPress={() => run(() => duplicateTrip(trip.id, t('tripDetail.duplicateName', { name: trip.name })), () => Alert.alert(t('tripDetail.duplicated')))}
              />
              {status === 'archived' ? (
                <Button label={t('common.unarchive')} icon="arrow-undo-outline" variant="ghost" onPress={() => run(() => unarchiveTrip(trip.id))} />
              ) : (
                <Button label={t('common.archive')} icon="archive-outline" variant="ghost" onPress={() => run(() => archiveTrip(trip.id), () => Alert.alert(t('tripDetail.archived')))} testID="trip-archive" />
              )}
              <Button label={t('common.delete')} icon="trash-outline" variant="danger" onPress={confirmDelete} testID="trip-delete" />
            </Stack>
          </Stack>
        );
      }}
    </TripScaffold>
  );
}
