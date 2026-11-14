import { Button, Screen, Stack } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LOCATION_ICON } from '@/components/icons';
import { ChipSelect, PhotoField, TextField } from '@/components/forms';
import { repos } from '@/database';
import { LOCATION_TYPES, type LocationType } from '@/domain/types';
import { useMutation } from '@/hooks/useData';
import { deletePhotos } from '@/services/photos';

export default function EditLocation() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [type, setType] = useState<LocationType>('living_room');
  const [name, setName] = useState(t('locationTypes.living_room'));
  const [nameTouched, setNameTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .locations.get(id)
      .then((l) => {
        if (!l) return;
        setType(l.type);
        setName(l.name);
        setNameTouched(true);
        setDescription(l.description);
        setPhoto(l.photoPath);
        setOriginal(l.photoPath);
      });
  }, [id]);

  const pickType = (v: LocationType) => {
    setType(v);
    if (!nameTouched) setName(v === 'custom' ? '' : t(`locationTypes.${v}`));
  };

  const save = async () => {
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    const input = { name: name.trim(), type, description: description.trim(), photoPath: photo };
    await mutate(async (r) => void (id ? await r.locations.update(id, input) : await r.locations.create(input)), { reminders: false });
    if (original && original !== photo) deletePhotos([original]);
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-location" />}>
      <RouterStack.Screen options={{ title: id ? t('garden.edit') : t('garden.add') }} />
      <Stack gap={4}>
        <ChipSelect label={t('garden.type')} options={LOCATION_TYPES} value={type} onChange={pickType} render={(x) => t(`locationTypes.${x}`)} icons={LOCATION_ICON} />
        <TextField label={t('garden.name')} value={name} onChangeText={(v) => (setName(v), setNameTouched(true), setError(null))} error={error} maxLength={50} testID="field-location-name" />
        <TextField label={t('plants.fields.description')} value={description} onChangeText={setDescription} multiline optional />
        <PhotoField label={t('garden.photo')} value={photo} onChange={setPhoto} />
      </Stack>
    </Screen>
  );
}
