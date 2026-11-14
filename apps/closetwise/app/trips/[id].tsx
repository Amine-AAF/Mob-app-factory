import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SectionList, View } from 'react-native';

import { ItemPickerSheet } from '@/components/ItemPickerSheet';
import { ItemPhoto } from '@/components/ItemPhoto';
import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { PACKING_SECTIONS, TRIP_TEMPLATES, type PackingSection, type TripTemplate } from '@/domain/catalog';
import { itemsToPack, missingFromChecklist, packingProgress, tripNights } from '@/domain/packing';
import type { Outfit, PackingEntry, Trip, WardrobeItem } from '@/domain/types';
import { entriesBySection } from '@/features/trips/logic';
import { PackingRow, useEntryLabel } from '@/features/trips/PackingRow';
import { tripDates } from '@/features/trips/TripCard';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { Button, Card, ChoiceChips, EmptyState, Field, IconButton, Loading, PressableScale, ProgressBar, Row, SectionHeader, Sheet, Stack, Text, useTheme } from '@/ui';

interface ChecklistData {
  trip: Trip | null;
  entries: PackingEntry[];
  items: WardrobeItem[];
  outfits: Outfit[];
}

async function loadChecklist(id: string): Promise<ChecklistData> {
  const r = repos();
  const trip = await r.trips.get(id);
  if (!trip) return { trip: null, entries: [], items: [], outfits: [] };
  const [entries, items, outfits] = await Promise.all([r.trips.entries(id), r.wardrobe.list({ archived: 'all' }), r.outfits.list()]);
  return { trip, entries, items, outfits };
}

export default function PackingChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data } = useAsync(() => loadChecklist(id), [id]);
  if (!data) return <Loading />;
  if (!data.trip) {
    return (
      <View style={{ flex: 1 }}>
        <RouterStack.Screen options={{ title: t('trips.checklist.title') }} />
        <EmptyState icon="airplane-outline" title={t('trips.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </View>
    );
  }
  return <Checklist data={data as ChecklistData & { trip: Trip }} />;
}

/** Runs a write, then refreshes the screen; errors are reported, never thrown at the UI. */
async function write(t: (k: string) => string, context: string, task: () => Promise<unknown>): Promise<void> {
  try {
    await task();
    afterWrite();
  } catch (e) {
    recordError(e, context);
    Alert.alert(t('common.error'));
  }
}

function Checklist({ data }: { data: ChecklistData & { trip: Trip } }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const entryLabel = useEntryLabel();
  const { trip, entries } = data;
  const [sheet, setSheet] = useState<null | 'items' | 'outfit' | 'custom' | 'template'>(null);

  const itemById = useMemo(() => new Map(data.items.map((i) => [i.id, i])), [data.items]);
  const outfitById = useMemo(() => new Map(data.outfits.map((o) => [o.id, o])), [data.outfits]);
  const progress = packingProgress(entries);
  const sections = entriesBySection(entries);
  const listedItemIds = useMemo(() => new Set(entries.filter((e) => e.itemId).map((e) => e.itemId!)), [entries]);
  const listedOutfitIds = useMemo(() => new Set(entries.filter((e) => e.outfitId).map((e) => e.outfitId!)), [entries]);

  // "Don't forget": items of outfits on the list that are not checklist lines themselves.
  const missing = useMemo(() => {
    const outfitsOnList = data.outfits.filter((o) => listedOutfitIds.has(o.id));
    return missingFromChecklist(entries, itemsToPack(outfitsOnList, []))
      .map((iid) => itemById.get(iid))
      .filter((i): i is WardrobeItem => !!i && !i.archived);
  }, [data.outfits, entries, itemById, listedOutfitIds]);

  const refs = (list: readonly WardrobeItem[]) => list.map((i) => ({ id: i.id, categoryKey: labels.categoryKey(i.categoryId) }));
  const addItems = (list: readonly WardrobeItem[]) => write(t, 'packing_add_items', () => repos().trips.addItems(trip.id, refs(list)));
  const toggle = useCallback((e: PackingEntry) => void write(t, 'packing_toggle', () => repos().trips.setPacked(e.id, !e.packed)), [t]);
  const remove = useCallback((e: PackingEntry) => void write(t, 'packing_remove', () => repos().trips.removeEntry(e.id)), [t]);
  const allPacked = progress.total > 0 && progress.packed === progress.total;

  const header = (
    <Stack gap={4} style={{ marginBottom: theme.spacing(2) }}>
      <Stack gap={1}>
        <Text variant="label" tone="accent">
          {`${tripDates(trip)} · ${t('trips.nights', { count: tripNights(trip) })}`}
        </Text>
        <Text variant="display" accessibilityRole="header">
          {trip.destination}
        </Text>
        {trip.notes ? <Text tone="muted">{trip.notes}</Text> : null}
      </Stack>
      <Stack gap={1.5}>
        <ProgressBar progress={progress.ratio} tone={allPacked ? 'success' : 'accent'} height={8} label={t('trips.progress', { packed: progress.packed, total: progress.total })} />
        <Text variant="bodySmall" tone="muted">
          {progress.total === 0 ? t('trips.emptyChecklist') : allPacked ? t('trips.checklist.allPacked') : t('trips.progress', { packed: progress.packed, total: progress.total })}
        </Text>
      </Stack>
      <Row gap={2} wrap>
        <Button small icon="shirt-outline" label={t('trips.checklist.addItems')} onPress={() => setSheet('items')} />
        <Button small variant="secondary" icon="layers-outline" label={t('trips.checklist.addOutfit')} onPress={() => setSheet('outfit')} />
        <Button small variant="secondary" icon="create-outline" label={t('trips.checklist.addCustom')} onPress={() => setSheet('custom')} />
        <Button small variant="secondary" icon="list-outline" label={t('trips.checklist.applyTemplate')} onPress={() => setSheet('template')} />
        {progress.total > 0 ? (
          <Button
            small
            variant="ghost"
            icon={allPacked ? 'square-outline' : 'checkbox-outline'}
            label={allPacked ? t('trips.checklist.unpackAll') : t('trips.checklist.packAll')}
            onPress={() => void write(t, 'packing_all', () => repos().trips.setAllPacked(trip.id, !allPacked))}
          />
        ) : null}
      </Row>
      {missing.length > 0 ? (
        <Card tone="accent">
          <Text variant="heading">{t('trips.checklist.dontForget')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('trips.checklist.dontForgetMessage', { count: missing.length })}
          </Text>
          <Row gap={2} wrap>
            {missing.slice(0, 8).map((i) => (
              <PressableScale key={i.id} onPress={() => void addItems([i])} accessibilityRole="button" accessibilityLabel={t('trips.checklist.addOne', { name: i.name })} style={{ width: 64 }}>
                <ItemPhoto photoPath={i.photoPath} thumbPath={i.thumbPath} categoryKey={labels.categoryKey(i.categoryId)} color={i.primaryColor} />
                <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: theme.colors.surface, borderRadius: 10, paddingHorizontal: 5 }}>
                  <Text variant="caption">+</Text>
                </View>
              </PressableScale>
            ))}
          </Row>
          <Button small label={t('trips.checklist.addAllMissing')} icon="add" onPress={() => void addItems(missing)} style={{ alignSelf: 'flex-start' }} />
        </Card>
      ) : null}
    </Stack>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <RouterStack.Screen
        options={{
          title: t('trips.checklist.title'),
          headerRight: () => <IconButton icon="create-outline" label={t('trips.edit.editTitle')} onPress={() => router.push({ pathname: '/trips/edit', params: { id: trip.id } })} />,
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={20}
        windowSize={9}
        contentContainerStyle={{ padding: theme.spacing(5), paddingBottom: theme.spacing(12) }}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => <SectionHeader title={t(`catalog.packingSection.${section.section}`)} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.border, opacity: 0.6 }} />}
        renderItem={({ item: e }) => (
          <PackingRow
            entry={e}
            label={entryLabel(e, itemById, outfitById)}
            item={e.itemId ? itemById.get(e.itemId) : undefined}
            outfit={e.outfitId ? outfitById.get(e.outfitId) : undefined}
            items={itemById}
            onToggle={toggle}
            onRemove={remove}
          />
        )}
        ListEmptyComponent={<EmptyState icon="briefcase-outline" title={t('trips.checklist.emptyTitle')} message={t('trips.checklist.emptyMessage')} />}
      />

      <ItemPickerSheet
        visible={sheet === 'items'}
        onClose={() => setSheet(null)}
        items={data.items.filter((i) => !i.archived && !listedItemIds.has(i.id))}
        title={t('trips.checklist.addItems')}
        multiple
        onConfirm={(ids) => {
          const chosen = ids.map((x) => itemById.get(x)).filter((i): i is WardrobeItem => !!i);
          if (chosen.length) void addItems(chosen);
        }}
      />
      <OutfitSheet
        visible={sheet === 'outfit'}
        onClose={() => setSheet(null)}
        outfits={data.outfits}
        listed={listedOutfitIds}
        items={itemById}
        onPick={(o) => {
          setSheet(null);
          const its = o.items.map((r) => itemById.get(r.itemId)).filter((i): i is WardrobeItem => !!i && !i.archived);
          void write(t, 'packing_add_outfit', () => repos().trips.addOutfit(trip.id, o.id, refs(its)));
        }}
      />
      <CustomSheet
        visible={sheet === 'custom'}
        onClose={() => setSheet(null)}
        onSave={(label, section) => {
          setSheet(null);
          void write(t, 'packing_add_custom', () => repos().trips.addCustom(trip.id, label, section));
        }}
      />
      <TemplateSheet
        visible={sheet === 'template'}
        onClose={() => setSheet(null)}
        initial={trip.template}
        onApply={(tpl) => {
          setSheet(null);
          void write(t, 'packing_template', async () => {
            const added = await repos().trips.applyTemplate(trip.id, tpl);
            Alert.alert(t('trips.checklist.templateApplied', { count: added }));
          });
        }}
      />
    </View>
  );
}

function OutfitSheet({ visible, onClose, outfits, listed, items, onPick }: { visible: boolean; onClose: () => void; outfits: Outfit[]; listed: ReadonlySet<string>; items: ReadonlyMap<string, WardrobeItem>; onPick: (o: Outfit) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const available = outfits.filter((o) => !listed.has(o.id));
  return (
    <Sheet visible={visible} onClose={onClose} title={t('trips.checklist.addOutfit')}>
      <Text variant="bodySmall" tone="muted">
        {t('trips.checklist.addOutfitHint')}
      </Text>
      {available.length === 0 ? (
        <Text tone="muted" center style={{ paddingVertical: theme.spacing(6) }}>
          {outfits.length === 0 ? t('trips.checklist.noOutfits') : t('trips.checklist.allOutfitsListed')}
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(3) }}>
          {available.map((o) => (
            <PressableScale key={o.id} onPress={() => onPick(o)} accessibilityRole="button" accessibilityLabel={o.name} style={{ width: '47%', gap: 4 }}>
              <OutfitCollage refs={o.items} items={items} height={150} />
              <Text variant="bodySmall" numberOfLines={1}>
                {o.name}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}
    </Sheet>
  );
}

function CustomSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (label: string, section: PackingSection) => void }) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [section, setSection] = useState<PackingSection>('other');
  const [error, setError] = useState(false);
  const submit = () => {
    if (!label.trim()) {
      setError(true);
      return;
    }
    onSave(label.trim(), section);
    setLabel('');
    setError(false);
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={t('trips.checklist.addCustom')} footer={<Button label={t('common.add')} onPress={submit} />}>
      <Field label={t('trips.checklist.customLabel')} value={label} onChangeText={setLabel} placeholder={t('trips.checklist.customPlaceholder')} error={error ? t('trips.checklist.customRequired') : null} maxLength={80} autoFocus onSubmitEditing={submit} returnKeyType="done" />
      <ChoiceChips label={t('trips.checklist.section')} options={PACKING_SECTIONS.map((s) => ({ value: s, label: t(`catalog.packingSection.${s}`) }))} value={section} onChange={(v) => v && setSection(v)} />
    </Sheet>
  );
}

function TemplateSheet({ visible, onClose, initial, onApply }: { visible: boolean; onClose: () => void; initial: TripTemplate | null; onApply: (tpl: TripTemplate) => void }) {
  const { t } = useTranslation();
  const [tpl, setTpl] = useState<TripTemplate | null>(initial);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('trips.checklist.applyTemplate')} footer={<Button label={t('common.apply')} disabled={!tpl} onPress={() => tpl && onApply(tpl)} />}>
      <Text variant="bodySmall" tone="muted">
        {t('trips.checklist.templateHint')}
      </Text>
      <ChoiceChips options={TRIP_TEMPLATES.map((k) => ({ value: k, label: t(`catalog.tripTemplate.${k}`) }))} value={tpl} onChange={setTpl} />
    </Sheet>
  );
}
