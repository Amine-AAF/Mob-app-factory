import { Card, Icon, ProgressBar, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import type { BudgetCategory } from '@/constants/domain';
import type { BudgetOverview as Overview } from '@/features/budget/insights';
import { fmt } from '@/i18n';

export const BUDGET_ICON: Record<BudgetCategory, IconName> = {
  transport: 'bus-outline',
  accommodation: 'bed-outline',
  food: 'restaurant-outline',
  activities: 'ticket-outline',
  shopping: 'bag-handle-outline',
  misc: 'ellipsis-horizontal-circle-outline',
};

/** Planned vs recorded spending, total and per category. */
export function BudgetOverview({ overview, currency }: { overview: Overview; currency: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const over = overview.remainingMinor !== null && overview.remainingMinor < 0;
  return (
    <Stack gap={3}>
      <Card tone="primary" testID="budget-total">
        <Text variant="label">{t('budget.spentTotal')}</Text>
        <Text variant="title">{fmt.money(overview.spentMinor, currency)}</Text>
        {overview.totalPlannedMinor !== null ? (
          <>
            <Text variant="bodySmall" tone="muted">
              {t('budget.ofPlanned', { planned: fmt.money(overview.totalPlannedMinor, currency), percent: fmt.percent(overview.ratio ?? 0) })}
            </Text>
            <ProgressBar progress={overview.ratio ?? 0} tone={over ? 'accent' : 'primary'} label={t('budget.spentTotal')} />
            <Text variant="subheading" tone={over ? 'danger' : 'success'}>
              {over ? t('budget.over', { amount: fmt.money(-overview.remainingMinor!, currency) }) : t('budget.remaining', { amount: fmt.money(overview.remainingMinor ?? 0, currency) })}
            </Text>
          </>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('budget.noPlan')}
          </Text>
        )}
      </Card>
      <Card>
        {overview.categories.map((c) => (
          <Stack key={c.category} gap={1} testID={`budget-cat-${c.category}`}>
            <Row gap={2} style={{ justifyContent: 'space-between' }}>
              <Row gap={2} style={{ flex: 1 }}>
                <Icon name={BUDGET_ICON[c.category]} size={16} color={theme.colors.primary} />
                <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
                  {t(`enums.budgetCategory.${c.category}`)}
                </Text>
              </Row>
              <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                {c.plannedMinor !== null ? `${fmt.money(c.spentMinor, currency)} / ${fmt.money(c.plannedMinor, currency)}` : fmt.money(c.spentMinor, currency)}
              </Text>
            </Row>
            {c.ratio !== null ? <ProgressBar progress={c.ratio} height={6} tone={c.ratio > 1 ? 'accent' : 'primary'} label={t(`enums.budgetCategory.${c.category}`)} /> : null}
          </Stack>
        ))}
      </Card>
    </Stack>
  );
}
