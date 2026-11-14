import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { byCategory, inMonth, inYear, monthlySeries, periodChange } from '@/domain/budget';
import type { ShoppingRecord } from '@/domain/types';
import { BarList } from '@/features/insights/BarList';
import type { Labels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { Badge, Card, Divider, ListRow, Row, SectionHeader, Stack, Text } from '@/ui/components';

import { compareByCurrency, previousMonthKey, type CurrencyComparison } from './logic';
import { MiniBarChart } from './MiniBarChart';

function ChangeBadge({ row }: { row: CurrencyComparison }) {
  const { t } = useTranslation();
  const change = periodChange(row.current, row.previous);
  if (change == null) return <Badge label={t('shopping.analytics.noComparison')} />;
  const label = change === 0 ? t('shopping.analytics.same') : change > 0 ? t('shopping.analytics.up', { percent: change }) : t('shopping.analytics.down', { percent: Math.abs(change) });
  return <Badge label={label} tone={change > 0 ? 'accent' : 'success'} />;
}

function Comparison({ title, currentLabel, previousLabel, rows }: { title: string; currentLabel: string; previousLabel: string; rows: CurrencyComparison[] }) {
  return (
    <Card>
      <Text variant="heading">{title}</Text>
      {rows.map((r, i) => (
        <Stack key={r.currency} gap={1.5}>
          {i > 0 ? <Divider /> : null}
          <Row style={{ justifyContent: 'space-between' }}>
            <Stack gap={0.5} style={{ flex: 1 }}>
              <Text variant="caption" tone="subtle">
                {currentLabel}
              </Text>
              <Text variant="heading">{fmt.money(r.current, r.currency)}</Text>
            </Stack>
            <Stack gap={0.5} style={{ flex: 1 }}>
              <Text variant="caption" tone="subtle">
                {previousLabel}
              </Text>
              <Text tone="muted">{fmt.money(r.previous, r.currency)}</Text>
            </Stack>
            <ChangeBadge row={r} />
          </Row>
        </Stack>
      ))}
    </Card>
  );
}

/** Premium shopping analytics: period comparisons, category breakdown, yearly chart, alerts. */
export function ShoppingAnalytics({ records, monthKey, currency, labels, alertsEnabled, warnPercent }: { records: readonly ShoppingRecord[]; monthKey: string; currency: string; labels: Labels; alertsEnabled: boolean; warnPercent: number }) {
  const { t } = useTranslation();
  const year = Number(monthKey.slice(0, 4));
  const data = useMemo(() => {
    const thisYear = inYear(records, year);
    const series = monthlySeries(records, year, currency);
    return {
      month: compareByCurrency(inMonth(records, monthKey), inMonth(records, previousMonthKey(monthKey)), currency),
      year: compareByCurrency(thisYear, inYear(records, year - 1), currency),
      categories: byCategory(thisYear, currency),
      series,
      yearTotal: series.reduce((s, v) => s + v, 0),
    };
  }, [records, monthKey, year, currency]);

  const monthShort = (i: number) => fmt.date(new Date(year, i, 1), { month: 'narrow' });
  const monthLong = (i: number) => fmt.monthYear(`${year}-${String(i + 1).padStart(2, '0')}`);

  return (
    <Stack gap={3}>
      <SectionHeader title={t('shopping.analytics.title')} />
      <Comparison title={t('shopping.analytics.monthTitle')} currentLabel={t('shopping.analytics.thisMonth')} previousLabel={t('shopping.analytics.lastMonth')} rows={data.month} />
      <Comparison title={t('shopping.analytics.yearTitle')} currentLabel={t('shopping.analytics.thisYear', { year })} previousLabel={t('shopping.analytics.lastYear', { year: year - 1 })} rows={data.year} />
      <Card>
        <Text variant="heading">{t('shopping.analytics.chartTitle', { year })}</Text>
        <Text variant="caption" tone="subtle">
          {t('shopping.analytics.chartSubtitle', { currency, total: fmt.money(data.yearTotal, currency) })}
        </Text>
        <MiniBarChart
          values={data.series}
          labels={data.series.map((_, i) => monthShort(i))}
          a11yLabels={data.series.map((v, i) => `${monthLong(i)}: ${fmt.money(v, currency)}`)}
          highlight={Number(monthKey.slice(5, 7)) - 1}
        />
      </Card>
      <Card>
        <Text variant="heading">{t('shopping.analytics.categoryTitle', { year })}</Text>
        {data.categories.length === 0 ? (
          <Text tone="muted">{t('shopping.analytics.categoryEmpty', { currency })}</Text>
        ) : (
          <BarList
            entries={data.categories.map((c) => ({
              key: c.categoryId ?? 'none',
              label: c.categoryId ? labels.category(c.categoryId) : t('shopping.uncategorized'),
              value: c.total,
              display: `${fmt.money(c.total, currency)} · ${c.count}`,
            }))}
          />
        )}
      </Card>
      <Card>
        <ListRow
          icon="notifications-outline"
          title={t('shopping.analytics.alertsTitle')}
          subtitle={alertsEnabled ? t('shopping.analytics.alertsOn', { percent: warnPercent }) : t('shopping.analytics.alertsOff')}
          onPress={() => router.push('/settings/notifications')}
        />
      </Card>
    </Stack>
  );
}
