import { Button, Card, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TextField } from '@/components/TextField';
import { WEATHER_CONDITIONS, type WeatherCondition } from '@/constants/domain';
import { catalogName } from '@/content/packingCatalog';
import { repos } from '@/database';
import type { TripDetails } from '@/database/repositories/trips';
import { WeatherValidationError, weatherPackingSuggestions } from '@/database/repositories/weather';
import { saveWeather } from '@/features/journal/actions';
import { addPackingItem, createPackingList } from '@/features/packing/actions';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import type { WeatherNote } from '@/types/models';

const parseTemp = (s: string): number | null | 'invalid' => {
  const v = s.trim().replace(',', '.');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : 'invalid';
};

/** Expected weather typed by the user. No forecast is shown or invented. */
function WeatherForm({ trip, note, destinationId, packedNames }: { trip: TripDetails; note: WeatherNote | null; destinationId: string | null; packedNames: Set<string> }) {
  const { t, i18n } = useTranslation();
  const [conditions, setConditions] = useState<WeatherCondition[]>(note?.conditions ?? []);
  const [min, setMin] = useState(note?.minTempC != null ? String(note.minTempC) : '');
  const [max, setMax] = useState(note?.maxTempC != null ? String(note.maxTempC) : '');
  const [notes, setNotes] = useState(note?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const minV = parseTemp(min);
  const maxV = parseTemp(max);
  const suggestions = weatherPackingSuggestions({ conditions, minTempC: typeof minV === 'number' ? minV : null, maxTempC: typeof maxV === 'number' ? maxV : null }).filter(
    (c) => !packedNames.has(catalogName(c, i18n.language).toLowerCase()),
  );

  const save = () => {
    setError(null);
    if (minV === 'invalid' || maxV === 'invalid') return setError(t('weather.errors.invalid_temperature'));
    saveWeather(trip.id, destinationId, { conditions, minTempC: minV, maxTempC: maxV, notes })
      .then(() => Alert.alert(t('weather.saved')))
      .catch((e) => setError(e instanceof WeatherValidationError ? t(`weather.errors.${e.code}`) : t('tripForm.errors.generic')));
  };

  const addSuggestions = async () => {
    try {
      const lists = await repos().packing.listsForTrip(trip.id);
      const list = lists[0] ?? (await createPackingList(trip.id, t('weather.listName')));
      for (const c of suggestions) await addPackingItem(list.id, { name: catalogName(c, i18n.language), category: c.category, priority: c.priority, quantity: c.quantity ?? 1 });
      Alert.alert(t('weather.addedToList', { count: suggestions.length, list: list.name }));
    } catch (e) {
      recordError(e, 'weather_suggestions');
      Alert.alert(t('tripForm.errors.generic'));
    }
  };

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text variant="label">{t('weather.conditions')}</Text>
        <Row gap={2} wrap>
          {WEATHER_CONDITIONS.map((c) => {
            const on = conditions.includes(c);
            return <Chip key={c} label={t(`enums.weather.${c}`)} selected={on} onPress={() => setConditions(on ? conditions.filter((x) => x !== c) : [...conditions, c])} testID={`weather-${c}`} />;
          })}
        </Row>
      </Stack>
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <TextField label={t('weather.min')} keyboardType="numbers-and-punctuation" value={min} onChangeText={setMin} testID="weather-min" />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <TextField label={t('weather.max')} keyboardType="numbers-and-punctuation" value={max} onChangeText={setMax} testID="weather-max" />
        </Stack>
      </Row>
      <TextField label={t('weather.notes')} placeholder={t('weather.notesPlaceholder')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button label={t('common.save')} onPress={save} testID="weather-save" />
      {suggestions.length ? (
        <Card tone="alt" testID="weather-suggestions">
          <Text variant="subheading">{t('weather.suggestionsTitle')}</Text>
          {suggestions.map((c) => (
            <Text key={c.id} variant="bodySmall">{`• ${catalogName(c, i18n.language)}`}</Text>
          ))}
          <Button label={t('weather.addSuggestions')} variant="secondary" icon="briefcase-outline" onPress={addSuggestions} testID="weather-add-suggestions" />
        </Card>
      ) : null}
    </Stack>
  );
}

export default function WeatherScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const { data } = useAsync(async () => {
    const r = repos();
    const [trip, note, lists] = await Promise.all([r.trips.get(id), r.weather.get(id, destinationId), r.packing.listsForTrip(id)]);
    return { trip, note, packedNames: new Set(lists.flatMap((l) => l.items.map((i) => i.name.toLowerCase()))) };
  }, [id, destinationId]);
  return (
    <Screen edges={[]} testID="weather-screen">
      <RouterStack.Screen options={{ headerShown: true, title: t('weather.title') }} />
      <Text variant="bodySmall" tone="muted">
        {t('weather.disclaimer')}
      </Text>
      {data && !data.trip ? <EmptyState icon="alert-circle-outline" title={t('tripDetail.notFound')} /> : null}
      {data?.trip && data.trip.destinations.length > 1 ? (
        <Row gap={2} wrap>
          <Chip label={t('weather.wholeTrip')} selected={destinationId === null} onPress={() => setDestinationId(null)} />
          {data.trip.destinations.map((d) => (
            <Chip key={d.id} label={d.city} selected={destinationId === d.id} onPress={() => setDestinationId(d.id)} />
          ))}
        </Row>
      ) : null}
      {data?.trip ? <WeatherForm key={`${destinationId ?? 'trip'}-${data.note?.updatedAt ?? 'new'}`} trip={data.trip} note={data.note} destinationId={destinationId} packedNames={data.packedNames} /> : null}
    </Screen>
  );
}
