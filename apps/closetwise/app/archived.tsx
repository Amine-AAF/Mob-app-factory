import { Stack as RouterStack, router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList } from 'react-native';

import { confirmDelete } from '@/components/forms';
import { repos } from '@/database';
import type { WardrobeItem } from '@/domain/types';
import { ItemListRow } from '@/features/wardrobe/components';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { deletePhotoFiles } from '@/services/photos';
import { EmptyState, IconButton, Loading, Row, Screen, Text, useTheme } from '@/ui';

export default function ArchivedScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: items } = useAsync(() => repos().wardrobe.list({ archived: true }), []);

  const run = async (fn: () => Promise<unknown>, context: string) => {
    try {
      await fn();
      afterWrite();
    } catch (e) {
      recordError(e, context);
      Alert.alert(t('common.error'));
    }
  };

  const unarchive = (i: WardrobeItem) => void run(() => repos().wardrobe.setArchived(i.id, false), 'unarchive_item');
  const remove = (i: WardrobeItem) =>
    confirmDelete(
      t,
      () =>
        void run(async () => {
          const files = await repos().wardrobe.remove(i.id);
          if (files) deletePhotoFiles(files.photoPath, files.thumbPath);
          await repos().outfits.removeEmpty();
        }, 'delete_item'),
      t('item.deleteTitle'),
      t('item.deleteMessage'),
    );
  const open = useCallback((i: WardrobeItem) => router.push({ pathname: '/item/[id]', params: { id: i.id } }), []);

  return (
    <Screen edges={[]} scroll={false} padded={false}>
      <RouterStack.Screen options={{ title: t('wardrobe.archivedTitle') }} />
      {!items ? (
        <Loading />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingVertical: theme.spacing(3) }}
          ListHeaderComponent={
            items.length ? (
              <Text variant="bodySmall" tone="muted" style={{ marginBottom: theme.spacing(2) }}>
                {t('wardrobe.archivedHint')}
              </Text>
            ) : undefined
          }
          ListEmptyComponent={<EmptyState icon="archive-outline" title={t('wardrobe.archivedEmptyTitle')} message={t('wardrobe.archivedEmptyMessage')} />}
          renderItem={({ item }) => (
            <ItemListRow
              item={item}
              onPress={open}
              right={
                <Row gap={0}>
                  <IconButton icon="arrow-undo-outline" label={t('wardrobe.unarchive')} onPress={() => unarchive(item)} testID={`unarchive-${item.id}`} />
                  <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={() => remove(item)} testID={`delete-${item.id}`} />
                </Row>
              }
            />
          )}
          initialNumToRender={14}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </Screen>
  );
}
