import { Button, Chip, EmptyState, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { CATEGORY_ICON } from '@/components/icons';
import { PlantCard } from '@/components/PlantCard';
import type { PlantSort } from '@/database/repositories';
import { canAddPlant, FREE_PLANT_LIMIT } from '@/domain/limits';
import { compareTasks } from '@/domain/schedule';
import { PLANT_CATEGORIES, type CareTask, type PlantCategory } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useIsPremium } from '@/store/session';

const SORTS: PlantSort[] = ['name', 'date', 'next_care'];

export default function Plants() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<PlantCategory | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(false);
  const [sort, setSort] = useState<PlantSort>('name');
  const [showFilters, setShowFilters] = useState(false);

  const { data } = useData(
    async (r) => {
      const [plants, total, tasks, locations] = await Promise.all([
        r.plants.list({ search, category, locationId, favoritesOnly: favorites }, sort),
        r.plants.count(),
        r.tasks.listActive(),
        r.locations.list(),
      ]);
      const next = new Map<string, CareTask>();
      for (const task of [...tasks].sort(compareTasks)) if (!next.has(task.plantId)) next.set(task.plantId, task);
      return { plants, total, next, locations };
    },
    [search, category, locationId, favorites, sort],
  );

  const total = data?.total ?? 0;
  const locName = new Map((data?.locations ?? []).map((l) => [l.id, l.name]));
  const add = () => (canAddPlant(isPremium, total) ? router.push('/plant/edit') : router.push({ pathname: '/paywall', params: { source: 'plant_limit' } }));

  return (
    <Screen testID="plants-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('plants.title')}
        </Text>
        <IconButton icon="add-circle" tone="primary" size={30} label={t('plants.add')} onPress={add} />
      </Row>
      {!isPremium ? (
        <Text variant="caption" tone="muted">
          {t('plants.freeCounter', { count: total, max: FREE_PLANT_LIMIT })}
        </Text>
      ) : null}

      <Row gap={2}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('plants.searchPlaceholder')}
          placeholderTextColor={theme.colors.textSubtle}
          accessibilityLabel={t('plants.searchPlaceholder')}
          style={{ flex: 1, minHeight: 46, borderRadius: theme.radius.pill, paddingHorizontal: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 16 }}
        />
        <IconButton icon={showFilters ? 'options' : 'options-outline'} label={t('plants.filters')} onPress={() => setShowFilters(!showFilters)} />
      </Row>

      {showFilters ? (
        <Stack gap={2}>
          <Text variant="label" tone="muted">
            {t('plants.sortBy')}
          </Text>
          <Row wrap gap={2}>
            {SORTS.map((s) => (
              <Chip key={s} label={t(`plants.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
            ))}
          </Row>
          <Text variant="label" tone="muted">
            {t('plants.filters')}
          </Text>
          <Row wrap gap={2}>
            <Chip label={t('plants.favorites')} icon="heart-outline" selected={favorites} onPress={() => setFavorites(!favorites)} />
            {PLANT_CATEGORIES.map((c) => (
              <Chip key={c} label={t(`categories.${c}`)} icon={CATEGORY_ICON[c]} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
            ))}
          </Row>
          {(data?.locations.length ?? 0) > 0 ? (
            <Row wrap gap={2}>
              {data!.locations.map((l) => (
                <Chip key={l.id} label={l.name} icon="location-outline" selected={locationId === l.id} onPress={() => setLocationId(locationId === l.id ? null : l.id)} />
              ))}
            </Row>
          ) : null}
        </Stack>
      ) : null}

      {data && data.plants.length === 0 ? (
        total === 0 ? (
          <EmptyState icon="leaf-outline" title={t('plants.emptyTitle')} message={t('plants.emptyBody')} action={<Button label={t('plants.add')} icon="add" onPress={add} />} />
        ) : (
          <EmptyState icon="search-outline" title={t('plants.noResults')} />
        )
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {(data?.plants ?? []).map((p) => (
            <PlantCard key={p.id} plant={p} nextTask={data?.next.get(p.id)} locationName={p.locationId ? locName.get(p.locationId) : null} />
          ))}
        </View>
      )}
      <AdBanner />
    </Screen>
  );
}
