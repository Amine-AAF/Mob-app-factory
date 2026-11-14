import { router, Stack as RouterStack } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';

import { PremiumCard } from '@/components/forms';
import { ItemPhoto } from '@/components/ItemPhoto';
import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import type { DayKey } from '@/domain/types';
import { FREE_HISTORY_DAYS, historyCutoff, withinFreeHistory } from '@/features/calendar/calendarLogic';
import { useOutfitData } from '@/features/outfits/useOutfitData';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';
import { Card, EmptyState, Loading, PressableScale, Row, Screen, Stack, Text, useTheme } from '@/ui';

interface HistoryDay {
  day: DayKey;
  items: number;
  outfitIds: string[];
  itemIds: string[];
}

/** Wear history. Free: last 14 days; Premium: full, detailed history (every piece worn). */
export default function HistoryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const today = clock.today();
  const { outfitById, map, ready } = useOutfitData();
  const { data } = useAsync(async () => {
    const days = await repos().usage.days(isPremium ? 3650 : FREE_HISTORY_DAYS + 1);
    const entries = await repos().usage.list(isPremium ? {} : { from: historyCutoff(today) });
    const byDay = new Map<DayKey, string[]>();
    for (const e of entries) byDay.set(e.wornOn, [...(byDay.get(e.wornOn) ?? []), e.itemId]);
    return days.map((d): HistoryDay => ({ ...d, outfitIds: d.outfitIds.filter(Boolean), itemIds: byDay.get(d.day) ?? [] }));
  }, [isPremium, today]);

  const list = useMemo(() => (data ?? []).filter((d) => isPremium || withinFreeHistory(d.day, today)), [data, isPremium, today]);
  const hasOlder = !isPremium && (data ?? []).some((d) => !withinFreeHistory(d.day, today));

  const header = (
    <Stack gap={3} style={{ paddingBottom: theme.spacing(3) }}>
      <Text tone="muted">{isPremium ? t('calendar.historyScreen.premiumIntro') : t('calendar.historyScreen.freeIntro', { count: FREE_HISTORY_DAYS })}</Text>
    </Stack>
  );
  const footer = !isPremium ? (
    <View style={{ paddingTop: theme.spacing(4) }}>
      <PremiumCard message={hasOlder ? t('calendar.historyScreen.olderLocked') : t('calendar.historyScreen.premiumPitch')} source="calendar" />
    </View>
  ) : undefined;

  return (
    <Screen edges={[]} scroll={false} padded={false}>
      <RouterStack.Screen options={{ title: t('calendar.history') }} />
      {!data || !ready ? (
        <Loading />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(d) => d.day}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={<EmptyState icon="time-outline" title={t('calendar.historyScreen.emptyTitle')} message={t('calendar.historyScreen.emptyMessage')} />}
          contentContainerStyle={{ padding: theme.spacing(5), gap: theme.spacing(3), paddingBottom: theme.spacing(10) }}
          renderItem={({ item: d }) => {
            const outfits = d.outfitIds.map((id) => outfitById.get(id)).filter((o) => !!o);
            const looseItems = isPremium ? d.itemIds.filter((id) => !outfits.some((o) => o.items.some((r) => r.itemId === id))).map((id) => map.get(id)).filter((i) => !!i) : [];
            return (
              <Card>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="heading">{fmt.day(d.day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                  <Text variant="caption" tone="subtle">
                    {t('common.items', { count: d.items })}
                  </Text>
                </Row>
                {outfits.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(2) }}>
                    {outfits.map((o) => (
                      <PressableScale key={o.id} onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={o.name} style={{ width: 110 }}>
                        <OutfitCollage refs={o.items} items={map} height={140} />
                        <Text variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>
                          {o.name}
                        </Text>
                      </PressableScale>
                    ))}
                  </ScrollView>
                ) : null}
                {looseItems.length > 0 ? (
                  <Stack gap={1.5}>
                    <Text variant="label" tone="subtle">
                      {t('calendar.historyScreen.alsoWorn')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(2) }}>
                      {looseItems.map((i) => (
                        <PressableScale key={i.id} onPress={() => router.push({ pathname: '/item/[id]', params: { id: i.id } })} accessibilityRole="button" accessibilityLabel={i.name} style={{ width: 56 }}>
                          <ItemPhoto photoPath={i.photoPath} thumbPath={i.thumbPath} categoryKey={labels.categoryKey(i.categoryId)} color={i.primaryColor} />
                        </PressableScale>
                      ))}
                    </ScrollView>
                  </Stack>
                ) : null}
                {outfits.length === 0 && looseItems.length === 0 ? (
                  <Text variant="bodySmall" tone="muted">
                    {t('calendar.historyScreen.itemsOnly')}
                  </Text>
                ) : null}
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}
