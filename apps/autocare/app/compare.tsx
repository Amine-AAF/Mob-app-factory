import { Card, EmptyState, Row, Screen, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarChart } from '@/components/charts';
import { InfoNote, PremiumGate, Segmented, VehicleAvatar } from '@/components/ui';
import { loadVehicleBundle, repos, type VehicleBundle } from '@/database';
import { bestIndex, metricsFor, type VehicleMetrics } from '@/features/comparison/compare';
import { currenciesOf } from '@/features/money/money';
import { hasFeature } from '@/features/premium/limits';
import { useAsync, useFormat, useToday } from '@/hooks';
import type { Vehicle } from '@/types';
import { useIsPremium } from '@/store/session';
import { addMonths, lastNMonths } from '@/utils/dates';

type Months = '3' | '6' | '12' | '24';
type CompareRow = { vehicle: Vehicle; metrics: VehicleMetrics };

/** A metric line: values per vehicle; the lowest is highlighted (only within one currency). */
function MetricCard({ rows, title, value, raw }: { rows: CompareRow[]; title: string; value: (m: VehicleMetrics) => string; raw?: (m: VehicleMetrics) => number | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const best = raw ? bestIndex(rows.map((r) => raw(r.metrics))) : null;
  return (
    <Card>
      <Text variant="subheading">{title}</Text>
      {rows.map((r, i) => (
        <Row key={r.vehicle.id} gap={3} style={{ justifyContent: 'space-between' }}>
          <Row gap={2} style={{ flex: 1 }}>
            <VehicleAvatar vehicle={r.vehicle} size={26} />
            <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
              {r.vehicle.name}
            </Text>
          </Row>
          <Text variant="bodySmall" style={{ fontWeight: best === i ? '800' : '500', color: best === i ? theme.colors.success : theme.colors.text }}>
            {value(r.metrics)}
            {best === i && rows.length > 1 ? ` · ${t('compare.best')}` : ''}
          </Text>
        </Row>
      ))}
    </Card>
  );
}

export default function Compare() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const premium = useIsPremium();
  const [months, setMonths] = useState<Months>('12');
  const from = addMonths(today, -Number(months));
  const monthKeys = lastNMonths(today, Number(months));
  const { data } = useAsync(async () => {
    const vehicles = await repos().vehicles.list();
    const bundles = (await Promise.all(vehicles.map((v) => loadVehicleBundle(repos(), v.id)))).filter((b): b is VehicleBundle => !!b);
    return bundles.map((b) => ({ vehicle: b.vehicle, metrics: metricsFor({ ...b }, from, today, monthKeys) }));
  }, [from, today]);

  if (!hasFeature(premium, 'comparison')) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('compare.title') }} />
        <Text tone="muted">{t('compare.intro')}</Text>
        <PremiumGate reason="comparison" />
      </Screen>
    );
  }
  const rows = data ?? [];
  if (data && rows.length < 2) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('compare.title') }} />
        <EmptyState icon="git-compare-outline" title={t('compare.needTwo')} />
      </Screen>
    );
  }

  const currencies = [...new Set(rows.flatMap((r) => currenciesOf(r.metrics.total)))];

  return (
    <>
      <RouterStack.Screen options={{ title: t('compare.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('compare.intro')}</Text>
        <Segmented<Months> value={months} options={(['3', '6', '12', '24'] as const).map((m) => ({ value: m, label: t(`compare.periods.${m}`) }))} onChange={setMonths} />
        {currencies.map((c) => (
          <View key={c} style={{ gap: 12 }}>
            {currencies.length > 1 ? <InfoNote text={`${t('common.currency')}: ${c}`} /> : null}
            <MetricCard rows={rows} title={t('compare.totalCost')} value={(m) => f.money(m.total[c] ?? 0, c)} raw={(m) => m.total[c] ?? null} />
            <MetricCard rows={rows} title={t('compare.fuelCost')} value={(m) => f.money(m.fuel[c] ?? 0, c)} raw={(m) => m.fuel[c] ?? null} />
            <MetricCard rows={rows} title={t('compare.maintenanceCost')} value={(m) => f.money(m.maintenance[c] ?? 0, c)} raw={(m) => m.maintenance[c] ?? null} />
            <MetricCard rows={rows} title={t('compare.costPerDistance', { unit: f.distanceUnit })} value={(m) => (m.costPerKm?.[c] !== undefined ? f.costPerDistance(m.costPerKm[c]!, c) : '—')} raw={(m) => m.costPerKm?.[c] ?? null} />
          </View>
        ))}
        <MetricCard rows={rows} title={t('compare.distance')} value={(m) => f.distance(m.distanceKm)} />
        <MetricCard rows={rows} title={t('compare.consumption')} value={(m) => m.consumption.map((c) => f.consumption(c.per100km, c.unit)).filter(Boolean).join(' · ') || '—'} />
        {currencies[0] ? (
          <Card>
            <Text variant="subheading">{t('compare.trend')}</Text>
            {rows.map((r) => (
              <View key={r.vehicle.id} style={{ gap: 4 }}>
                <Text variant="caption" tone="muted">
                  {r.vehicle.name}
                </Text>
                <BarChart height={60} color={r.vehicle.color} data={r.metrics.monthly.map((m) => ({ label: f.month(m.month).slice(0, 1), value: (m.totals[currencies[0]!] ?? 0) / 100 }))} summary={`${r.vehicle.name}: ${r.metrics.monthly.map((m) => f.totals(m.totals, currencies[0])).join(', ')}`} />
              </View>
            ))}
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
