import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Outfit, WardrobeItem } from '@/domain/types';
import { Button, Row, SearchBar, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

import { filterOutfits } from './builderLogic';
import { OutfitCard } from './OutfitCard';

/** Full-screen outfit chooser (virtualised 2-column grid of collages) used by the day planner. */
export function OutfitPickerSheet({
  visible,
  onClose,
  outfits,
  items,
  onPick,
  onCreateNew,
}: {
  visible: boolean;
  onClose: () => void;
  outfits: readonly Outfit[];
  items: ReadonlyMap<string, WardrobeItem>;
  onPick: (outfit: Outfit) => void;
  onCreateNew?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const list = useMemo(() => filterOutfits(outfits, 'all', query), [outfits, query]);
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack gap={3} style={{ flex: 1, padding: theme.spacing(4) }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="title" accessibilityRole="header" style={{ flex: 1 }}>
              {t('calendar.plan.chooseOutfit')}
            </Text>
            <Button small variant="ghost" label={t('common.close')} onPress={onClose} />
          </Row>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('outfits.searchPlaceholder')} />
          {onCreateNew ? <Button variant="secondary" icon="add" label={t('calendar.plan.createOutfit')} onPress={onCreateNew} /> : null}
          <FlatList
            data={list}
            keyExtractor={(o) => o.id}
            numColumns={2}
            initialNumToRender={6}
            windowSize={7}
            removeClippedSubviews
            columnWrapperStyle={{ gap: theme.spacing(3) }}
            contentContainerStyle={{ gap: theme.spacing(4), paddingBottom: theme.spacing(6) }}
            ListEmptyComponent={
              <Text tone="muted" center style={{ paddingVertical: 32 }}>
                {outfits.length === 0 ? t('calendar.plan.noOutfits') : t('outfits.noResults')}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={{ flex: 1, maxWidth: '50%' }}>
                <OutfitCard
                  outfit={item}
                  items={items}
                  collageHeight={170}
                  onPress={(o) => {
                    onPick(o);
                    onClose();
                  }}
                />
              </View>
            )}
          />
        </Stack>
      </SafeAreaView>
    </Modal>
  );
}
