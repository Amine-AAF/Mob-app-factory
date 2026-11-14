import { Badge, Button, Card, Chip, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import { PremiumCard } from '@/components/care';
import { LineChart } from '@/components/charts';
import { PlantPhoto } from '@/components/PlantPhoto';
import { canAddGrowthRecord, FREE_GROWTH_RECORDS_PER_PLANT } from '@/domain/limits';
import type { GrowthRecord } from '@/domain/types';
import { lengthFromCm, lengthUnit } from '@/domain/units';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { deletePhotos } from '@/services/photos';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

type View_ = 'log' | 'gallery' | 'compare';

/**
 * Growth tracker. Heights and leaf counts are only what the user measured: nothing is
 * estimated from photos. The chart only appears when at least two measurements exist.
 */
export default function Growth() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const { id } = useLocalSearchParams<{ id: string }>();
  const [view, setView] = useState<View_>('log');
  const [pair, setPair] = useState<[string | null, string | null]>([null, null]);

  const { data } = useData(async (r) => ({ plant: await r.plants.get(id), records: await r.growth.forPlant(id), journalPhotos: await r.journal.photos(id) }), [id]);
  const records = data?.records ?? [];
  const measured = records.filter((g) => g.heightCm !== null);
  const photos: { id: string; path: string; date: string }[] = [
    ...records.filter((g) => g.photoPath).map((g) => ({ id: g.id, path: g.photoPath!, date: g.date })),
    ...(isPremium ? (data?.journalPhotos ?? []).map((j) => ({ id: j.id, path: j.photoPath!, date: j.date })) : []),
  ].sort((a, b) => (a.date < b.date ? -1 : 1));

  const add = () =>
    canAddGrowthRecord(isPremium, records.length) ? router.push({ pathname: '/record/growth', params: { plantId: id } }) : router.push({ pathname: '/paywall', params: { source: 'growth' } });

  const remove = (g: GrowthRecord) =>
    Alert.alert(t('growth.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.growth.remove(g.id), { reminders: false }).then((p) => deletePhotos([p])) },
    ]);

  const first = photos.find((p) => p.id === pair[0]) ?? photos[0];
  const last = photos.find((p) => p.id === pair[1]) ?? photos[photos.length - 1];
  const unit = lengthUnit(units);

  return (
    <Screen edges={[]} footer={<Button label={t('growth.add')} icon="add" onPress={add} testID="add-growth" />}>
      <RouterStack.Screen options={{ title: t('growth.title') }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      <Row wrap gap={2}>
        {(['log', 'gallery', 'compare'] as View_[]).map((v) => (
          <Chip key={v} label={t(`growth.views.${v}`)} selected={view === v} onPress={() => setView(v)} />
        ))}
      </Row>

      {view === 'log' ? (
        <>
          {measured.length >= 2 ? (
            <Card>
              <Text variant="subheading">{t('growth.chartTitle', { unit })}</Text>
              <LineChart
                unit={unit}
                points={measured.map((g) => ({ label: fmt.shortDay(g.date), value: lengthFromCm(g.heightCm!, units) }))}
                summary={t('growth.chartSummary', { count: measured.length, first: lengthFromCm(measured[0]!.heightCm!, units), last: lengthFromCm(measured[measured.length - 1]!.heightCm!, units), unit })}
              />
            </Card>
          ) : (
            <Text variant="caption" tone="muted">
              {t('growth.chartNeedsTwo')}
            </Text>
          )}
          {records.length === 0 ? (
            <EmptyState icon="trending-up-outline" title={t('growth.empty')} message={t('growth.emptyBody')} />
          ) : (
            <Stack gap={2}>
              {[...records].reverse().map((g) => (
                <Card key={g.id}>
                  <Row gap={3}>
                    {g.photoPath ? <PlantPhoto path={g.photoPath} size={64} /> : null}
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="subheading">{fmt.day(g.date)}</Text>
                      <Row wrap gap={1}>
                        {g.heightCm !== null ? <Badge tone="primary" label={`${fmt.number(lengthFromCm(g.heightCm, units))} ${unit}`} icon="resize-outline" /> : null}
                        {g.leafCount !== null ? <Badge tone="neutral" label={t('growth.leaves', { count: g.leafCount })} /> : null}
                        <Badge tone={g.condition === 'poor' ? 'warning' : 'success'} label={t(`condition.${g.condition}`)} />
                      </Row>
                      {g.notes ? <Text variant="bodySmall" tone="muted">{g.notes}</Text> : null}
                    </View>
                    <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => remove(g)} />
                  </Row>
                </Card>
              ))}
            </Stack>
          )}
          {!isPremium ? <Text variant="caption" tone="muted">{t('growth.freeLimit', { max: FREE_GROWTH_RECORDS_PER_PLANT })}</Text> : null}
        </>
      ) : null}

      {view === 'gallery' ? (
        photos.length === 0 ? (
          <EmptyState icon="images-outline" title={t('growth.noPhotos')} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {photos.map((p) => (
              <View key={p.id} style={{ width: '31%', gap: 2 }}>
                <PlantPhoto path={p.path} height={110} label={fmt.day(p.date)} />
                <Text variant="caption" tone="muted" center>
                  {fmt.shortDay(p.date)}
                </Text>
              </View>
            ))}
          </View>
        )
      ) : null}

      {view === 'compare' ? (
        !isPremium ? (
          <PremiumCard title={t('premium.compareTitle')} message={t('premium.compareBody')} source="compare" />
        ) : photos.length < 2 ? (
          <EmptyState icon="git-compare-outline" title={t('growth.compareNeedsTwo')} />
        ) : (
          <>
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              {[first, last].map((p, i) => (
                <View key={i} style={{ flex: 1, gap: 4 }}>
                  <PlantPhoto path={p?.path} height={200} label={p ? fmt.day(p.date) : undefined} />
                  <Text variant="caption" center>
                    {p ? fmt.day(p.date) : ''}
                  </Text>
                </View>
              ))}
            </Row>
            <SectionHeader title={t('growth.pickPhotos')} />
            {[0, 1].map((slot) => (
              <ScrollView key={slot} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {photos.map((p) => (
                  <Chip key={p.id} label={fmt.shortDay(p.date)} selected={(slot === 0 ? first : last)?.id === p.id} onPress={() => setPair(slot === 0 ? [p.id, pair[1]] : [pair[0], p.id])} />
                ))}
              </ScrollView>
            ))}
          </>
        )
      ) : null}
    </Screen>
  );
}
