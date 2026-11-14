import { Badge, Card, Icon, PressableScale, ProgressBar, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useMoney } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import type { Account, Category, SavingsGoal, Subscription, Transaction } from '@/types';
import { fromDayKey, type DayKey } from '@/utils/dates';

import type { BudgetLine } from '@/features/budgets/budgets';
import type { GoalProgress } from '@/features/savings-goals/goals';

export function formatDay(day: DayKey, style: 'short' | 'medium' = 'medium'): string {
  return new Intl.DateTimeFormat(currentLanguage(), style === 'short' ? { day: 'numeric', month: 'short' } : { dateStyle: 'medium' }).format(fromDayKey(day));
}

export function IconBubble({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '22' }}>
      <Icon name={icon as IconName} size={size * 0.48} color={color} />
    </View>
  );
}

/* ------------------------------------------------------------------ Privacy */

export function PrivacyToggle() {
  const { t } = useTranslation();
  const theme = useTheme();
  const privacy = usePreferences((s) => s.privacyMode);
  const set = usePreferences((s) => s.set);
  return (
    <Pressable
      onPress={() => set({ privacyMode: !privacy })}
      accessibilityRole="switch"
      accessibilityState={{ checked: privacy }}
      accessibilityLabel={t('privacy.toggle')}
      hitSlop={8}
      testID="privacy-toggle"
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent' })}
    >
      <Icon name={privacy ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.colors.text} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Balance */

export function BalanceCard({ totals, mainCurrency, income, spending, excluded, onPress }: { totals: Record<string, number>; mainCurrency: string; income: number; spending: number; excluded: number; onPress?: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const theme = useTheme();
  const main = totals[mainCurrency];
  const others = Object.entries(totals).filter(([c]) => c !== mainCurrency);
  return (
    <Card tone="primary" onPress={onPress} accessibilityLabel={t('home.balance')} testID="balance-card" style={{ padding: theme.spacing(5), gap: theme.spacing(3) }}>
      <Text variant="label" tone="primary">
        {t('home.balance')}
      </Text>
      <Text variant="display" testID="balance-amount" adjustsFontSizeToFit numberOfLines={1}>
        {main === undefined ? t('home.noAccounts') : money(main, mainCurrency)}
      </Text>
      {others.map(([c, v]) => (
        <Text key={c} variant="bodySmall" tone="muted">
          {t('home.otherCurrency', { amount: money(v, c) })}
        </Text>
      ))}
      <Row gap={4}>
        <View style={{ flex: 1 }}>
          <Row gap={1}>
            <Icon name="arrow-down-circle" size={16} color={theme.colors.success} />
            <Text variant="caption" tone="muted">
              {t('home.income')}
            </Text>
          </Row>
          <Text variant="subheading" tone="success">
            {money(income, mainCurrency)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Row gap={1}>
            <Icon name="arrow-up-circle" size={16} color={theme.colors.danger} />
            <Text variant="caption" tone="muted">
              {t('home.spending')}
            </Text>
          </Row>
          <Text variant="subheading" tone="danger">
            {money(spending, mainCurrency)}
          </Text>
        </View>
      </Row>
      {excluded > 0 ? (
        <Text variant="caption" tone="muted">
          {t('stats.excluded', { count: excluded })}
        </Text>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ Transactions */

const TYPE_ICON: Record<Transaction['type'], string> = {
  expense: 'arrow-up',
  income: 'arrow-down',
  transfer: 'swap-horizontal',
  refund: 'return-down-back',
  adjustment: 'construct-outline',
};

export function TransactionCard({ tx, category, account, toAccount, onPress, categoryLabel }: { tx: Transaction; category?: Category; account?: Account; toAccount?: Account; categoryLabel: string; onPress?: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const theme = useTheme();
  const positive = tx.type === 'income' || tx.type === 'refund' || (tx.type === 'adjustment' && tx.amount > 0);
  const neutral = tx.type === 'transfer';
  const title = tx.description || (tx.type === 'transfer' ? t('tx.transferTitle', { from: account?.name ?? '', to: toAccount?.name ?? '' }) : categoryLabel || t(`tx.types.${tx.type}`));
  const subtitle = [tx.type === 'transfer' ? null : categoryLabel, account?.name, tx.recurringRuleId ? t('tx.recurringTag') : null].filter(Boolean).join(' · ');
  const amount = tx.type === 'adjustment' ? money(tx.amount, tx.currency, { signed: true }) : money(positive ? tx.amount : -tx.amount, tx.currency, { signed: !neutral });
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}, ${amount}, ${formatDay(tx.date)}`} testID={`tx-${tx.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <IconBubble icon={category?.icon ?? TYPE_ICON[tx.type]} color={neutral ? theme.colors.textMuted : (category?.color ?? theme.colors.primary)} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1}>{title}</Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {subtitle || formatDay(tx.date)}
        </Text>
      </View>
      <Stack gap={0} style={{ alignItems: 'flex-end' }}>
        <Text variant="subheading" tone={neutral ? 'default' : positive ? 'success' : 'default'}>
          {amount}
        </Text>
        <Text variant="caption" tone="subtle">
          {formatDay(tx.date, 'short')}
        </Text>
      </Stack>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ Categories */

export function CategoryCard({ category, label, amount, currency, share, onPress }: { category?: Category; label: string; amount: number; currency: string; share?: number; onPress?: () => void }) {
  const money = useMoney();
  const theme = useTheme();
  const color = category?.color ?? theme.colors.textMuted;
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={`${label}, ${money(amount, currency)}`} style={{ gap: 6, paddingVertical: 6 }}>
      <Row gap={3}>
        <IconBubble icon={category?.icon ?? 'help-circle-outline'} color={color} size={34} />
        <Text style={{ flex: 1 }} numberOfLines={1}>
          {label}
        </Text>
        <Text variant="subheading">{money(amount, currency)}</Text>
      </Row>
      {share !== undefined ? (
        <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceAlt, marginLeft: 46 }}>
          <View style={{ width: `${Math.max(2, Math.min(100, share * 100))}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
        </View>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Budgets */

export function budgetTone(line: Pick<BudgetLine, 'reached' | 'over'>): 'success' | 'warning' | 'danger' {
  if (line.over || (line.reached ?? 0) >= 100) return 'danger';
  if ((line.reached ?? 0) >= 75) return 'warning';
  return 'success';
}

export function BudgetProgressCard({ line, label, category, currency, onPress }: { line: BudgetLine; label: string; category?: Category; currency: string; onPress?: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const theme = useTheme();
  const tone = budgetTone(line);
  const color = { success: theme.colors.success, warning: theme.colors.warning, danger: theme.colors.danger }[tone];
  return (
    <Card onPress={onPress} accessibilityLabel={`${label}: ${t('budgets.progressA11y', { pct: line.percent })}`} testID={`budget-${line.scope}`}>
      <Row gap={3}>
        {category ? <IconBubble icon={category.icon} color={category.color} size={34} /> : <IconBubble icon="pie-chart-outline" color={theme.colors.primary} size={34} />}
        <View style={{ flex: 1 }}>
          <Text variant="subheading" numberOfLines={1}>
            {label}
          </Text>
          <Text variant="caption" tone="muted">
            {t('budgets.spentOf', { spent: money(line.spent, currency), limit: money(line.limit, currency) })}
          </Text>
        </View>
        <Badge label={`${line.percent}%`} tone={tone} />
      </Row>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.min(100, line.percent) }}>
        <View style={{ width: `${Math.min(100, line.percent)}%`, height: 8, backgroundColor: color }} />
      </View>
      <Text variant="caption" tone={line.over ? 'danger' : 'muted'}>
        {line.over ? t('budgets.over', { amount: money(-line.remaining, currency) }) : t('budgets.remaining', { amount: money(line.remaining, currency) })}
      </Text>
    </Card>
  );
}

/* ------------------------------------------------------------------ Goals */

export function SavingsGoalCard({ goal, progress, onPress }: { goal: SavingsGoal; progress: GoalProgress; onPress?: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  return (
    <Card onPress={onPress} accessibilityLabel={`${goal.name}, ${progress.percent}%`} testID={`goal-${goal.id}`}>
      <Row gap={3}>
        <IconBubble icon={goal.icon} color={goal.color} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading" numberOfLines={1}>
            {goal.name}
          </Text>
          <Text variant="caption" tone="muted">
            {t('goals.savedOf', { saved: money(progress.saved, goal.currency), target: money(goal.target, goal.currency) })}
          </Text>
        </View>
        {progress.reached ? <Badge label={t('goals.reached')} tone="success" icon="trophy-outline" /> : <Badge label={`${progress.percent}%`} tone="primary" />}
      </Row>
      <ProgressBar progress={progress.ratio} tone="success" label={`${progress.percent}%`} />
      {progress.recommendedMonthly && progress.recommendedMonthly > 0 ? (
        <Text variant="caption" tone="muted">
          {t('goals.perMonth', { amount: money(progress.recommendedMonthly, goal.currency), count: progress.monthsLeft ?? 1 })}
        </Text>
      ) : progress.overdue ? (
        <Text variant="caption" tone="warning">
          {t('goals.overdue')}
        </Text>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ Subscriptions */

export function SubscriptionCard({ sub, next, monthly, onPress }: { sub: Subscription; next: DayKey | null; monthly: number; onPress?: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const theme = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={sub.name} testID={`sub-${sub.id}`} style={!sub.active ? { opacity: 0.6 } : undefined}>
      <Row gap={3}>
        <IconBubble icon={SUB_ICONS[sub.kind]} color={theme.colors.accent} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading" numberOfLines={1}>
            {sub.name}
          </Text>
          <Text variant="caption" tone="muted">
            {sub.active ? (next ? t('subs.next', { date: formatDay(next) }) : t('subs.ended')) : t('subs.inactive')}
          </Text>
        </View>
        <Stack gap={0} style={{ alignItems: 'flex-end' }}>
          <Text variant="subheading">{money(sub.price, sub.currency)}</Text>
          <Text variant="caption" tone="subtle">
            {t(`freq.${sub.frequency}`, { count: sub.interval })}
          </Text>
        </Stack>
      </Row>
      {sub.frequency !== 'monthly' || sub.interval !== 1 ? (
        <Text variant="caption" tone="muted">
          {t('subs.perMonthEq', { amount: money(monthly, sub.currency) })}
        </Text>
      ) : null}
    </Card>
  );
}

export const SUB_ICONS: Record<Subscription['kind'], string> = {
  streaming: 'tv-outline',
  software: 'code-slash-outline',
  cloud: 'cloud-outline',
  mobile: 'phone-portrait-outline',
  internet: 'wifi-outline',
  gym: 'barbell-outline',
  other: 'repeat-outline',
};
