import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DateField, MoneyField, PhotoField } from '@/components/forms';
import { canAdd } from '@/config/limits';
import { repos } from '@/database';
import { parseAmount } from '@/domain/budget';
import {
  COLORS,
  COMMON_SIZES,
  CONDITIONS,
  maskToSeasons,
  SEASON_KEYS,
  seasonsToMask,
  SIZE_SYSTEMS,
  type CareStatus,
  type Condition,
  type Season,
  type SizeSystem,
} from '@/domain/catalog';
import type { DayKey, WardrobeItem, WardrobeItemInput } from '@/domain/types';
import { findPossibleDuplicates } from '@/domain/wardrobeQuery';
import { matchingSuggestions, resolveItemName } from '@/features/wardrobe/logic';
import { showItemLimit } from '@/features/wardrobe/useAddItem';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { deletePhotoFiles, type StoredPhoto } from '@/services/photos';
import { useIsPremium, useSettings } from '@/store/session';
import { Button, Card, Chip, ChoiceChips, EmptyState, Field, Icon, Loading, MultiChips, PressableScale, Row, Screen, Stack, SwitchRow, Text, useTheme } from '@/ui';

type PhotoPaths = { photoPath: string | null; thumbPath: string | null };

interface Form {
  name: string;
  categoryId: string | null;
  subcategory: string;
  primaryColor: string | null;
  secondaryColors: string[];
  brand: string;
  size: string;
  sizeSystem: SizeSystem | null;
  seasons: Season[];
  styleId: string | null;
  occasionIds: string[];
  purchaseDate: DayKey | null;
  price: string;
  currency: string;
  condition: Condition | null;
  notes: string;
  favorite: boolean;
}

function formFrom(item: WardrobeItem, fallbackCurrency: string): Form {
  return {
    name: item.name,
    categoryId: item.categoryId,
    subcategory: item.subcategory ?? '',
    primaryColor: item.primaryColor,
    secondaryColors: item.secondaryColors,
    brand: item.brandName ?? '',
    size: item.size ?? '',
    sizeSystem: item.sizeSystem,
    seasons: maskToSeasons(item.seasons),
    styleId: item.styleId,
    occasionIds: item.occasionIds,
    purchaseDate: item.purchaseDate,
    price: item.purchasePrice == null ? '' : String(item.purchasePrice),
    currency: item.currency ?? fallbackCurrency,
    condition: item.condition,
    notes: item.notes ?? '',
    favorite: item.favorite,
  };
}

export default function ItemEditScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const settings = useSettings();
  const isPremium = useIsPremium();
  const params = useLocalSearchParams<{ id?: string; categoryKey?: string; name?: string; brand?: string; size?: string; price?: string; currency?: string; purchaseDate?: string }>();
  const id = typeof params.id === 'string' && params.id ? params.id : undefined;
  const isEdit = !!id;

  const { data: existing, loading } = useAsync(() => (id ? repos().wardrobe.get(id) : Promise.resolve(null)), [id]);
  const { data: brands } = useAsync(() => repos().taxonomy.brands(), []);

  const [form, setForm] = useState<Form>(() => ({
    // Optional prefill (e.g. from a recorded purchase).
    name: (typeof params.name === 'string' ? params.name : ''),
    categoryId: params.categoryKey ? labels.categoryIdForKey(String(params.categoryKey)) : null,
    subcategory: '',
    primaryColor: null,
    secondaryColors: [],
    brand: (typeof params.brand === 'string' ? params.brand : ''),
    size: (typeof params.size === 'string' ? params.size : ''),
    sizeSystem: null,
    seasons: [],
    styleId: null,
    occasionIds: [],
    purchaseDate: typeof params.purchaseDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.purchaseDate) ? params.purchaseDate : null,
    price: (typeof params.price === 'string' ? params.price : ''),
    currency: (typeof params.currency === 'string' ? params.currency : '') || settings.currency,
    condition: null,
    notes: '',
    favorite: false,
  }));
  const [photo, setPhoto] = useState<PhotoPaths>({ photoPath: null, thumbPath: null });
  const [initialized, setInitialized] = useState(!isEdit);
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Newly picked, not yet saved photo: deleted if the user leaves without saving. */
  const pendingPhoto = useRef<StoredPhoto | null>(null);

  // Prefill once from the saved item (state derived during render, no effect needed).
  if (isEdit && !initialized && existing) {
    setInitialized(true);
    setForm(formFrom(existing, settings.currency));
    setPhoto({ photoPath: existing.photoPath, thumbPath: existing.thumbPath });
    setShowMore(true);
  }

  // Leaving without saving: remove the photo picked during this edit.
  useEffect(
    () => () => {
      if (pendingPhoto.current) deletePhotoFiles(pendingPhoto.current.photoPath, pendingPhoto.current.thumbPath);
    },
    [],
  );

  const { data: subcategories } = useAsync(() => (form.categoryId ? repos().wardrobe.subcategories(form.categoryId) : Promise.resolve([] as string[])), [form.categoryId]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onPhoto = (p: StoredPhoto | null) => {
    // A replaced photo that was never saved is not referenced anywhere: remove it now.
    if (pendingPhoto.current && pendingPhoto.current.photoPath !== p?.photoPath) deletePhotoFiles(pendingPhoto.current.photoPath, pendingPhoto.current.thumbPath);
    pendingPhoto.current = p;
    setPhoto(p ?? { photoPath: null, thumbPath: null });
  };

  const priceValue = form.price.trim() ? parseAmount(form.price) : null;
  const priceError = form.price.trim() && priceValue == null ? t('common.money.invalid') : null;
  const categoryError = submitted && !form.categoryId ? t('item.categoryRequired') : null;

  const computedName = () =>
    resolveItemName(
      form.name,
      { category: labels.category(form.categoryId), subcategory: form.subcategory, color: form.primaryColor ? labels.color(form.primaryColor) : null },
      (color, base) => t('item.defaultName', { color, base }),
    );

  const buildInput = (): WardrobeItemInput => ({
    name: computedName(),
    categoryId: form.categoryId!,
    subcategory: form.subcategory.trim() || null,
    primaryColor: form.primaryColor,
    secondaryColors: form.secondaryColors.filter((c) => c !== form.primaryColor),
    brandName: form.brand.trim() || null,
    size: form.size.trim() || null,
    sizeSystem: form.sizeSystem,
    seasons: seasonsToMask(form.seasons),
    styleId: form.styleId,
    occasionIds: form.occasionIds,
    purchaseDate: form.purchaseDate,
    purchasePrice: priceValue,
    currency: priceValue == null ? null : form.currency,
    condition: form.condition,
    notes: form.notes.trim() || null,
    photoPath: photo.photoPath,
    thumbPath: photo.thumbPath,
    favorite: form.favorite,
    archived: existing?.archived ?? false,
    careStatus: (existing?.careStatus ?? 'clean') as CareStatus,
  });

  const persist = async (input: WardrobeItemInput) => {
    setSaving(true);
    try {
      let savedId = id;
      if (id) await repos().wardrobe.update(id, input);
      else {
        const count = await repos().wardrobe.count();
        if (!canAdd('items', count, isPremium)) {
          setSaving(false);
          showItemLimit(t);
          return;
        }
        savedId = await repos().wardrobe.create(input);
      }
      // Saved: the new photo is now referenced; the replaced one can go.
      // Photo files of the saved item: deleted only now that a successful save replaced them.
      const old: PhotoPaths = { photoPath: existing?.photoPath ?? null, thumbPath: existing?.thumbPath ?? null };
      if (old.photoPath !== input.photoPath || old.thumbPath !== input.thumbPath) {
        deletePhotoFiles(old.photoPath !== input.photoPath ? old.photoPath : null, old.thumbPath !== input.thumbPath ? old.thumbPath : null);
      }
      pendingPhoto.current = null;
      afterWrite();
      if (isEdit) router.back();
      else router.replace({ pathname: '/item/[id]', params: { id: savedId! } });
    } catch (e) {
      recordError(e, 'save_item');
      setSaving(false);
      Alert.alert(t('common.error'));
    }
  };

  const save = async () => {
    setSubmitted(true);
    if (!form.categoryId || priceError) return;
    const input = buildInput();
    try {
      const all = await repos().wardrobe.list();
      const dups = findPossibleDuplicates({ id, name: input.name, categoryId: input.categoryId, primaryColor: input.primaryColor, brandName: input.brandName, size: input.size }, all);
      if (dups.length) {
        Alert.alert(t('item.duplicateTitle'), t('item.duplicateMessage', { names: dups.slice(0, 3).map((d) => d.name).join(', ') }), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('item.saveAnyway'), onPress: () => void persist(input) },
        ]);
        return;
      }
    } catch (e) {
      // The duplicate check is only a hint: never block saving on it.
      recordError(e, 'duplicate_check');
    }
    await persist(input);
  };

  const title = isEdit ? t('item.editTitle') : t('item.newTitle');

  if (isEdit && !initialized) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        {loading || existing === undefined ? (
          <Loading />
        ) : (
          <EmptyState icon="help-circle-outline" title={t('item.notFoundTitle')} message={t('item.notFoundMessage')} action={<Button variant="secondary" label={t('common.back')} onPress={() => router.back()} />} />
        )}
      </Screen>
    );
  }

  const categoryKey = labels.categoryKey(form.categoryId);
  const subSuggestions = matchingSuggestions(subcategories ?? [], form.subcategory, 6);
  const brandSuggestions = matchingSuggestions((brands ?? []).map((b) => b.name), form.brand, 6);
  const colorOptions = COLORS.map((c) => ({ value: c.key as string, label: t(`catalog.color.${c.key}`), color: c.hex }));

  return (
    <Screen
      edges={[]}
      footer={<Button label={t('common.save')} icon="checkmark" onPress={save} loading={saving} testID="item-save" />}
    >
      <RouterStack.Screen options={{ title }} />
      {!isEdit ? (
        <Text tone="muted" center>
          {t('item.quickAddHint')}
        </Text>
      ) : null}
      <PhotoField photo={photo} onChange={onPhoto} categoryKey={categoryKey} idPrefix="itm" />

      <Stack gap={2}>
        <ChoiceChips label={t('item.category')} options={labels.categoryOptions} value={form.categoryId} onChange={(v) => set('categoryId', v)} />
        {categoryError ? (
          <Text variant="caption" tone="danger">
            {categoryError}
          </Text>
        ) : null}
      </Stack>

      <Field
        label={`${t('item.name')} · ${t('common.optional')}`}
        value={form.name}
        onChangeText={(v) => set('name', v)}
        placeholder={form.categoryId ? computedName() : t('item.namePlaceholder')}
        hint={t('item.nameHint')}
        maxLength={80}
        testID="item-name"
      />

      <ChoiceChips label={t('item.primaryColor')} options={colorOptions} value={form.primaryColor} onChange={(v) => set('primaryColor', v)} allowNone wrap={false} />

      <PressableScale
        onPress={() => setShowMore((s) => !s)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showMore }}
        accessibilityLabel={showMore ? t('item.lessDetails') : t('item.moreDetails')}
        style={{ minHeight: 48, justifyContent: 'center' }}
        testID="item-more"
      >
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="heading">{showMore ? t('item.lessDetails') : t('item.moreDetails')}</Text>
          <Icon name={showMore ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.textMuted} />
        </Row>
      </PressableScale>

      {showMore ? (
        <Stack gap={4}>
          <Stack gap={2}>
            <Field label={t('item.subcategory')} value={form.subcategory} onChangeText={(v) => set('subcategory', v)} placeholder={t('item.subcategoryPlaceholder')} maxLength={60} />
            {subSuggestions.length ? (
              <Row gap={2} wrap>
                {subSuggestions.map((s) => (
                  <Chip key={s} label={s} selected={false} onPress={() => set('subcategory', s)} />
                ))}
              </Row>
            ) : null}
          </Stack>

          <MultiChips
            label={t('item.secondaryColors')}
            options={colorOptions.filter((c) => c.value !== form.primaryColor)}
            values={form.secondaryColors}
            onChange={(v) => set('secondaryColors', v)}
            wrap={false}
          />

          <Stack gap={2}>
            <Field label={t('item.brand')} value={form.brand} onChangeText={(v) => set('brand', v)} placeholder={t('item.brandPlaceholder')} maxLength={60} autoCapitalize="words" />
            {brandSuggestions.length ? (
              <Row gap={2} wrap>
                {brandSuggestions.map((b) => (
                  <Chip key={b} label={b} selected={false} onPress={() => set('brand', b)} />
                ))}
              </Row>
            ) : null}
          </Stack>

          <Card tone="alt">
            <Field label={t('item.size')} value={form.size} onChangeText={(v) => set('size', v)} placeholder={t('item.sizePlaceholder')} maxLength={20} autoCapitalize="characters" />
            <Row gap={2} wrap>
              {COMMON_SIZES.map((s) => (
                <Chip key={s} label={s === 'One size' ? t('item.oneSize') : s} selected={form.size === s} onPress={() => set('size', form.size === s ? '' : s)} />
              ))}
            </Row>
            <ChoiceChips label={t('item.sizeSystem')} options={SIZE_SYSTEMS.map((s) => ({ value: s, label: t(`catalog.sizeSystem.${s}`) }))} value={form.sizeSystem} onChange={(v) => set('sizeSystem', v)} allowNone />
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              <Icon name="information-circle-outline" size={16} color={theme.colors.textSubtle} />
              <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
                {t('item.sizeHint')}
              </Text>
            </Row>
          </Card>

          <Stack gap={1.5}>
            <MultiChips label={t('item.seasons')} options={SEASON_KEYS.map((s) => ({ value: s, label: t(`catalog.season.${s}`) }))} values={form.seasons} onChange={(v) => set('seasons', v)} />
            <Text variant="caption" tone="subtle">
              {t('item.seasonsHint')}
            </Text>
          </Stack>

          {labels.styleOptions.length ? <ChoiceChips label={t('item.style')} options={labels.styleOptions} value={form.styleId} onChange={(v) => set('styleId', v)} allowNone /> : null}
          {labels.occasionOptions.length ? <MultiChips label={t('item.occasions')} options={labels.occasionOptions} values={form.occasionIds} onChange={(v) => set('occasionIds', v)} /> : null}

          <DateField label={t('item.purchaseDate')} value={form.purchaseDate} onChange={(v) => set('purchaseDate', v)} allowClear />
          <MoneyField label={t('item.purchasePrice')} amount={form.price} currency={form.currency} onAmount={(v) => set('price', v)} onCurrency={(v) => set('currency', v)} error={priceError} testID="item-price" />

          <ChoiceChips label={t('item.condition')} options={CONDITIONS.map((c) => ({ value: c, label: t(`catalog.condition.${c}`) }))} value={form.condition} onChange={(v) => set('condition', v)} allowNone />

          <Field label={t('item.notes')} value={form.notes} onChangeText={(v) => set('notes', v)} placeholder={t('item.notesPlaceholder')} multiline maxLength={500} />
          <SwitchRow title={t('item.favorite')} value={form.favorite} onChange={(v) => set('favorite', v)} />
        </Stack>
      ) : null}
    </Screen>
  );
}
