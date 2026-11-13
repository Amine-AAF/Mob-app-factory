import { Card, Chip, CodeLabel, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { InlineTranslation } from '@/components/learning';
import type { VocabularyCategory } from '@/content';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { useIsPremium } from '@/store/session';

const CATEGORIES: (VocabularyCategory | 'favorites' | null)[] = [null, 'favorites', 'programming', 'web', 'architecture', 'data', 'devops', 'cloud', 'testing', 'security', 'agile', 'collaboration'];

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export default function Vocabulary() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<VocabularyCategory | 'favorites' | null>(null);
  const q = useDebounced(query, 200);

  const { data } = useAsync(async () => {
    const [words, favorites] = await Promise.all([
      repos().content.searchVocabulary({ query: q, category: category === 'favorites' ? null : category, favoritesOnly: category === 'favorites' }),
      repos().progress.favoriteIds(),
    ]);
    return { words, favorites };
  }, [q, category]);

  const header = (
    <Stack gap={4} style={{ paddingBottom: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={1}>
          <CodeLabel>dictionary</CodeLabel>
          <Text variant="title" accessibilityRole="header">
            {t('vocabulary.title')}
          </Text>
        </Stack>
      </Row>
      <Card tone="primary" onPress={() => router.push('/flashcards')} accessibilityLabel={t('vocabulary.flashcards')} testID="open-flashcards">
        <Row>
          <Icon name="layers" size={24} color={theme.colors.primary} />
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="subheading">{t('vocabulary.flashcards')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('vocabulary.flashcardsHint')}
            </Text>
          </Stack>
          <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </Row>
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 12 }}>
        <Icon name="search" size={18} color={theme.colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('vocabulary.searchPlaceholder')}
          placeholderTextColor={theme.colors.textSubtle}
          accessibilityLabel={t('vocabulary.searchPlaceholder')}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          testID="vocab-search"
          style={{ flex: 1, minHeight: 48, color: theme.colors.text, fontSize: 16 }}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={10}>
            <Icon name="close-circle" size={18} color={theme.colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c ?? 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => <Chip label={t(`categories.${item ?? 'all'}`)} selected={category === item} onPress={() => setCategory(item)} icon={item === 'favorites' ? 'bookmark' : undefined} />}
      />
      {data ? (
        <Text variant="caption" tone="muted">
          {t('vocabulary.results', { count: data.words.length })}
        </Text>
      ) : null}
    </Stack>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={data?.words ?? []}
        keyExtractor={(w) => w.id}
        ListHeaderComponent={header}
        ListFooterComponent={<AdBanner />}
        contentContainerStyle={{ padding: 20, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={data ? <EmptyState icon={category === 'favorites' ? 'bookmark-outline' : 'search-outline'} title={t('vocabulary.empty')} message={category === 'favorites' ? t('vocabulary.emptyFavorites') : undefined} /> : undefined}
        renderItem={({ item }) => {
          const locked = item.premium && !isPremium;
          return (
            <Card onPress={() => router.push(`/word/${item.id}`)} accessibilityLabel={locked ? `${item.term}. ${t('common.locked')}` : item.term} testID={`word-${item.id}`}>
              <Row>
                <Stack gap={1} style={{ flex: 1 }}>
                  <Row gap={2}>
                    <Text variant="subheading">{item.term}</Text>
                    {data?.favorites.has(item.id) ? <Icon name="bookmark" size={14} color={theme.colors.accent} /> : null}
                  </Row>
                  {locked ? (
                    <Text variant="bodySmall" tone="subtle">
                      {t('vocabulary.premiumWord')}
                    </Text>
                  ) : (
                    <>
                      <Text variant="bodySmall" tone="muted" numberOfLines={2}>
                        {item.definition}
                      </Text>
                      <InlineTranslation value={item.translation} />
                    </>
                  )}
                </Stack>
                <Icon name={locked ? 'lock-closed' : 'chevron-forward'} size={16} color={theme.colors.textSubtle} />
              </Row>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}
