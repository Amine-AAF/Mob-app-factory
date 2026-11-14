import { Button, Card, Chip, EmptyState, ListRow, Screen, SectionHeader, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BarChart } from '@/components/charts';
import { ChipScroller, InfoNote, KeyValue } from '@/components/ui';
import { cardioRecords, paceSecPer, speedKmh } from '@/features/cardio/cardio';
import { weeklyFrequency } from '@/features/stats/stats';
import { M_PER_MI } from '@/features/units';
import { useData, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { useIsPremium, useSession } from '@/store/session';
import { CARDIO_TYPES, type CardioActivity, type CardioType } from '@/types';

/** Cardio tracker: history, weekly volume, personal bests, comparison by type. */
export default function Cardio() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const f = useFormat();
  const [type, setType] = useState<CardioType | null>(null);
  const { data } = useData((r) => r.cardio.list(), []);
  const list = useMemo(() => (data ?? []).filter((a) => !type || a.type === type), [data, type]);
  const rec = cardioRecords(list);
  const weeks = weeklyFrequency(list.map((a) => ({ id: a.id, day: a.day, durationSec: a.durationSec, startedAt: a.createdAt, name: a.type })), today, 8);
  const perUnit = f.units.distance === 'km' ? 1000 : M_PER_MI;
  const describe = (a: CardioActivity) =>
    [f.duration(a.durationSec), a.distanceM ? f.distance(a.distanceM) : null, a.distanceM ? f.pace(paceSecPer(a.distanceM, a.durationSec, perUnit)) : null].filter(Boolean).join(' · ');

  return (
    <Screen edges={[]} footer={<Button label={t('cardio.log')} icon="add" onPress={() => router.push('/cardio/edit')} testID="log-cardio" />}>
      <Stack.Screen options={{ title: t('cardio.title') }} />
      <ChipScroller>
        <Chip label={t('cardio.all')} selected={type === null} onPress={() => setType(null)} />
        {CARDIO_TYPES.map((c) => <Chip key={c} label={t(`cardio.types.${c}`)} selected={type === c} onPress={() => setType(c)} />)}
      </ChipScroller>
      {list.length === 0 ? (
        <EmptyState icon="walk-outline" title={t('cardio.emptyTitle')} message={t('cardio.emptyBody')} />
      ) : (
        <>
          <Card>
            <Text variant="subheading">{t('cardio.weeklyMinutes')}</Text>
            <BarChart data={weeks.map((w, i) => ({ label: fmt.shortDay(fromDayKey(w.weekStart)), value: w.minutes || null, highlight: i === weeks.length - 1 }))} summary={t('cardio.chartA11y')} />
          </Card>
          <SectionHeader title={t('cardio.records')} />
          <Card>
            <KeyValue label={t('cardio.longestDistance')} value={rec.longestDistance ? f.distance(rec.longestDistance.distanceM) : '—'} />
            <KeyValue label={t('cardio.longestDuration')} value={rec.longestDuration ? f.duration(rec.longestDuration.durationSec) : '—'} />
            <KeyValue label={t('cardio.fastestPace')} value={rec.fastestPace ? f.pace(paceSecPer(rec.fastestPace.distanceM, rec.fastestPace.durationSec, perUnit)) : '—'} />
            {premium && rec.fastestPace ? <KeyValue label={t('cardio.bestSpeed')} value={f.speed(speedKmh(rec.fastestPace.distanceM, rec.fastestPace.durationSec))} /> : null}
            {!type ? <Text variant="caption" tone="subtle">{t('cardio.recordsHint')}</Text> : null}
          </Card>
          <SectionHeader title={t('cardio.history')} />
          <Card>
            {list.slice(0, premium ? 200 : 30).map((a) => (
              <ListRow key={a.id} title={`${t(`cardio.types.${a.type}`)} · ${fmt.shortDay(fromDayKey(a.day))}`} subtitle={describe(a)} onPress={() => router.push({ pathname: '/cardio/edit', params: { id: a.id } })} />
            ))}
          </Card>
        </>
      )}
      <InfoNote text={t('cardio.honesty')} />
    </Screen>
  );
}
