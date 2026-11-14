import { Chip, EmptyState, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';

import { QuestionCard } from '@/components/content';
import { SearchField } from '@/components/SearchField';
import { CATEGORY_META } from '@/content/taxonomy';
import { repos } from '@/database';
import { canReadAnswer, searchQuestions } from '@/features/questions/search';
import { useAsync } from '@/hooks/useAsync';
import { useQuestions } from '@/hooks/useContent';
import { useIsPremium } from '@/store/session';
import { CATEGORIES, DIFFICULTIES, JOB_ROLES, type CategoryId, type Difficulty, type JobRoleId, type TopicId } from '@/types/content';

const isCategory = (v: unknown): v is CategoryId => typeof v === 'string' && (CATEGORIES as readonly string[]).includes(v);
const isRole = (v: unknown): v is JobRoleId => typeof v === 'string' && (JOB_ROLES as readonly string[]).includes(v);

export default function QuestionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string; role?: string; q?: string; favorites?: string }>();
  const category = isCategory(params.category) ? params.category : undefined;
  const role = isRole(params.role) ? params.role : undefined;
  const isPremium = useIsPremium();
  const questions = useQuestions();

  const [query, setQuery] = useState(params.q ?? '');
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(params.favorites === '1');

  const { data } = useAsync(async () => {
    const [favorites, studied] = await Promise.all([repos().library.favoriteIds(), repos().library.studiedIds()]);
    return { favorites: new Set(favorites), studied };
  }, []);

  const results = useMemo(
    () =>
      searchQuestions(questions, {
        query,
        categories: category ? [category] : undefined,
        topics: topic ? [topic] : undefined,
        difficulties,
        jobRole: role ?? null,
        ids: favoritesOnly ? (data?.favorites ?? new Set()) : undefined,
      }),
    [questions, query, category, topic, difficulties, role, favoritesOnly, data],
  );

  const title = category ? t(`categories.${category}`) : role ? t(`roles.${role}`) : favoritesOnly ? t('explore.favorites') : t('questions.title');
  const toggleDifficulty = (d: Difficulty) => setDifficulties((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <Screen scroll={false} edges={[]} testID="questions">
      <RouterStack.Screen options={{ title }} />
      <SearchField value={query} onChangeText={setQuery} placeholder={t('explore.searchPlaceholder')} testID="questions-search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('explore.favorites')} icon="bookmark-outline" selected={favoritesOnly} onPress={() => setFavoritesOnly((v) => !v)} testID="filter-favorites" />
        {DIFFICULTIES.map((d) => (
          <Chip key={d} label={t(`difficulty.${d}`)} selected={difficulties.includes(d)} onPress={() => toggleDifficulty(d)} testID={`filter-${d}`} />
        ))}
      </ScrollView>
      {category ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('common.all')} selected={topic === null} onPress={() => setTopic(null)} />
          {CATEGORY_META[category].topics.map((tp) => (
            <Chip key={tp} label={t(`topics.${tp}`)} selected={topic === tp} onPress={() => setTopic(tp)} />
          ))}
        </ScrollView>
      ) : null}
      <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
        {t('common.questions', { count: results.length })}
      </Text>
      <FlatList
        data={results}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ gap: 12, paddingBottom: theme.spacing(8) }}
        initialNumToRender={8}
        windowSize={7}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            favorite={data?.favorites.has(item.id)}
            studied={data?.studied.has(item.id)}
            locked={!canReadAnswer(item, isPremium)}
            onPress={() => router.push({ pathname: '/question/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: 24 }}>
            <EmptyState
              icon={favoritesOnly ? 'bookmark-outline' : 'search-outline'}
              title={favoritesOnly ? t('questions.noFavorites') : t('questions.noResults')}
              message={favoritesOnly ? t('questions.noFavoritesHint') : t('questions.noResultsHint')}
            />
          </View>
        }
      />
    </Screen>
  );
}
