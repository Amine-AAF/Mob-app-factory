import { router, Stack as RouterStack } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { confirmDelete } from '@/components/forms';
import { repos } from '@/database';
import { GOAL_TEMPLATES, goalProgress, type GoalData } from '@/domain/goals';
import type { WardrobeGoal } from '@/domain/types';
import { GoalCard, goalTitle } from '@/features/goals/GoalCard';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { clock } from '@/services/clock';
import { useSettings } from '@/store/session';
import { Badge, Card, Divider, EmptyState, FadeIn, IconButton, ListRow, Loading, Row, Screen, SectionHeader, Stack, Text } from '@/ui/components';

export default function GoalsScreen() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { data } = useAsync(async () => {
    const r = repos();
    const [goals, items, outfits, usage, shopping] = await Promise.all([r.goals.list(), r.wardrobe.list({ archived: 'all' }), r.outfits.list(), r.usage.list(), r.shopping.list()]);
    return { goals, items, outfits, usage, shopping };
  }, []);

  const view = useMemo(() => {
    if (!data) return null;
    const goalData: GoalData = { items: data.items, outfits: data.outfits, usage: data.usage, shopping: data.shopping, budgetCurrency: settings.currency, today: clock.today() };
    return {
      active: data.goals.filter((g) => g.status === 'active').map((g) => ({ goal: g, progress: goalProgress(g, goalData) })),
      history: data.goals.filter((g) => g.status !== 'active'),
    };
  }, [data, settings.currency]);

  const setStatus = async (goal: WardrobeGoal, status: WardrobeGoal['status']) => {
    try {
      await repos().goals.setStatus(goal.id, status);
      afterWrite({ notifications: true });
    } catch (e) {
      recordError(e, 'goal_status');
      Alert.alert(t('common.error'));
    }
  };

  const stop = (goal: WardrobeGoal) =>
    Alert.alert(t('goals.stopTitle'), t('goals.stopMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('goals.stop'), onPress: () => void setStatus(goal, 'stopped') },
    ]);

  const remove = (goal: WardrobeGoal) =>
    confirmDelete(t, async () => {
      try {
        await repos().goals.remove(goal.id);
        afterWrite({ notifications: true });
      } catch (e) {
        recordError(e, 'goal_delete');
      }
    });

  const templates = (challenge: boolean) =>
    GOAL_TEMPLATES.filter((g) => g.challenge === challenge).map((g, i) => (
      <Stack key={g.kind} gap={0}>
        {i > 0 ? <Divider /> : null}
        <ListRow
          icon={challenge ? 'flame-outline' : 'flag-outline'}
          title={t(`catalog.goal.${g.kind}`)}
          subtitle={t(`goals.templateDesc.${g.kind}`)}
          onPress={() => router.push({ pathname: '/goals/edit', params: { kind: g.kind } })}
        />
      </Stack>
    ));

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('goals.title') }} />
      <Text tone="muted">{t('goals.intro')}</Text>
      {!view ? (
        <Loading />
      ) : (
        <>
          <SectionHeader title={t('goals.activeTitle')} />
          {view.active.length === 0 ? (
            <EmptyState icon="flag-outline" title={t('goals.empty.title')} message={t('goals.empty.message')} />
          ) : (
            view.active.map(({ goal, progress }, i) => (
              <FadeIn key={goal.id} delay={i * 40}>
                <GoalCard
                  goal={goal}
                  progress={progress}
                  currency={settings.currency}
                  onEdit={() => router.push({ pathname: '/goals/edit', params: { id: goal.id } })}
                  onComplete={() => void setStatus(goal, 'completed')}
                  onStop={() => stop(goal)}
                />
              </FadeIn>
            ))
          )}

          <SectionHeader title={t('goals.newTitle')} />
          <Text variant="caption" tone="subtle">
            {t('goals.goalsSection')}
          </Text>
          <Card style={{ paddingVertical: 0 }}>{templates(false)}</Card>
          <Text variant="caption" tone="subtle">
            {t('goals.challengesSection')}
          </Text>
          <Card style={{ paddingVertical: 0 }}>{templates(true)}</Card>

          {view.history.length > 0 ? (
            <>
              <SectionHeader title={t('goals.historyTitle')} />
              <Card style={{ paddingVertical: 0 }}>
                {view.history.map((g, i) => (
                  <Stack key={g.id} gap={0}>
                    {i > 0 ? <Divider /> : null}
                    <ListRow
                      title={goalTitle(g, t)}
                      subtitle={`${fmt.day(g.startDate)}${g.endDate ? ` – ${fmt.day(g.endDate)}` : ''}`}
                      right={
                        <Row gap={1}>
                          <Badge label={g.status === 'completed' ? t('goals.statusCompleted') : t('goals.statusStopped')} tone={g.status === 'completed' ? 'success' : 'neutral'} />
                          <IconButton icon="refresh" label={t('goals.restart')} onPress={() => void setStatus(g, 'active')} size={18} />
                          <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => remove(g)} size={18} tone="danger" />
                        </Row>
                      }
                    />
                  </Stack>
                ))}
              </Card>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
