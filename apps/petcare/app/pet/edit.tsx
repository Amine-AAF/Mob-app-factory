import { Button, Card, Chip, Row, Screen, Stack as UIStack, Text } from '@factory/design-system';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { DateField, SelectChips, TextField } from '@/components/fields';
import { PetAvatar, SPECIES_ICON } from '@/components/pet';
import { repos } from '@/database';
import { ageFrom, estimateBirthDate } from '@/domain/dates';
import { canAddPet } from '@/domain/limits';
import { SEXES, SPECIES, type Pet, type Sex, type Species } from '@/domain/types';
import { createId, fromKg, parseDecimal, toKg } from '@/domain/units';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { deleteFile, extensionFor, importFile } from '@/services/files';
import { mutate } from '@/services/mutations';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

interface PetForm {
  name: string;
  species: Species;
  breed: string;
  sex: Sex | null;
  birthMode: 'date' | 'age';
  birthDate: string | null;
  ageYears: string;
  ageMonths: string;
  weight: string;
  color: string;
  identification: string;
  adoptionDate: string | null;
  notes: string;
  photo: string | null;
  walkGoal: string;
}

const EMPTY: PetForm = { name: '', species: 'dog', breed: '', sex: null, birthMode: 'date', birthDate: null, ageYears: '', ageMonths: '', weight: '', color: '', identification: '', adoptionDate: null, notes: '', photo: null, walkGoal: '' };

export default function EditPet() {
  const { t } = useTranslation();
  const { id, onboarding } = useLocalSearchParams<{ id?: string; onboarding?: string }>();
  const unit = usePreferences((s) => s.weightUnit);
  const isPremium = useIsPremium();
  const petCount = useSession((s) => s.petCount);
  const [form, setForm] = useState<PetForm>(EMPTY);
  const [original, setOriginal] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<PetForm>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!id) return;
    repos()
      .pets.get(id)
      .then((p) => {
        if (!p) return;
        setOriginal(p);
        const age = p.birthDate ? ageFrom(p.birthDate, clock.today()) : null;
        setForm({
          name: p.name,
          species: p.species,
          breed: p.breed ?? '',
          sex: p.sex,
          birthMode: p.birthEstimated ? 'age' : 'date',
          birthDate: p.birthDate,
          ageYears: age ? String(age.years) : '',
          ageMonths: age ? String(age.months) : '',
          weight: p.weightKg != null ? String(fromKg(p.weightKg, unit)) : '',
          color: p.color ?? '',
          identification: p.identification ?? '',
          adoptionDate: p.adoptionDate,
          notes: p.notes ?? '',
          photo: p.photo,
          walkGoal: p.walkGoalMinutes != null ? String(p.walkGoalMinutes) : '',
        });
      })
      .catch((e) => recordError(e, 'pet_load'));
  }, [id, unit]);

  // Free version: block creating a 3rd pet before the user types everything.
  useEffect(() => {
    if (!id && !canAddPet(petCount, isPremium)) router.replace('/paywall?source=pet_limit');
  }, [id, petCount, isPremium]);

  const pickPhoto = async () => {
    try {
      // System photo picker: no storage permission needed on Android 13+.
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (res.canceled || !res.assets[0]) return;
      const asset = res.assets[0];
      const { fileName } = await importFile('photos', asset.uri, createId('photo'), extensionFor(asset.mimeType, asset.fileName));
      if (form.photo && form.photo !== original?.photo) deleteFile('photos', form.photo);
      set({ photo: fileName });
    } catch (e) {
      recordError(e, 'pet_photo');
      Alert.alert(t('errors.photoTitle'), t('errors.photoBody'));
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError(t('errors.required'));
      return;
    }
    const weight = parseDecimal(form.weight);
    const birthDate =
      form.birthMode === 'age' && (form.ageYears || form.ageMonths)
        ? estimateBirthDate(Number(parseDecimal(form.ageYears) ?? 0), Number(parseDecimal(form.ageMonths) ?? 0), clock.today())
        : form.birthMode === 'date'
          ? form.birthDate
          : null;
    const data = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || null,
      sex: form.sex,
      birthDate,
      birthEstimated: form.birthMode === 'age' && !!birthDate,
      weightKg: weight != null && weight > 0 ? toKg(weight, unit) : null,
      color: form.color.trim() || null,
      identification: form.identification.trim() || null,
      adoptionDate: form.adoptionDate,
      notes: form.notes.trim() || null,
      photo: form.photo,
      walkGoalMinutes: form.species === 'dog' ? (parseDecimal(form.walkGoal) != null ? Math.round(parseDecimal(form.walkGoal)!) : null) : null,
      archived: original?.archived ?? false,
    };
    setSaving(true);
    try {
      const newId = await mutate(t, async () => {
        const r = repos();
        if (original) {
          await r.update('pets', original.id, data);
          if (original.photo && original.photo !== data.photo) deleteFile('photos', original.photo);
          // A changed weight is also recorded in the history, so the chart follows.
          if (data.weightKg != null && data.weightKg !== original.weightKg) await r.create('weights', { petId: original.id, date: clock.today(), weightKg: data.weightKg, heightCm: null, notes: null });
          return original.id;
        }
        if (!canAddPet(await r.pets.countActive(), useSession.getState().entitlement.isPremium)) throw new Error('pet_limit');
        const pet = await r.create('pets', data);
        if (data.weightKg != null) await r.create('weights', { petId: pet.id, date: clock.today(), weightKg: data.weightKg, heightCm: null, notes: null });
        return pet.id;
      });
      if (!original) track('pet_created', { species: form.species });
      if (onboarding) {
        usePreferences.getState().set({ onboardingCompleted: true });
        router.replace(`/(tabs)`);
      } else if (original) router.back();
      else router.replace(`/pet/${newId}`);
    } catch (e) {
      if (e instanceof Error && e.message === 'pet_limit') router.replace('/paywall?source=pet_limit');
      else {
        recordError(e, 'pet_save');
        Alert.alert(t('errors.saveFailedTitle'), t('errors.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const archive = () =>
    Alert.alert(t(original?.archived ? 'pets.unarchiveTitle' : 'pets.archiveTitle'), t(original?.archived ? 'pets.unarchiveBody' : 'pets.archiveBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          if (original?.archived && !canAddPet(petCount, isPremium)) {
            router.push('/paywall?source=pet_limit');
            return;
          }
          await mutate(t, () => repos().update('pets', original!.id, { archived: !original!.archived }));
          router.back();
        },
      },
    ]);

  const remove = () =>
    Alert.alert(t('pets.deleteTitle', { name: original?.name }), t('pets.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const r = repos();
          const docs = await r.documents.forPet(original!.id);
          await mutate(t, () => r.remove('pets', original!.id));
          docs.forEach((d) => deleteFile('documents', d.fileName));
          deleteFile('photos', original!.photo);
          router.replace('/(tabs)/pets');
        },
      },
    ]);

  return (
    <Screen edges={onboarding ? ['top'] : []} footer={<Button label={t(original ? 'common.save' : 'pets.create')} onPress={save} loading={saving} testID="save-pet" />}>
      <Stack.Screen options={{ title: t(original ? 'pets.edit' : 'pets.new') }} />
      <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel={t('pets.choosePhoto')} style={{ alignItems: 'center', gap: 8 }}>
        <PetAvatar pet={{ name: form.name, species: form.species, photo: form.photo }} size={96} />
        <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
          {t(form.photo ? 'pets.changePhoto' : 'pets.choosePhoto')}
        </Text>
      </Pressable>
      <TextField label={t('fields.petName')} value={form.name} onChange={(name) => set({ name })} required error={error} testID="pet-name" maxLength={40} autoFocus={!id} />
      <SelectChips label={t('fields.species')} value={form.species} options={SPECIES} onChange={(s) => s && set({ species: s })} labelFor={(s) => t(`species.${s}`)} iconFor={(s) => SPECIES_ICON[s]} required testID="species" />
      <TextField label={t('fields.breed')} value={form.breed} onChange={(breed) => set({ breed })} maxLength={60} />
      <SelectChips label={t('fields.sex')} value={form.sex} options={SEXES} onChange={(sex) => set({ sex })} labelFor={(s) => t(`sex.${s}`)} allowNone />
      <Card tone="alt">
        <Row gap={2}>
          <Chip label={t('pets.exactBirthDate')} selected={form.birthMode === 'date'} onPress={() => set({ birthMode: 'date' })} />
          <Chip label={t('pets.estimatedAge')} selected={form.birthMode === 'age'} onPress={() => set({ birthMode: 'age' })} />
        </Row>
        {form.birthMode === 'date' ? (
          <DateField label={t('fields.birthDate')} value={form.birthDate} onChange={(birthDate) => set({ birthDate })} />
        ) : (
          <Row gap={2}>
            <UIStack style={{ flex: 1 }}>
              <TextField label={t('fields.ageYears')} value={form.ageYears} onChange={(ageYears) => set({ ageYears })} keyboardType="number-pad" maxLength={2} />
            </UIStack>
            <UIStack style={{ flex: 1 }}>
              <TextField label={t('fields.ageMonths')} value={form.ageMonths} onChange={(ageMonths) => set({ ageMonths })} keyboardType="number-pad" maxLength={2} />
            </UIStack>
          </Row>
        )}
      </Card>
      <TextField label={`${t('fields.weight')} (${unit})`} value={form.weight} onChange={(weight) => set({ weight })} keyboardType="decimal-pad" maxLength={8} />
      <TextField label={t('fields.color')} value={form.color} onChange={(color) => set({ color })} maxLength={40} />
      <TextField label={t('fields.identification')} value={form.identification} onChange={(identification) => set({ identification })} help={t('pets.identificationHelp')} maxLength={40} />
      <DateField label={t('fields.adoptionDate')} value={form.adoptionDate} onChange={(adoptionDate) => set({ adoptionDate })} />
      {form.species === 'dog' ? <TextField label={t('fields.walkGoal')} value={form.walkGoal} onChange={(walkGoal) => set({ walkGoal })} keyboardType="number-pad" help={t('pets.walkGoalHelp')} maxLength={3} /> : null}
      <TextField label={t('fields.additionalInfo')} value={form.notes} onChange={(notes) => set({ notes })} multiline />
      {original ? (
        <UIStack gap={2}>
          <Button label={t(original.archived ? 'pets.unarchive' : 'pets.archive')} variant="secondary" icon="archive-outline" onPress={archive} />
          <Button label={t('pets.delete')} variant="danger" icon="trash-outline" onPress={remove} testID="delete-pet" />
        </UIStack>
      ) : null}
    </Screen>
  );
}
