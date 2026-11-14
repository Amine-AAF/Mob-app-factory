import { Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FilterChips, SelectField } from '@/components/forms';
import { AdBanner, openPaywall, PremiumLock, Thumb } from '@/components/media';
import { ExpiryBadge, Fab, ItemRow, ScreenHeader, SearchBar } from '@/components/ui';
import { ASSET_ICONS } from '@/config/icons';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { ASSET_CATEGORIES, ASSET_STATUSES, type AssetCategory, type AssetStatus } from '@/domain/types';
import { expiryStatus } from '@/domain/warranty';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { useIsPremium } from '@/store/session';

export default function AssetsList() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ warranty?: string; status?: string }>();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AssetCategory | null>(null);
  const [status, setStatus] = useState<AssetStatus | null>((ASSET_STATUSES as readonly string[]).includes(params.status ?? '') ? (params.status as AssetStatus) : null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [warrantyOnly, setWarrantyOnly] = useState(params.warranty === '1');

  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [assets, total, rooms] = await Promise.all([r.assets.list(home.id, { search, category, status, roomId }), r.assets.count(home.id), r.homes.listRooms(home.id)]);
    const filtered = warrantyOnly ? assets.filter((a) => a.warrantyEnd).sort((a, b) => ((a.warrantyEnd ?? '') < (b.warrantyEnd ?? '') ? -1 : 1)) : assets;
    const covers = await r.photos.covers('asset', filtered.map((a) => a.id));
    return { assets: filtered, total, rooms, covers };
  }, [home?.id, search, category, status, roomId, warrantyOnly]);

  if (!home) return null;
  const allowed = canCreate('assets', data?.total ?? 0, isPremium);
  const roomName = new Map((data?.rooms ?? []).map((r) => [r.id, r.name]));
  const filtersActive = !!(search || category || status || roomId || warrantyOnly);

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="assets-list">
        <ScreenHeader title={t('assets.title')} subtitle={t('assets.subtitle')} back />
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('assets.search')} />
        <FilterChips options={ASSET_CATEGORIES} value={category} onChange={setCategory} renderLabel={(v) => t(`assetCategories.${v}`)} allLabel={t('common.allCategories')} />
        <Row gap={2} wrap>
          <Chip label={t('assets.warrantyFilter')} icon="shield-checkmark-outline" selected={warrantyOnly} onPress={() => setWarrantyOnly((v) => !v)} />
          {ASSET_STATUSES.filter((s) => s !== 'active').map((s) => (
            <Chip key={s} label={t(`assetStatus.${s}`)} selected={status === s} onPress={() => setStatus(status === s ? null : s)} />
          ))}
        </Row>
        {data?.rooms.length ? <SelectField label={t('fields.room')} options={data.rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => roomName.get(v) ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.allRooms')} icon="grid-outline" /> : null}
        {!isPremium && data ? (
          <Text variant="caption" tone="subtle">
            {t('limits.assets', { used: data.total, max: FREE_LIMITS.assets })}
          </Text>
        ) : null}
        {data && data.assets.length === 0 ? <EmptyState icon="cube-outline" title={filtersActive ? t('common.noResults') : t('assets.emptyTitle')} message={filtersActive ? undefined : t('assets.emptyMessage')} /> : null}
        <Stack gap={2}>
          {data?.assets.map((a) => (
            <ItemRow
              key={a.id}
              icon={ASSET_ICONS[a.category]}
              thumbnail={data.covers[a.id] ? <Thumb path={data.covers[a.id]} /> : undefined}
              title={a.name}
              subtitle={[t(`assetCategories.${a.category}`), a.roomId ? roomName.get(a.roomId) : null, a.status !== 'active' ? t(`assetStatus.${a.status}`) : null].filter(Boolean).join(' · ')}
              right={<ExpiryBadge status={expiryStatus(a.warrantyEnd, today)} date={a.warrantyEnd} today={today} />}
              onPress={() => router.push(`/assets/${a.id}`)}
            />
          ))}
        </Stack>
        {!allowed ? <PremiumLock feature="assets_limit" message={t('limits.assetsReached')} /> : null}
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('assets.add')} testID="add-asset" bottomInset onPress={() => (allowed ? router.push('/assets/edit') : openPaywall('assets_limit'))} />
    </View>
  );
}
