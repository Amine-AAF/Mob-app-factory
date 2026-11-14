import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OutfitCollage } from '@/components/OutfitCollage';
import type { Outfit, WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { IconButton, PressableScale, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/** Grid card: collage, name, style · occasion, wear count and a favorite toggle. */
export const OutfitCard = memo(function OutfitCard({
  outfit,
  items,
  onPress,
  onToggleFavorite,
  collageHeight = 200,
}: {
  outfit: Outfit;
  items: ReadonlyMap<string, WardrobeItem>;
  onPress: (o: Outfit) => void;
  onToggleFavorite?: (o: Outfit) => void;
  collageHeight?: number;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const meta = [labels.style(outfit.styleId), labels.occasion(outfit.occasionId)].filter(Boolean).join(' · ');
  return (
    <PressableScale onPress={() => onPress(outfit)} accessibilityRole="button" accessibilityLabel={outfit.name} style={{ flex: 1 }}>
      <View>
        <OutfitCollage refs={outfit.items} items={items} height={collageHeight} />
        {onToggleFavorite ? (
          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: theme.colors.surface, borderRadius: 21, opacity: 0.95 }}>
            <IconButton
              icon={outfit.favorite ? 'heart' : 'heart-outline'}
              tone={outfit.favorite ? 'accent' : 'default'}
              size={18}
              label={outfit.favorite ? t('outfits.removeFavorite') : t('outfits.addFavorite')}
              onPress={() => onToggleFavorite(outfit)}
            />
          </View>
        ) : null}
      </View>
      <Stack gap={0.5} style={{ paddingTop: theme.spacing(2), paddingHorizontal: 2 }}>
        <Text variant="heading" numberOfLines={1}>
          {outfit.name}
        </Text>
        {meta ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {outfit.wearCount > 0 ? t('common.wears', { count: outfit.wearCount }) : t('outfits.neverWorn')}
        </Text>
      </Stack>
    </PressableScale>
  );
});
