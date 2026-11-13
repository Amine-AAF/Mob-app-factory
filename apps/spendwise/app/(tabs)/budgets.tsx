import { Button, Card, EmptyState, Icon, IconButton, Row, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpendingChart } from '@/components/charts';
import { BudgetProgressCard, CategoryCard, PrivacyToggle } from '@/components/finance';
import { evaluateBudget } from '@/features/budgets/budgets';
import { rankCategories, rateMap, summarize } from '@/features/reports/stats';
import { mutate, useCategoryName, useData, useMoney } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { addMonths, fromDayKey, monthEnd, monthOf, monthStart, type MonthKey } from '@/utils/dates';

function monthLabel(m: MonthKey) {
  return new Intl.DateTimeFormat(currentLanguage(), { month: 'long', year: 'numeric' }).format(fromDayKey(`${m}-01`));
}

export default function BudgetsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const money = useMoney();
  const catName = useCategoryName();
  const [month, setMonth] = useState<MonthKey>(monthOf(clock.today()));

  const { data } = useData(
    async (r) => {
      const [b, txs, categories, rates, settings, months, prev] = await Promise.all([
        r.budgets.getByMonth(month),
        r.transactions.list({ from: monthStart(month), to: monthEnd(month) }),
        r.categories.list({ includeArchived: true }),
        r.rates.list(),
        r.settings.getAll(),
        r.budgets.months(),
        r.budgets.previousMonthWithBudget(month),
      ]);
      const currency = b?.budget.currency ?? settings.mainCurrency ?? 'USD';
      const s = summarize(txs, currency, rateMap(rates));
      const evaluation = b ? evaluateBudget(b.budget, b.limits, s.spendingByCategory, s.spending, settings.alertThresholds) : null;
      const budgeted = new Set(b?.limits.map((l) => l.categoryId));
      const unbudgeted = rankCategories(s.spendingByCategory).filter((c) => !budgeted.has(c.categoryId));
      return { b, s, currency, evaluation, unbudgeted, categories: new Map(categories.map((c) => [c.id, c])), months, prev };
    },
    [month],
  );

  async function copyPrevious() {
    try {
      await mutate((r) => r.budgets.copyFromPrevious(month));
      track('budget_created', { copied: true });
    } catch (e) {
      recordError(e, 'budget_copy');
    }
  }

  const e = data?.evaluation;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(5), paddingTop: theme.spacing(2), paddingBottom: theme.spacing(10) }}>
        <Stack gap={4}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="title" accessibilityRole="header">
              {t('budgets.title')}
            </Text>
            <Row gap={0}>
              <PrivacyToggle />
              {data?.b ? <IconButton icon="create-outline" label={t('budgets.edit')} onPress={() => router.push(`/budgets/edit?month=${month}`)} /> : null}
            </Row>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={() => setMonth(addMonths(month, -1))} accessibilityRole="button" accessibilityLabel={t('common.previous')} hitSlop={12}>
              <Icon name="chevron-back" size={22} color={theme.colors.text} />
            </Pressable>
            <Text variant="subheading" accessibilityLiveRegion="polite">
              {monthLabel(month)}
            </Text>
            <Pressable onPress={() => setMonth(addMonths(month, 1))} accessibilityRole="button" accessibilityLabel={t('common.next')} hitSlop={12}>
              <Icon name="chevron-forward" size={22} color={theme.colors.text} />
            </Pressable>
          </Row>

          {data && !data.b ? (
            <Card>
              <EmptyState
                icon="pie-chart-outline"
                title={t('budgets.noBudget')}
                message={t('budgets.noBudgetBody')}
                action={
                  <Stack gap={2}>
                    <Button label={t('budgets.create')} icon="add" onPress={() => router.push(`/budgets/edit?month=${month}`)} testID="budget-create" />
                    {data.prev ? <Button label={t('budgets.copyPrevious', { month: monthLabel(data.prev) })} variant="secondary" icon="copy-outline" onPress={copyPrevious} testID="budget-copy" /> : null}
                  </Stack>
                }
              />
            </Card>
          ) : null}

          {e && data ? (
            <>
              <BudgetProgressCard line={e.total} label={t('budgets.total')} currency={data.currency} onPress={() => router.push(`/budgets/edit?month=${month}`)} />
              {data.s.excludedCount > 0 ? (
                <Text variant="caption" tone="muted">
                  {t('budgets.currencyNote', { currency: data.currency })}
                </Text>
              ) : null}
              {e.categories.length ? <SectionHeader title={t('budgets.byCategory')} /> : null}
              {e.categories.map((line) => (
                <BudgetProgressCard key={line.scope} line={line} label={catName(data.categories.get(line.scope))} category={data.categories.get(line.scope)} currency={data.currency} />
              ))}
              {e.categories.length ? (
                <Card>
                  <Text variant="subheading">{t('budgets.vsActual')}</Text>
                  <SpendingChart
                    data={e.categories.slice(0, 8).map((l) => ({ key: l.scope, label: catName(data.categories.get(l.scope)).slice(0, 6), value: l.spent, value2: l.limit }))}
                    series={['spending', 'budget']}
                    currency={data.currency}
                    height={110}
                  />
                </Card>
              ) : null}
            </>
          ) : null}

          {data && data.unbudgeted.length > 0 ? (
            <>
              <SectionHeader title={t('budgets.unbudgeted')} />
              <Card>
                {data.unbudgeted.slice(0, 6).map((c) => (
                  <CategoryCard key={c.categoryId} category={data.categories.get(c.categoryId)} label={catName(data.categories.get(c.categoryId))} amount={c.amount} currency={data.currency} />
                ))}
              </Card>
            </>
          ) : null}

          {data && data.months.length > 0 ? (
            <>
              <SectionHeader title={t('budgets.history')} />
              <Text variant="caption" tone="muted">
                {t('budgets.historyHint')}
              </Text>
              <Row gap={2} wrap>
                {data.months.slice(0, 12).map((m) => (
                  <Button key={m} label={monthLabel(m)} size="md" variant={m === month ? 'primary' : 'secondary'} onPress={() => setMonth(m)} />
                ))}
              </Row>
            </>
          ) : null}
          <View style={{ height: 8 }} />
          {data?.b ? (
            <Text variant="caption" tone="subtle">
              {money(data.s.spending, data.currency)} · {t('home.spending')}
            </Text>
          ) : null}
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
