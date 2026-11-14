import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Linking, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { ItemPhoto } from '@/components/ItemPhoto';
import { repos } from '@/database';
import { WISHLIST_STATUSES, type WishlistStatus } from '@/domain/catalog';
import type { WishlistItem } from '@/domain/types';
import { isOpenableUrl, wishlistTotals } from '@/features/shopping/logic';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { useSettings } from '@/store/session';
import { Badge, Button, Card, Chip, ChipScroller, ChoiceChips, EmptyState, Fab, IconButton, Loading, PressableScale, Row, Screen, Sheet, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

type Filter = WishlistStatus | 'all';
const FILTERS: Filter[] = [...WISHLIST_STATUSES, 'all'];
const STATUS_TONE: Record<WishlistStatus, 'primary' | 'accent' | 'success' | 'neutral'> = { wanted: 'accent', planned: 'primary', purchased: 'success', cancelled: 'neutral' };

function openLink(url: string, t: ReturnType<typeof useTranslation>['t']) {
  if (!isOpenableUrl(url)) return;
  Alert.alert(t('wishlist.leaveTitle'), t('wishlist.leaveMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('wishlist.openLink'), onPress: () => Linking.openURL(url).catch(() => Alert.alert(t('wishlist.linkError'))) },
  ]);
}

function WishCard({ item, fallbackCurrency, onStatus, onPurchased }: { item: WishlistItem; fallbackCurrency: string; onStatus: () => void; onPurchased: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const meta = [item.brand, item.store].filter(Boolean).join(' · ');
  const open = item.status === 'wanted' || item.status === 'planned';
  return (
    <Card onPress={() => router.push({ pathname: '/wishlist/edit', params: { id: item.id } })} accessibilityLabel={item.name} style={{ opacity: item.status === 'cancelled' ? 0.7 : 1 }}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 72 }}>
          <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} />
        </View>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={2}>
            {item.name}
          </Text>
          {meta ? (
            <Text variant="bodySmall" tone="subtle" numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          {item.estimatedPrice != null ? <Text>{fmt.money(item.estimatedPrice, item.currency ?? fallbackCurrency)}</Text> : null}
          <Row gap={1.5} wrap>
            <Badge label={t(`catalog.wishlistStatus.${item.status}`)} tone={STATUS_TONE[item.status]} />
            <Badge label={t('wishlist.priorityBadge', { priority: t(`catalog.priority.${item.priority}`) })} tone={item.priority === 1 ? 'warning' : 'neutral'} icon={item.priority === 1 ? 'flag' : undefined} />
          </Row>
        </Stack>
        {isOpenableUrl(item.url) ? <IconButton icon="open-outline" label={t('wishlist.openLink')} onPress={() => openLink(item.url!, t)} /> : null}
      </Row>
      <Row gap={2} wrap style={{ marginTop: theme.spacing(1) }}>
        {open ? <Button small icon="bag-check-outline" label={t('wishlist.markPurchased')} onPress={onPurchased} /> : null}
        <Button small variant="secondary" icon="swap-horizontal-outline" label={t('wishlist.changeStatus')} onPress={onStatus} />
      </Row>
    </Card>
  );
}

export default function WishlistScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useSettings();
  const [filter, setFilter] = useState<Filter>('all');
  const [statusFor, setStatusFor] = useState<WishlistItem | null>(null);
  const { data } = useAsync(() => repos().wishlist.list(), []);

  const items = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => (filter === 'all' ? items : items.filter((w) => w.status === filter)), [items, filter]);
  const totals = useMemo(() => wishlistTotals(items, settings.currency), [items, settings.currency]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { wanted: 0, planned: 0, purchased: 0, cancelled: 0, all: items.length };
    for (const w of items) c[w.status]++;
    return c;
  }, [items]);

  const setStatus = async (item: WishlistItem, status: WishlistStatus) => {
    try {
      await repos().wishlist.setStatus(item.id, status);
      afterWrite();
    } catch (e) {
      recordError(e, 'wishlist_status');
      Alert.alert(t('common.error'));
    }
  };

  const markPurchased = (item: WishlistItem) =>
    Alert.alert(t('wishlist.purchasedTitle'), t('wishlist.purchasedMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('wishlist.justMark'), onPress: () => void setStatus(item, 'purchased') },
      { text: t('wishlist.recordPurchase'), onPress: () => router.push({ pathname: '/shopping/edit', params: { fromWishlist: item.id } }) },
    ]);

  const add = () => router.push('/wishlist/edit');

  const header = (
    <Stack gap={3} style={{ paddingBottom: theme.spacing(2) }}>
      <Text tone="muted">{t('wishlist.intro')}</Text>
      {totals.length > 0 ? (
        <Card tone="alt">
          <Text variant="label" tone="subtle">
            {t('wishlist.totalTitle')}
          </Text>
          <Row gap={3} wrap>
            {totals.map((c) => (
              <Text key={c.currency} variant="title">
                {fmt.money(c.total, c.currency)}
              </Text>
            ))}
          </Row>
          {totals.length > 1 ? (
            <Text variant="caption" tone="subtle">
              {t('wishlist.totalNoConversion')}
            </Text>
          ) : null}
        </Card>
      ) : null}
      {items.length > 0 ? (
        <ChipScroller>
          {FILTERS.map((f) => (
            <Chip key={f} label={`${f === 'all' ? t('common.all') : t(`catalog.wishlistStatus.${f}`)} (${counts[f]})`} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ChipScroller>
      ) : null}
    </Stack>
  );

  return (
    <Screen edges={[]} scroll={false} padded={false}>
      <RouterStack.Screen options={{ title: t('wishlist.title') }} />
      <View style={{ flex: 1 }}>
        {!data ? (
          <Loading />
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(w) => w.id}
            initialNumToRender={10}
            windowSize={7}
            removeClippedSubviews
            contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingTop: theme.spacing(3), paddingBottom: theme.spacing(24), gap: theme.spacing(3) }}
            ListHeaderComponent={header}
            renderItem={({ item }) => <WishCard item={item} fallbackCurrency={settings.currency} onStatus={() => setStatusFor(item)} onPurchased={() => markPurchased(item)} />}
            ListEmptyComponent={
              items.length === 0 ? (
                <EmptyState icon="heart-outline" title={t('wishlist.empty.title')} message={t('wishlist.empty.message')} action={<Button label={t('wishlist.add')} icon="add" onPress={add} />} />
              ) : (
                <PressableScale onPress={() => setFilter('all')} accessibilityRole="button" accessibilityLabel={t('wishlist.emptyFilter.action')}>
                  <EmptyState icon="filter-outline" title={t('wishlist.emptyFilter.title')} message={t('wishlist.emptyFilter.action')} />
                </PressableScale>
              )
            }
            ListFooterComponent={
              items.length > 0 ? (
                <Text variant="caption" tone="subtle" center style={{ paddingTop: theme.spacing(2) }}>
                  {t('wishlist.offlineNote')}
                </Text>
              ) : undefined
            }
          />
        )}
        <Fab label={t('wishlist.add')} onPress={add} testID="wishlist-add" />
      </View>
      <AdBanner screen="wishlist" />
      <Sheet visible={!!statusFor} onClose={() => setStatusFor(null)} title={t('wishlist.changeStatus')}>
        {statusFor ? (
          <ChoiceChips
            options={WISHLIST_STATUSES.map((s) => ({ value: s, label: t(`catalog.wishlistStatus.${s}`) }))}
            value={statusFor.status}
            onChange={(s) => {
              const target = statusFor;
              setStatusFor(null);
              if (!s || s === target.status) return;
              if (s === 'purchased') markPurchased(target);
              else void setStatus(target, s);
            }}
          />
        ) : null}
      </Sheet>
    </Screen>
  );
}
