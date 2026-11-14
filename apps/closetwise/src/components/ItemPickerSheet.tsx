import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal as RNModal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SLOT_CATEGORIES, type Slot } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { matchesQuery } from '@/domain/wardrobeQuery';
import { useLabels } from '@/hooks/useLabels';
import { Button, Icon, SearchBar, Segmented, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

import { ItemPhoto } from './ItemPhoto';

/**
 * Full-screen item selector used by the outfit builder, packing lists and goals.
 * Virtualised grid (FlatList) of thumbnails so it stays fast with hundreds of items.
 */
export function ItemPickerSheet({
  visible,
  onClose,
  items,
  title,
  slot,
  multiple,
  selected,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  items: readonly WardrobeItem[];
  title: string;
  /** Restricts to categories that fit this slot (with an "all items" escape hatch). */
  slot?: Slot;
  multiple?: boolean;
  selected?: readonly string[];
  onConfirm: (ids: string[]) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'fit' | 'all'>('fit');
  const [picked, setPicked] = useState<string[]>([...(selected ?? [])]);
  // Re-sync the selection each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPicked([...(selected ?? [])]);
  }

  const list = useMemo(() => {
    const allowed = slot && scope === 'fit' ? (SLOT_CATEGORIES[slot] as readonly string[]) : null;
    return items.filter((i) => !i.archived && (!allowed || allowed.includes(labels.categoryKey(i.categoryId))) && matchesQuery(i, query, (x) => labels.category(x.categoryId)));
  }, [items, slot, scope, query, labels]);

  const toggle = (id: string) => {
    if (!multiple) {
      onConfirm([id]);
      onClose();
      return;
    }
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <PickerModal visible={visible} onClose={onClose}>
      <Stack gap={3} style={{ flex: 1, padding: theme.spacing(4) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          <Button small variant="ghost" label={t('common.close')} onPress={onClose} />
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('common.search')} />
        {slot && slot !== 'extra' ? (
          <Segmented
            options={[
              { value: 'fit', label: t(`catalog.slot.${slot}`) },
              { value: 'all', label: t('common.all') },
            ]}
            value={scope}
            onChange={setScope}
          />
        ) : null}
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          numColumns={3}
          initialNumToRender={18}
          windowSize={7}
          removeClippedSubviews
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text tone="muted" center style={{ paddingVertical: 32 }}>
              {t('outfits.builder.noMatchingItems')}
            </Text>
          }
          renderItem={({ item }) => {
            const on = picked.includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                accessibilityRole={multiple ? 'checkbox' : 'button'}
                accessibilityState={multiple ? { checked: on } : undefined}
                accessibilityLabel={item.name}
                style={{ width: '31.5%' }}
              >
                <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} style={on ? { borderWidth: 3, borderColor: theme.colors.primary } : undefined} />
                {on ? (
                  <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: theme.colors.primary, borderRadius: 12, padding: 2 }}>
                    <Icon name="checkmark" size={16} color={theme.colors.onPrimary} />
                  </View>
                ) : null}
                <Text variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
        {multiple ? (
          <Button
            label={`${t('common.done')} (${picked.length})`}
            onPress={() => {
              onConfirm(picked);
              onClose();
            }}
          />
        ) : null}
      </Stack>
    </PickerModal>
  );
}

function PickerModal({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const theme = useTheme();
  return (
    <RNModal visible={visible} onRequestClose={onClose} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>{children}</SafeAreaView>
    </RNModal>
  );
}

