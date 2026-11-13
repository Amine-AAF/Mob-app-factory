import { Button, Card, Chip, EmptyState, ListRow, Screen, SectionHeader, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { LineChart } from '@/components/charts';
import { ChipScroller, InfoNote, KeyValue, PremiumGate } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { compare, dailySeries, isLength, seriesKey } from '@/features/body/body';
import { useData, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { useIsPremium, useSession } from '@/store/session';
import { MEASUREMENT_KINDS, type BodyMeasurement, type MeasurementKind } from '@/types';

/** Body progress: optional, private measurements; plain history, charts and date comparison. */
export default function Body() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const f = useFormat();
  const { data } = useData((r) => r.body.list());
  const [series, setSeries] = useState<string>('weight');
  const [compareFrom, setCompareFrom] = useState<string | null>(null);

  const keys = useMemo(() => {
    const custom = [...new Set((data ?? []).filter((m) => m.kind === 'custom').map(seriesKey))];
    return [...MEASUREMENT_KINDS.filter((k) => k !== 'custom'), ...custom];
  }, [data]);
  const entries = (data ?? []).filter((m) => seriesKey(m) === series);
  const kind: MeasurementKind = series.startsWith('custom:') ? 'custom' : (series as MeasurementKind);
  const points = dailySeries(entries);
  const locked = !premium && !(FREE_LIMITS.measurementKinds as readonly string[]).includes(kind);
  const show = (v: number) => (kind === 'weight' ? f.weight(v) : isLength(kind) ? f.length(v) : fmt.number(v));
  const label = (k: string) => (k.startsWith('custom:') ? (data?.find((m) => seriesKey(m) === k)?.customName ?? k) : t(`body.kinds.${k}`));
  const last = points[points.length - 1];
  const cmp = compareFrom && last ? compare(points, compareFrom, last.day) : null;

  const remove = (m: BodyMeasurement) =>
    Alert.alert(t('body.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await repos().body.remove(m.id); useSession.getState().bump(); } },
    ]);

  return (
    <Screen edges={[]} footer={<Button label={t('body.add')} icon="add" onPress={() => router.push({ pathname: '/body/add', params: { kind, name: kind === 'custom' ? label(series) : '' } })} testID="add-measurement" />}>
      <Stack.Screen options={{ title: t('body.title') }} />
      <InfoNote text={t('body.privacy')} icon="lock-closed-outline" />
      <ChipScroller>
        {keys.map((k) => (
          <Chip key={k} label={label(k)} selected={series === k} onPress={() => { setSeries(k); setCompareFrom(null); }} />
        ))}
      </ChipScroller>
      {locked ? (
        <PremiumGate title={t('premium.bodyTitle')} message={t('premium.bodyBody')} source="body" />
      ) : points.length === 0 ? (
        <EmptyState icon="body-outline" title={t('body.emptyTitle', { name: label(series) })} message={t('body.emptyBody')} />
      ) : (
        <>
          <Card>
            <Text variant="subheading">{label(series)}</Text>
            {last ? <Text variant="title">{show(last.value)}</Text> : null}
            {points.length >= 2 ? <LineChart points={points.map((p) => ({ label: fmt.shortDay(fromDayKey(p.day)), value: kind === 'weight' ? f.weightValue(p.value) : p.value }))} summary={t('body.chartA11y', { name: label(series), count: points.length })} formatValue={(v) => (kind === 'weight' ? fmt.number(v) : show(v))} /> : null}
          </Card>
          {premium && points.length >= 2 ? (
            <>
              <SectionHeader title={t('body.compare')} />
              <ChipScroller>
                {points.slice(0, -1).map((p) => (
                  <Chip key={p.day} label={fmt.shortDay(fromDayKey(p.day))} selected={compareFrom === p.day} onPress={() => setCompareFrom(p.day)} />
                ))}
              </ChipScroller>
              {cmp ? (
                <Card tone="alt">
                  <KeyValue label={fmt.mediumDate(fromDayKey(cmp.from.day))} value={show(cmp.from.value)} />
                  <KeyValue label={fmt.mediumDate(fromDayKey(cmp.to.day))} value={show(cmp.to.value)} />
                  <KeyValue label={t('body.difference')} value={`${cmp.delta > 0 ? '+' : cmp.delta < 0 ? '−' : ''}${show(Math.abs(cmp.delta))}`} />
                </Card>
              ) : (
                <Text variant="caption" tone="subtle">{t('body.compareHint')}</Text>
              )}
            </>
          ) : null}
          <SectionHeader title={t('body.history')} />
          <Card>
            {[...entries].reverse().map((m) => (
              <ListRow key={m.id} title={show(m.value)} subtitle={`${fmt.mediumDate(fromDayKey(m.day))}${m.note ? ` · ${m.note}` : ''}`} onPress={() => remove(m)} />
            ))}
          </Card>
        </>
      )}
      <ListRow icon="images-outline" title={t('photos.title')} subtitle={premium ? t('photos.sub') : t('premium.badge')} onPress={() => router.push('/body/photos')} />
      <InfoNote text={t('body.noDiagnosis')} />
    </Screen>
  );
}
