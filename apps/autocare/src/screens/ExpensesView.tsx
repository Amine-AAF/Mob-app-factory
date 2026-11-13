import { Card, EmptyState, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarChart, ShareBars } from '@/components/charts';
import { AdBanner, Fab, InfoNote, ItemRow, PremiumGate, Segmented, VehicleChooser } from '@/components/ui';
import { EXPENSE_ICONS } from '@/constants/icons';
import { loadVehicleBundle, repos, type VehicleBundle } from '@/database';
import { byCategory, costPerKm, inRange, toCostEntries, totalCostOfOwnership, totals, totalsByMonth, type CostEntry } from '@/features/expenses/aggregate';
import { currenciesOf } from '@/features/money/money';
import { distanceBetween } from '@/features/odometer/mileage';
import { statsMonths } from '@/features/premium/limits';
import { useAsync, useFormat, useToday } from '@/hooks';
import { useVehicles } from '@/hooks/data';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { endOfMonth, lastNMonths, startOfMonth } from '@/utils/dates';

type Period = 'month' | 'year' | 'all';

/** Every cost (expenses + fuel + maintenance + tires) with breakdowns, per currency. */
export function ExpensesView({ fixedVehicleId, inTab }: { fixedVehicleId?: string; inTab?: boolean }) {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const premium = useIsPremium();
  const preferred = usePreferences((s) => s.currency);
  const { data: vehicles } = useVehicles();
  const [selected, setSelected] = useState<string | null>(fixedVehicleId ?? null);
  const vehicleId = fixedVehicleId ?? selected;
  const [period, setPeriod] = useState<Period>('month');

  const { data } = useAsync(async () => {
    const ids = vehicleId ? [vehicleId] : (vehicles ?? []).map((v) => v.id);
    return (await Promise.all(ids.map((id) => loadVehicleBundle(repos(), id)))).filter((b): b is VehicleBundle => !!b);
  }, [vehicleId, vehicles?.length]);

  const bundles = data ?? [];
  const all: CostEntry[] = bundles.flatMap((b) => toCostEntries(b)).sort((a, b) => (a.day < b.day ? 1 : -1));
  const from = period === 'month' ? startOfMonth(today) : period === 'year' ? `${today.slice(0, 4)}-01-01` : null;
  const to = period === 'all' ? null : period === 'month' ? endOfMonth(today) : `${today.slice(0, 4)}-12-31`;
  const entries = inRange(all, from, to);
  const periodTotals = totals(entries);
  const currencies = currenciesOf(periodTotals, preferred);
  const chartCurrency = currencies[0] ?? preferred;
  const months = lastNMonths(today, statsMonths(premium));
  const monthly = totalsByMonth(all, months);
  const names = new Map((vehicles ?? []).map((v) => [v.id, v.name]));
  const showVehicle = !vehicleId && (vehicles?.length ?? 0) > 1;

  const single = vehicleId ? bundles[0] : null;
  const distance = single ? distanceBetween(single.readings, from ?? single.readings[0]?.day ?? today, to ?? today) : null;
  const perKm = costPerKm(periodTotals, distance);
  const tco = single ? totalCostOfOwnership(toCostEntries(single), { minor: single.vehicle.purchasePriceMinor, currency: single.vehicle.currency }) : null;

  const open = (e: CostEntry) => {
    if (e.source === 'fuel') router.push({ pathname: '/fuel/edit', params: { id: e.id } });
    else if (e.source === 'maintenance') router.push({ pathname: '/maintenance/edit', params: { id: e.id } });
    else if (e.source === 'tire') router.push({ pathname: '/tire/edit', params: { id: e.id } });
    else router.push({ pathname: '/expense/edit', params: { id: e.id } });
  };
  const sourceLabel = (e: CostEntry) => (e.source === 'fuel' ? t('expenses.fromFuel') : e.source === 'maintenance' ? t('expenses.fromMaintenance') : e.source === 'tire' ? t('expenses.fromTire') : null);

  return (
    <View style={{ flex: 1 }}>
      <Screen edges={inTab ? ['top'] : []}>
        {inTab ? <Text variant="title">{t('expenses.title')}</Text> : null}
        {!fixedVehicleId ? <VehicleChooser vehicles={vehicles ?? []} value={selected} onChange={setSelected} allowAll allLabel={t('maintenance.allVehicles')} /> : null}
        <Segmented<Period> value={period} options={[{ value: 'month', label: t('expenses.period.month') }, { value: 'year', label: t('expenses.period.year') }, { value: 'all', label: t('expenses.period.all') }]} onChange={setPeriod} />

        <Card>
          <Text variant="label" tone="muted">
            {period === 'month' ? t('expenses.thisMonth') : period === 'year' ? t('expenses.thisYear') : t('expenses.period.all')}
          </Text>
          <Text variant="title" testID="expenses-total">
            {f.totals(periodTotals, preferred, f.money(0, preferred))}
          </Text>
          {currencies.length > 1 ? <InfoNote text={t('expenses.multiCurrency')} /> : null}
          {single ? (
            <Row gap={3} style={{ alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text variant="label" tone="subtle">
                  {t('expenses.costPerDistance', { unit: f.distanceUnit })}
                </Text>
                <Text variant="bodySmall">{perKm ? currencies.map((c) => f.costPerDistance(perKm[c] ?? 0, c)).join(' + ') : '—'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" tone="subtle">
                  {t('expenses.tco')}
                </Text>
                <Text variant="bodySmall">{tco ? f.totals(tco, single.vehicle.currency) : '—'}</Text>
              </View>
            </Row>
          ) : null}
          <InfoNote text={t('expenses.allSources')} />
        </Card>

        {all.length ? (
          <Card>
            <Text variant="subheading">{t('expenses.monthly')}</Text>
            <BarChart
              data={monthly.map((m, i) => ({ label: f.month(m.month), value: (m.totals[chartCurrency] ?? 0) / 100, highlight: i === monthly.length - 1 }))}
              summary={monthly.map((m) => `${f.month(m.month, 'long')}: ${f.totals(m.totals, chartCurrency)}`).join(', ')}
              formatValue={(v) => f.money(Math.round(v * 100), chartCurrency)}
            />
            {currencies.length > 1 ? (
              <Text variant="caption" tone="subtle">
                {t('expenses.chartCurrency')}: {chartCurrency}
              </Text>
            ) : null}
            {!premium ? <PremiumGate reason="advanced_stats" /> : null}
          </Card>
        ) : null}

        {currencies.map((c) => {
          const cats = byCategory(entries, c);
          return cats.length ? (
            <Card key={c}>
              <Text variant="subheading">
                {t('expenses.byCategory')}
                {currencies.length > 1 ? ` (${c})` : ''}
              </Text>
              <ShareBars rows={cats.map((x) => ({ label: t(`expenseCategories.${x.category}`), value: f.money(x.minor, c), share: x.share }))} />
            </Card>
          ) : null;
        })}

        <SectionHeader title={t('maintenance.history')} />
        {entries.length ? (
          <Card>
            {entries.slice(0, 200).map((e) => (
              <ItemRow
                key={`${e.source}-${e.id}`}
                icon={EXPENSE_ICONS[e.category]}
                tone={e.source === 'expense' ? 'primary' : 'neutral'}
                title={t(`expenseCategories.${e.category}`)}
                subtitle={[f.day(e.day), sourceLabel(e), showVehicle ? names.get(e.vehicleId) : null].filter(Boolean).join(' · ')}
                value={f.money(e.minor, e.currency)}
                onPress={() => open(e)}
              />
            ))}
          </Card>
        ) : data ? (
          <EmptyState icon="wallet-outline" title={t('expenses.empty')} />
        ) : null}
        {inTab ? <AdBanner screen="expenses_list" /> : null}
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('expenses.add')} onPress={() => router.push({ pathname: '/expense/edit', params: vehicleId ? { vehicleId } : {} })} />
    </View>
  );
}
