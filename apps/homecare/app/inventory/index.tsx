import { Card, EmptyState, IconButton, Row, Screen, Stack, Stat, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { FilterChips } from '@/components/forms';
import { AdBanner, openPaywall, PremiumLock, Thumb } from '@/components/media';
import { Fab, ItemRow, ScreenHeader, SearchBar } from '@/components/ui';
import { INVENTORY_ICONS } from '@/config/icons';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { INVENTORY_CATEGORIES, type InventoryCategory } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { exportCsv, exportPdf } from '@/services/exports';
import { useIsPremium } from '@/store/session';

export default function Inventory() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<InventoryCategory | null>(null);
  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [items, summary, rooms] = await Promise.all([r.inventory.list(home.id, { search, category }), r.inventory.summary(home.id), r.homes.listRooms(home.id)]);
    const covers = await r.photos.covers('inventory', items.map((i) => i.id));
    return { items, summary, rooms: new Map(rooms.map((x) => [x.id, x.name])), covers };
  }, [home?.id, search, category]);

  if (!home) return null;
  const allowed = canCreate('inventoryItems', data?.summary.items ?? 0, isPremium);

  const exportMenu = () => {
    if (!isPremium) return openPaywall('export');
    Alert.alert(t('export.title'), undefined, [
      { text: t('export.csv'), onPress: () => void exportCsv('inventory', repos(), home, t, today) },
      { text: t('export.pdf'), onPress: () => void exportPdf('inventory', repos(), home, t, today) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScreenHeader title={t('inventory.title')} subtitle={t('inventory.subtitle')} back right={<IconButton icon="share-outline" label={t('export.title')} onPress={exportMenu} />} />
        {data ? (
          <Row gap={2}>
            <Stat icon="albums-outline" value={fmt.number(data.summary.items)} label={t('inventory.items')} />
            <Stat icon="layers-outline" value={fmt.number(data.summary.quantity)} label={t('inventory.quantity')} />
          </Row>
        ) : null}
        {data?.summary.value.length ? (
          <Card>
            <Text variant="label" tone="subtle">
              {t('inventory.estimatedValue')}
            </Text>
            <Text variant="title">{fmt.moneyList(data.summary.value)}</Text>
            <Text variant="caption" tone="subtle">
              {data.summary.byCategory.map((c) => `${t(`inventoryCategories.${c.category}`)} ${c.items}`).join(' · ')}
            </Text>
          </Card>
        ) : null}
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('inventory.search')} />
        <FilterChips options={INVENTORY_CATEGORIES} value={category} onChange={setCategory} renderLabel={(v) => t(`inventoryCategories.${v}`)} allLabel={t('common.all')} />
        {!isPremium && data ? (
          <Text variant="caption" tone="subtle">
            {t('limits.inventory', { used: data.summary.items, max: FREE_LIMITS.inventoryItems })}
          </Text>
        ) : null}
        {data && data.items.length === 0 ? <EmptyState icon="albums-outline" title={search || category ? t('common.noResults') : t('inventory.emptyTitle')} message={search || category ? undefined : t('inventory.emptyMessage')} /> : null}
        <Stack gap={2}>
          {data?.items.map((i) => (
            <ItemRow
              key={i.id}
              icon={INVENTORY_ICONS[i.category]}
              thumbnail={data.covers[i.id] ? <Thumb path={data.covers[i.id]} /> : undefined}
              title={i.name}
              subtitle={[`× ${i.quantity}`, i.roomId ? data.rooms.get(i.roomId) : null, i.estimatedValueMinor != null && i.currency ? fmt.money({ amountMinor: i.estimatedValueMinor * i.quantity, currency: i.currency }) : null].filter(Boolean).join(' · ')}
              onPress={() => router.push(`/inventory/${i.id}`)}
            />
          ))}
        </Stack>
        {!allowed ? <PremiumLock feature="inventory_limit" message={t('limits.inventoryReached')} /> : null}
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('inventory.add')} bottomInset onPress={() => (allowed ? router.push('/inventory/edit') : openPaywall('inventory_limit'))} />
    </View>
  );
}
