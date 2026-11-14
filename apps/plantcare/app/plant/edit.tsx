import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { CATEGORY_ICON } from '@/components/icons';
import { ChipSelect, DateField, PhotoField, Stepper, SwitchRow, TextField } from '@/components/forms';
import { getSpecies } from '@/content/species';
import { speciesName } from '@/content/species/localize';
import { repos } from '@/database';
import { canAddPlant } from '@/domain/limits';
import { WATERING_SUGGESTIONS } from '@/domain/schedule';
import { PLANT_CATEGORIES, type GardenLocation, type PlantCategory } from '@/domain/types';
import { parseDecimal, volumeToMl, volumeUnit } from '@/domain/units';
import { useMutation } from '@/hooks/useData';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { deletePhotos } from '@/services/photos';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function EditPlant() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const params = useLocalSearchParams<{ id?: string; speciesId?: string; locationId?: string }>();
  const editing = typeof params.id === 'string' && params.id.length > 0;
  const species = getSpecies(params.speciesId);

  const [nickname, setNickname] = useState(species ? speciesName(species) : '');
  const [commonName, setCommonName] = useState(species ? speciesName(species) : '');
  const [scientificName, setScientificName] = useState(species?.scientificName ?? '');
  const [category, setCategory] = useState<PlantCategory>(species?.category ?? 'indoor');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [acquiredOn, setAcquiredOn] = useState<string | null>(clock.today());
  const [plantedOn, setPlantedOn] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(typeof params.locationId === 'string' ? params.locationId : null);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(species?.id ?? null);
  const [favorite, setFavorite] = useState(false);
  const [locations, setLocations] = useState<GardenLocation[]>([]);
  // Optional watering schedule (creation only)
  const [schedule, setSchedule] = useState(true);
  const [interval, setIntervalDays] = useState(7);
  const [firstWatering, setFirstWatering] = useState<string | null>(clock.today());
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = repos();
    void r.locations.list().then(setLocations);
    if (!editing) return;
    void r.plants.get(params.id!).then((p) => {
      if (!p) return;
      setNickname(p.nickname);
      setCommonName(p.commonName);
      setScientificName(p.scientificName ?? '');
      setCategory(p.category);
      setPhotoPath(p.photoPath);
      setOriginalPhoto(p.photoPath);
      setAcquiredOn(p.acquiredOn);
      setPlantedOn(p.plantedOn);
      setLocationId(p.locationId);
      setDescription(p.description);
      setNotes(p.notes);
      setSpeciesId(p.speciesId);
      setFavorite(p.favorite);
    });
  }, [editing, params.id]);

  const suggestions = species ? WATERING_SUGGESTIONS[species.water] : WATERING_SUGGESTIONS.moderate;

  const save = async () => {
    if (!nickname.trim()) {
      setError(t('validation.required'));
      return;
    }
    setSaving(true);
    try {
      const input = {
        nickname: nickname.trim(),
        commonName: commonName.trim(),
        scientificName: scientificName.trim() || null,
        speciesId,
        category,
        photoPath,
        acquiredOn,
        plantedOn,
        locationId,
        description: description.trim(),
        notes: notes.trim(),
        favorite,
      };
      if (editing) {
        await mutate((r) => r.plants.update(params.id!, input), { reminders: false });
        if (originalPhoto && originalPhoto !== photoPath) deletePhotos([originalPhoto]);
        router.back();
        return;
      }
      const count = await repos().plants.count();
      if (!canAddPlant(isPremium, count)) {
        router.replace({ pathname: '/paywall', params: { source: 'plant_limit' } });
        return;
      }
      const ml = parseDecimal(amount);
      const plant = await mutate(async (r) => {
        const p = await r.plants.create(input);
        if (schedule && firstWatering) {
          await r.tasks.create({ plantId: p.id, type: 'watering', nextDue: firstWatering, intervalDays: interval, priority: 'normal', notes: '', amountMl: ml === null ? null : volumeToMl(ml, units), remindersEnabled: true });
        }
        return p;
      });
      track('plant_added', { category, from_library: !!speciesId });
      router.replace(`/plant/${plant.id}`);
    } catch {
      Alert.alert(t('common.error'), t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} loading={saving} testID="save-plant" />}>
      <RouterStack.Screen options={{ title: editing ? t('plants.edit') : t('plants.add') }} />
      {species && !editing ? (
        <Card tone="primary">
          <Text variant="bodySmall">{t('plants.fromLibrary', { name: speciesName(species) })}</Text>
        </Card>
      ) : null}
      <Stack gap={4}>
        <TextField label={t('plants.fields.nickname')} value={nickname} onChangeText={(v) => (setNickname(v), setError(null))} error={error} maxLength={60} testID="field-nickname" />
        <TextField label={t('plants.fields.commonName')} value={commonName} onChangeText={setCommonName} optional maxLength={80} />
        <TextField label={t('plants.fields.scientificName')} value={scientificName} onChangeText={setScientificName} optional maxLength={80} />
        <ChipSelect label={t('plants.fields.category')} options={PLANT_CATEGORIES} value={category} onChange={setCategory} render={(c) => t(`categories.${c}`)} icons={CATEGORY_ICON} />
        <PhotoField label={t('plants.fields.photo')} value={photoPath} onChange={setPhotoPath} />
        <DateField label={t('plants.fields.acquiredOn')} value={acquiredOn} onChange={setAcquiredOn} optional allowFuture={false} clearable />
        <DateField label={t('plants.fields.plantedOn')} value={plantedOn} onChange={setPlantedOn} optional allowFuture={false} clearable />
        <Stack gap={1}>
          <Text variant="label" tone="muted">
            {`${t('plants.fields.location')} · ${t('common.optional')}`}
          </Text>
          <Row wrap gap={2}>
            <Chip label={t('plants.noLocation')} selected={locationId === null} onPress={() => setLocationId(null)} />
            {locations.map((l) => (
              <Chip key={l.id} label={l.name} selected={locationId === l.id} onPress={() => setLocationId(l.id)} icon="location-outline" />
            ))}
            <Chip label={t('garden.add')} selected={false} icon="add" onPress={() => router.push('/garden/edit')} />
          </Row>
        </Stack>
        <TextField label={t('plants.fields.description')} value={description} onChangeText={setDescription} optional multiline maxLength={1000} />
        <TextField label={t('plants.fields.notes')} value={notes} onChangeText={setNotes} optional multiline maxLength={2000} />

        {!editing ? (
          <Card>
            <SwitchRow label={t('watering.setupTitle')} subtitle={t('watering.setupHint')} value={schedule} onChange={setSchedule} />
            {schedule ? (
              <Stack gap={3}>
                <Stepper label={t('watering.frequency')} value={interval} onChange={setIntervalDays} suffix={t('common.daysShort')} />
                <Row wrap gap={2}>
                  {suggestions.map((n) => (
                    <Chip key={n} label={t('tasks.everyDays', { count: n })} selected={interval === n} onPress={() => setIntervalDays(n)} />
                  ))}
                </Row>
                <Text variant="caption" tone="muted">
                  {t('watering.noUniversalRule')}
                </Text>
                <DateField label={t('watering.firstDate')} value={firstWatering} onChange={setFirstWatering} allowPast={false} />
                <TextField label={`${t('watering.amount')} (${volumeUnit(units)})`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" optional maxLength={6} />
              </Stack>
            ) : null}
          </Card>
        ) : null}
      </Stack>
    </Screen>
  );
}
