import { fromDayKey } from '@factory/app-core';
import { Badge, Button, Card, EmptyState, IconButton, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Segmented, useQuantityLabel } from '@/components/ui';
import { repos } from '@/database';
import { daysLeft, expiryStatus, FREE_PANTRY_LIMIT, sortByExpiry } from '@/domain/pantry';
import { PANTRY_LOCATIONS, type PantryItem, type PantryLocation } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { scheduleSync } from '@/services/planning';
import { dataChanged, useIsPremium } from '@/store/session';

const ICONS: Record<PantryLocation, 'snow-outline' | 'cube-outline' | 'file-tray-outline'> = { fridge: 'cube-outline', freezer: 'snow-outline', cupboard: 'file-tray-outline' };

export default function Pantry() {
  const { t, lng } = useLang();
  const theme = useTheme();
  const q = useQuantityLabel();
  const isPremium = useIsPremium();
  const [location, setLocation] = useState<PantryLocation | 'all'>('all');
  const today = clock.today();
  const { data } = useAsync(() => repos().pantry.active(), []);
  const items = sortByExpiry((data ?? []).filter((i) => location === 'all' || i.location === location));
  const count = data?.length ?? 0;
  const atLimit = !isPremium && count >= FREE_PANTRY_LIMIT;

  const consume = async (item: PantryItem) => {
    await repos().pantry.consume(item.id);
    dataChanged();
    scheduleSync(t, lng);
  };

  const expiryBadge = (item: PantryItem) => {
    const s = expiryStatus(item.expiresOn, today);
    if (s === 'none') return null;
    if (s === 'expired') return <Badge label={t('pantry.expired')} tone="danger" icon="alert-circle" />;
    if (s === 'today') return <Badge label={t('pantry.expiresToday')} tone="warning" icon="time" />;
    const left = daysLeft(item.expiresOn as string, today);
    return <Badge label={s === 'soon' ? t('pantry.daysLeft', { count: left }) : fmt.date(fromDayKey(item.expiresOn as string), { day: 'numeric', month: 'short' })} tone={s === 'soon' ? 'warning' : 'neutral'} />;
  };

  return (
    <Screen edges={[]} testID="pantry-screen">
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button label={t('pantry.add')} icon="add" onPress={() => (atLimit ? router.push({ pathname: '/paywall', params: { source: 'pantry_limit' } }) : router.push('/pantry/edit'))} testID="pantry-add" />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('pantry.whatCanICook')} icon="restaurant-outline" variant="accent" onPress={() => router.push('/pantry/cook')} testID="pantry-cook" />
        </View>
      </Row>
      <Segmented
        value={location}
        onChange={setLocation}
        options={[{ value: 'all' as const, label: t('pantry.all') }, ...PANTRY_LOCATIONS.map((l) => ({ value: l, label: t(`pantry.locations.${l}`) }))]}
      />
      {!isPremium ? (
        <Text variant="caption" tone="muted">
          {t('pantry.freeLimit', { count, limit: FREE_PANTRY_LIMIT })}
        </Text>
      ) : null}
      {data && items.length === 0 ? <EmptyState icon="file-tray-outline" title={t('pantry.emptyTitle')} message={t('pantry.emptyBody')} /> : null}
      {items.map((item) => (
        <Card key={item.id} onPress={() => router.push({ pathname: '/pantry/edit', params: { id: String(item.id) } })} accessibilityLabel={item.name} testID={`pantry-item-${item.id}`}>
          <Row gap={3}>
            <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}>
              <IconButton icon={ICONS[item.location]} size={18} label={t(`pantry.locations.${item.location}`)} onPress={() => setLocation(item.location)} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="subheading">{item.name}</Text>
              <Row gap={2} wrap>
                {item.quantity !== null ? (
                  <Text variant="caption" tone="muted">
                    {q(item.quantity, item.unit, { original: true })}
                  </Text>
                ) : null}
                {expiryBadge(item)}
              </Row>
            </View>
            <Button label={t('pantry.consume')} size="md" variant="secondary" icon="checkmark" onPress={() => void consume(item)} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
