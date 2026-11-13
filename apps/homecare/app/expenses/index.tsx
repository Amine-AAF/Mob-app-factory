import { Card, EmptyState, IconButton, ProgressBar, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Segmented } from '@/components/forms';
import { AdBanner, PremiumLock } from '@/components/media';
import { BarChart, Fab, ItemRow, Notice, ScreenHeader, ShareBars } from '@/components/ui';
import { EXPENSE_ICONS, tintFor } from '@/config/icons';
import { repos } from '@/database';
import { addMonths, endOfMonth, lastNMonths, monthKey, startOfMonth } from '@/domain/dates';
import { EXPENSE_CATEGORIES } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

type Period = 'month' | 'year';

/**
 * Spending overview. Charts use one currency at a time (the home currency by default);
 * other currencies are listed separately and never added in.
 */
export default function Expenses() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [period, setPeriod] = useState<Period>('month');
  const [anchor, setAnchor] = useState(startOfMonth(today));
  const [chartCurrency, setChartCurrency] = useState<string | null>(null);

  const from = period === 'month' ? anchor : `${anchor.slice(0, 4)}-01-01`;
  const to = period === 'month' ? endOfMonth(anchor) : `${anchor.slice(0, 4)}-12-31`;

  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const months = lastNMonths(anchor, isPremium ? 12 : 6);
    const prevFrom = period === 'month' ? addMonths(anchor, -1) : `${Number(anchor.slice(0, 4)) - 1}-01-01`;
    const prevTo = period === 'month' ? endOfMonth(addMonths(anchor, -1)) : `${Number(anchor.slice(0, 4)) - 1}-12-31`;
    const [list, totals, previous, byCategory, monthly] = await Promise.all([
      r.expenses.list(home.id, { from, to }),
      r.expenses.totals(home.id, { from, to }),
      r.expenses.totals(home.id, { from: prevFrom, to: prevTo }),
      r.expenses.byCategory(home.id, from, to),
      r.expenses.monthlyTotals(home.id, `${months[0]}-01`, endOfMonth(anchor)),
    ]);
    return { list, totals, previous, byCategory, monthly, months };
  }, [home?.id, from, to, isPremium, period]);

  if (!home) return null;
  const currency = chartCurrency ?? (data?.totals.some((x) => x.currency === home.currency) || !data?.totals.length ? home.currency : data.totals[0]!.currency);
  const currencies = [...new Set([home.currency, ...(data?.totals.map((x) => x.currency) ?? [])])];
  const current = data?.totals.find((x) => x.currency === currency)?.amountMinor ?? 0;
  const prev = data?.previous.find((x) => x.currency === currency)?.amountMinor ?? 0;
  const delta = prev > 0 ? Math.round(((current - prev) / prev) * 100) : null;
  const budget = period === 'month' && home.monthlyBudgetMinor != null && currency === home.currency ? home.monthlyBudgetMinor : null;
  const bars = (data?.months ?? []).map((m) => {
    const v = data?.monthly.find((x) => x.month === m && x.currency === currency)?.amountMinor ?? 0;
    return { key: m, label: fmt.month(m), value: v, display: fmt.money({ amountMinor: v, currency }), highlight: m === monthKey(anchor) };
  });
  const cats = (data?.byCategory ?? []).filter((c) => c.currency === currency).map((c) => ({ key: c.category, label: t(`expenseCategories.${c.category}`), value: c.amountMinor, display: fmt.money(c), color: tintFor(EXPENSE_CATEGORIES, c.category) }));
  const step = (n: number) => setAnchor(period === 'month' ? addMonths(anchor, n) : `${Number(anchor.slice(0, 4)) + n}-${anchor.slice(5)}`);

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="expenses">
        <ScreenHeader title={t('expenses.title')} back right={<IconButton icon="repeat" label={t('recurring.title')} onPress={() => router.push('/expenses/recurring')} />} />
        <Segmented options={['month', 'year'] as const} value={period} onChange={setPeriod} renderLabel={(p) => t(`expenses.periods.${p}`)} />
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="chevron-back" label={t('calendar.previous')} onPress={() => step(-1)} />
          <Text variant="subheading" style={{ textTransform: 'capitalize' }}>
            {period === 'month' ? fmt.monthTitle(monthKey(anchor)) : anchor.slice(0, 4)}
          </Text>
          <IconButton icon="chevron-forward" label={t('calendar.next')} onPress={() => step(1)} />
        </Row>

        <Card>
          <Text variant="label" tone="subtle">
            {t('expenses.total')}
          </Text>
          <Text variant="title">{fmt.moneyList(data?.totals ?? [], fmt.money({ amountMinor: 0, currency: home.currency }))}</Text>
          {delta !== null ? (
            <Text variant="bodySmall" tone={delta > 0 ? 'warning' : 'success'}>
              {t(period === 'month' ? 'expenses.vsLastMonth' : 'expenses.vsLastYear', { percent: `${delta > 0 ? '+' : ''}${delta}` })}
            </Text>
          ) : null}
          {budget != null ? (
            <Stack gap={1}>
              <ProgressBar progress={current / Math.max(1, budget)} tone={current > budget ? 'accent' : 'primary'} label={t('expenses.budget')} />
              <Text variant="caption" tone={current > budget ? 'danger' : 'muted'}>
                {current > budget ? t('expenses.overBudget', { amount: fmt.money({ amountMinor: current - budget, currency }) }) : t('expenses.leftInBudget', { amount: fmt.money({ amountMinor: budget - current, currency }) })}
              </Text>
            </Stack>
          ) : period === 'month' ? (
            <Text variant="caption" tone="primary" onPress={() => router.push({ pathname: '/homes/edit', params: { id: home.id } })}>
              {t('expenses.setBudget')}
            </Text>
          ) : null}
        </Card>
        {(data?.totals.length ?? 0) > 1 ? <Notice icon="cash-outline">{t('expenses.multiCurrency')}</Notice> : null}
        {currencies.length > 1 ? <Segmented options={currencies} value={currency} onChange={setChartCurrency} renderLabel={(c) => c} /> : null}

        <SectionHeader title={t('expenses.trend', { count: data?.months.length ?? 6 })} />
        <Card>
          <BarChart bars={bars} limit={budget} />
        </Card>
        {!isPremium ? <PremiumLock feature="advanced_stats" message={t('expenses.statsLocked')} /> : null}

        {cats.length ? (
          <>
            <SectionHeader title={t('expenses.byCategory')} />
            <Card>
              <ShareBars items={cats} />
            </Card>
          </>
        ) : null}

        <SectionHeader title={t('expenses.list')} />
        {data && data.list.length === 0 ? <EmptyState icon="wallet-outline" title={t('expenses.emptyTitle')} message={t('expenses.emptyMessage')} /> : null}
        <Stack gap={2}>
          {data?.list.map((e) => (
            <ItemRow
              key={e.id}
              icon={EXPENSE_ICONS[e.category]}
              tint={tintFor(EXPENSE_CATEGORIES, e.category)}
              title={e.title ?? t(`expenseCategories.${e.category}`)}
              subtitle={[fmt.day(e.spentOn), e.recurringId ? t('expenses.recurringTag') : null, e.paymentMethod ? t(`paymentMethods.${e.paymentMethod}`) : null].filter(Boolean).join(' · ')}
              right={<Text variant="subheading">{fmt.money(e)}</Text>}
              onPress={() => router.push({ pathname: '/expenses/edit', params: { id: e.id } })}
            />
          ))}
        </Stack>
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('expenses.add')} bottomInset testID="add-expense" onPress={() => router.push('/expenses/edit')} />
    </View>
  );
}
