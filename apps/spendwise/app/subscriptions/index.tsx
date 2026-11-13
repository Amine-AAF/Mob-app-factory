import { Badge, Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDay, SubscriptionCard } from '@/components/finance';
import { UPCOMING_DAYS } from '@/constants';
import { useData, useMoney } from '@/hooks';
import { monthlyCostOf, monthlyEstimate, nextBillingDate, upcomingBillings, yearlyEstimate } from '@/features/subscriptions/estimates';
import { clock } from '@/services/clock';

export default function SubscriptionsScreen() {
  const { t } = useTranslation();
  const money = useMoney();
  const today = clock.today();
  const { data, error, reload } = useData(async (r) => {
    const subs = await r.subscriptions.list();
    return {
      subs,
      monthly: monthlyEstimate(subs),
      yearly: yearlyEstimate(subs),
      upcoming: upcomingBillings(subs, today, UPCOMING_DAYS),
    };
  }, [today]);

  const currencies = Object.keys(data?.monthly ?? {});
  const activeCount = data?.subs.filter((s) => s.active).length ?? 0;

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('subs.title') }} />
      {error ? (
        <Card>
          <Text>{t('common.loadError')}</Text>
          <Button label={t('common.retry')} variant="secondary" size="md" onPress={reload} />
        </Card>
      ) : null}

      <Card tone="primary" testID="subs-totals">
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="label" tone="primary">
            {t('subs.totals')}
          </Text>
          <Badge label={t('common.estimate')} tone="neutral" />
        </Row>
        {currencies.length === 0 ? (
          <Text tone="muted">{t('subs.noActive')}</Text>
        ) : (
          currencies.map((c) => (
            <Row key={c} gap={4}>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="muted">
                  {t('subs.monthly')}
                </Text>
                <Text variant="heading">{money(data?.monthly[c] ?? 0, c)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="muted">
                  {t('subs.yearly')}
                </Text>
                <Text variant="heading">{money(data?.yearly[c] ?? 0, c)}</Text>
              </View>
            </Row>
          ))
        )}
        <Text variant="caption" tone="muted">
          {t('subs.activeCount', { count: activeCount })}
        </Text>
      </Card>
      <Text variant="caption" tone="muted">
        {t('subs.notPayments')}
      </Text>

      <Button label={t('subs.new')} icon="add" onPress={() => router.push('/subscriptions/edit')} testID="subs-add" />

      {data && data.upcoming.length > 0 ? (
        <Stack gap={2}>
          <SectionHeader title={t('subs.upcoming')} />
          <Card tone="alt">
            {data.upcoming.map(({ sub, date }) => (
              <Row key={sub.id} gap={3} style={{ paddingVertical: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{sub.name}</Text>
                  <Text variant="caption" tone="muted">
                    {formatDay(date)}
                  </Text>
                </View>
                <Text tone="muted">{money(sub.price, sub.currency)}</Text>
              </Row>
            ))}
          </Card>
        </Stack>
      ) : null}

      <SectionHeader title={t('subs.list')} />
      {data && data.subs.length === 0 ? <EmptyState icon="repeat-outline" title={t('subs.empty')} message={t('subs.emptyBody')} /> : null}
      {data?.subs.map((sub) => (
        <SubscriptionCard key={sub.id} sub={sub} next={nextBillingDate(sub, today)} monthly={monthlyCostOf(sub)} onPress={() => router.push(`/subscriptions/edit?id=${sub.id}`)} />
      ))}
    </Screen>
  );
}
