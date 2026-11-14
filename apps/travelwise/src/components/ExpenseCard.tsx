import { Badge, Icon, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { ExpenseWithShares } from '@/database/repositories/expenses';
import { fmt } from '@/i18n';

import { BUDGET_ICON } from './BudgetOverview';

export function ExpenseCard({ expense, tripCurrency, payerName, onPress }: { expense: ExpenseWithShares; tripCurrency: string; payerName?: string; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const foreign = expense.currency !== tripCurrency;
  const title = expense.description || t(`enums.budgetCategory.${expense.category}`);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${fmt.money(expense.amountMinor, expense.currency)}`}
      testID={`expense-${expense.id}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: theme.spacing(3),
        alignItems: 'center',
        padding: theme.spacing(3),
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={BUDGET_ICON[expense.category]} size={20} color={theme.colors.primary} />
      <Stack gap={0.5} style={{ flex: 1 }}>
        <Text variant="subheading" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {[fmt.shortDate(expense.date), expense.city, payerName ? t('expenses.paidBy', { name: payerName }) : null].filter(Boolean).join(' · ')}
        </Text>
        {expense.shares.length ? <Badge label={t('expenses.sharedBetween', { count: expense.shares.length })} tone="neutral" icon="people-outline" /> : null}
      </Stack>
      <Stack gap={0} style={{ alignItems: 'flex-end' }}>
        <Text variant="subheading">{fmt.money(expense.amountMinor, expense.currency)}</Text>
        {foreign ? (
          <Text variant="caption" tone="muted">
            {`≈ ${fmt.money(expense.tripAmountMinor, tripCurrency)}`}
          </Text>
        ) : null}
      </Stack>
    </Pressable>
  );
}
