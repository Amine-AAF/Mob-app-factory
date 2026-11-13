import { Button, Chip, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ChipChoice } from '@/components/forms';
import { BookCover, Field, Page } from '@/components/ui';
import { CURRENCIES } from '@/config/presets';
import { repos } from '@/database';
import { useAction } from '@/hooks';
import { deleteWish, saveWish } from '@/services/contentService';
import { pickCoverImage, saveCover } from '@/services/covers';
import { usePreferences } from '@/store/preferences';
import { WISHLIST_STATUSES, type WishlistStatus } from '@/types';
import { centsToInput, parseMoneyToCents } from '@/utils';

export default function EditWish() {
  const { t } = useTranslation();
  const run = useAction(t);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const defaultCurrency = usePreferences((s) => s.currency);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [store, setStore] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<WishlistStatus>('want_to_buy');
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    repos()
      .organize.wish(id)
      .then((w) => {
        if (!w) return;
        setTitle(w.title);
        setAuthor(w.author ?? '');
        setCover(w.coverUri);
        setPrice(centsToInput(w.estimatedPriceCents));
        setCurrency(w.currency ?? defaultCurrency);
        setStore(w.store ?? '');
        setUrl(w.url ?? '');
        setPriority(w.priority);
        setNotes(w.notes ?? '');
        setStatus(w.status);
      });
  }, [id, defaultCurrency]);

  const save = () => {
    const cents = price ? parseMoneyToCents(price) : null;
    if (price && cents == null) return setPriceError(t('errors.book.price'));
    setPriceError(null);
    void run(() => saveWish(repos(), { title, author, coverUri: cover, estimatedPriceCents: cents, currency, store, url, priority, notes, status }, id).then(() => router.back()));
  };

  const pick = () =>
    run(async () => {
      const uri = await pickCoverImage();
      if (uri) setCover((await saveCover(uri)).thumbUri);
    });

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} size="lg" disabled={!title.trim()} onPress={save} testID="save-wish" />}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel={t('book.chooseCover')}>
          <BookCover uri={cover} title={title || t('book.untitled')} width={70} />
        </Pressable>
        <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
          {t('wishlist.coverOptional')}
        </Text>
      </View>
      <Field label={t('book.title')} value={title} onChangeText={setTitle} autoFocus={!id} testID="wish-title" />
      <Field label={t('book.author')} value={author} onChangeText={setAuthor} />
      <ChipChoice label={t('wishlist.status')} options={WISHLIST_STATUSES} value={status} onChange={setStatus} render={(s) => t(`wishlist.statuses.${s}`)} />
      <View style={{ gap: 6 }}>
        <Text variant="label" tone="muted">
          {t('wishlist.priority')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {([1, 2, 3] as const).map((p) => (
            <Chip key={p} label={t(`wishlist.priorities.${p}`)} selected={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>
      </View>
      <Field label={t('wishlist.price')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" error={priceError} />
      <ChipChoice label={t('book.currency')} options={CURRENCIES} value={currency} onChange={setCurrency} render={(c) => c} />
      <Field label={t('wishlist.store')} value={store} onChangeText={setStore} />
      <Field label={t('wishlist.url')} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://" />
      <Field label={t('book.notes')} value={notes} onChangeText={setNotes} multiline />
      {id ? (
        <Button
          label={t('common.delete')}
          variant="danger"
          onPress={() =>
            Alert.alert(t('wishlist.deleteTitle'), t('common.cannotUndo'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteWish(repos(), id).then(() => router.back())) },
            ])
          }
        />
      ) : null}
    </Page>
  );
}
