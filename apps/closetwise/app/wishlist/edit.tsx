import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { confirmDelete, MoneyField, PhotoField } from '@/components/forms';
import { repos } from '@/database';
import { sanitizeUrl } from '@/database/repositories/shoppingRepository';
import { parseAmount } from '@/domain/budget';
import { WISHLIST_STATUSES, type WishlistStatus } from '@/domain/catalog';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { deletePhotoFiles, type StoredPhoto } from '@/services/photos';
import { useSettings } from '@/store/session';
import { Button, ChoiceChips, EmptyState, Field, Loading, Row, Screen, Text } from '@/ui/components';

type Photo = { photoPath: string | null; thumbPath: string | null };
const NO_PHOTO: Photo = { photoPath: null, thumbPath: null };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const samePhoto = (a: Photo, b: Photo) => a.photoPath === b.photoPath && a.thumbPath === b.thumbPath;

export default function WishlistEditScreen() {
  const { t } = useTranslation();
  const labels = useLabels();
  const settings = useSettings();
  const id = one(useLocalSearchParams<{ id?: string }>().id);
  const { data } = useAsync(async () => ({ item: id ? await repos().wishlist.get(id) : null }), [id]);

  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<Photo>(NO_PHOTO);
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings.currency);
  const [url, setUrl] = useState('');
  const [store, setStore] = useState('');
  const [priority, setPriority] = useState<'1' | '2' | '3'>('2');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<WishlistStatus>('wanted');
  const [errors, setErrors] = useState<{ name?: string; price?: string; url?: string }>({});
  const [busy, setBusy] = useState(false);

  // Photo picked during this edit and not saved yet (deleted if the user leaves without saving).
  const pending = useRef<StoredPhoto | null>(null);
  // Set once the record is saved or deleted, so the "not found" state never flashes while leaving.
  const [finished, setFinished] = useState(false);
  useEffect(
    () => () => {
      if (pending.current) deletePhotoFiles(pending.current.photoPath, pending.current.thumbPath);
    },
    [],
  );

  if (data && !ready) {
    setReady(true);
    const w = data.item;
    if (w) {
      setName(w.name);
      setPhoto({ photoPath: w.photoPath, thumbPath: w.thumbPath });
      setBrand(w.brand ?? '');
      setCategoryId(w.categoryId);
      setAmount(w.estimatedPrice != null ? String(w.estimatedPrice) : '');
      setCurrency(w.currency ?? settings.currency);
      setUrl(w.url ?? '');
      setStore(w.store ?? '');
      setPriority(String(w.priority) as '1' | '2' | '3');
      setNotes(w.notes ?? '');
      setStatus(w.status);
    }
  }

  if (!data || !ready) return <Loading />;
  if (id && !data.item && !finished) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('wishlist.edit.titleEdit') }} />
        <EmptyState icon="alert-circle-outline" title={t('wishlist.edit.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  const original: Photo = data.item ? { photoPath: data.item.photoPath, thumbPath: data.item.thumbPath } : NO_PHOTO;

  const onPhoto = (p: StoredPhoto | null) => {
    // Replace a previously picked unsaved photo; the saved one is only removed after saving.
    if (pending.current) deletePhotoFiles(pending.current.photoPath, pending.current.thumbPath);
    pending.current = p;
    setPhoto(p ?? NO_PHOTO);
  };

  const save = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('wishlist.edit.nameRequired');
    const price = amount.trim() ? parseAmount(amount) : null;
    if (amount.trim() && price == null) next.price = t('common.money.invalid');
    const cleanUrl = url.trim() ? sanitizeUrl(url) : null;
    if (url.trim() && !cleanUrl) next.url = t('wishlist.edit.urlInvalid');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      await repos().wishlist.save(
        {
          name,
          photoPath: photo.photoPath,
          thumbPath: photo.thumbPath,
          brand: brand || null,
          categoryId,
          estimatedPrice: price,
          currency: price != null ? currency : null,
          url: cleanUrl,
          store: store || null,
          priority: Number(priority) as 1 | 2 | 3,
          notes: notes || null,
          status,
        },
        id,
      );
      pending.current = null;
      if (!samePhoto(original, photo)) deletePhotoFiles(original.photoPath, original.thumbPath);
      setFinished(true);
      afterWrite();
      router.back();
    } catch (e) {
      recordError(e, 'wishlist_save');
      Alert.alert(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    confirmDelete(t, async () => {
      if (!id) return;
      try {
        setFinished(true);
        const files = await repos().wishlist.remove(id);
        deletePhotoFiles(files?.photoPath, files?.thumbPath, pending.current?.photoPath, pending.current?.thumbPath);
        pending.current = null;
        afterWrite();
        router.back();
      } catch (e) {
        recordError(e, 'wishlist_delete');
        Alert.alert(t('common.error'));
      }
    });

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {id ? <Button variant="danger" label={t('common.delete')} icon="trash-outline" onPress={remove} disabled={busy} /> : null}
          <Button label={t('common.save')} onPress={save} loading={busy} style={{ flex: 1 }} testID="wishlist-save" />
        </Row>
      }
    >
      <RouterStack.Screen options={{ title: id ? t('wishlist.edit.titleEdit') : t('wishlist.edit.titleNew') }} />
      <PhotoField photo={photo} onChange={onPhoto} categoryKey={labels.categoryKey(categoryId)} idPrefix="wsh" />
      <Field
        label={t('wishlist.edit.name')}
        value={name}
        onChangeText={(s) => {
          setName(s);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
        }}
        placeholder={t('wishlist.edit.namePlaceholder')}
        error={errors.name}
        maxLength={120}
        testID="wishlist-name"
      />
      <Field label={`${t('wishlist.edit.brand')} · ${t('common.optional')}`} value={brand} onChangeText={setBrand} maxLength={80} />
      <ChoiceChips label={t('wishlist.edit.category')} options={labels.categoryOptions} value={categoryId} onChange={setCategoryId} allowNone wrap={false} />
      <MoneyField
        label={`${t('wishlist.edit.price')} · ${t('common.optional')}`}
        amount={amount}
        currency={currency}
        onAmount={(s) => {
          setAmount(s);
          if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
        }}
        onCurrency={setCurrency}
        error={errors.price}
      />
      <Field label={`${t('wishlist.edit.store')} · ${t('common.optional')}`} value={store} onChangeText={setStore} maxLength={80} />
      <Field
        label={`${t('wishlist.edit.url')} · ${t('common.optional')}`}
        value={url}
        onChangeText={(s) => {
          setUrl(s);
          if (errors.url) setErrors((e) => ({ ...e, url: undefined }));
        }}
        placeholder="https://"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.url}
        hint={t('wishlist.edit.urlHint')}
        maxLength={500}
      />
      <ChoiceChips
        label={t('wishlist.edit.priority')}
        options={(['1', '2', '3'] as const).map((p) => ({ value: p, label: t(`catalog.priority.${p}`) }))}
        value={priority}
        onChange={(p) => p && setPriority(p)}
      />
      <ChoiceChips label={t('wishlist.edit.status')} options={WISHLIST_STATUSES.map((s) => ({ value: s, label: t(`catalog.wishlistStatus.${s}`) }))} value={status} onChange={(s) => s && setStatus(s)} />
      {status === 'purchased' && !id ? (
        <Text variant="caption" tone="subtle">
          {t('wishlist.edit.purchasedHint')}
        </Text>
      ) : null}
      <Field label={`${t('wishlist.edit.notes')} · ${t('common.optional')}`} value={notes} onChangeText={setNotes} multiline maxLength={1000} />
    </Screen>
  );
}
