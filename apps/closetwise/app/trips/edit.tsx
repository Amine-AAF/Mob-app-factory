import { addDays } from '@factory/app-core';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DateField, confirmDelete } from '@/components/forms';
import { canAdd, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { TRIP_TEMPLATES, type TripTemplate } from '@/domain/catalog';
import { isValidTripDates, tripNights } from '@/domain/packing';
import type { DayKey, Trip } from '@/domain/types';
import { REMINDER_OPTIONS } from '@/features/trips/logic';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { useIsPremium } from '@/store/session';
import { Button, ChoiceChips, EmptyState, Field, FieldLabel, Loading, Row, Screen, Stack, Text, Chip } from '@/ui';

export default function TripEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const { data, loading } = useAsync(async () => (id ? await repos().trips.get(id) : null), [id]);
  const title = id ? t('trips.edit.editTitle') : t('trips.edit.newTitle');
  if (id && loading && data === undefined) return <Loading />;
  if (id && !data) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        <EmptyState icon="airplane-outline" title={t('trips.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  return <TripForm key={data?.id ?? 'new'} trip={data ?? null} title={title} />;
}

function TripForm({ trip, title }: { trip: Trip | null; title: string }) {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const today = clock.today();
  const [destination, setDestination] = useState(trip?.destination ?? '');
  const [departure, setDeparture] = useState<DayKey | null>(trip?.departureDate ?? addDays(today, 7));
  const [ret, setRet] = useState<DayKey | null>(trip?.returnDate ?? addDays(today, 9));
  const [template, setTemplate] = useState<TripTemplate | null>(trip?.template ?? null);
  const [reminder, setReminder] = useState<number | null>(trip ? trip.reminderDays : 2);
  const [notes, setNotes] = useState(trip?.notes ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const destinationError = submitted && !destination.trim() ? t('trips.edit.destinationRequired') : null;
  const datesValid = !!departure && !!ret && isValidTripDates(departure, ret);
  const datesError = submitted && !datesValid ? t('trips.edit.invalidDates') : null;

  const save = async () => {
    setSubmitted(true);
    if (!destination.trim() || !departure || !ret || !datesValid) return;
    setSaving(true);
    try {
      const r = repos();
      if (!trip && ret >= today) {
        const count = await r.trips.activeCount(today);
        if (!canAdd('activeTrips', count, isPremium)) {
          setSaving(false);
          Alert.alert(t('common.premium.limitTitle'), t('common.premium.tripsLimit', { count: FREE_LIMITS.activeTrips }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.premium.seePlans'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'trips' } }) },
          ]);
          return;
        }
      }
      const savedId = await r.trips.save({ destination, departureDate: departure, returnDate: ret, template, notes: notes.trim() || null, reminderDays: reminder }, trip?.id);
      if (template && template !== trip?.template) await r.trips.applyTemplate(savedId, template);
      afterWrite({ notifications: true });
      if (trip) router.back();
      else router.replace({ pathname: '/trips/[id]', params: { id: savedId } });
    } catch (e) {
      recordError(e, 'trip_save');
      setSaving(false);
      Alert.alert(t('common.error'));
    }
  };

  const remove = () =>
    trip &&
    confirmDelete(
      t,
      async () => {
        try {
          await repos().trips.remove(trip.id);
          afterWrite({ notifications: true });
          router.dismissTo('/trips');
        } catch (e) {
          recordError(e, 'trip_delete');
          Alert.alert(t('common.error'));
        }
      },
      t('trips.edit.deleteTitle'),
      t('trips.edit.deleteMessage'),
    );

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} loading={saving} testID="trip-save" />}>
      <RouterStack.Screen options={{ title }} />
      <Text tone="muted">{t('trips.intro')}</Text>
      <Field label={t('trips.edit.destination')} value={destination} onChangeText={setDestination} placeholder={t('trips.edit.destinationPlaceholder')} error={destinationError} maxLength={80} testID="trip-destination" />
      <DateField label={t('trips.edit.departure')} value={departure} onChange={setDeparture} testID="trip-departure" />
      <DateField label={t('trips.edit.return')} value={ret} onChange={setRet} testID="trip-return" />
      {datesError ? (
        <Text variant="caption" tone="danger">
          {datesError}
        </Text>
      ) : datesValid && departure && ret ? (
        <Text variant="caption" tone="subtle">
          {t('trips.nights', { count: tripNights({ departureDate: departure, returnDate: ret }) })}
        </Text>
      ) : null}

      <Stack gap={1.5}>
        <ChoiceChips
          label={t('trips.edit.template')}
          options={TRIP_TEMPLATES.map((k) => ({ value: k, label: t(`catalog.tripTemplate.${k}`) }))}
          value={template}
          onChange={setTemplate}
          allowNone
        />
        <Text variant="caption" tone="subtle">
          {trip ? t('trips.edit.templateHintEdit') : t('trips.edit.templateHint')}
        </Text>
      </Stack>

      <Stack gap={2}>
        <FieldLabel>{t('trips.edit.reminder')}</FieldLabel>
        <Row gap={2} wrap>
          {REMINDER_OPTIONS.map((d) => (
            <Chip key={String(d)} label={d == null ? t('trips.edit.reminderOff') : t('trips.edit.reminderDays', { count: d })} selected={reminder === d} onPress={() => setReminder(d)} />
          ))}
        </Row>
        <Text variant="caption" tone="subtle">
          {t('trips.edit.reminderHint')}
        </Text>
      </Stack>

      <Field label={`${t('trips.edit.notes')} · ${t('common.optional')}`} value={notes} onChangeText={setNotes} multiline maxLength={500} />

      {trip ? <Button variant="danger" icon="trash-outline" label={t('trips.edit.delete')} onPress={remove} /> : null}
    </Screen>
  );
}
