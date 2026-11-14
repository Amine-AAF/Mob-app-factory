import { memo } from 'react';
import { View } from 'react-native';

import type { Slot } from '@/domain/catalog';
import type { OutfitItemRef, WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

import { ItemPhoto } from './ItemPhoto';

/**
 * Visual composition of an outfit, laid out like a flat-lay: the main pieces in a large
 * column (outerwear/top/bottom or dress), shoes below, and bag/accessories in a side column.
 * Uses thumbnails only, so a list of many outfits stays light.
 */
const MAIN_ORDER: Slot[] = ['outerwear', 'onepiece', 'top', 'bottom'];
const SIDE_ORDER: Slot[] = ['bag', 'accessory', 'extra', 'shoes'];

export const OutfitCollage = memo(function OutfitCollage({ refs, items, height = 220, accessibilityLabel }: { refs: readonly OutfitItemRef[]; items: ReadonlyMap<string, WardrobeItem>; height?: number; accessibilityLabel?: string }) {
  const t = useTheme();
  const labels = useLabels();
  const resolved = refs.map((r) => ({ ref: r, item: items.get(r.itemId) })).filter((x): x is { ref: OutfitItemRef; item: WardrobeItem } => !!x.item);
  const main = MAIN_ORDER.flatMap((s) => resolved.filter((x) => x.ref.slot === s));
  const side = SIDE_ORDER.flatMap((s) => resolved.filter((x) => x.ref.slot === s));
  const mainShown = main.slice(0, 3);
  const sideShown = [...main.slice(3), ...side].slice(0, 4);
  const hidden = resolved.length - mainShown.length - sideShown.length;

  if (resolved.length === 0) {
    return (
      <View style={{ height, borderRadius: t.radius.lg, backgroundColor: t.colors.photoBackdrop }} accessibilityLabel={accessibilityLabel} />
    );
  }

  const photo = (x: { item: WardrobeItem }, flex: number, key: string) => (
    <ItemPhoto
      key={key}
      photoPath={x.item.photoPath}
      thumbPath={x.item.thumbPath}
      categoryKey={labels.categoryKey(x.item.categoryId)}
      color={x.item.primaryColor}
      style={{ flex, aspectRatio: undefined, minHeight: 0 }}
    />
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? resolved.map((x) => x.item.name).join(', ')}
      style={{ height, flexDirection: 'row', gap: 4, padding: 4, borderRadius: t.radius.lg, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
    >
      <View style={{ flex: sideShown.length ? 1.6 : 1, gap: 4 }}>{(mainShown.length ? mainShown : sideShown.slice(0, 1)).map((x, i) => photo(x, 1, `m${i}`))}</View>
      {sideShown.length && mainShown.length ? (
        <View style={{ flex: 1, gap: 4 }}>
          {sideShown.map((x, i) => photo(x, 1, `s${i}`))}
          {hidden > 0 ? (
            <View style={{ position: 'absolute', right: 6, bottom: 6, backgroundColor: t.colors.overlay, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text variant="caption" style={{ color: '#FFFFFF' }}>{`+${hidden}`}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

/** Lookup map helper for collages. */
export function itemMap(items: readonly WardrobeItem[]): Map<string, WardrobeItem> {
  return new Map(items.map((i) => [i.id, i]));
}
