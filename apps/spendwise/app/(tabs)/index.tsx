import { Button, Card, EmptyState, FadeIn, Icon, Row, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard, budgetTone, CategoryCard, formatDay, PrivacyToggle, SavingsGoalCard, TransactionCard } from '@/components/finance';
import { loadDashboard } from '@/features/dashboard/loadDashboard';
import { useCategoryName, useData, useMoney } from '@/hooks';
import { clock } from '@/services/clock';
import { useMainCurrency } from '@/store/session';

function QuickAction({ icon, label, onPress, testID }: { icon: IconName; label: string; onPress: () => void; testID: string }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <View style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
        <Icon name={icon} size={22} color={theme.colors.primary} />
      </View>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const money = useMoney();
  const catName = useCategoryName();
  const main = useMainCurrency();
  const today = clock.today();
  const { data, error, reload } = useData((r) => loadDashboard(r, today, main), [today, main]);

  if (error && !data)
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
        <EmptyState icon="alert-circle-outline" title={t('common.loadError')} action={<Button label={t('common.retry')} onPress={reload} />} />
      </View>
    );
  if (!data) return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;

  const accountById = new Map(data.accounts.map((a) => [a.id, a]));
  const budget = data.budget;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: theme.spacing(2), paddingHorizontal: theme.spacing(5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('home.greeting')}
        </Text>
        <PrivacyToggle />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollBody>
          <FadeIn>
            <BalanceCard totals={data.totals} mainCurrency={main} income={data.month.income} spending={data.month.spending} excluded={data.month.excludedCount} onPress={() => router.push('/accounts')} />
          </FadeIn>

          <Row gap={2}>
            <QuickAction icon="remove-circle-outline" label={t('home.quick.expense')} onPress={() => router.push('/transaction?type=expense')} testID="quick-expense" />
            <QuickAction icon="add-circle-outline" label={t('home.quick.income')} onPress={() => router.push('/transaction?type=income')} testID="quick-income" />
            <QuickAction icon="swap-horizontal-outline" label={t('home.quick.transfer')} onPress={() => router.push('/transaction?type=transfer')} testID="quick-transfer" />
            <QuickAction icon="pie-chart-outline" label={t('home.quick.budget')} onPress={() => router.push('/budgets/edit')} testID="quick-budget" />
            <QuickAction icon="flag-outline" label={t('home.quick.goal')} onPress={() => router.push('/goals/edit')} testID="quick-goal" />
          </Row>

          {!data.hasAccounts ? (
            <Card tone="accent">
              <Text variant="subheading">{t('home.addFirstAccount')}</Text>
              <Text tone="muted">{t('home.addFirstAccountBody')}</Text>
              <Button label={t('accounts.new')} icon="add" size="md" onPress={() => router.push('/accounts/edit')} />
            </Card>
          ) : null}

          {data.pending.length > 0 ? (
            <Card tone="accent" onPress={() => router.push('/recurring')} accessibilityLabel={t('home.pendingTitle')} testID="pending-card">
              <Row gap={3}>
                <Icon name="time-outline" size={22} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{t('home.pendingTitle')}</Text>
                  <Text tone="muted">{t('home.pendingBody', { count: data.pending.length })}</Text>
                </View>
              </Row>
            </Card>
          ) : null}

          {data.alerts.length > 0 ? (
            <Card style={{ borderColor: theme.colors.warning }} testID="alerts-card">
              <Row gap={2}>
                <Icon name="warning-outline" size={20} color={theme.colors.warning} />
                <Text variant="subheading">{t('home.alerts')}</Text>
              </Row>
              {data.alerts.slice(0, 3).map((a) => (
                <Text key={a.scope} tone={budgetTone(a) === 'danger' ? 'danger' : 'warning'}>
                  {t('home.alertLine', { name: a.scope === 'total' ? t('budgets.total') : catName(data.categories.get(a.scope)), pct: a.percent })}
                </Text>
              ))}
            </Card>
          ) : null}

          <Card onPress={() => router.push('/(tabs)/budgets')} accessibilityLabel={t('home.budgetLeft')} testID="budget-summary">
            {budget && budget.total.limit > 0 ? (
              <>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="label" tone="muted">
                    {t('home.budgetLeft')}
                  </Text>
                  <Text variant="caption" tone={budgetTone(budget.total)}>
                    {t('home.budgetUsed', { pct: budget.total.percent })}
                  </Text>
                </Row>
                <Text variant="title" tone={budget.total.over ? 'danger' : 'default'}>
                  {money(budget.total.remaining, budget.currency)}
                </Text>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, budget.total.percent)}%`, height: 8, backgroundColor: theme.colors[budgetTone(budget.total)] }} />
                </View>
              </>
            ) : (
              <Row style={{ justifyContent: 'space-between' }}>
                <Text tone="muted">{t('home.noBudget')}</Text>
                <Text tone="primary" style={{ fontWeight: '700' }}>
                  {t('home.createBudget')}
                </Text>
              </Row>
            )}
          </Card>

          <SectionHeader title={t('home.recent')} action={data.recent.length ? t('common.seeAll') : undefined} onAction={() => router.push('/(tabs)/transactions')} />
          {data.recent.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title={t('home.noTransactions')}
              message={t('home.noTransactionsBody')}
              action={data.hasAccounts ? <Button label={t('tx.newExpense')} icon="add" size="md" onPress={() => router.push('/transaction?type=expense')} /> : undefined}
            />
          ) : (
            <Card style={{ paddingVertical: theme.spacing(1) }}>
              {data.recent.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  category={tx.categoryId ? data.categories.get(tx.categoryId) : undefined}
                  categoryLabel={tx.categoryId ? catName(data.categories.get(tx.categoryId)) : ''}
                  account={accountById.get(tx.accountId)}
                  toAccount={tx.toAccountId ? accountById.get(tx.toAccountId) : undefined}
                  onPress={() => router.push(`/transaction?id=${tx.id}`)}
                />
              ))}
            </Card>
          )}

          {data.topCategories.length > 0 ? (
            <>
              <SectionHeader title={t('home.topCategories')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/reports')} />
              <Card>
                {data.topCategories.map((c) => (
                  <CategoryCard key={c.categoryId} category={data.categories.get(c.categoryId)} label={catName(data.categories.get(c.categoryId))} amount={c.amount} currency={main} share={data.month.spending > 0 ? c.amount / data.month.spending : 0} />
                ))}
              </Card>
            </>
          ) : null}

          {data.upcoming.length > 0 ? (
            <>
              <SectionHeader title={t('home.upcoming')} />
              <Card>
                {data.upcoming.map((u, i) => (
                  <Row key={`${u.kind}-${u.date}-${i}`} style={{ justifyContent: 'space-between', minHeight: 36 }}>
                    <Row gap={2} style={{ flex: 1 }}>
                      <Icon name={u.kind === 'subscription' ? 'repeat-outline' : 'calendar-outline'} size={16} color={theme.colors.textMuted} />
                      <Text numberOfLines={1} style={{ flex: 1 }}>
                        {u.name || t('tx.recurringTag')}
                      </Text>
                    </Row>
                    <Text variant="bodySmall" tone="muted">
                      {formatDay(u.date, 'short')} · {money(Math.abs(u.amount), u.currency)}
                    </Text>
                  </Row>
                ))}
                <Text variant="caption" tone="subtle">
                  {t('home.upcomingHint')}
                </Text>
              </Card>
            </>
          ) : null}

          {data.goals.length > 0 ? (
            <>
              <SectionHeader title={t('home.goals')} action={t('common.seeAll')} onAction={() => router.push('/goals')} />
              {data.goals.map((g) => (
                <SavingsGoalCard key={g.goal.id} goal={g.goal} progress={g.progress} onPress={() => router.push(`/goals/${g.goal.id}`)} />
              ))}
            </>
          ) : null}
        </ScrollBody>
      </View>
    </SafeAreaView>
  );
}

/** The header (title + privacy toggle) stays fixed while the body scrolls. */
function ScrollBody({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing(5), paddingTop: theme.spacing(2), paddingBottom: theme.spacing(10) }}>
      <Stack gap={4}>{children}</Stack>
    </ScrollView>
  );
}
