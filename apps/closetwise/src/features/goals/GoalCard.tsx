import { useTranslation } from 'react-i18next';

import { templateFor, type GoalProgress } from '@/domain/goals';
import type { WardrobeGoal } from '@/domain/types';
import { fmt } from '@/i18n';
import { Badge, Button, Card, ProgressBar, Row, Stack, Text } from '@/ui/components';

import { formatGoalValue, goalCopy, goalProgressTone } from './goalCopy';

export const goalTitle = (goal: Pick<WardrobeGoal, 'title' | 'kind'>, t: (k: string) => string) => goal.title?.trim() || t(`catalog.goal.${goal.kind}`);

/** Active goal: progress, encouraging copy, days left and actions. */
export function GoalCard({ goal, progress, currency, onEdit, onComplete, onStop }: { goal: WardrobeGoal; progress: GoalProgress; currency: string; onEdit: () => void; onComplete: () => void; onStop: () => void }) {
  const { t } = useTranslation();
  const money = (n: number) => fmt.money(n, currency);
  const title = goalTitle(goal, t);
  const challenge = templateFor(goal.kind).challenge;
  const value = formatGoalValue(goal.kind, progress.value, money);
  const target = formatGoalValue(goal.kind, progress.target, money);
  return (
    <Card onPress={onEdit} accessibilityLabel={title}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="label" tone="accent">
            {challenge ? t('goals.challenge') : t('goals.goal')}
          </Text>
          <Text variant="title">{title}</Text>
        </Stack>
        {progress.done ? <Badge label={t('goals.achieved')} tone="success" icon="checkmark-circle" /> : null}
      </Row>
      <ProgressBar progress={progress.ratio} tone={goalProgressTone(goal.kind, progress)} height={8} label={t('goals.progressA11y', { value, target })} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('goals.valueOfTarget', { value, target })}
        </Text>
        <Text variant="caption" tone="subtle">
          {progress.daysLeft == null ? t('goals.ongoing') : progress.daysLeft === 0 ? t('goals.lastDay') : t('goals.daysLeft', { count: progress.daysLeft })}
        </Text>
      </Row>
      <Text tone="muted">{goalCopy(goal.kind, progress, t, money)}</Text>
      <Row gap={2} wrap>
        <Button small icon="checkmark" label={t('goals.complete')} onPress={onComplete} variant={progress.done ? 'primary' : 'secondary'} />
        <Button small variant="ghost" label={t('goals.stop')} onPress={onStop} />
      </Row>
    </Card>
  );
}
