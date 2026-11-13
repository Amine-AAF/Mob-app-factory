import { Chip, Icon, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Share, TextInput, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Empty, IconAction, Paper } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { copyText } from '@/services/files';
import { useSession } from '@/store/session';
import { quoteShareText } from '@/features/quotes/share';

/** Quotes stay private: copying or sharing is always an explicit user action through Android's share sheet. */
export default function Quotes() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const params = useLocalSearchParams<{ bookId?: string }>();
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const [favorites, setFavorites] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [bookId, setBookId] = useState<string | null>(params.bookId ?? null);
  const { data } = useData((r) => Promise.all([r.content.quotes({ search, favoritesOnly: favorites, tag, bookId }), r.content.allTags(), r.books.list({ sort: 'title' })]), [search, favorites, tag, bookId]);
  const [quotes, tags, books] = data ?? [[], [], []];
  const booksWithQuotes = books.filter((b) => (data?.[0] ?? []).some((q) => q.bookId === b.id) || b.id === bookId);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 12 }}
      data={quotes}
      keyExtractor={(q) => q.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={theme.colors.textSubtle} />
            <TextInput value={query} onChangeText={setQuery} placeholder={t('quotes.search')} placeholderTextColor={theme.colors.textSubtle} accessibilityLabel={t('quotes.search')} style={{ flex: 1, minHeight: 46, color: theme.colors.text }} />
            <IconAction icon="add-circle" tone="primary" label={t('quotes.add')} onPress={() => router.push({ pathname: '/quotes/edit', params: bookId ? { bookId } : {} })} testID="add-quote" />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Chip label={t('library.favorites')} icon="heart" selected={favorites} onPress={() => setFavorites(!favorites)} />
            {bookId ? <Chip label={books.find((b) => b.id === bookId)?.title ?? t('quotes.thisBook')} icon="close" selected onPress={() => setBookId(null)} /> : null}
            {tags.slice(0, 12).map((x) => (
              <Chip key={x} label={`#${x}`} selected={tag === x} onPress={() => setTag(tag === x ? null : x)} />
            ))}
          </View>
          {!bookId && booksWithQuotes.length > 1 ? (
            <FlatList
              horizontal
              data={booksWithQuotes}
              keyExtractor={(b) => b.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
              renderItem={({ item }) => <Chip label={item.title} selected={false} onPress={() => setBookId(item.id)} />}
            />
          ) : null}
        </View>
      }
      renderItem={({ item: q }) => (
        <Paper onPress={() => router.push({ pathname: '/quotes/edit', params: { id: q.id } })} accessibilityLabel={q.text}>
          <Text style={{ fontFamily: theme.serif, fontSize: 17, lineHeight: 26, fontStyle: 'italic' }}>“{q.text}”</Text>
          <Text variant="caption" tone="subtle">
            {[q.authorName, q.bookTitle, q.page != null ? t('quotes.pageN', { page: q.page }) : null].filter(Boolean).join(' · ')}
          </Text>
          {q.comment ? (
            <Text variant="bodySmall" tone="muted">
              {q.comment}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <IconAction icon={q.isFavorite ? 'heart' : 'heart-outline'} tone="primary" label={t('quotes.favorite')} onPress={() => void run(() => repos().content.setQuoteFavorite(q.id, !q.isFavorite).then(() => useSession.getState().bump()))} />
            <IconAction icon="copy-outline" label={t('quotes.copy')} onPress={() => void run(() => copyText(quoteShareText(q)))} />
            <IconAction icon="share-social-outline" label={t('quotes.share')} onPress={() => void Share.share({ message: quoteShareText(q) })} />
          </View>
        </Paper>
      )}
      ListEmptyComponent={<Empty icon="chatbox-ellipses-outline" title={t('quotes.emptyTitle')} message={t('quotes.emptyBody')} />}
    />
  );
}
