import { Badge, EmptyState, Screen, Stack } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FilterChips } from '@/components/forms';
import { AdBanner } from '@/components/media';
import { Fab, ItemRow, ScreenHeader, SearchBar } from '@/components/ui';
import { REPAIR_STATUS_TONE } from '@/config/icons';
import { repos } from '@/database';
import { REPAIR_STATUSES, type RepairStatus } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome } from '@/hooks/useHome';
import { fmt } from '@/i18n';

export default function Repairs() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const [status, setStatus] = useState<RepairStatus | 'open' | null>('open');
  const [search, setSearch] = useState('');
  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [repairs, assets] = await Promise.all([r.repairs.list(home.id, { status, search }), r.assets.list(home.id)]);
    return { repairs, assetNames: new Map(assets.map((a) => [a.id, a.name])) };
  }, [home?.id, status, search]);

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScreenHeader title={t('repairs.title')} subtitle={t('repairs.subtitle')} back />
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('repairs.search')} />
        <FilterChips options={['open', ...REPAIR_STATUSES] as const} value={status} onChange={setStatus} renderLabel={(v) => (v === 'open' ? t('repairs.open') : t(`repairStatus.${v}`))} allLabel={t('common.all')} />
        {data && data.repairs.length === 0 ? <EmptyState icon="hammer-outline" title={t('repairs.emptyTitle')} message={t('repairs.emptyMessage')} /> : null}
        <Stack gap={2}>
          {data?.repairs.map((r) => (
            <ItemRow
              key={r.id}
              icon="hammer-outline"
              title={r.title}
              subtitle={[r.assetId ? data.assetNames.get(r.assetId) : null, r.provider, fmt.day(r.scheduledOn ?? r.reportedOn), r.costMinor != null && r.currency ? fmt.money({ amountMinor: r.costMinor, currency: r.currency }) : null].filter(Boolean).join(' · ')}
              right={<Badge label={t(`repairStatus.${r.status}`)} tone={REPAIR_STATUS_TONE[r.status]} />}
              onPress={() => router.push(`/repairs/${r.id}`)}
            />
          ))}
        </Stack>
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('repairs.add')} bottomInset onPress={() => router.push('/repairs/edit')} />
    </View>
  );
}
