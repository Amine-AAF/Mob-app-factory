import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import type { Slot } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { Icon, IconButton, PressableScale, Row, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

const THUMB = 72;

/** One builder slot: label, selected thumbnails with remove buttons, and an add/replace tile. */
export function SlotRow({ slot, ids, items, multiple, onPick, onRemove }: { slot: Slot; ids: readonly string[]; items: ReadonlyMap<string, WardrobeItem>; multiple: boolean; onPick: () => void; onRemove: (itemId: string) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const slotLabel = t(`catalog.slot.${slot}`);
  const resolved = ids.map((id) => items.get(id)).filter((i): i is WardrobeItem => !!i);
  const showAdd = multiple || resolved.length === 0;
  return (
    <Stack gap={2}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="subtle">
          {slotLabel}
        </Text>
        {!multiple && resolved.length > 0 ? (
          <PressableScale onPress={onPick} accessibilityRole="button" accessibilityLabel={t('outfits.builder.replace', { slot: slotLabel })} hitSlop={8} style={{ minHeight: 40, justifyContent: 'center' }}>
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '600' }}>
              {t('outfits.builder.change')}
            </Text>
          </PressableScale>
        ) : null}
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(2) }}>
        {resolved.map((item) => (
          <View key={item.id} style={{ width: THUMB }}>
            <PressableScale onPress={onPick} accessibilityRole="button" accessibilityLabel={item.name}>
              <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} />
            </PressableScale>
            <View style={{ position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.surface, borderRadius: 21, transform: [{ scale: 0.8 }] }}>
              <IconButton icon="close" size={16} label={t('outfits.builder.removeItem', { name: item.name })} onPress={() => onRemove(item.id)} />
            </View>
            <Text variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>
              {item.name}
            </Text>
          </View>
        ))}
        {showAdd ? (
          <PressableScale
            onPress={onPick}
            accessibilityRole="button"
            accessibilityLabel={t('outfits.builder.addTo', { slot: slotLabel })}
            style={{ width: THUMB, aspectRatio: 3 / 4, borderRadius: theme.radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }}
          >
            <Icon name="add" size={24} color={theme.colors.textMuted} />
          </PressableScale>
        ) : null}
      </ScrollView>
    </Stack>
  );
}
