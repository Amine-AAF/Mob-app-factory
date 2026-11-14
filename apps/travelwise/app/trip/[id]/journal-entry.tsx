import { Button, Chip, EmptyState, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { repos } from '@/database';
import { JournalValidationError, MAX_PHOTOS_PER_ENTRY } from '@/database/repositories/journal';
import type { TripDetails } from '@/database/repositories/trips';
import { createEntry, deleteEntry, discardPhotos, updateEntry } from '@/features/journal/actions';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { pickPhotos } from '@/services/documents';
import { FileImportError } from '@/services/files';
import type { JournalEntry } from '@/types/models';
import { clock } from '@/utils/clock';

function EntryForm({ trip, entry }: { trip: TripDetails; entry: JournalEntry | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = clock.today();
  const defaultDate = trip.startDate && trip.endDate && (today < trip.startDate || today > trip.endDate) ? trip.startDate : today;
  const [date, setDate] = useState(entry?.date ?? defaultDate);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [city, setCity] = useState(entry?.city ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [photos, setPhotos] = useState<string[]>(entry?.photoUris ?? []);
  const [error, setError] = useState<string | null>(null);
  // Photos copied during this edit but not saved must not stay on the phone.
  const added = useRef<string[]>([]);
  const saved = useRef(false);
  useEffect(
    () => () => {
      if (!saved.current) discardPhotos(added.current);
    },
    [],
  );

  const addPhotos = async () => {
    try {
      const res = await pickPhotos(MAX_PHOTOS_PER_ENTRY - photos.length);
      if (res.status === 'denied') return Alert.alert(t('journal.photoDenied'));
      if (res.status !== 'ok') return;
      added.current.push(...res.uris);
      setPhotos((p) => [...p, ...res.uris]);
    } catch (e) {
      if (e instanceof FileImportError) Alert.alert(t(`documents.errors.${e.code}`));
      else {
        recordError(e, 'journal_photos');
        Alert.alert(t('tripForm.errors.generic'));
      }
    }
  };

  const save = async () => {
    setError(null);
    const input = { date, title, city, body, notes, photoUris: photos };
    try {
      if (entry) await updateEntry(entry.id, input);
      else await createEntry(trip.id, input);
      // Photos removed from a new entry before saving are deleted now.
      discardPhotos(added.current.filter((u) => !photos.includes(u)));
      saved.current = true;
      router.back();
    } catch (e) {
      if (e instanceof JournalValidationError) setError(t(`journal.errors.${e.code}`));
      else {
        recordError(e, 'journal_form');
        setError(t('tripForm.errors.generic'));
      }
    }
  };

  return (
    <Stack gap={4}>
      <DateField label={t('journal.date')} value={date} onChange={(d) => d && setDate(d)} testID="journal-date" />
      <TextField label={t('journal.title')} value={title} onChangeText={setTitle} maxLength={120} optional optionalLabel={t('common.optional')} testID="journal-title" />
      <Stack gap={2}>
        <TextField label={t('journal.city')} value={city} onChangeText={setCity} optional optionalLabel={t('common.optional')} />
        {trip.destinations.length ? (
          <Row gap={2} wrap>
            {trip.destinations.map((d) => (
              <Chip key={d.id} label={d.city} selected={city === d.city} onPress={() => setCity(d.city)} />
            ))}
          </Row>
        ) : null}
      </Stack>
      <TextField label={t('journal.text')} placeholder={t('journal.textPlaceholder')} value={body} onChangeText={setBody} multiline testID="journal-body" />
      <Stack gap={2}>
        <Text variant="label">{t('journal.photos', { count: photos.length, max: MAX_PHOTOS_PER_ENTRY })}</Text>
        <Row gap={2} wrap>
          {photos.map((u) => (
            <View key={u}>
              <Image source={{ uri: u }} style={{ width: 96, height: 96, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} accessibilityIgnoresInvertColors />
              <View style={{ position: 'absolute', top: 0, right: 0 }}>
                <IconButton icon="close-circle" tone="danger" label={t('journal.removePhoto')} onPress={() => setPhotos((p) => p.filter((x) => x !== u))} />
              </View>
            </View>
          ))}
        </Row>
        {photos.length < MAX_PHOTOS_PER_ENTRY ? <Button label={t('journal.addPhotos')} variant="secondary" icon="images-outline" onPress={addPhotos} testID="journal-add-photos" /> : null}
      </Stack>
      <TextField label={t('journal.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {error ? (
        <Text tone="danger" testID="journal-error">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} size="lg" onPress={save} testID="journal-save" />
      {entry ? (
        <Button
          label={t('common.delete')}
          variant="danger"
          icon="trash-outline"
          onPress={() =>
            Alert.alert(t('journal.deleteTitle'), t('journal.deleteMessage'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () =>
                  deleteEntry(entry.id).then(() => {
                    saved.current = true;
                    discardPhotos(added.current);
                    router.back();
                  }),
              },
            ])
          }
        />
      ) : null}
    </Stack>
  );
}

export default function JournalEntryScreen() {
  const { id, entryId } = useLocalSearchParams<{ id: string; entryId?: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(async () => ({ trip: await repos().trips.get(id), entry: entryId ? await repos().journal.get(entryId) : null }), [id, entryId]);
  const missing = data && (!data.trip || (entryId && !data.entry));
  return (
    <Screen edges={[]} testID="journal-entry-screen">
      <RouterStack.Screen options={{ headerShown: true, title: entryId ? t('journal.editTitle') : t('journal.newTitle') }} />
      {missing ? <EmptyState icon="alert-circle-outline" title={t('journal.errors.not_found')} /> : null}
      {data?.trip && !missing ? <EntryForm key={data.entry?.id ?? 'new'} trip={data.trip} entry={data.entry} /> : null}
    </Screen>
  );
}
