import { Button, Card, EmptyState, Row, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DateField } from '@/components/DateField';
import { DayTimeline } from '@/components/DayTimeline';
import { TripScaffold } from '@/components/TripScaffold';
import { repos } from '@/database';
import { ItineraryValidationError } from '@/database/repositories/itinerary';
import { addDay, createDaysFromTripDates, setActivityStatus, shiftActivity } from '@/features/itinerary/actions';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { dayNumber, tripDayCount } from '@/utils/dates';

/** Day-by-day itinerary with a visual timeline. No ads on this screen (editing). */
export default function TripItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: days } = useAsync(() => repos().itinerary.listDays(id), [id]);
  const [extraDate, setExtraDate] = useState<string | null>(null);

  const fail = (e: unknown) => {
    if (e instanceof ItineraryValidationError) Alert.alert(t(`itinerary.errors.${e.code}`));
    else {
      recordError(e, 'itinerary');
      Alert.alert(t('tripForm.errors.generic'));
    }
  };

  return (
    <TripScaffold tripId={id} section="itinerary">
      {({ trip, today }) => {
        const hasDates = !!(trip.startDate && trip.endDate);
        const destinationOf = (destId: string | null) => trip.destinations.find((d) => d.id === destId) ?? null;
        const toActivity = (params: Record<string, string>) => router.push({ pathname: '/trip/[id]/activity', params: { id: trip.id, ...params } });
        const toTemplates = () => router.push({ pathname: '/trip/[id]/templates', params: { id: trip.id } });

        if (days && days.length === 0) {
          return (
            <Card>
              <EmptyState
                icon="map-outline"
                title={t('itinerary.emptyTitle')}
                message={hasDates ? t('itinerary.emptyMessage') : t('itinerary.needDates')}
                action={
                  <Stack gap={2} style={{ alignSelf: 'stretch' }}>
                    {hasDates ? (
                      <>
                        <Button label={t('itinerary.createDays')} icon="calendar-outline" onPress={() => createDaysFromTripDates(trip.id).catch(fail)} testID="itinerary-create-days" />
                        <Button label={t('itinerary.useTemplate')} variant="secondary" icon="copy-outline" onPress={toTemplates} testID="itinerary-use-template" />
                      </>
                    ) : (
                      <Button label={t('itinerary.setDates')} variant="secondary" icon="calendar-outline" onPress={() => router.push({ pathname: '/trip/[id]/edit', params: { id: trip.id } })} />
                    )}
                  </Stack>
                }
              />
            </Card>
          );
        }

        const inTrip = (days ?? []).filter((d) => !d.outsideTrip).length;
        const missingDays = hasDates && !!days && inTrip < (tripDayCount(trip.startDate, trip.endDate) ?? 0);

        return (
          <Stack gap={3}>
            <Text variant="caption" tone="subtle">
              {t('itinerary.timesNote')}
            </Text>
            {missingDays ? (
              <Card tone="alt">
                <Text variant="bodySmall">{t('itinerary.missingDays')}</Text>
                <Button label={t('itinerary.createDays')} variant="secondary" icon="calendar-outline" onPress={() => createDaysFromTripDates(trip.id).catch(fail)} />
              </Card>
            ) : null}
            {(days ?? []).map((day) => (
              <DayTimeline
                key={day.id}
                day={day}
                dayNumber={dayNumber(trip.startDate, trip.endDate, day.date)}
                destination={destinationOf(day.destinationId)}
                isToday={day.date === today}
                onEditDay={() => router.push({ pathname: '/trip/[id]/day', params: { id: trip.id, dayId: day.id } })}
                onAddActivity={() => toActivity({ dayId: day.id })}
                onOpenActivity={(activityId) => toActivity({ activityId })}
                onToggleDone={(activityId, done) => setActivityStatus(activityId, done ? 'completed' : 'planned').catch(fail)}
                onShift={(activityId, dir) => shiftActivity(activityId, dir).catch(fail)}
              />
            ))}
            <Card tone="alt">
              <Text variant="subheading">{t('itinerary.addDayTitle')}</Text>
              <DateField label={t('itinerary.dayDate')} value={extraDate} onChange={setExtraDate} testID="itinerary-extra-date" />
              <Row gap={2} wrap>
                <Button
                  label={t('itinerary.addDay')}
                  icon="add"
                  disabled={!extraDate}
                  onPress={() => {
                    if (extraDate)
                      addDay(trip.id, extraDate)
                        .then(() => setExtraDate(null))
                        .catch(fail);
                  }}
                />
                {hasDates ? <Button label={t('itinerary.useTemplate')} variant="ghost" icon="copy-outline" onPress={toTemplates} /> : null}
              </Row>
            </Card>
          </Stack>
        );
      }}
    </TripScaffold>
  );
}
