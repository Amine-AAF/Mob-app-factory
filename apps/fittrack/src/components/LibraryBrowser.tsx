import { Chip, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TextInput, View } from 'react-native';

import { EQUIPMENT, EXERCISE_CATEGORIES, LEVELS, type Equipment, type ExerciseCategory, type Level } from '@/content/types';
import { filterExercises, isPremiumExercise, sortByRelevance } from '@/features/library/library';
import { useData, useExercises } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { useIsPremium } from '@/store/session';
import type { Exercise } from '@/types';

import { ExerciseRow } from './ExerciseRow';
import { ChipScroller } from './ui';

type Scope = 'all' | 'favorites' | 'recent' | 'custom';

/**
 * Searchable, filterable exercise list shared by the Library tab and the picker.
 * Filters: scope (all / favorites / recent / mine), category, equipment ("I have…"), level.
 */
export function LibraryBrowser({ onSelect, selectedIds, header, footer }: { onSelect: (e: Exercise) => void; selectedIds?: ReadonlySet<string>; header?: React.ReactNode; footer?: React.ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const ex = useExercises();
  const { data } = useData(async (r) => ({ favorites: await r.exercises.favorites(), recent: await r.exercises.recentIds(20) }));
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const favorites = useMemo(() => new Set(data?.favorites ?? []), [data]);

  const results = useMemo(() => {
    const ids = scope === 'favorites' ? favorites : scope === 'recent' ? new Set(data?.recent ?? []) : scope === 'custom' ? new Set(ex.list.filter((e) => e.source === 'custom').map((e) => e.id)) : null;
    const filtered = filterExercises(ex.list, { query, categories, equipment, levels, ids }, (e) => [t(`muscles.${e.primary}`), t(`categories.${e.category}`)]);
    if (scope === 'recent' && data) return data.recent.map((id) => filtered.find((e) => e.id === id)).filter((e): e is Exercise => !!e);
    return sortByRelevance(filtered, query, currentLanguage());
  }, [ex.list, query, categories, equipment, levels, scope, favorites, data, t]);

  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const activeFilters = categories.length + equipment.length + levels.length;

  return (
    <FlatList
      data={results}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 40 }}
      initialNumToRender={14}
      windowSize={8}
      ListHeaderComponent={
        <Stack gap={3} style={{ marginBottom: 6 }}>
          {header}
          <Row gap={2} style={{ borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={theme.colors.textSubtle} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('library.search')}
              placeholderTextColor={theme.colors.textSubtle}
              accessibilityLabel={t('library.search')}
              testID="library-search"
              style={{ flex: 1, minHeight: 48, color: theme.colors.text, fontSize: 16 }}
              maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
            />
          </Row>
          <ChipScroller>
            {(['all', 'favorites', 'recent', 'custom'] as Scope[]).map((s) => (
              <Chip key={s} label={t(`library.scope.${s}`)} selected={scope === s} onPress={() => setScope(s)} />
            ))}
            <Chip label={activeFilters ? t('library.filtersCount', { count: activeFilters }) : t('library.filters')} icon="options" selected={showFilters || activeFilters > 0} onPress={() => setShowFilters((v) => !v)} testID="toggle-filters" />
          </ChipScroller>
          {showFilters ? (
            <Stack gap={2}>
              <Text variant="label" tone="muted">
                {t('library.muscleGroup')}
              </Text>
              <Row wrap gap={2}>
                {EXERCISE_CATEGORIES.map((c) => (
                  <Chip key={c} label={t(`categories.${c}`)} selected={categories.includes(c)} onPress={() => toggle(categories, c, setCategories)} testID={`filter-cat-${c}`} />
                ))}
              </Row>
              <Text variant="label" tone="muted">
                {t('library.equipmentHave')}
              </Text>
              <Row wrap gap={2}>
                {EQUIPMENT.filter((e) => e !== 'bodyweight').map((e) => (
                  <Chip key={e} label={t(`equipment.${e}`)} selected={equipment.includes(e)} onPress={() => toggle(equipment, e, setEquipment)} testID={`filter-eq-${e}`} />
                ))}
              </Row>
              <Text variant="caption" tone="subtle">
                {t('library.equipmentHint')}
              </Text>
              <Text variant="label" tone="muted">
                {t('library.level')}
              </Text>
              <Row wrap gap={2}>
                {LEVELS.map((l) => (
                  <Chip key={l} label={t(`levels.${l}`)} selected={levels.includes(l)} onPress={() => toggle(levels, l, setLevels)} />
                ))}
              </Row>
              {activeFilters ? (
                <Chip
                  label={t('library.clearFilters')}
                  icon="close"
                  selected={false}
                  onPress={() => {
                    setCategories([]);
                    setEquipment([]);
                    setLevels([]);
                  }}
                />
              ) : null}
            </Stack>
          ) : null}
          <Text variant="caption" tone="subtle">
            {t('library.resultCount', { count: results.length })}
          </Text>
        </Stack>
      }
      ListEmptyComponent={<EmptyState icon="search" title={t('library.emptyTitle')} message={scope === 'favorites' ? t('library.emptyFavorites') : t('library.emptyBody')} />}
      ListFooterComponent={footer ? <View style={{ marginTop: 12 }}>{footer}</View> : undefined}
      renderItem={({ item }) => (
        <ExerciseRow
          exercise={item}
          favorite={favorites.has(item.id)}
          locked={!premium && isPremiumExercise(item)}
          selected={selectedIds?.has(item.id)}
          onPress={() => onSelect(item)}
          testID={`exercise-${item.id}`}
        />
      )}
    />
  );
}
