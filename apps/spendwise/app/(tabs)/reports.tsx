import { Badge, Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { DateRangeSelector, SpendingChart, type BarDatum } from '@/components/charts';
import { BudgetProgressCard, CategoryCard } from '@/components/finance';
import { SelectField } from '@/components/inputs';
import { loadReport } from '@/features/reports/loadReport';
import { percentChange } from '@/features/reports/stats';
import { useCategoryName, useData, useMoney } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { adsSdk, adsState, adUnits } from '@/services/ads';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { detailedReportsUnlocked, REWARD_UNLOCK_MS } from '@/services/premium';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useMainCurrency } from '@/store/session';
import { fromDayKey, shiftPeriod, type PeriodKind } from '@/utils/dates';

const ALL = '__all__';

function LockedCard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const sdk = adsSdk();
  // Only offered once the AdMob SDK was initialised with the user's consent (UMP).
  const canReward = !!sdk && !!adUnits.rewarded && adsState().initialized && adsState().canRequestAds;

  const watch = () => {
    if (!sdk || !adUnits.rewarded) return;
    setLoading(true);
    try {
      const ad = sdk.RewardedAd.createForAdRequest(adUnits.rewarded);
      const offs: (() => void)[] = [];
      const done = () => {
        offs.forEach((o) => o());
        setLoading(false);
      };
      offs.push(ad.addAdEventListener(sdk.RewardedAdEventType.LOADED, () => void ad.show()));
      offs.push(
        ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => {
          usePreferences.getState().set({ reportsUnlockedUntil: Date.now() + REWARD_UNLOCK_MS });
          Alert.alert(t('reports.unlocked'));
        }),
      );
      offs.push(ad.addAdEventListener(sdk.AdEventType.CLOSED, done));
      offs.push(
        ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
          done();
          Alert.alert(t('reports.adUnavailable'));
        }),
      );
      ad.load();
    } catch (e) {
      recordError(e, 'reports_rewarded');
      setLoading(false);
    }
  };

  return (
    <Card tone="accent" testID="reports-locked">
      <Row gap={2}>
        <Badge label={t('common.premium')} tone="accent" icon="lock-closed-outline" />
        <Text variant="subheading">{t('reports.lockedTitle')}</Text>
      </Row>
      <Text tone="muted">{t('reports.lockedBody')}</Text>
      <Button label={t('reports.goPremium')} icon="star-outline" size="md" onPress={() => router.push('/paywall?source=reports')} />
      {canReward ? <Button label={t('reports.watchAd')} variant="secondary" icon="play-circle-outline" size="md" loading={loading} onPress={watch} /> : null}
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' | 'default' }) {
  return (
    <View style={{ flex: 1, minWidth: '45%' }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="heading" tone={tone ?? 'default'} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export default function ReportsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const money = useMoney();
  const catName = useCategoryName();
  const currency = useMainCurrency();
  const isPremium = useIsPremium();
  usePreferences((s) => s.reportsUnlockedUntil); // re-render after a rewarded unlock
  const detailed = detailedReportsUnlocked(isPremium);

  const [kind, setKind] = useState<PeriodKind>('month');
  const [anchor, setAnchor] = useState(clock.today());
  const [accountId, setAccountId] = useState(ALL);
  const [categoryId, setCategoryId] = useState(ALL);

  useEffect(() => {
    track('report_opened', { period: kind });
  }, [kind]);

  const effectiveKind: PeriodKind = kind === 'year' && !detailed ? 'month' : kind;
  const filters = { accountId: accountId === ALL ? undefined : accountId, categoryId: categoryId === ALL ? undefined : categoryId };
  const { data, error, reload } = useData((r) => loadReport(r, effectiveKind, anchor, filters, currency), [effectiveKind, anchor, accountId, categoryId, currency]);
  const { data: lists } = useData(async (r) => ({ accounts: await r.accounts.list({ includeArchived: true }), categories: await r.categories.list({ includeArchived: true }) }), []);

  const accountOptions = useMemo(() => [{ value: ALL, label: t('reports.allAccounts') }, ...(lists?.accounts ?? []).map((a) => ({ value: a.id, label: a.name }))], [lists, t]);
  const categoryOptions = useMemo(
    () => [{ value: ALL, label: t('reports.allCategories') }, ...(lists?.categories ?? []).map((c) => ({ value: c.id, label: catName(c), icon: c.icon as never, color: c.color }))],
    [lists, t, catName],
  );

  const lng = currentLanguage();
  const chart: { title: string; data: BarDatum[]; series: ('spending' | 'income')[] } | null = useMemo(() => {
    if (!data) return null;
    if (data.kind === 'year') {
      return {
        title: t('reports.trendYear'),
        series: ['spending', 'income'],
        data: data.trend.map((m) => ({ key: m.month, label: new Intl.DateTimeFormat(lng, { month: 'narrow' }).format(fromDayKey(`${m.month}-01`)), value: m.spending, value2: m.income })),
      };
    }
    return {
      title: t('reports.daily'),
      series: ['spending'],
      data: (data.daily ?? []).map((d) => ({
        key: d.day,
        label: data.kind === 'week' ? new Intl.DateTimeFormat(lng, { weekday: 'narrow' }).format(fromDayKey(d.day)) : String(Number(d.day.slice(8))),
        value: Math.max(0, d.amount),
      })),
    };
  }, [data, t, lng]);

  const insightText = (i: NonNullable<typeof data>['insights'][number]) => {
    const category = 'categoryId' in i ? catName(data?.categories.get(i.categoryId)) : '';
    const pct = 'pct' in i ? i.pct : i.sharePct;
    return t(`reports.insights.${i.key}`, { category, pct });
  };

  const empty = data && data.summary.count === 0 && data.summary.excludedCount === 0;
  const s = data?.summary;

  return (
    <Screen testID="reports-screen">
      <Text variant="title" accessibilityRole="header">
        {t('reports.title')}
      </Text>
      <DateRangeSelector
        kind={kind}
        anchor={anchor}
        locked={detailed ? [] : ['year']}
        onKind={(k) => {
          setKind(k);
          setAnchor(clock.today());
        }}
        onShift={(step) => setAnchor((a) => shiftPeriod(kind, a, step))}
      />
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <SelectField label={t('tx.account')} value={accountId} options={accountOptions} onChange={setAccountId} testID="report-account" />
        </View>
        <View style={{ flex: 1 }}>
          <SelectField label={t('tx.category')} value={categoryId} options={categoryOptions} onChange={setCategoryId} searchable testID="report-category" />
        </View>
      </Row>

      {kind === 'year' && !detailed ? <LockedCard /> : null}

      {error ? (
        <Card>
          <Text>{t('common.loadError')}</Text>
          <Button label={t('common.retry')} variant="secondary" size="md" onPress={reload} />
        </Card>
      ) : null}

      {empty ? <EmptyState icon="bar-chart-outline" title={t('reports.empty')} message={t('reports.emptyBody')} /> : null}

      {data && s && !empty ? (
        <Stack gap={4}>
          <Card testID="report-summary">
            <Text variant="label" tone="muted">
              {t('reports.summary')}
            </Text>
            <Row gap={3} wrap>
              <Metric label={t('reports.income')} value={money(s.income, currency)} tone="success" />
              <Metric label={t('reports.spending')} value={money(s.spending, currency)} />
              <Metric label={t('reports.net')} value={money(s.net, currency, { signed: true })} tone={s.net < 0 ? 'danger' : 'default'} />
              <Metric label={t('reports.savingsRate')} value={data.savingsRate === null ? '—' : `${Math.round(data.savingsRate * 100)}%`} />
            </Row>
            {s.excludedCount > 0 ? (
              <Text variant="caption" tone="muted">
                {t('stats.excluded', { count: s.excludedCount })}
              </Text>
            ) : null}
          </Card>

          {data.insights.length > 0 ? (
            <Card tone="primary" testID="report-insights">
              <Text variant="label" tone="primary">
                {t('reports.insightsTitle')}
              </Text>
              {data.insights.map((i) => (
                <Text key={i.key} variant="bodySmall">
                  • {insightText(i)}
                </Text>
              ))}
            </Card>
          ) : null}

          {chart && chart.data.length > 0 ? (
            <Card>
              <Text variant="subheading">{chart.title}</Text>
              <SpendingChart data={chart.data} currency={currency} series={chart.series} testID="report-chart" />
            </Card>
          ) : null}

          {data.spendingCategories.length > 0 ? (
            <View>
              <SectionHeader title={t('reports.byCategory')} />
              <Card>
                {data.spendingCategories.map((c) => (
                  <CategoryCard key={c.categoryId} category={data.categories.get(c.categoryId)} label={catName(data.categories.get(c.categoryId))} amount={c.amount} currency={currency} share={s.spending > 0 ? c.amount / s.spending : 0} />
                ))}
              </Card>
            </View>
          ) : null}

          {data.incomeCategories.length > 0 ? (
            <View>
              <SectionHeader title={t('reports.incomeBreakdown')} />
              <Card>
                {data.incomeCategories.map((c) => (
                  <CategoryCard key={c.categoryId} category={data.categories.get(c.categoryId)} label={catName(data.categories.get(c.categoryId))} amount={c.amount} currency={currency} share={s.income > 0 ? c.amount / s.income : 0} />
                ))}
              </Card>
            </View>
          ) : null}

          {data.budget ? (
            <View>
              <SectionHeader title={t('reports.budgetVsActual')} />
              <Stack gap={3}>
                {!filters.categoryId ? <BudgetProgressCard line={data.budget.total} label={t('budgets.total')} currency={data.budget.currency} /> : null}
                {data.budget.categories.map((l) => (
                  <BudgetProgressCard key={l.scope} line={l} label={catName(data.categories.get(l.scope))} category={data.categories.get(l.scope)} currency={data.budget!.currency} />
                ))}
              </Stack>
            </View>
          ) : null}

          {data.kind !== 'year' && kind !== 'year' ? (
            detailed ? (
              <Card testID="report-comparison">
                <Text variant="subheading">{t('reports.comparison')}</Text>
                {(
                  [
                    ['reports.spending', data.previous.spending, s.spending],
                    ['reports.income', data.previous.income, s.income],
                  ] as const
                ).map(([key, prev, cur]) => {
                  const pct = percentChange(prev, cur);
                  return (
                    <Row key={key} gap={2} style={{ justifyContent: 'space-between' }}>
                      <Text variant="bodySmall" style={{ flex: 1 }}>
                        {t(key)}
                      </Text>
                      <Text variant="bodySmall" tone="muted">
                        {money(prev, currency)} → {money(cur, currency)}
                      </Text>
                      {pct !== null ? <Badge label={`${pct > 0 ? '+' : ''}${pct}%`} tone="neutral" /> : null}
                    </Row>
                  );
                })}
              </Card>
            ) : (
              <LockedCard />
            )
          ) : null}

          {data.recurringSpending > 0 ? (
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="subheading">{t('reports.recurring')}</Text>
                <Text variant="subheading">{money(data.recurringSpending, currency)}</Text>
              </Row>
              <Text variant="caption" tone="muted">
                {t('reports.recurringDesc')}
              </Text>
            </Card>
          ) : null}
        </Stack>
      ) : null}
      <View style={{ height: theme.spacing(2) }} />
    </Screen>
  );
}
