import { Card, EmptyState, ProgressBar, Row, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTripsOverview } from '@/features/trips/useTrips';
import { fmt } from '@/i18n';
import { budgetRatio } from '@/utils/money';

/** Cross-trip budget overview, from recorded expenses only (Phase 4 adds expense entry). */
export default function BudgetScreen() {
  const { t } = useTranslation();
  const { data } = useTripsOverview();
  const trips = data ? [...data.buckets.ongoing, ...data.buckets.upcoming, ...data.buckets.completed] : [];

  return (
    <Screen testID="budget-screen">
      <Text variant="title" accessibilityRole="header">
        {t('budgetTab.title')}
      </Text>
      {data && trips.length === 0 ? <EmptyState icon="wallet-outline" title={t('budgetTab.empty')} /> : null}
      <Stack gap={3}>
        {trips.map((trip) => {
          const spent = data!.summaries.get(trip.id)?.spentMinor ?? 0;
          const ratio = budgetRatio(spent, trip.budgetMinor);
          return (
            <Card key={trip.id} onPress={() => router.push({ pathname: '/trip/[id]/budget', params: { id: trip.id } })} accessibilityLabel={t('a11y.openTrip', { name: trip.name })}>
              <Text variant="subheading" numberOfLines={1}>
                {trip.name}
              </Text>
              <Row style={{ justifyContent: 'space-between' }} wrap>
                <Text variant="bodySmall">{t('budgetTab.spent', { amount: fmt.money(spent, trip.currency) })}</Text>
                <Text variant="bodySmall" tone="muted">
                  {trip.budgetMinor !== null ? t('budgetTab.planned', { amount: fmt.money(trip.budgetMinor, trip.currency) }) : t('tripDetail.noBudget')}
                </Text>
              </Row>
              {ratio !== null ? <ProgressBar progress={ratio} tone={ratio > 1 ? 'accent' : 'primary'} label={t('tripDetail.budgetSpent')} /> : null}
            </Card>
          );
        })}
      </Stack>
    </Screen>
  );
}
