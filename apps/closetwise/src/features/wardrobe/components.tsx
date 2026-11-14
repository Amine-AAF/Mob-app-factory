import { memo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import { CARE_STATUSES, COLORS, SEASON_KEYS, type CareStatus, type Season } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { EMPTY_FILTER, SORT_KEYS, type SortKey, type WardrobeFilter } from '@/domain/wardrobeQuery';
import { useLabels } from '@/hooks/useLabels';
import { Badge, Button, ChoiceChips, Icon, ListRow, MultiChips, PressableScale, Row, Sheet, Stack, SwitchRow, Text, useTheme, type ClosetTheme } from '@/ui';

/** Theme color used for a care status (dot / badge). */
export function careColor(theme: ClosetTheme, status: CareStatus): string {
  return {
    clean: theme.colors.success,
    ready: theme.colors.primary,
    to_wash: theme.colors.warning,
    in_laundry: theme.colors.accent,
    to_iron: theme.colors.textMuted,
  }[status];
}

export function CareDot({ status, size = 10 }: { status: CareStatus; size?: number }) {
  const theme = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: careColor(theme, status), borderWidth: 1.5, borderColor: theme.colors.surface }} />;
}

/** Grid tile: thumbnail only, favorite heart and care dot (when not clean). */
export const ItemGridCard = memo(function ItemGridCard({
  item,
  width,
  onPress,
  selected,
}: {
  item: WardrobeItem;
  width: number;
  onPress: (item: WardrobeItem) => void;
  selected?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const status = t(`catalog.care.${item.careStatus}`);
  return (
    <PressableScale
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={[item.name, item.favorite ? t('wardrobe.favorite') : null, t('wardrobe.careStatusA11y', { status })].filter(Boolean).join(', ')}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={{ width, gap: 4 }}
    >
      <View>
        <ItemPhoto
          photoPath={item.photoPath}
          thumbPath={item.thumbPath}
          categoryKey={labels.categoryKey(item.categoryId)}
          color={item.primaryColor}
          style={selected ? { borderWidth: 2, borderColor: theme.colors.primary } : undefined}
        />
        {item.favorite ? (
          <View style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }}>
            <Icon name="heart" size={13} color={theme.colors.danger} />
          </View>
        ) : null}
        {item.careStatus !== 'clean' ? (
          <View style={{ position: 'absolute', top: 7, left: 7 }}>
            <CareDot status={item.careStatus} size={12} />
          </View>
        ) : null}
        {selected ? (
          <View style={{ position: 'absolute', bottom: 6, right: 6, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}>
            <Icon name="checkmark" size={15} color={theme.colors.onPrimary} />
          </View>
        ) : null}
      </View>
      <Text variant="caption" numberOfLines={1}>
        {item.name}
      </Text>
    </PressableScale>
  );
});

/** List row: thumbnail, name, category/color/brand, wears and care status. */
export const ItemListRow = memo(function ItemListRow({ item, onPress, right }: { item: WardrobeItem; onPress: (item: WardrobeItem) => void; right?: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const meta = [labels.category(item.categoryId), item.subcategory, labels.color(item.primaryColor), item.brandName].filter(Boolean).join(' · ');
  return (
    <PressableScale onPress={() => onPress(item)} accessibilityRole="button" accessibilityLabel={item.name} style={{ paddingVertical: theme.spacing(2) }}>
      <Row gap={3}>
        <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} style={{ width: 60 }} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Row gap={1.5}>
            <Text variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>
              {item.name}
            </Text>
            {item.favorite ? <Icon name="heart" size={14} color={theme.colors.danger} accessibilityLabel={t('wardrobe.favorite')} /> : null}
          </Row>
          {meta ? (
            <Text variant="bodySmall" tone="muted" numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          <Row gap={2}>
            <Text variant="caption" tone="subtle">
              {t('common.wears', { count: item.wearCount })}
            </Text>
            {item.careStatus !== 'clean' ? (
              <Row gap={1}>
                <CareDot status={item.careStatus} />
                <Text variant="caption" tone="subtle">
                  {t(`catalog.care.${item.careStatus}`)}
                </Text>
              </Row>
            ) : null}
          </Row>
        </Stack>
        {right ?? <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
      </Row>
    </PressableScale>
  );
});

/** Filter sheet: edits a draft and applies it on "Apply". The category filter lives in the quick chips. */
export function FilterSheet({ visible, onClose, value, onApply }: { visible: boolean; onClose: () => void; value: WardrobeFilter; onApply: (f: WardrobeFilter) => void }) {
  const { t } = useTranslation();
  const labels = useLabels();
  const [draft, setDraft] = useState(value);
  // Reset the draft whenever the sheet opens or the applied filter changes (derived during render).
  const [synced, setSynced] = useState({ visible, value });
  if (synced.visible !== visible || synced.value !== value) {
    setSynced({ visible, value });
    if (visible) setDraft(value);
  }
  const patch = (p: Partial<WardrobeFilter>) => setDraft((d) => ({ ...d, ...p }));
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('wardrobe.filterTitle')}
      footer={
        <Row gap={2}>
          <Button
            variant="secondary"
            label={t('common.reset')}
            onPress={() => setDraft({ ...EMPTY_FILTER, query: draft.query, categoryIds: draft.categoryIds })}
            style={{ flex: 1 }}
          />
          <Button
            label={t('common.apply')}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 1 }}
            testID="filter-apply"
          />
        </Row>
      }
    >
      <MultiChips label={t('wardrobe.filterColors')} options={COLORS.map((c) => ({ value: c.key as string, label: t(`catalog.color.${c.key}`), color: c.hex }))} values={draft.colors} onChange={(colors) => patch({ colors })} />
      <ChoiceChips<Season>
        label={t('wardrobe.filterSeason')}
        allowNone
        options={SEASON_KEYS.map((s) => ({ value: s, label: t(`catalog.season.${s}`) }))}
        value={draft.season}
        onChange={(season) => patch({ season })}
      />
      {labels.styleOptions.length ? <MultiChips label={t('wardrobe.filterStyles')} options={labels.styleOptions} values={draft.styleIds} onChange={(styleIds) => patch({ styleIds })} /> : null}
      {labels.occasionOptions.length ? (
        <MultiChips label={t('wardrobe.filterOccasions')} options={labels.occasionOptions} values={draft.occasionIds} onChange={(occasionIds) => patch({ occasionIds })} />
      ) : null}
      <MultiChips<CareStatus>
        label={t('wardrobe.filterCare')}
        options={CARE_STATUSES.map((s) => ({ value: s, label: t(`catalog.care.${s}`) }))}
        values={draft.careStatuses}
        onChange={(careStatuses) => patch({ careStatuses })}
      />
      <SwitchRow title={t('wardrobe.favoritesOnly')} value={draft.favoritesOnly} onChange={(favoritesOnly) => patch({ favoritesOnly })} />
    </Sheet>
  );
}

export function SortSheet({ visible, onClose, value, onChange }: { visible: boolean; onClose: () => void; value: SortKey; onChange: (s: SortKey) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title={t('wardrobe.sortTitle')}>
      <Stack gap={0}>
        {SORT_KEYS.map((k) => (
          <ListRow
            key={k}
            title={t(`wardrobe.sortKey.${k}`)}
            onPress={() => {
              onChange(k);
              onClose();
            }}
            right={k === value ? <Icon name="checkmark" size={20} color={theme.colors.primary} /> : <View style={{ width: 20 }} />}
          />
        ))}
      </Stack>
    </Sheet>
  );
}

/** Small "Archived" badge helper reused by detail and list screens. */
export function ArchivedBadge() {
  const { t } = useTranslation();
  return <Badge label={t('item.archivedBadge')} icon="archive-outline" />;
}
