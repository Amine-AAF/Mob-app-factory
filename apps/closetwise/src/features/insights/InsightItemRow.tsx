import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import type { WardrobeItem } from '@/domain/types';
import type { Labels } from '@/hooks/useLabels';
import { Icon, PressableScale, Row, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/** Compact item row (thumbnail + name + detail) linking to the item page. */
export function InsightItemRow({ item, labels, detail, right }: { item: WardrobeItem; labels: Labels; detail?: string; right?: ReactNode }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
      accessibilityRole="button"
      accessibilityLabel={[item.name, detail].filter(Boolean).join(', ')}
      style={{ minHeight: 56 }}
    >
      <Row gap={3} style={{ paddingVertical: theme.spacing(1.5) }}>
        <View style={{ width: 44 }}>
          <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} />
        </View>
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" tone="subtle" numberOfLines={1}>
            {detail ?? labels.category(item.categoryId)}
          </Text>
        </Stack>
        {right}
        <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
      </Row>
    </PressableScale>
  );
}
