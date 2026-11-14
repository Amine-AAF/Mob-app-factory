import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ItemPickerSheet } from '@/components/ItemPickerSheet';
import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { defaultSlotFor, maskToSeasons, SEASON_KEYS, seasonsToMask, SLOTS, type Season, type Slot } from '@/domain/catalog';
import type { Outfit, OutfitInput } from '@/domain/types';
import { isValidDayKey } from '@/features/calendar/calendarLogic';
import { isMultiSlot, nextLookNumber, parseItemsParam, refsFromSelection, removeFromSlot, selectedIds, selectionFromRefs, setSlot, unavailableItems, type SlotSelection } from '@/features/outfits/builderLogic';
import { ensureCanAddOutfit } from '@/features/outfits/limits';
import { SlotRow } from '@/features/outfits/SlotRow';
import { useOutfitData } from '@/features/outfits/useOutfitData';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { useIsPremium } from '@/store/session';
import { Button, Card, ChoiceChips, Divider, EmptyState, Field, Icon, Loading, MultiChips, Row, Screen, Stack, SwitchRow, Text, useTheme } from '@/ui';

type Params = { id?: string; itemId?: string; items?: string; name?: string; planDate?: string };

interface FormState {
  sel: SlotSelection;
  name: string;
  styleId: string | null;
  occasionId: string | null;
  seasons: Season[];
  notes: string;
  favorite: boolean;
}

/** Visual outfit editor. No ads here (creation flow). */
export default function OutfitBuilderScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Params>();
  const data = useOutfitData();

  if (!data.ready) return <Screen edges={[]}>{<Loading />}</Screen>;
  const existing = params.id ? (data.outfitById.get(params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('outfits.builder.editTitle') }} />
        <EmptyState icon="alert-circle-outline" title={t('outfits.notFound.title')} message={t('outfits.notFound.message')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  return <BuilderForm key={params.id ?? 'new'} params={params} existing={existing} data={data} />;
}

function BuilderForm({ params, existing, data }: { params: Params; existing: Outfit | null; data: ReturnType<typeof useOutfitData> }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const { map, activeItems, outfits } = data;
  const fromSuggestion = !existing && !!params.items;

  const [form, setForm] = useState<FormState>(() => {
    const exists = (id: string) => map.has(id);
    if (existing) {
      return {
        sel: selectionFromRefs(existing.items, exists),
        name: existing.name,
        styleId: existing.styleId,
        occasionId: existing.occasionId,
        seasons: maskToSeasons(existing.seasons),
        notes: existing.notes ?? '',
        favorite: existing.favorite,
      };
    }
    const refs = parseItemsParam(params.items);
    const prefill = params.itemId ? map.get(params.itemId) : undefined;
    if (prefill) refs.push({ itemId: prefill.id, slot: defaultSlotFor(labels.categoryKey(prefill.categoryId)), position: refs.length });
    const makeName = (n: number) => t('outfits.builder.defaultName', { n });
    return {
      sel: selectionFromRefs(refs, exists),
      name: params.name?.trim() || makeName(nextLookNumber(outfits.map((o) => o.name), makeName)),
      styleId: null,
      occasionId: null,
      seasons: [],
      notes: '',
      favorite: false,
    };
  });
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [errors, setErrors] = useState<{ items?: string; name?: string }>({});
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const refs = useMemo(() => refsFromSelection(form.sel), [form.sel]);
  const ids = useMemo(() => selectedIds(form.sel), [form.sel]);
  const unavailable = useMemo(() => unavailableItems(ids, map), [ids, map]);

  const save = async () => {
    const next: typeof errors = {};
    if (refs.length === 0) next.items = t('outfits.builder.errorNoItems');
    if (!form.name.trim()) next.name = t('outfits.builder.errorName');
    setErrors(next);
    if (next.items || next.name) return;
    const input: OutfitInput = {
      name: form.name.trim(),
      styleId: form.styleId,
      occasionId: form.occasionId,
      seasons: seasonsToMask(form.seasons),
      notes: form.notes.trim() || null,
      favorite: form.favorite,
      source: existing ? existing.source : fromSuggestion ? 'suggestion' : 'manual',
      items: refs,
    };
    setSaving(true);
    try {
      let id: string;
      if (existing) {
        await repos().outfits.update(existing.id, input);
        id = existing.id;
      } else {
        const count = await repos().outfits.count();
        if (!ensureCanAddOutfit(t, count, isPremium)) {
          setSaving(false);
          return;
        }
        id = await repos().outfits.create(input);
      }
      afterWrite();
      if (!existing && isValidDayKey(params.planDate)) router.replace({ pathname: '/plan/[date]', params: { date: params.planDate, outfitId: id } });
      else router.replace({ pathname: '/outfit/[id]', params: { id } });
    } catch (e) {
      recordError(e, 'outfit_save');
      setSaving(false);
      Alert.alert(t('common.error'));
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} icon="checkmark" onPress={save} loading={saving} testID="builder-save" />}>
      <RouterStack.Screen options={{ title: existing ? t('outfits.builder.editTitle') : t('outfits.builder.title') }} />

      <OutfitCollage refs={refs} items={map} height={320} accessibilityLabel={t('outfits.builder.preview')} />
      {refs.length === 0 ? (
        <Text tone="muted" center>
          {t('outfits.builder.emptyHint')}
        </Text>
      ) : null}
      {errors.items ? (
        <Text variant="bodySmall" tone="danger" center>
          {errors.items}
        </Text>
      ) : null}

      {unavailable.length > 0 ? (
        <Card tone="alt">
          <Row gap={2} style={{ alignItems: 'flex-start' }}>
            <Icon name="water-outline" size={18} color={theme.colors.warning} />
            <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
              {t('outfits.builder.laundryWarning', { names: unavailable.map((i) => i.name).join(', ') })}
            </Text>
          </Row>
        </Card>
      ) : null}

      {activeItems.length === 0 ? (
        <Card tone="accent">
          <Text>{t('outfits.empty.noItems')}</Text>
          <Button small label={t('outfits.empty.addItem')} icon="add" onPress={() => router.push('/item/edit')} style={{ alignSelf: 'flex-start' }} />
        </Card>
      ) : null}

      <Stack gap={4}>
        {SLOTS.map((slot) => (
          <SlotRow
            key={slot}
            slot={slot}
            ids={form.sel[slot]}
            items={map}
            multiple={isMultiSlot(slot)}
            onPick={() => setPickerSlot(slot)}
            onRemove={(itemId) => patch({ sel: removeFromSlot(form.sel, slot, itemId) })}
          />
        ))}
      </Stack>

      <Divider />

      <Field
        label={t('outfits.builder.name')}
        value={form.name}
        onChangeText={(name) => patch({ name })}
        maxLength={80}
        error={errors.name}
        testID="builder-name"
      />
      {labels.styleOptions.length ? <ChoiceChips label={t('outfits.builder.style')} options={labels.styleOptions} value={form.styleId} onChange={(styleId) => patch({ styleId })} allowNone /> : null}
      {labels.occasionOptions.length ? <ChoiceChips label={t('outfits.builder.occasion')} options={labels.occasionOptions} value={form.occasionId} onChange={(occasionId) => patch({ occasionId })} allowNone /> : null}
      <MultiChips label={t('outfits.builder.seasons')} options={SEASON_KEYS.map((s) => ({ value: s, label: t(`catalog.season.${s}`) }))} values={form.seasons} onChange={(seasons) => patch({ seasons })} />
      <Text variant="caption" tone="subtle">
        {t('outfits.builder.seasonsHint')}
      </Text>
      <Field label={`${t('outfits.builder.notes')} (${t('common.optional')})`} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline maxLength={500} />
      <SwitchRow title={t('outfits.builder.favorite')} value={form.favorite} onChange={(favorite) => patch({ favorite })} />

      <ItemPickerSheet
        visible={pickerSlot != null}
        onClose={() => setPickerSlot(null)}
        items={activeItems}
        title={pickerSlot ? t(`catalog.slot.${pickerSlot}`) : ''}
        slot={pickerSlot ?? undefined}
        multiple={pickerSlot ? isMultiSlot(pickerSlot) : false}
        selected={pickerSlot ? form.sel[pickerSlot] : []}
        onConfirm={(picked) => {
          if (pickerSlot) setForm((f) => ({ ...f, sel: setSlot(f.sel, pickerSlot, picked) }));
          setErrors((e) => ({ ...e, items: undefined }));
        }}
      />
    </Screen>
  );
}
