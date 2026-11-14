import { Button, Chip, EmptyState, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Switch } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { TextField } from '@/components/TextField';
import { PLACE_CATEGORIES, type PlaceCategory } from '@/constants/domain';
import { repos } from '@/database';
import type { DayWithActivities } from '@/database/repositories/itinerary';
import { PlaceValidationError, parseCoordinates } from '@/database/repositories/places';
import { createPlace, deletePlace, openInMaps, updatePlace } from '@/features/places/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { pickPhotos } from '@/services/documents';
import { deleteLocalFiles } from '@/services/files';
import type { Place, Trip } from '@/types/models';

function PlaceForm({ place, trips, days, defaultTripId }: { place: Place | null; trips: Trip[]; days: DayWithActivities[]; defaultTripId: string | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [name, setName] = useState(place?.name ?? '');
  const [category, setCategory] = useState<PlaceCategory>(place?.category ?? 'attraction');
  const [address, setAddress] = useState(place?.address ?? '');
  const [city, setCity] = useState(place?.city ?? '');
  const [country, setCountry] = useState(place?.countryCode ?? '');
  const [coords, setCoords] = useState(place?.latitude != null && place.longitude != null ? `${place.latitude}, ${place.longitude}` : '');
  const [url, setUrl] = useState(place?.url ?? '');
  const [notes, setNotes] = useState(place?.notes ?? '');
  const [favorite, setFavorite] = useState(place?.isFavorite ?? false);
  const [tripId, setTripId] = useState<string | null>(place ? place.tripId : defaultTripId);
  const [dayId, setDayId] = useState<string | null>(place?.dayId ?? null);
  const [photoUri, setPhotoUri] = useState<string | null>(place?.photoUri ?? null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tripDays = days.filter((d) => d.tripId === tripId);

  const save = async () => {
    setError(null);
    const c = coords.trim() ? parseCoordinates(coords) : null;
    if (coords.trim() && !c) return setError(t('places.errors.invalid_coordinates'));
    const input = { name, category, address, city, countryCode: country || null, url: url || null, notes, isFavorite: favorite, tripId, dayId: tripId ? dayId : null, photoUri, latitude: c?.latitude ?? null, longitude: c?.longitude ?? null };
    try {
      if (place) await updatePlace(place.id, input);
      else await createPlace(input);
      router.back();
    } catch (e) {
      if (e instanceof PlaceValidationError) setError(t(`places.errors.${e.code}`));
      else {
        recordError(e, 'place_form');
        setError(t('tripForm.errors.generic'));
      }
    }
  };

  const choosePhoto = async () => {
    try {
      const res = await pickPhotos(1);
      if (res.status === 'denied') return Alert.alert(t('journal.photoDenied'));
      if (res.status !== 'ok') return;
      // A photo picked in this form but replaced again is deleted right away.
      if (newPhoto) deleteLocalFiles([newPhoto]);
      setNewPhoto(res.uris[0]!);
      setPhotoUri(res.uris[0]!);
    } catch (e) {
      recordError(e, 'place_photo');
      Alert.alert(t('documents.errors.copy_failed'));
    }
  };

  return (
    <Stack gap={4}>
      <TextField label={t('places.name')} value={name} onChangeText={setName} maxLength={120} testID="place-name" />
      <ChoiceChips label={t('places.category')} options={PLACE_CATEGORIES} value={category} onChange={setCategory} labelOf={(c) => t(`enums.placeCategory.${c}`)} testID="place-category" />
      <TextField label={t('places.address')} value={address} onChangeText={setAddress} optional optionalLabel={t('common.optional')} />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 2 }}>
          <TextField label={t('places.city')} value={city} onChangeText={setCity} optional optionalLabel={t('common.optional')} />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <TextField label={t('tripForm.country')} value={country} onChangeText={(v) => setCountry(v.toUpperCase())} maxLength={2} autoCapitalize="characters" />
        </Stack>
      </Row>
      <TextField label={t('places.coordinates')} hint={t('places.coordinatesHint')} placeholder="38.7223, -9.1393" keyboardType="numbers-and-punctuation" value={coords} onChangeText={setCoords} testID="place-coords" />
      <TextField label={t('places.link')} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" optional optionalLabel={t('common.optional')} />
      <TextField label={t('places.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {photoUri ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: 180, borderRadius: theme.radius.md }} resizeMode="cover" accessibilityLabel={name} /> : null}
      <Row gap={2} wrap>
        <Button label={photoUri ? t('places.changePhoto') : t('places.addPhoto')} variant="secondary" icon="image-outline" onPress={choosePhoto} />
        {photoUri ? <Button label={t('places.removePhoto')} variant="ghost" onPress={() => setPhotoUri(null)} /> : null}
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text>{t('places.favorite')}</Text>
        <Switch value={favorite} onValueChange={setFavorite} accessibilityLabel={t('places.favorite')} />
      </Row>
      {trips.length ? (
        <Stack gap={2}>
          <Text variant="label">{t('places.trip')}</Text>
          <Row gap={2} wrap>
            <Chip label={t('places.noTrip')} selected={tripId === null} onPress={() => setTripId(null)} />
            {trips.map((x) => (
              <Chip key={x.id} label={x.name} selected={tripId === x.id} onPress={() => {
                  setTripId(x.id);
                  setDayId(null);
                }} />
            ))}
          </Row>
        </Stack>
      ) : null}
      {tripDays.length ? (
        <Stack gap={2}>
          <Text variant="label">{t('places.day')}</Text>
          <Row gap={2} wrap>
            <Chip label={t('places.noDay')} selected={dayId === null} onPress={() => setDayId(null)} />
            {tripDays.map((d) => (
              <Chip key={d.id} label={fmt.shortDate(d.date)} selected={dayId === d.id} onPress={() => setDayId(d.id)} />
            ))}
          </Row>
        </Stack>
      ) : null}
      {error ? (
        <Text tone="danger" testID="place-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} testID="place-save" />
      {place ? (
        <Stack gap={2}>
          <Button label={t('places.openMap')} variant="secondary" icon="navigate-outline" onPress={() => openInMaps(place).then((ok) => {
                if (!ok) Alert.alert(t('places.noMapApp'));
              })} />
          <Button
            label={t('common.delete')}
            variant="danger"
            icon="trash-outline"
            onPress={() =>
              Alert.alert(t('places.deleteTitle'), place.name, [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: () => deletePlace(place.id).then(() => router.back()) },
              ])
            }
          />
        </Stack>
      ) : null}
    </Stack>
  );
}

export default function PlaceScreen() {
  const { placeId, tripId } = useLocalSearchParams<{ placeId?: string; tripId?: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => {
    const r = repos();
    const [place, trips] = await Promise.all([placeId ? r.places.get(placeId) : Promise.resolve(null), r.trips.list({ includeArchived: false })]);
    const days = (await Promise.all(trips.map((x) => r.itinerary.listDays(x.id)))).flat();
    return { place, trips, days };
  }, [placeId]);
  const missing = data && placeId && !data.place;
  return (
    <Screen edges={[]} testID="place-screen">
      <RouterStack.Screen options={{ title: placeId ? t('places.editTitle') : t('places.newTitle') }} />
      {missing ? <EmptyState icon="alert-circle-outline" title={t('places.errors.not_found')} /> : null}
      {data && !missing ? <PlaceForm key={data.place?.id ?? 'new'} place={data.place} trips={data.trips} days={data.days} defaultTripId={tripId ?? null} /> : null}
    </Screen>
  );
}
