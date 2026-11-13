import { Button, OptionCard, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DateField } from '@/components/forms';
import { Field, Page, Paper } from '@/components/ui';
import { repos } from '@/database';
import { DEFAULT_TARGETS, goalPeriod, validateGoalTarget } from '@/features/goals/goals';
import { useAction, useToday } from '@/hooks';
import { createGoal, updateGoal } from '@/services/goalService';
import { useIsPremium } from '@/store/session';
import { GOAL_TYPES, type GoalType } from '@/types';

export default function EditGoal() {
  const { t } = useTranslation();
  const today = useToday();
  const run = useAction(t);
  const premium = useIsPremium();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [type, setType] = useState<GoalType>('books_per_year');
  const [target, setTarget] = useState(String(DEFAULT_TARGETS.books_per_year));
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [end, setEnd] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    repos()
      .organize.goal(id)
      .then((g) => {
        if (!g) return;
        setType(g.type);
        setTarget(String(g.target));
        setTitle(g.title ?? '');
        setUnit(g.unit ?? '');
        setEnd(g.periodEnd ?? '');
        setChallengeId(g.challengeId);
      });
  }, [id]);

  const n = Number(target);
  const valid = validateGoalTarget(type, n);

  const save = () =>
    run(async () => {
      const period = goalPeriod({ type, periodStart: today, periodEnd: null }, today);
      const input = { type, target: n, title: title || null, unit: type === 'custom' ? unit || null : null, periodStart: type === 'custom' ? today : period.start, periodEnd: type === 'custom' ? end || null : null, challengeId };
      if (id) await updateGoal(repos(), id, input);
      else await createGoal(repos(), input);
      router.back();
    });

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} size="lg" disabled={!valid} onPress={() => void save()} testID="save-goal" />}>
      {!id ? (
        <View style={{ gap: 8 }}>
          {GOAL_TYPES.map((g) => (
            <OptionCard
              key={g}
              title={t(`goals.typeNames.${g}`)}
              subtitle={g === 'custom' && !premium ? t('premium.badge') : t(`goals.typeHints.${g}`)}
              selected={type === g}
              onPress={() => {
                setType(g);
                setTarget(String(DEFAULT_TARGETS[g]));
              }}
              role="radio"
              testID={`goal-type-${g}`}
            />
          ))}
        </View>
      ) : null}
      <Field label={t('goals.target')} value={target} onChangeText={(v) => setTarget(v.replace(/\D/g, ''))} keyboardType="number-pad" error={target && !valid ? t('errors.goal.invalid_target') : null} hint={t(`goals.targetHints.${type}`)} testID="goal-target" />
      <Field label={t('goals.customTitle')} value={title} onChangeText={setTitle} placeholder={t(`goals.types.${type}`, { count: n || 0 })} />
      {type === 'custom' ? (
        <>
          <Field label={t('goals.unit')} value={unit} onChangeText={setUnit} placeholder={t('goals.unitPlaceholder')} />
          <DateField label={t('goals.endDate')} value={end} onChange={setEnd} today={today} />
        </>
      ) : null}
      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('goals.noPressure')}
        </Text>
      </Paper>
    </Page>
  );
}
