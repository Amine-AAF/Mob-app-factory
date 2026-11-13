import { Button, Text } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, useWindowDimensions, View } from 'react-native';

import { BookTile } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { Empty, Field, IconAction, Paper, Serif } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { useSession } from '@/store/session';

const bump = () => useSession.getState().bump();

export default function CollectionDetail() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => {
    const [all, books] = await Promise.all([r.organize.collections(), r.books.list({ collectionId: id, sort: 'title' })]);
    return { collection: all.find((c) => c.id === id) ?? null, books };
  }, [id]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const open = useCallback((bookId: string) => router.push(`/book/${bookId}`), []);
  const c = data?.collection;
  const name = c ? (c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name) : '';
  const columns = Math.max(3, Math.floor((width - 40) / 120));
  const tile = Math.floor((width - 40 - (columns - 1) * 14) / columns);

  const menu = () =>
    c &&
    Alert.alert(name, undefined, [
      { text: t('collections.rename'), onPress: () => setRenaming(name) },
      { text: c.isPinned ? t('collections.unpin') : t('collections.pin'), onPress: () => void run(() => repos().organize.setCollectionPinned(id, !c.isPinned).then(bump)) },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('collections.deleteTitle'), t('collections.deleteBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => repos().organize.deleteCollection(id).then(() => (bump(), router.back()))) },
          ]),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <>
      <Stack.Screen options={{ title: name, headerRight: () => <IconAction icon="ellipsis-vertical" label={t('common.more')} onPress={menu} /> }} />
      <FlatList
        key={columns}
        style={{ backgroundColor: theme.colors.background }}
        data={data?.books ?? []}
        numColumns={columns}
        keyExtractor={(b) => b.id}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={{ padding: 20, gap: 18 }}
        renderItem={({ item }) => <BookTile book={item} width={tile} onPress={open} />}
        ListHeaderComponent={
          <View style={{ gap: 10 }}>
            {renaming != null ? (
              <Paper>
                <Field label={t('collections.newName')} value={renaming} onChangeText={setRenaming} autoFocus />
                <Button
                  label={t('common.save')}
                  disabled={!renaming.trim()}
                  onPress={() =>
                    void run(async () => {
                      await repos().organize.renameCollection(id, renaming);
                      bump();
                      setRenaming(null);
                    })
                  }
                />
              </Paper>
            ) : (
              <Serif size={24}>{name}</Serif>
            )}
            <Text variant="caption" tone="subtle">
              {t('collections.bookCount', { count: data?.books.length ?? 0 })} · {t('collections.addHint')}
            </Text>
          </View>
        }
        ListEmptyComponent={<Empty icon="albums-outline" title={t('collections.emptyOne')} message={t('collections.addHint')} />}
      />
    </>
  );
}
