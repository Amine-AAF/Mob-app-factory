import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, useWindowDimensions, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { PremiumCard } from '@/components/forms';
import { canAdd, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import type { WardrobeItem } from '@/domain/types';
import { EMPTY_FILTER, filterItems, sortItems, type WardrobeFilter } from '@/domain/wardrobeQuery';
import { FilterSheet, ItemGridCard, ItemListRow, SortSheet } from '@/features/wardrobe/components';
import { sheetFilterCount } from '@/features/wardrobe/logic';
import { useAddItem } from '@/features/wardrobe/useAddItem';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { Button, Chip, ChipScroller, EmptyState, Fab, IconButton, Loading, PageHeader, Row, Screen, SearchBar, Stack, Text, useTheme } from '@/ui';

const COLUMNS = 3;

export default function WardrobeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const addItem = useAddItem();
  const { width } = useWindowDimensions();
  const view = usePreferences((s) => s.wardrobeView);
  const sort = usePreferences((s) => s.wardrobeSort);
  const setPrefs = usePreferences((s) => s.set);
  const [filter, setFilter] = useState<WardrobeFilter>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const { data: items } = useAsync(() => repos().wardrobe.list(), []);

  const extraText = useCallback((i: WardrobeItem) => [labels.category(i.categoryId), labels.color(i.primaryColor)].join(' '), [labels]);
  const visible = useMemo(() => (items ? sortItems(filterItems(items, filter, extraText), sort) : []), [items, filter, sort, extraText]);
  const sheetCount = sheetFilterCount(filter);
  const anyFilter = sheetCount > 0 || filter.categoryIds.length > 0 || filter.query.trim().length > 0;
  const total = items?.length ?? 0;
  const atLimit = items ? !canAdd('items', total, isPremium) : false;

  const gap = theme.spacing(3);
  const pad = theme.spacing(5);
  const tileWidth = Math.floor((width - pad * 2 - gap * (COLUMNS - 1)) / COLUMNS);
  const open = useCallback((i: WardrobeItem) => router.push({ pathname: '/item/[id]', params: { id: i.id } }), []);

  const toggleCategory = (id: string) => setFilter((f) => ({ ...f, categoryIds: f.categoryIds.includes(id) ? [] : [id] }));
  const resetFilters = () => setFilter(EMPTY_FILTER);

  const header = (
    <Stack gap={3} style={{ paddingHorizontal: pad, paddingTop: theme.spacing(3), paddingBottom: theme.spacing(2) }}>
      <PageHeader
        eyebrow={t('wardrobe.eyebrow')}
        title={t('wardrobe.title')}
        subtitle={items ? t('common.items', { count: total }) : undefined}
        right={
          <>
            <IconButton icon="water-outline" label={t('wardrobe.openCare')} onPress={() => router.push('/care')} testID="open-care" />
            <IconButton icon="archive-outline" label={t('wardrobe.openArchived')} onPress={() => router.push('/archived')} testID="open-archived" />
          </>
        }
      />
      {total > 0 ? (
        <>
          <SearchBar value={filter.query} onChangeText={(query) => setFilter((f) => ({ ...f, query }))} placeholder={t('wardrobe.searchPlaceholder')} />
          <ChipScroller>
            <Chip label={t('wardrobe.allCategories')} selected={filter.categoryIds.length === 0} onPress={() => setFilter((f) => ({ ...f, categoryIds: [] }))} />
            {labels.categoryOptions.map((c) => (
              <Chip key={c.value} label={c.label} selected={filter.categoryIds.includes(c.value)} onPress={() => toggleCategory(c.value)} />
            ))}
          </ChipScroller>
          <Row gap={2}>
            <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
              {t('wardrobe.results', { count: visible.length })}
            </Text>
            <Button small variant="secondary" icon="swap-vertical-outline" label={t(`wardrobe.sortKey.${sort}`)} onPress={() => setSortOpen(true)} testID="open-sort" />
            <Button
              small
              variant={sheetCount ? 'primary' : 'secondary'}
              icon="options-outline"
              label={sheetCount ? t('wardrobe.filtersActive', { count: sheetCount }) : t('wardrobe.filters')}
              onPress={() => setFilterOpen(true)}
              testID="open-filters"
            />
            <IconButton
              icon={view === 'grid' ? 'list-outline' : 'grid-outline'}
              label={view === 'grid' ? t('wardrobe.viewList') : t('wardrobe.viewGrid')}
              onPress={() => setPrefs({ wardrobeView: view === 'grid' ? 'list' : 'grid' })}
              testID="toggle-view"
            />
          </Row>
        </>
      ) : null}
    </Stack>
  );

  const empty = !items ? (
    <Loading />
  ) : total === 0 ? (
    <EmptyState
      icon="shirt-outline"
      title={t('wardrobe.emptyTitle')}
      message={t('wardrobe.emptyMessage')}
      action={<Button label={t('wardrobe.addFirst')} icon="camera-outline" onPress={() => addItem()} testID="add-first-item" />}
    />
  ) : (
    <EmptyState
      icon="search-outline"
      title={t('wardrobe.noResultsTitle')}
      message={t('wardrobe.noResultsMessage')}
      action={anyFilter ? <Button variant="secondary" label={t('wardrobe.resetFilters')} onPress={resetFilters} /> : undefined}
    />
  );

  const footer = (
    <View style={{ gap: theme.spacing(3), paddingTop: theme.spacing(3) }}>
      {atLimit ? <PremiumCard message={t('common.premium.itemsLimit', { count: FREE_LIMITS.items })} source="items_limit" /> : null}
      <View style={{ height: 88 }} />
    </View>
  );

  return (
    <Screen scroll={false} padded={false} header={header}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {view === 'grid' ? (
            <FlatList
              key="grid"
              data={visible}
              keyExtractor={(i) => i.id}
              numColumns={COLUMNS}
              renderItem={({ item }) => <ItemGridCard item={item} width={tileWidth} onPress={open} />}
              columnWrapperStyle={{ gap }}
              contentContainerStyle={{ paddingHorizontal: pad, paddingTop: theme.spacing(1), gap: theme.spacing(4) }}
              ListEmptyComponent={empty}
              ListFooterComponent={visible.length ? footer : undefined}
              initialNumToRender={18}
              maxToRenderPerBatch={18}
              windowSize={7}
              removeClippedSubviews
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              testID="wardrobe-grid"
            />
          ) : (
            <FlatList
              key="list"
              data={visible}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => <ItemListRow item={item} onPress={open} />}
              contentContainerStyle={{ paddingHorizontal: pad, paddingTop: theme.spacing(1) }}
              ListEmptyComponent={empty}
              ListFooterComponent={visible.length ? footer : undefined}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={7}
              removeClippedSubviews
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              testID="wardrobe-list"
            />
          )}
          {total > 0 ? <Fab label={t('wardrobe.addItem')} onPress={() => addItem(filter.categoryIds.length === 1 ? labels.categoryKey(filter.categoryIds[0]) : undefined)} testID="add-item" /> : null}
        </View>
        <AdBanner screen="wardrobe" />
      </View>
      <FilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onApply={setFilter} />
      <SortSheet visible={sortOpen} onClose={() => setSortOpen(false)} value={sort} onChange={(wardrobeSort) => setPrefs({ wardrobeSort })} />
    </Screen>
  );
}
