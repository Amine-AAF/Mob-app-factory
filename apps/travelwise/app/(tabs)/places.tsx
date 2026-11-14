import { Button, Card, Chip, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { PlaceCard } from '@/components/PlaceCard';
import { TextField } from '@/components/TextField';
import { PLACE_CATEGORIES, type PlaceCategory } from '@/constants/domain';
import { repos } from '@/database';
import { openInMaps, toggleFavorite } from '@/features/places/actions';
import { useAsync } from '@/hooks/useAsync';

/** Saved places (restaurants, hotels, sights…), searchable, with favourites and map hand-off. */
export default function PlacesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const { data } = useAsync(async () => {
    const [places, trips] = await Promise.all([repos().places.list({ favorites, category, search }), repos().trips.list()]);
    return { places, tripNames: new Map(trips.map((x) => [x.id, x.name])) };
  }, [favorites, category, search]);

  return (
    <Screen testID="places-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('placesTab.title')}
        </Text>
        <Button label={t('places.add')} icon="add" onPress={() => router.push('/place')} testID="places-add" />
      </Row>
      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="map-outline" size={18} color={theme.colors.textMuted} />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {t('places.mapNotice')}
          </Text>
        </Row>
      </Card>
      <TextField label={t('expenses.search')} value={search} onChangeText={setSearch} />
      <Row gap={2} wrap>
        <Chip label={t('places.favorites')} icon="heart" selected={favorites} onPress={() => setFavorites(!favorites)} testID="places-favorites" />
        <Chip label={t('expenses.allCategories')} selected={category === null} onPress={() => setCategory(null)} />
        {PLACE_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`enums.placeCategory.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </Row>
      {data && data.places.length === 0 ? <EmptyState icon="map-outline" title={t('places.emptyTitle')} message={t('places.emptyMessage')} /> : null}
      <Stack gap={3}>
        {(data?.places ?? []).map((p) => (
          <PlaceCard
            key={p.id}
            place={p}
            tripName={p.tripId ? data!.tripNames.get(p.tripId) : undefined}
            onPress={() => router.push({ pathname: '/place', params: { placeId: p.id } })}
            onToggleFavorite={() => toggleFavorite(p.id, !p.isFavorite)}
            onOpenMap={() => openInMaps(p).then((ok) => {
                if (!ok) Alert.alert(t('places.noMapApp'));
              })}
          />
        ))}
      </Stack>
    </Screen>
  );
}
