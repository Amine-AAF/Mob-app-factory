import { Button, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TextField } from '@/components/TextField';
import { repos } from '@/database';
import type { TripDetails } from '@/database/repositories/trips';
import { deleteDay, updateDay } from '@/features/itinerary/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import type { ItineraryDay } from '@/types/models';
import { fromMinor, parseAmount } from '@/utils/money';

function DayForm({ trip, day, activityCount }: { trip: TripDetails; day: ItineraryDay; activityCount: number }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(day.title);
  const [description, setDescription] = useState(day.description);
  const [notes, setNotes] = useState(day.notes);
  const [destinationId, setDestinationId] = useState<string | null>(day.destinationId);
  const [budget, setBudget] = useState(day.budgetMinor != null ? String(fromMinor(day.budgetMinor, trip.currency)) : '');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const budgetMinor = budget.trim() ? parseAmount(budget, trip.currency) : null;
    if (budget.trim() && budgetMinor === null) return setError(t('itinerary.errors.invalid_price'));
    try {
      await updateDay(day.id, { title, description, notes, destinationId, budgetMinor });
      router.back();
    } catch (e) {
      recordError(e, 'day_form');
      setError(t('tripForm.errors.generic'));
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('itinerary.deleteDayTitle'), t('itinerary.deleteDayMessage', { count: activityCount }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteDay(day.id).then(() => router.back()) },
    ]);

  return (
    <Stack gap={4}>
      <Text variant="subheading">{fmt.date(day.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <TextField label={t('day.title')} placeholder={t('day.titlePlaceholder')} value={title} onChangeText={setTitle} maxLength={80} testID="day-title" />
      {trip.destinations.length ? (
        <Stack gap={2}>
          <Text variant="label">{t('day.city')}</Text>
          <Row gap={2} wrap>
            {trip.destinations.map((d) => (
              <Chip key={d.id} label={d.city} selected={destinationId === d.id} onPress={() => setDestinationId(destinationId === d.id ? null : d.id)} />
            ))}
          </Row>
        </Stack>
      ) : null}
      <TextField label={t('day.description')} value={description} onChangeText={setDescription} multiline optional optionalLabel={t('common.optional')} />
      <TextField label={t('day.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      <TextField label={t('day.budget', { currency: trip.currency })} keyboardType="decimal-pad" value={budget} onChangeText={setBudget} optional optionalLabel={t('common.optional')} />
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button label={t('common.save')} size="lg" onPress={save} testID="day-save" />
      <Button label={t('itinerary.deleteDay')} variant="danger" icon="trash-outline" onPress={confirmDelete} />
    </Stack>
  );
}

export default function DayScreen() {
  const { id, dayId } = useLocalSearchParams<{ id: string; dayId: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => {
    const [trip, days] = await Promise.all([repos().trips.get(id), repos().itinerary.listDays(id)]);
    return { trip, day: days.find((d) => d.id === dayId) ?? null };
  }, [id, dayId]);
  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ headerShown: true, title: t('itinerary.editDay') }} />
      {data && (!data.trip || !data.day) ? <EmptyState icon="alert-circle-outline" title={t('itinerary.errors.day_not_found')} /> : null}
      {data?.trip && data.day ? <DayForm trip={data.trip} day={data.day} activityCount={data.day.activities.length} /> : null}
    </Screen>
  );
}
