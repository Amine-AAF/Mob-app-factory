import { Badge, Button, Card, Chip, EmptyState, IconButton, ProgressBar, Row, Screen, SectionHeader, Stack as UIStack, Text, useTheme } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { InfoNote, PremiumBadge, Stepper } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { BADGES, CHALLENGES, challengeProgress, GOAL_NEEDS_EXERCISE, goalProgress } from '@/features/goals/goals';
import { useData, useExercises, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { evaluateAchievements, goalContext, loadProgress, recordDays } from '@/services/progressService';
import { syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';
import { GOAL_KINDS, type GoalKind } from '@/types';
import { displayToKg, kgToDisplay, roundDisplay } from '@/features/units';

const DEFAULT_TARGET: Record<GoalKind, number> = { weekly_sessions: 3, weekly_minutes: 120, exercise_reps: 10, exercise_weight: 50, consistency_weeks: 4, weekly_cardio_km: 10, weekly_cardio_minutes: 60 };

/** Goals (positive, editable), challenges (rest days always allowed) and badges. */
export default function Goals() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const weeklyTarget = usePreferences((s) => s.weeklyTarget);
  const ex = useExercises();
  const f = useFormat();
  const { data } = useData(async (r) => ({ progress: await loadProgress(r, { premium: true }), goals: await r.goals.list(), runs: await r.goals.challenges(), badges: await r.goals.achievements() }), [today]);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<GoalKind>('weekly_sessions');
  const [target, setTarget] = useState<number>(DEFAULT_TARGET.weekly_sessions);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const { data: recentIds } = useData((r) => r.exercises.recentIds(10));
  if (!data) return null;
  const ctx = goalContext(data.progress);
  const rDays = recordDays(data.progress.records);
  const activeGoals = data.goals.filter((g) => g.active);
  const r = repos();
  const bump = () => useSession.getState().bump();

  const saveGoal = async () => {
    if (!premium && activeGoals.length >= FREE_LIMITS.activeGoals) return router.push({ pathname: '/paywall', params: { source: 'goals' } });
    if (GOAL_NEEDS_EXERCISE[kind] && !exerciseId) return Alert.alert(t('goals.pickExercise'));
    const value = kind === 'exercise_weight' ? displayToKg(target, f.units.weight) : target;
    await r.goals.add({ kind, target: value, exerciseId: GOAL_NEEDS_EXERCISE[kind] ? exerciseId : null, startDay: clock.today(), endDay: null });
    setAdding(false);
    await evaluateAchievements(r);
    void syncNotifications(r, i18n.t);
    bump();
  };

  const startChallenge = async (id: string, isPremium: boolean) => {
    if (isPremium && !premium) return router.push({ pathname: '/paywall', params: { source: 'challenges' } });
    await r.goals.startChallenge(id, clock.today());
    track('challenge_started', { challenge_id: id });
    void syncNotifications(r, i18n.t);
    bump();
  };

  const goalValue = (k: GoalKind, v: number) => (k === 'exercise_weight' ? f.weight(v) : k === 'weekly_cardio_km' ? `${fmt.number(v)} ${t('units.km')}` : fmt.number(v));

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('goals.title') }} />
      <InfoNote text={t('goals.principle')} icon="heart-outline" />

      <SectionHeader title={t('goals.myGoals')} action={adding ? undefined : t('goals.add')} onAction={() => setAdding(true)} />
      {adding ? (
        <Card>
          <Row wrap gap={2}>
            {GOAL_KINDS.map((k) => (
              <Chip key={k} label={t(`goalKinds.short.${k}`)} selected={kind === k} onPress={() => { setKind(k); setTarget(k === 'exercise_weight' ? roundDisplay(kgToDisplay(DEFAULT_TARGET[k], f.units.weight), 0) : DEFAULT_TARGET[k]); }} />
            ))}
          </Row>
          {GOAL_NEEDS_EXERCISE[kind] ? (
            <UIStack gap={2}>
              <Text variant="label" tone="muted">{t('goals.exercise')}</Text>
              <Row wrap gap={2}>
                {(recentIds?.length ? recentIds : ['push-up', 'bodyweight-squat', 'barbell-bench-press', 'back-squat', 'deadlift', 'pull-up'])
                  .map((id) => ex.byId.get(id))
                  .filter((e) => !!e && (kind === 'exercise_reps' ? e.tracking !== 'time' && e.tracking !== 'distance_time' : e.tracking === 'weight_reps'))
                  .map((e) => <Chip key={e!.id} label={e!.name} selected={exerciseId === e!.id} onPress={() => setExerciseId(e!.id)} />)}
              </Row>
            </UIStack>
          ) : null}
          <Stepper label={t('goals.target')} value={target} min={1} max={10000} step={kind === 'weekly_minutes' || kind === 'weekly_cardio_minutes' ? 15 : kind === 'exercise_weight' ? 2.5 : 1} decimals={kind === 'exercise_weight' || kind === 'weekly_cardio_km' ? 1 : 0} unit={kind === 'exercise_weight' ? t(`units.${f.units.weight}`) : undefined} onChange={(v) => setTarget(v ?? 1)} />
          <Row>
            <View style={{ flex: 1 }}><Button label={t('common.save')} size="md" onPress={() => void saveGoal()} testID="save-goal" /></View>
            <Button label={t('common.cancel')} size="md" variant="ghost" onPress={() => setAdding(false)} />
          </Row>
        </Card>
      ) : null}
      {activeGoals.length === 0 && !adding ? <EmptyState icon="flag-outline" title={t('goals.emptyTitle')} message={t('goals.emptyBody')} /> : null}
      {activeGoals.map((g) => {
        const p = goalProgress(g, ctx);
        return (
          <Card key={g.id}>
            <Row>
              <Text variant="subheading" style={{ flex: 1 }}>{t(`goalKinds.${g.kind}`, { name: g.exerciseId ? (ex.get(g.exerciseId)?.name ?? '') : '' })}</Text>
              <IconButton icon="trash-outline" label={t('common.delete')} onPress={async () => { await r.goals.remove(g.id); bump(); }} />
            </Row>
            <ProgressBar progress={p.ratio} tone={p.reached ? 'success' : 'primary'} label={t('goals.progressA11y', { current: p.current, target: p.target })} />
            <Text variant="bodySmall" tone={p.reached ? 'success' : 'muted'}>
              {p.reached ? t('goals.reached') : `${goalValue(g.kind, p.current)} / ${goalValue(g.kind, p.target)}`}
            </Text>
          </Card>
        );
      })}
      {!premium ? <Text variant="caption" tone="subtle">{t('goals.freeLimit', { max: FREE_LIMITS.activeGoals })}</Text> : null}

      <SectionHeader title={t('challenges.title')} />
      {CHALLENGES.map((c) => {
        const run = data.runs.find((x) => x.challengeId === c.id && x.status === 'active') ?? data.runs.find((x) => x.challengeId === c.id && x.status === 'completed');
        const p = run ? challengeProgress(run, c, { today, sessions: data.progress.sessions, cardio: data.progress.cardio, recordDays: rDays, weeklyTarget }) : null;
        return (
          <Card key={c.id}>
            <Row>
              <Text variant="subheading" style={{ flex: 1 }}>{t(`challenges.items.${c.id}.name`)}</Text>
              {c.premium && !premium ? <PremiumBadge /> : null}
              {p?.status === 'completed' ? <Badge label={t('challenges.completed')} tone="success" icon="checkmark" /> : null}
            </Row>
            <Text variant="bodySmall" tone="muted">{t(`challenges.items.${c.id}.desc`, { count: c.target, days: c.windowDays ?? 0, weekly: weeklyTarget })}</Text>
            {p && run?.status === 'active' ? (
              <>
                <ProgressBar progress={p.ratio} label={t('goals.progressA11y', { current: p.current, target: p.target })} />
                <Text variant="caption" tone="muted">
                  {p.status === 'expired' ? t('challenges.expired') : `${p.current} / ${p.target}${p.daysLeft !== null ? ` · ${t('challenges.daysLeft', { count: p.daysLeft })}` : ''}`}
                </Text>
                <Row>
                  {p.status === 'expired' ? <Button label={t('challenges.retry')} size="md" variant="secondary" onPress={() => void startChallenge(c.id, c.premium)} /> : null}
                  <Button label={t('challenges.stop')} size="md" variant="ghost" onPress={async () => { await r.goals.setChallengeStatus(run.id, 'abandoned'); bump(); }} />
                </Row>
              </>
            ) : (
              <Button label={run?.status === 'completed' ? t('challenges.again') : t('challenges.start')} size="md" variant="secondary" onPress={() => void startChallenge(c.id, c.premium)} testID={`start-challenge-${c.id}`} />
            )}
          </Card>
        );
      })}
      <InfoNote text={t('challenges.safety')} icon="medkit-outline" />

      <SectionHeader title={t('badges.title')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BADGES.map((b) => {
          const unlocked = data.badges.has(b.id);
          return (
            <View key={b.id} accessible accessibilityLabel={`${t(`badges.${b.id}.name`)}. ${unlocked ? t('badges.unlocked') : t('badges.locked')}. ${t(`badges.${b.id}.desc`)}`} style={{ width: '31%', alignItems: 'center', gap: 4, padding: 10, borderRadius: 14, backgroundColor: unlocked ? theme.colors.primarySoft : theme.colors.surfaceAlt, opacity: unlocked ? 1 : 0.55 }}>
              <Badge label={unlocked ? '★' : '·'} tone={unlocked ? 'warning' : 'neutral'} />
              <Text variant="caption" center numberOfLines={2}>{t(`badges.${b.id}.name`)}</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
