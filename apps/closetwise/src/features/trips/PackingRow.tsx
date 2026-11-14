import { router } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import { OutfitCollage } from '@/components/OutfitCollage';
import type { Outfit, PackingEntry, WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { Icon, IconButton, Row, Text, useTheme } from '@/ui';

import { templateKeyOf } from './logic';

/** Label shown for a checklist entry (template keys are translated, custom labels shown as typed). */
export function useEntryLabel(): (entry: PackingEntry, items: ReadonlyMap<string, WardrobeItem>, outfits: ReadonlyMap<string, Outfit>) => string {
  const { t } = useTranslation();
  return (entry, items, outfits) => {
    if (entry.kind === 'item') return (entry.itemId && items.get(entry.itemId)?.name) || t('trips.checklist.itemDeleted');
    if (entry.kind === 'outfit') return (entry.outfitId && outfits.get(entry.outfitId)?.name) || t('trips.checklist.outfitDeleted');
    const key = templateKeyOf(entry.label);
    return key ? t(`trips.template.${key}`) : (entry.label ?? '');
  };
}

export const PackingRow = memo(function PackingRow({
  entry,
  label,
  item,
  outfit,
  items,
  onToggle,
  onRemove,
}: {
  entry: PackingEntry;
  label: string;
  item: WardrobeItem | undefined;
  outfit: Outfit | undefined;
  items: ReadonlyMap<string, WardrobeItem>;
  onToggle: (entry: PackingEntry) => void;
  onRemove: (entry: PackingEntry) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const open = item
    ? () => router.push({ pathname: '/item/[id]', params: { id: item.id } })
    : outfit
      ? () => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id } })
      : undefined;

  return (
    <Row gap={3} style={{ paddingVertical: theme.spacing(2), minHeight: 56 }}>
      <Pressable
        onPress={() => onToggle(entry)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: entry.packed }}
        accessibilityLabel={label}
        hitSlop={6}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: entry.packed ? theme.colors.primary : theme.colors.border,
            backgroundColor: entry.packed ? theme.colors.primary : theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {entry.packed ? <Icon name="checkmark" size={18} color={theme.colors.onPrimary} /> : null}
        </View>
      </Pressable>
      {item ? (
        <View style={{ width: 40 }}>
          <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} />
        </View>
      ) : outfit ? (
        <View style={{ width: 48 }}>
          <OutfitCollage refs={outfit.items} items={items} height={60} accessibilityLabel={outfit.name} />
        </View>
      ) : null}
      <Pressable onPress={open} disabled={!open} accessibilityRole={open ? 'link' : undefined} style={{ flex: 1, minHeight: 40, justifyContent: 'center' }}>
        <Text style={entry.packed ? { textDecorationLine: 'line-through', color: theme.colors.textSubtle } : undefined} numberOfLines={2}>
          {label}
        </Text>
        {outfit ? (
          <Text variant="caption" tone="subtle">
            {t('common.items', { count: outfit.items.length })}
          </Text>
        ) : null}
      </Pressable>
      <IconButton icon="close" size={18} label={t('trips.checklist.remove', { label })} onPress={() => onRemove(entry)} />
    </Row>
  );
});
