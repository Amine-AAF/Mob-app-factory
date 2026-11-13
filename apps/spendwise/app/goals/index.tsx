import { Button, Card, EmptyState, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SavingsGoalCard } from '@/components/finance';
import { SwitchRow } from '@/components/inputs';
import { FREE_LIMITS } from '@/constants';
import { useData } from '@/hooks';
import { goalProgress } from '@/features/savings-goals/goals';
import { clock } from '@/services/clock';
import { canAdd } from '@/services/premium';
import { useIsPremium } from '@/store/session';

export default function GoalsScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const today = clock.today();
  const [showArchived, setShowArchived] = useState(false);
  const { data, error, reload } = useData(async (r) => {
    const goals = await r.goals.list({ includeArchived: showArchived });
    const items = await Promise.all(goals.map(async (g) => ({ goal: g, progress: goalProgress(g.target, await r.goals.contributions(g.id), g.targetDate, today) })));
    return { items, activeCount: await r.goals.count() };
  }, [showArchived, today]);

  const add = () => {
    if (!canAdd('savingsGoals', data?.activeCount ?? 0, isPremium)) router.push('/paywall?source=goals');
    else router.push('/goals/edit');
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('goals.title') }} />
      <Text tone="muted">{t('goals.intro')}</Text>
      <Button label={t('goals.new')} icon="add" onPress={add} testID="goal-add" />
      {!isPremium ? (
        <Text variant="caption" tone="muted">
          {t('goals.freeLimit', { count: FREE_LIMITS.savingsGoals })}
        </Text>
      ) : null}
      {error ? (
        <Card>
          <Text>{t('common.loadError')}</Text>
          <Button label={t('common.retry')} variant="secondary" size="md" onPress={reload} />
        </Card>
      ) : null}
      {data && data.items.length === 0 ? <EmptyState icon="flag-outline" title={t('goals.empty')} message={t('goals.emptyBody')} /> : null}
      {data?.items.map(({ goal, progress }) => (
        <SavingsGoalCard key={goal.id} goal={goal} progress={progress} onPress={() => router.push(`/goals/${goal.id}`)} />
      ))}
      <SwitchRow label={t('goals.showArchived')} value={showArchived} onChange={setShowArchived} />
    </Screen>
  );
}
