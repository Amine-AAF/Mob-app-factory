import { Button, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { TextField } from '@/components/TextField';
import { TimeField } from '@/components/TimeField';
import { CURRENCY_CODES, isCurrencyCode, type CurrencyCode } from '@/constants/currencies';
import { ACTIVITY_CATEGORIES, ACTIVITY_STATUSES, type ActivityCategory, type ActivityStatus } from '@/constants/domain';
import { repos } from '@/database';
import { ItineraryValidationError, type DayWithActivities } from '@/database/repositories/itinerary';
import type { TripDetails } from '@/database/repositories/trips';
import { addActivity, deleteActivity, duplicateActivity, moveActivity, updateActivity } from '@/features/itinerary/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import type { Activity } from '@/types/models';
import { dayNumber } from '@/utils/dates';
import { fromMinor, parseAmount } from '@/utils/money';

function ActivityForm({ trip, days, activity, dayId }: { trip: TripDetails; days: DayWithActivities[]; activity: Activity | null; dayId: string }) {
  const { t } = useTranslation();
  const [name, setName] = useState(activity?.name ?? '');
  const [category, setCategory] = useState<ActivityCategory>(activity?.category ?? 'sightseeing');
  const [status, setStatus] = useState<ActivityStatus>(activity?.status ?? 'planned');
  const [startTime, setStartTime] = useState(activity?.startTime ?? null);
  const [endTime, setEndTime] = useState(activity?.endTime ?? null);
  const [duration, setDuration] = useState(activity?.durationMinutes != null && !(activity.startTime && activity.endTime) ? String(activity.durationMinutes) : '');
  const [currency, setCurrency] = useState<CurrencyCode>(activity?.currency && isCurrencyCode(activity.currency) ? activity.currency : isCurrencyCode(trip.currency) ? trip.currency : 'USD');
  const [price, setPrice] = useState(activity?.priceMinor != null && activity.currency ? String(fromMinor(activity.priceMinor, activity.currency)) : '');
  const [address, setAddress] = useState(activity?.address ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [notes, setNotes] = useState(activity?.notes ?? '');
  const [url, setUrl] = useState(activity?.url ?? '');
  const [targetDay, setTargetDay] = useState(dayId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cityOf = (d: DayWithActivities) => trip.destinations.find((x) => x.id === d.destinationId)?.city;
  const dayLabel = (date: string) => {
    const n = dayNumber(trip.startDate, trip.endDate, date);
    return n ? t('itinerary.dayNumber', { number: n }) : null;
  };

  const save = async () => {
    setError(null);
    const priceMinor = price.trim() ? parseAmount(price, currency) : null;
    if (price.trim() && priceMinor === null) return setError(t('itinerary.errors.invalid_price'));
    const durationMinutes = duration.trim() ? Number(duration) : null;
    if (durationMinutes !== null && !Number.isInteger(durationMinutes)) return setError(t('itinerary.errors.invalid_duration'));
    const input = { name, category, status, startTime, endTime, durationMinutes, priceMinor, currency: priceMinor !== null ? currency : null, address, description, notes, url: url || null, placeId: activity?.placeId ?? null };
    setSaving(true);
    try {
      if (activity) {
        await updateActivity(activity.id, input);
        if (targetDay !== activity.dayId) await moveActivity(activity.id, targetDay);
      } else {
        await addActivity(targetDay, input);
      }
      router.back();
    } catch (e) {
      if (e instanceof ItineraryValidationError) setError(t(`itinerary.errors.${e.code}`));
      else {
        recordError(e, 'activity_form');
        setError(t('tripForm.errors.generic'));
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('itinerary.deleteActivityTitle'), activity?.name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => activity && deleteActivity(activity.id).then(() => router.back()) },
    ]);

  return (
    <Stack gap={4}>
      <TextField label={t('activity.name')} placeholder={t('activity.namePlaceholder')} value={name} onChangeText={setName} maxLength={120} testID="activity-name" />
      <ChoiceChips label={t('activity.category')} options={ACTIVITY_CATEGORIES} value={category} onChange={setCategory} labelOf={(c) => t(`enums.activityCategory.${c}`)} testID="activity-category" />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <TimeField label={t('activity.start')} value={startTime} onChange={setStartTime} testID="activity-start" />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <TimeField label={t('activity.end')} value={endTime} onChange={setEndTime} testID="activity-end" />
        </Stack>
      </Row>
      <Text variant="caption" tone="subtle">
        {t('activity.timeHint')}
      </Text>
      {!(startTime && endTime) ? (
        <TextField label={t('activity.duration')} keyboardType="number-pad" value={duration} onChangeText={setDuration} optional optionalLabel={t('common.optional')} />
      ) : null}
      <Stack gap={2}>
        <Text variant="label">{t('activity.moveToDay')}</Text>
        <Row gap={2} wrap>
          {days.map((d) => (
            <Chip
              key={d.id}
              label={[dayLabel(d.date), fmt.shortDate(d.date), cityOf(d)].filter(Boolean).join(' · ')}
              selected={targetDay === d.id}
              onPress={() => setTargetDay(d.id)}
              testID={`activity-day-${d.date}`}
            />
          ))}
        </Row>
      </Stack>
      <TextField label={t('activity.address')} value={address} onChangeText={setAddress} optional optionalLabel={t('common.optional')} />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <TextField label={t('activity.price')} keyboardType="decimal-pad" value={price} onChangeText={setPrice} optional optionalLabel={t('common.optional')} testID="activity-price" />
        </Stack>
      </Row>
      {price.trim() ? <ChoiceChips options={CURRENCY_CODES} value={currency} onChange={setCurrency} labelOf={(c) => c} /> : null}
      <TextField label={t('activity.description')} value={description} onChangeText={setDescription} multiline optional optionalLabel={t('common.optional')} />
      <TextField label={t('activity.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      <TextField label={t('activity.link')} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" optional optionalLabel={t('common.optional')} />
      {activity ? <ChoiceChips label={t('activity.status')} options={ACTIVITY_STATUSES} value={status} onChange={setStatus} labelOf={(s) => t(`enums.activityStatus.${s}`)} /> : null}
      {error ? (
        <Text tone="danger" testID="activity-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} loading={saving} testID="activity-save" />
      {activity ? (
        <Stack gap={2}>
          <Button label={t('common.duplicate')} variant="secondary" icon="copy-outline" onPress={() => duplicateActivity(activity.id).then(() => router.back())} />
          <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} />
        </Stack>
      ) : null}
    </Stack>
  );
}

export default function ActivityScreen() {
  const { id, dayId, activityId } = useLocalSearchParams<{ id: string; dayId?: string; activityId?: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => {
    const r = repos();
    const [trip, days, activity] = await Promise.all([r.trips.get(id), r.itinerary.listDays(id), activityId ? r.itinerary.getActivity(activityId) : Promise.resolve(null)]);
    return { trip, days, activity };
  }, [id, activityId]);

  const startDay = data?.activity?.dayId ?? dayId;
  const missing = data && (!data.trip || !startDay || (activityId && !data.activity));
  return (
    <Screen edges={[]} testID="activity-screen">
      <RouterStack.Screen options={{ headerShown: true, title: activityId ? t('activity.editTitle') : t('activity.newTitle') }} />
      {missing ? <EmptyState icon="alert-circle-outline" title={t('itinerary.errors.activity_not_found')} /> : null}
      {data && !missing && data.trip && startDay ? <ActivityForm key={data.activity?.id ?? 'new'} trip={data.trip} days={data.days} activity={data.activity} dayId={startDay} /> : null}
    </Screen>
  );
}
