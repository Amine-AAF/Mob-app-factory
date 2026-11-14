import { memo, useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CategoryKey } from '@/domain/catalog';
import { colorHex } from '@/domain/catalog';
import { displayUri } from '@/services/photos';
import { Icon, type IconName } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

export const CATEGORY_ICONS: Record<CategoryKey, IconName> = {
  tops: 'shirt-outline',
  shirts: 'shirt-outline',
  tshirts: 'shirt-outline',
  sweaters: 'shirt-outline',
  jackets: 'snow-outline',
  coats: 'snow-outline',
  pants: 'reorder-two-outline',
  jeans: 'reorder-two-outline',
  shorts: 'remove-outline',
  skirts: 'triangle-outline',
  dresses: 'woman-outline',
  shoes: 'footsteps-outline',
  bags: 'bag-handle-outline',
  accessories: 'watch-outline',
  sportswear: 'barbell-outline',
  formalwear: 'ribbon-outline',
  other: 'pricetag-outline',
};

/**
 * Photo of an item (or wishlist entry). Grids use the thumbnail; detail screens the full photo.
 * When the file is missing (deleted, restore without photos) a tinted placeholder with the
 * category icon is shown instead of a broken image.
 */
export const ItemPhoto = memo(function ItemPhoto({
  photoPath,
  thumbPath,
  categoryKey = 'other',
  color,
  size = 'thumb',
  style,
  rounded = true,
  accessibilityLabel,
}: {
  photoPath: string | null;
  thumbPath: string | null;
  categoryKey?: CategoryKey;
  color?: string | null;
  size?: 'thumb' | 'full';
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  const uri = failed ? null : displayUri({ photoPath, thumbPath }, size);
  const radius = rounded ? t.radius.md : 0;
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      style={[{ backgroundColor: t.colors.photoBackdrop, borderRadius: radius, overflow: 'hidden', aspectRatio: 3 / 4 }, style]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode={size === 'full' ? 'contain' : 'cover'} onError={() => setFailed(true)} fadeDuration={150} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name={CATEGORY_ICONS[categoryKey] ?? 'pricetag-outline'} size={28} color={t.colors.textSubtle} />
          {color ? <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colorHex(color), borderWidth: 1, borderColor: t.colors.border }} /> : null}
        </View>
      )}
    </View>
  );
});
