import { Chip, Icon, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner, BOOK_ROW_HEIGHT, BookRow, BookTile } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { Empty, IconAction, Paper, Segmented, Serif } from '@/components/ui';
import type { LibrarySort } from '@/database';
import { useData } from '@/hooks';
import { usePreferences } from '@/store/preferences';
import { BOOK_FORMATS, READING_STATUSES, type BookFormat, type BookListItem, type ReadingStatus } from '@/types';

const SORTS: LibrarySort[] = ['recent', 'added', 'title', 'author', 'rating', 'progress', 'year'];

export default function Library() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const params = useLocalSearchParams<{ status?: string }>();
  const { width } = useWindowDimensions();
  const view = usePreferences((s) => s.libraryView);
  const sort = usePreferences((s) => s.librarySort);
  const setPrefs = usePreferences((s) => s.set);
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const [status, setStatus] = useState<ReadingStatus | null>(null);
  const [format, setFormat] = useState<BookFormat | null>(null);
  const [genreId, setGenreId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(false);
  const [archived, setArchived] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (params.status && (READING_STATUSES as readonly string[]).includes(params.status)) setStatus(params.status as ReadingStatus);
  }, [params.status]);

  const { data } = useData((r) => Promise.all([r.books.list({ search, status, format, genreId, favoritesOnly: favorites, archived, sort }), r.books.genres(), r.books.count()]), [search, status, format, genreId, favorites, archived, sort]);
  const [books, genres, total] = data ?? [[] as BookListItem[], [], 0];

  const columns = Math.max(3, Math.floor((width - 40) / 120));
  const tileWidth = Math.floor((width - 40 - (columns - 1) * 14) / columns);
  const open = useCallback((id: string) => router.push(`/book/${id}`), []);
  const activeFilters = [status, format, genreId, favorites || null, archived || null].filter(Boolean).length;

  const header = useMemo(
    () => (
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Serif size={30}>{t('library.title')}</Serif>
            <Text variant="caption" tone="subtle">
              {t('library.count', { count: total })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconAction icon={view === 'grid' ? 'list' : 'grid'} label={t(view === 'grid' ? 'library.listView' : 'library.gridView')} onPress={() => setPrefs({ libraryView: view === 'grid' ? 'list' : 'grid' })} testID="toggle-view" />
            <IconAction icon="add-circle" tone="primary" label={t('library.addBook')} onPress={() => router.push('/book/edit')} testID="library-add" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12 }}>
          <Icon name="search" size={18} color={theme.colors.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('library.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSubtle}
            accessibilityLabel={t('library.searchPlaceholder')}
            style={{ flex: 1, minHeight: 46, color: theme.colors.text, fontSize: 16 }}
            returnKeyType="search"
            testID="library-search"
          />
          {query ? <IconAction icon="close-circle" label={t('common.clear')} onPress={() => setQuery('')} /> : null}
          <IconAction icon="options" tone={activeFilters ? 'primary' : 'default'} label={t('library.filters')} onPress={() => setFiltersOpen(true)} testID="open-filters" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('library.all')} selected={!status} onPress={() => setStatus(null)} />
          {READING_STATUSES.map((s) => (
            <Chip key={s} label={t(`status.${s}`)} selected={status === s} onPress={() => setStatus(status === s ? null : s)} testID={`filter-${s}`} />
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Paper tone="alt" style={{ flex: 1, paddingVertical: 10 }} onPress={() => router.push('/collections')} accessibilityLabel={t('collections.title')}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="albums" size={18} color={theme.colors.primary} />
              <Text style={{ fontWeight: '600' }}>{t('collections.title')}</Text>
            </View>
          </Paper>
          <Paper tone="alt" style={{ flex: 1, paddingVertical: 10 }} onPress={() => router.push('/wishlist')} accessibilityLabel={t('wishlist.title')}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="gift" size={18} color={theme.colors.primary} />
              <Text style={{ fontWeight: '600' }}>{t('wishlist.title')}</Text>
            </View>
          </Paper>
        </View>
        <AdBanner screen="library" />
      </View>
    ),
    [t, total, view, theme, query, activeFilters, status, setPrefs],
  );

  const empty = total === 0 && !archived ? (
    <Empty icon="library-outline" title={t('library.emptyTitle')} message={t('library.emptyBody')} />
  ) : (
    <Empty icon="search" title={t('library.noResults')} message={t('library.noResultsBody')} />
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="library">
      {view === 'grid' ? (
        <FlatList
          key={`grid-${columns}`}
          data={books}
          numColumns={columns}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookTile book={item} width={tileWidth} onPress={open} />}
          columnWrapperStyle={{ gap: 14 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 18 }}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          initialNumToRender={18}
          maxToRenderPerBatch={18}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          key="list"
          data={books}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookRow book={item} onPress={open} />}
          getItemLayout={(_, index) => ({ length: BOOK_ROW_HEIGHT, offset: BOOK_ROW_HEIGHT * index, index })}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
        />
      )}

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay }} onPress={() => setFiltersOpen(false)} accessibilityLabel={t('common.close')} />
        <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14, maxHeight: '80%' }}>
          <ScrollView contentContainerStyle={{ gap: 14 }}>
            <Serif size={22}>{t('library.filters')}</Serif>
            <Text variant="label" tone="muted">
              {t('library.sortBy')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SORTS.map((s) => (
                <Chip key={s} label={t(`library.sort.${s}`)} selected={sort === s} onPress={() => setPrefs({ librarySort: s })} testID={`sort-${s}`} />
              ))}
            </View>
            <Text variant="label" tone="muted">
              {t('book.format')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BOOK_FORMATS.map((f) => (
                <Chip key={f} label={t(`formats.${f}`)} selected={format === f} onPress={() => setFormat(format === f ? null : f)} />
              ))}
            </View>
            {genres.length ? (
              <>
                <Text variant="label" tone="muted">
                  {t('book.genre')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {genres.map((g) => (
                    <Chip key={g.id} label={`${g.name} · ${g.books}`} selected={genreId === g.id} onPress={() => setGenreId(genreId === g.id ? null : g.id)} />
                  ))}
                </View>
              </>
            ) : null}
            <Segmented
              value={archived ? 'archived' : favorites ? 'favorites' : 'all'}
              onChange={(v) => {
                setArchived(v === 'archived');
                setFavorites(v === 'favorites');
              }}
              options={[
                { value: 'all', label: t('library.all') },
                { value: 'favorites', label: t('library.favorites'), icon: 'heart' },
                { value: 'archived', label: t('library.archived'), icon: 'archive' },
              ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable
                onPress={() => {
                  setStatus(null);
                  setFormat(null);
                  setGenreId(null);
                  setFavorites(false);
                  setArchived(false);
                }}
                accessibilityRole="button"
                style={{ padding: 10 }}
              >
                <Text tone="primary" style={{ fontWeight: '600' }}>
                  {t('library.resetFilters')}
                </Text>
              </Pressable>
              <Pressable onPress={() => setFiltersOpen(false)} accessibilityRole="button" style={{ padding: 10 }} testID="close-filters">
                <Text tone="primary" style={{ fontWeight: '700' }}>
                  {t('common.done')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
