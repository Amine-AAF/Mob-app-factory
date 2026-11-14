import { Card, EmptyState, Row, Screen, SectionHeader, Stat, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarChart, DotTrend } from '@/components/charts';
import { Fab, InfoNote, ItemRow, PremiumGate } from '@/components/ui';
import { repos } from '@/database';
import { inRange, toCostEntries, totals, totalsByMonth } from '@/features/expenses/aggregate';
import { averageUnitPrice, computeConsumption, consumptionByMonth, fuelCostPerKm, unitsInUse, type BrokenReason } from '@/features/fuel/consumption';
import { singleCurrency } from '@/features/money/money';
import { statsMonths } from '@/features/premium/limits';
import { useAsync, useFormat, useToday } from '@/hooks';
import { useIsPremium } from '@/store/session';
import { lastNMonths } from '@/utils/dates';

const BROKEN_KEYS: Record<BrokenReason, string> = {
  missed_fill: 'fuel.brokenMissedFill',
  missing_odometer: 'fuel.brokenMissingOdometer',
  odometer_backwards: 'fuel.brokenBackwards',
  no_distance: 'fuel.brokenNoDistance',
};

export default function VehicleFuel() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const premium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(async () => ({ vehicle: await repos().vehicles.get(id), fills: await repos().fuel.list(id) }), [id]);
  const fills = data?.fills ?? [];
  const months = lastNMonths(today, statsMonths(premium));
  const entries = toCostEntries({ fuel: fills });
  const monthly = totalsByMonth(entries, months);
  const chartCurrency = data?.vehicle?.currency ?? singleCurrency(totals(entries)) ?? 'USD';
  const yearTotals = totals(inRange(entries, `${today.slice(0, 4)}-01-01`, today));

  return (
    <>
      <RouterStack.Screen options={{ title: t('fuel.title') }} />
      <View style={{ flex: 1 }}>
        <Screen edges={[]}>
          {fills.length === 0 && data ? <EmptyState icon="speedometer-outline" title={t('fuel.empty')} message={t('fuel.needTwoFull')} /> : null}
          {unitsInUse(fills).map((unit) => {
            const c = computeConsumption(fills, unit);
            const perKm = fuelCostPerKm(c);
            const avgPrice = averageUnitPrice(fills, unit);
            const trend = consumptionByMonth(c).filter((m) => months.includes(m.month));
            return (
              <Card key={unit}>
                <Text variant="label" tone="muted">
                  {unit === 'kWh' ? t('fuel.averageEnergy') : t('fuel.average')}
                </Text>
                <Text variant="title" testID={`avg-${unit}`}>
                  {f.consumption(c.averagePer100km, unit) ?? t('fuel.notReliable')}
                </Text>
                {c.averagePer100km === null ? <InfoNote text={t('fuel.needTwoFull')} /> : null}
                {c.broken.map((b) => (
                  <InfoNote key={b} icon="warning-outline" text={t(BROKEN_KEYS[b])} />
                ))}
                {c.segments.some((s) => s.suspicious) ? <InfoNote icon="warning-outline" text={t('fuel.suspiciousNote')} /> : null}
                {c.pendingFills > 0 && c.segments.length > 0 ? <InfoNote text={t('fuel.pending', { count: c.pendingFills })} /> : null}
                <Row gap={2}>
                  <Stat icon="cash-outline" label={t('fuel.costPerDistance', { unit: f.distanceUnit })} value={Object.entries(perKm).map(([cur, v]) => f.costPerDistance(v, cur)).join(' + ') || '—'} />
                  <Stat icon="pricetag-outline" tone="accent" label={t('fuel.avgPrice')} value={Object.entries(avgPrice).map(([cur, v]) => f.unitPrice(v, cur, unit)).join(' + ') || '—'} />
                </Row>
                {trend.length >= 2 ? (
                  <>
                    <Text variant="label" tone="muted">
                      {t('fuel.evolution')}
                    </Text>
                    <DotTrend data={trend.map((m) => ({ label: f.month(m.month), value: f.consumptionValue(m.per100km, unit) ?? 0 }))} summary={trend.map((m) => `${f.month(m.month, 'long')}: ${f.consumption(m.per100km, unit)}`).join(', ')} />
                  </>
                ) : null}
              </Card>
            );
          })}
          {unitsInUse(fills).length > 1 ? <InfoNote text={t('fuel.phevNote')} /> : null}

          {fills.length ? (
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="subheading">{t('fuel.monthly')}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t('fuel.yearly')}: {f.totals(yearTotals, chartCurrency)}
                </Text>
              </Row>
              <BarChart
                data={monthly.map((m, i) => ({ label: f.month(m.month), value: (m.totals[chartCurrency] ?? 0) / 100, highlight: i === monthly.length - 1 }))}
                summary={monthly.map((m) => `${f.month(m.month, 'long')}: ${f.totals(m.totals, chartCurrency)}`).join(', ')}
                formatValue={(v) => f.money(Math.round(v * 100), chartCurrency)}
              />
              {!premium ? <PremiumGate reason="advanced_stats" /> : null}
            </Card>
          ) : null}

          {fills.length ? <SectionHeader title={t('maintenance.history')} /> : null}
          <Card>
            {fills.map((fill) => (
              <ItemRow
                key={fill.id}
                icon={fill.quantityUnit === 'kWh' ? 'flash' : 'speedometer'}
                tone={fill.isFull ? 'primary' : 'neutral'}
                title={`${f.quantity(fill.quantity, fill.quantityUnit)}${fill.isFull ? '' : ` · ${t('fuel.partial')}`}${fill.missedPrevious ? ' · ⚠' : ''}`}
                subtitle={[f.day(fill.day), fill.odometerKm === null ? t('fuel.noOdometer') : f.distance(fill.odometerKm), fill.station].filter(Boolean).join(' · ')}
                value={f.money(fill.totalMinor, fill.currency)}
                onPress={() => router.push({ pathname: '/fuel/edit', params: { id: fill.id } })}
              />
            ))}
          </Card>
          <View style={{ height: 72 }} />
        </Screen>
        <Fab label={t('fuel.add')} onPress={() => router.push({ pathname: '/fuel/edit', params: { vehicleId: id } })} />
      </View>
    </>
  );
}
