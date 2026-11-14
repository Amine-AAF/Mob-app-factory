import { Button, Chip, EmptyState, IconButton, Row, Screen, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import { AdBanner, RecipeCard } from '@/components/cards';
import { Field } from '@/components/ui';
import { repos } from '@/database';
import { filterRecipes, type RecipeSort } from '@/domain/recipes';
import { RECIPE_CATEGORIES, type RecipeCategory } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { allRecipes } from '@/services/recipeCatalog';

type Quick = 'favorites' | 'mine' | 'quick30' | 'free';
const PAGE = 30;

export default function Recipes() {
  const { t, lng } = useLang();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RecipeCategory | null>(null);
  const [quick, setQuick] = useState<Set<Quick>>(new Set());
  const [sort, setSort] = useState<RecipeSort>('relevance');
  const [limit, setLimit] = useState(PAGE);

  const { data } = useAsync(async () => ({ list: await allRecipes(lng), fav: await repos().recipes.favorites() }), [lng]);

  const results = useMemo(() => {
    if (!data) return [];
    const list = filterRecipes(
      data.list,
      {
        query,
        categories: category ? [category] : [],
        favoritesOnly: quick.has('favorites'),
        source: quick.has('mine') ? 'user' : 'all',
        maxMinutes: quick.has('quick30') ? 30 : null,
        sort,
      },
      { lng, favorites: data.fav },
    );
    return quick.has('free') ? list.filter((r) => !r.premium) : list;
  }, [data, query, category, quick, sort, lng]);

  const toggle = (q: Quick) =>
    setQuick((s) => {
      const next = new Set(s);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });

  const sorts: RecipeSort[] = ['relevance', 'quickest', 'az', 'newest'];

  return (
    <Screen testID="recipes-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('recipes.title')}
        </Text>
        <Row gap={0}>
          <IconButton icon="time-outline" label={t('history.title')} onPress={() => router.push('/history')} />
          <IconButton icon="clipboard-outline" label={t('import.title')} onPress={() => router.push('/recipe/import')} />
          <IconButton icon="add-circle-outline" label={t('recipes.new')} tone="primary" onPress={() => router.push('/recipe/edit')} />
        </Row>
      </Row>
      <Field value={query} onChangeText={setQuery} placeholder={t('recipes.searchPlaceholder')} testID="recipes-search" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('recipes.all')} selected={category === null} onPress={() => setCategory(null)} />
        {RECIPE_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`categories.${c}`)} selected={category === c} onPress={() => setCategory(category === c ? null : c)} testID={`cat-${c}`} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('recipes.favorites')} icon="heart-outline" selected={quick.has('favorites')} onPress={() => toggle('favorites')} testID="filter-favorites" />
        <Chip label={t('recipes.mine')} icon="person-outline" selected={quick.has('mine')} onPress={() => toggle('mine')} testID="filter-mine" />
        <Chip label={t('recipes.under30')} icon="timer-outline" selected={quick.has('quick30')} onPress={() => toggle('quick30')} />
        <Chip label={t('recipes.freeOnly')} icon="lock-open-outline" selected={quick.has('free')} onPress={() => toggle('free')} />
      </ScrollView>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {t('recipes.count', { count: results.length })}
        </Text>
        <Text
          variant="caption"
          tone="primary"
          style={{ fontWeight: '700' }}
          accessibilityRole="button"
          onPress={() => setSort(sorts[(sorts.indexOf(sort) + 1) % sorts.length]!)}
        >
          {t('recipes.sortBy', { sort: t(`recipes.sort.${sort}`) })}
        </Text>
      </Row>

      {data && results.length === 0 ? (
        <EmptyState icon="search-outline" title={t('recipes.noResults')} message={quick.has('mine') ? t('recipes.noMine') : t('recipes.noResultsHint')} />
      ) : null}
      {results.slice(0, limit).map((r) => (
        <RecipeCard key={r.id} recipe={r} favorite={data?.fav.has(r.id)} testID={`recipe-${r.id}`} />
      ))}
      {results.length > limit ? <Button label={t('recipes.showMore', { count: results.length - limit })} variant="secondary" onPress={() => setLimit(limit + PAGE)} /> : null}
      <AdBanner screen="recipes" />
    </Screen>
  );
}
