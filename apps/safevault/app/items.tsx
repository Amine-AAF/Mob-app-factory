import { Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchBar } from '@/components/inputs';
import { ItemRow, useCategoryName } from '@/components/vault';
import { allTags, filterItems, type ItemSort } from '@/features/search/search';
import { toggleFavorite, useVault } from '@/store/vault';

/** Full list with filters: /items?categoryId=…&tag=… */
export default function Items() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; tag?: string }>();
  const items = useVault((s) => s.items);
  const categories = useVault((s) => s.categories);
  const categoryName = useCategoryName();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ItemSort>('title');
  const [tag, setTag] = useState<string | null>(params.tag ?? null);
  const category = categories.find((c) => c.id === params.categoryId);
  const scoped = useMemo(() => (category ? items.filter((i) => i.meta.categoryId === category.id) : items), [items, category]);
  const tags = useMemo(() => allTags(scoped), [scoped]);
  const results = useMemo(() => filterItems(scoped, { query, tag }, sort), [scoped, query, tag, sort]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: category ? categoryName(category) : t('vault.all') }} />
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('vault.search')} />
      <Row gap={2} wrap>
        {(['title', 'updated', 'recent'] as const).map((s) => (
          <Chip key={s} label={t(`vault.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </Row>
      {tags.length > 0 ? (
        <Row gap={2} wrap>
          {tags.map((tg) => (
            <Chip key={tg} label={`#${tg}`} selected={tag === tg} onPress={() => setTag(tag === tg ? null : tg)} />
          ))}
        </Row>
      ) : null}
      <Text variant="caption" tone="muted">
        {t('vault.results', { count: results.length })}
      </Text>
      <Stack gap={1}>
        {results.map((i) => (
          <ItemRow key={i.id} item={i} category={catById.get(i.meta.categoryId)} onPress={() => router.push({ pathname: '/item/[id]', params: { id: i.id } })} onToggleFavorite={() => void toggleFavorite(i.id)} />
        ))}
      </Stack>
      {results.length === 0 ? <EmptyState icon="file-tray" title={t('vault.noResults')} /> : null}
    </Screen>
  );
}
