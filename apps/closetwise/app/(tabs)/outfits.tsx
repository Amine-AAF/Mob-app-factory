import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { repos } from '@/database';
import type { Outfit } from '@/domain/types';
import { filterOutfits } from '@/features/outfits/builderLogic';
import { ensureCanAddOutfit } from '@/features/outfits/limits';
import { OutfitCard } from '@/features/outfits/OutfitCard';
import { useOutfitData } from '@/features/outfits/useOutfitData';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { useIsPremium } from '@/store/session';
import { Button, Card, EmptyState, Fab, FadeIn, Icon, Loading, PageHeader, Row, Screen, SearchBar, Segmented, Stack, Text, useTheme } from '@/ui';

type Scope = 'all' | 'favorites';

export default function OutfitsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { outfits, map, activeItems, loading } = useOutfitData();
  const [scope, setScope] = useState<Scope>('all');
  const [query, setQuery] = useState('');
  const list = useMemo(() => filterOutfits(outfits, scope, query), [outfits, scope, query]);

  const onNew = () => {
    if (ensureCanAddOutfit(t, outfits.length, isPremium)) router.push('/outfit/builder');
  };
  const open = useCallback((o: Outfit) => router.push({ pathname: '/outfit/[id]', params: { id: o.id } }), []);
  const toggleFavorite = useCallback(
    (o: Outfit) => {
      repos()
        .outfits.setFavorite(o.id, !o.favorite)
        .then(() => afterWrite())
        .catch((e) => {
          recordError(e, 'outfit_favorite');
          Alert.alert(t('common.error'));
        });
    },
    [t],
  );

  const header = (
    <Stack gap={4} style={{ paddingBottom: theme.spacing(4) }}>
      <PageHeader eyebrow={t('outfits.eyebrow')} title={t('outfits.title')} subtitle={outfits.length > 0 ? t('common.outfits', { count: outfits.length }) : undefined} />
      <Card tone="accent" onPress={() => router.push('/suggestions')} accessibilityLabel={t('outfits.ideas.title')} testID="outfits-ideas">
        <Row gap={3}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bulb-outline" size={22} color={theme.colors.text} />
          </View>
          <Stack gap={0.5} style={{ flex: 1 }}>
            <Text variant="heading">{t('outfits.ideas.title')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('outfits.ideas.subtitle')}
            </Text>
          </Stack>
          <Icon name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </Row>
      </Card>
      {outfits.length > 0 ? (
        <>
          <Segmented
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'favorites', label: t('outfits.favorites'), icon: 'heart-outline' },
            ]}
            value={scope}
            onChange={setScope}
          />
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('outfits.searchPlaceholder')} />
        </>
      ) : null}
    </Stack>
  );

  const empty = loading ? (
    <Loading />
  ) : outfits.length === 0 ? (
    <EmptyState
      icon="layers-outline"
      title={t('outfits.empty.title')}
      message={activeItems.length === 0 ? t('outfits.empty.noItems') : t('outfits.empty.message')}
      action={
        activeItems.length === 0 ? (
          <Button label={t('outfits.empty.addItem')} icon="add" onPress={() => router.push('/item/edit')} />
        ) : (
          <Button label={t('outfits.new')} icon="add" onPress={onNew} />
        )
      }
    />
  ) : (
    <EmptyState icon={scope === 'favorites' && !query ? 'heart-outline' : 'search-outline'} title={scope === 'favorites' && !query ? t('outfits.emptyFavorites') : t('outfits.noResults')} />
  );

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={list}
          keyExtractor={(o) => o.id}
          numColumns={2}
          initialNumToRender={6}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          columnWrapperStyle={{ gap: theme.spacing(3) }}
          contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingTop: theme.spacing(3), paddingBottom: theme.spacing(24), gap: theme.spacing(5) }}
          renderItem={({ item, index }) => (
            <FadeIn delay={Math.min(index, 6) * 30} style={{ flex: 1, maxWidth: '50%' }}>
              <OutfitCard outfit={item} items={map} onPress={open} onToggleFavorite={toggleFavorite} />
            </FadeIn>
          )}
        />
        {outfits.length > 0 || activeItems.length > 0 ? <Fab label={t('outfits.new')} onPress={onNew} testID="outfits-new" /> : null}
      </View>
      <AdBanner screen="outfits" />
    </Screen>
  );
}
