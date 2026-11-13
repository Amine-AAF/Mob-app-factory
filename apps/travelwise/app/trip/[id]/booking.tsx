import { Button, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { TimeField } from '@/components/TimeField';
import { CURRENCY_CODES, isCurrencyCode, type CurrencyCode } from '@/constants/currencies';
import { BOOKING_STATUSES, BOOKING_TYPES, type BookingStatus, type BookingType } from '@/constants/domain';
import { repos } from '@/database';
import { BookingValidationError } from '@/database/repositories/bookings';
import type { TripDetails } from '@/database/repositories/trips';
import { createBooking, deleteBooking, updateBooking } from '@/features/bookings/actions';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import type { Booking } from '@/types/models';
import { fromMinor, parseAmount } from '@/utils/money';

/** Labels for the two "info" fields depend on the booking type (flight: from/to, hotel: check-in/out…). */
const ROUTE_TYPES: BookingType[] = ['flight', 'train', 'bus', 'ferry', 'car_rental'];

function BookingForm({ trip, booking }: { trip: TripDetails; booking: Booking | null }) {
  const { t } = useTranslation();
  const [type, setType] = useState<BookingType>(booking?.type ?? 'flight');
  const [status, setStatus] = useState<BookingStatus>(booking?.status ?? 'confirmed');
  const [provider, setProvider] = useState(booking?.provider ?? '');
  const [reference, setReference] = useState(booking?.reference ?? '');
  const [date, setDate] = useState(booking?.date ?? null);
  const [time, setTime] = useState(booking?.time ?? null);
  const [endDate, setEndDate] = useState(booking?.endDate ?? null);
  const [endTime, setEndTime] = useState(booking?.endTime ?? null);
  const [departureInfo, setDepartureInfo] = useState(booking?.departureInfo ?? '');
  const [arrivalInfo, setArrivalInfo] = useState(booking?.arrivalInfo ?? '');
  const [address, setAddress] = useState(booking?.address ?? '');
  const [currency, setCurrency] = useState<CurrencyCode>(booking?.currency && isCurrencyCode(booking.currency) ? booking.currency : isCurrencyCode(trip.currency) ? trip.currency : 'USD');
  const [price, setPrice] = useState(booking?.priceMinor != null && booking.currency ? String(fromMinor(booking.priceMinor, booking.currency)) : '');
  const [notes, setNotes] = useState(booking?.notes ?? '');
  const [url, setUrl] = useState(booking?.url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isRoute = ROUTE_TYPES.includes(type);

  const save = async () => {
    setError(null);
    const priceMinor = price.trim() ? parseAmount(price, currency) : null;
    if (price.trim() && priceMinor === null) return setError(t('bookings.errors.invalid_price'));
    const input = { type, status, provider, reference, date, time, endDate, endTime, departureInfo, arrivalInfo, address, priceMinor, currency: priceMinor !== null ? currency : null, notes, url: url || null, attachmentDocumentId: booking?.attachmentDocumentId ?? null };
    setSaving(true);
    try {
      if (booking) await updateBooking(booking.id, input);
      else await createBooking(trip.id, input);
      router.back();
    } catch (e) {
      if (e instanceof BookingValidationError) setError(t(`bookings.errors.${e.code}`));
      else {
        recordError(e, 'booking_form');
        setError(t('tripForm.errors.generic'));
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('bookings.deleteTitle'), t('bookings.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => booking && deleteBooking(booking.id).then(() => router.back()) },
    ]);

  return (
    <Stack gap={4}>
      <Text variant="caption" tone="subtle">
        {t('bookings.disclaimer')}
      </Text>
      <ChoiceChips label={t('booking.type')} options={BOOKING_TYPES} value={type} onChange={setType} labelOf={(v) => t(`enums.bookingType.${v}`)} testID="booking-type" />
      <TextField label={t('booking.provider')} placeholder={t('booking.providerPlaceholder')} value={provider} onChangeText={setProvider} testID="booking-provider" />
      <TextField label={t('booking.reference')} hint={t('booking.referenceHint')} value={reference} onChangeText={setReference} autoCapitalize="characters" autoCorrect={false} testID="booking-reference" />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <DateField label={isRoute ? t('booking.departureDate') : t('booking.startDate')} value={date} onChange={setDate} optional testID="booking-date" />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <TimeField label={t('booking.time')} value={time} onChange={setTime} testID="booking-time" />
        </Stack>
      </Row>
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <DateField label={isRoute ? t('booking.arrivalDate') : t('booking.endDate')} value={endDate} min={date} onChange={setEndDate} optional />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <TimeField label={t('booking.endTime')} value={endTime} onChange={setEndTime} />
        </Stack>
      </Row>
      <Text variant="caption" tone="subtle">
        {t('booking.localTimeHint')}
      </Text>
      <TextField label={isRoute ? t('booking.from') : t('booking.checkInInfo')} value={departureInfo} onChangeText={setDepartureInfo} optional optionalLabel={t('common.optional')} />
      <TextField label={isRoute ? t('booking.to') : t('booking.checkOutInfo')} value={arrivalInfo} onChangeText={setArrivalInfo} optional optionalLabel={t('common.optional')} />
      <TextField label={t('booking.address')} value={address} onChangeText={setAddress} optional optionalLabel={t('common.optional')} />
      <TextField label={t('booking.price')} keyboardType="decimal-pad" value={price} onChangeText={setPrice} optional optionalLabel={t('common.optional')} />
      {price.trim() ? <ChoiceChips options={CURRENCY_CODES} value={currency} onChange={setCurrency} labelOf={(c) => c} /> : null}
      <ChoiceChips label={t('booking.status')} options={BOOKING_STATUSES} value={status} onChange={setStatus} labelOf={(v) => t(`enums.bookingStatus.${v}`)} />
      <TextField label={t('booking.link')} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" optional optionalLabel={t('common.optional')} />
      <TextField label={t('booking.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      <Text variant="caption" tone="subtle">
        {t('booking.noPayment')}
      </Text>
      {error ? (
        <Text tone="danger" testID="booking-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} loading={saving} testID="booking-save" />
      {booking ? <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} /> : null}
    </Stack>
  );
}

export default function BookingScreen() {
  const { id, bookingId } = useLocalSearchParams<{ id: string; bookingId?: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => {
    const [trip, booking] = await Promise.all([repos().trips.get(id), bookingId ? repos().bookings.get(bookingId) : Promise.resolve(null)]);
    return { trip, booking };
  }, [id, bookingId]);
  const missing = data && (!data.trip || (bookingId && !data.booking));
  return (
    <Screen edges={[]} testID="booking-screen">
      <RouterStack.Screen options={{ headerShown: true, title: bookingId ? t('booking.editTitle') : t('booking.newTitle') }} />
      {missing ? <EmptyState icon="alert-circle-outline" title={t('bookings.errors.not_found')} /> : null}
      {data?.trip && !missing ? <BookingForm key={data.booking?.id ?? 'new'} trip={data.trip} booking={data.booking} /> : null}
    </Screen>
  );
}
