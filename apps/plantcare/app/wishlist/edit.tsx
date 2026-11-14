import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChipSelect, PhotoField, TextField } from '@/components/forms';
import { searchSpecies } from '@/content/species';
import { speciesName } from '@/content/species/localize';
import { repos } from '@/database';
import { PRIORITIES, WISHLIST_STATUSES, type Priority, type WishlistStatus } from '@/domain/types';
import { parseDecimal } from '@/domain/units';
import { useMutation } from '@/hooks/useData';
import { deletePhotos } from '@/services/photos';

export default function EditWish() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [status, setStatus] = useState<WishlistStatus>('wishlist');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .wishlist.get(id)
      .then((w) => {
        if (!w) return;
        setName(w.name);
        setSpeciesId(w.speciesId);
        setDescription(w.description);
        setPrice(w.estimatedPrice === null ? '' : String(w.estimatedPrice));
        setStore(w.store);
        setPriority(w.priority);
        setStatus(w.status);
        setNotes(w.notes);
        setPhoto(w.photoPath);
      });
  }, [id]);

  const match = !speciesId && name.trim().length >= 3 ? searchSpecies(name)[0] : undefined;

  const save = async () => {
    if (!name.trim()) return setError(t('validation.required'));
    const p = parseDecimal(price);
    if (price.trim() && p === null) return setError(t('validation.number'));
    const input = { name: name.trim(), speciesId, photoPath: photo, description: description.trim(), estimatedPrice: p, store: store.trim(), priority, notes: notes.trim(), status };
    await mutate(async (r) => void (id ? await r.wishlist.update(id, input) : await r.wishlist.create(input)), { reminders: false });
    router.back();
  };

  const remove = () =>
    Alert.alert(t('wishlist.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.wishlist.remove(id!), { reminders: false }).then((ph) => (deletePhotos([ph]), router.back())) },
    ]);

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-wish" />}>
      <RouterStack.Screen options={{ title: id ? t('wishlist.edit') : t('wishlist.add') }} />
      <Stack gap={4}>
        <TextField label={t('wishlist.name')} value={name} onChangeText={(v) => (setName(v), setError(null))} error={error} maxLength={80} />
        {match ? (
          <Card tone="primary" onPress={() => setSpeciesId(match.id)} accessibilityLabel={t('wishlist.linkSpecies', { name: speciesName(match) })}>
            <Text variant="bodySmall">{t('wishlist.linkSpecies', { name: `${speciesName(match)} (${match.scientificName})` })}</Text>
          </Card>
        ) : null}
        {speciesId ? <Button size="md" variant="ghost" icon="library-outline" label={t('wishlist.openSheet')} onPress={() => router.push(`/species/${speciesId}`)} /> : null}
        <TextField label={t('plants.fields.description')} value={description} onChangeText={setDescription} multiline optional />
        <TextField label={t('wishlist.price')} value={price} onChangeText={(v) => (setPrice(v), setError(null))} keyboardType="decimal-pad" optional maxLength={10} />
        <TextField label={t('wishlist.store')} value={store} onChangeText={setStore} optional maxLength={80} />
        <ChipSelect label={t('tasks.priority')} options={PRIORITIES} value={priority} onChange={setPriority} render={(x) => t(`priority.${x}`)} />
        <ChipSelect label={t('wishlist.status')} options={WISHLIST_STATUSES} value={status} onChange={setStatus} render={(x) => t(`wishlistStatus.${x}`)} />
        <PhotoField label={t('plants.fields.photo')} value={photo} onChange={setPhoto} />
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
        {status === 'purchased' && id ? (
          <Button variant="secondary" icon="leaf-outline" label={t('wishlist.addToCollection')} onPress={() => router.push({ pathname: '/plant/edit', params: speciesId ? { speciesId } : {} })} />
        ) : null}
        {id ? <Button variant="danger" icon="trash-outline" label={t('common.delete')} onPress={remove} /> : null}
      </Stack>
    </Screen>
  );
}
