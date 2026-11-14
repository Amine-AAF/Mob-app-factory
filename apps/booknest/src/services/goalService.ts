import { addDays } from '@factory/app-core';

import { assertWithinLimit, LimitReachedError } from '@/config/limits';
import { CHALLENGES } from '@/config/presets';
import type { GoalInput, Repositories } from '@/database';
import { buildActivity, computeGoalProgress, goalPeriod, validateGoalTarget, type ActivityData, type GoalProgress } from '@/features/goals/goals';
import { isPremiumNow, useSession } from '@/store/session';

import { track } from './analytics';
import { clock } from './clock';

export class GoalValidationError extends Error {
  constructor(public readonly code: 'invalid_target' | 'premium_required' | 'invalid_period') {
    super(`Goal error: ${code}`);
    this.name = 'GoalValidationError';
  }
}

/** Loads the activity needed to evaluate goals (around `today`, plus history for comparisons). */
export async function loadActivity(r: Repositories, today: string, historyDays = 400): Promise<ActivityData> {
  const from = addDays(today, -historyDays);
  const [records, pages, sessions] = await Promise.all([r.reading.allRecords(), r.reading.progressByDay('page', from, today), r.reading.sessions({ from, to: today })]);
  return buildActivity({
    finishedDays: records.filter((x) => x.status === 'completed' && x.finishedOn).map((x) => x.finishedOn!),
    pages,
    sessions,
  });
}

export async function evaluateGoals(r: Repositories, today: string, activity?: ActivityData): Promise<GoalProgress[]> {
  const goals = await r.organize.goals({ activeOnly: true });
  if (!goals.length) return [];
  const data = activity ?? (await loadActivity(r, today));
  return goals.map((g) => computeGoalProgress(g, data, today));
}

export async function createGoal(r: Repositories, input: GoalInput): Promise<string> {
  if (!validateGoalTarget(input.type, input.target)) throw new GoalValidationError('invalid_target');
  const premium = isPremiumNow();
  if (input.type === 'custom' && !premium) throw new GoalValidationError('premium_required');
  if (input.periodEnd && input.periodEnd < input.periodStart) throw new GoalValidationError('invalid_period');
  assertWithinLimit('activeGoals', (await r.organize.goals({ activeOnly: true })).length, premium);
  const id = await r.organize.saveGoal(input);
  track('goal_created', { type: input.type, challenge: !!input.challengeId });
  useSession.getState().bump();
  return id;
}

export async function updateGoal(r: Repositories, id: string, input: GoalInput): Promise<void> {
  if (!validateGoalTarget(input.type, input.target)) throw new GoalValidationError('invalid_target');
  await r.organize.saveGoal(input, id);
  // A new target may un-reach the goal: recompute the completion stamp.
  await r.organize.markGoalCompleted(id, null);
  await checkGoalCelebrations(r, false);
  useSession.getState().bump();
}

export async function joinChallenge(r: Repositories, challengeId: string): Promise<string> {
  const c = CHALLENGES.find((x) => x.id === challengeId);
  if (!c) throw new GoalValidationError('invalid_target');
  const today = clock.today();
  const period = goalPeriod({ type: c.type, periodStart: today, periodEnd: null }, today);
  return createGoal(r, { type: c.type, target: c.target, challengeId: c.id, periodStart: period.start, title: null });
}

export async function setCustomProgress(r: Repositories, id: string, value: number) {
  await r.organize.setGoalManualProgress(id, value);
  await checkGoalCelebrations(r);
  useSession.getState().bump();
}

export async function archiveGoal(r: Repositories, id: string, active: boolean) {
  if (active) assertWithinLimit('activeGoals', (await r.organize.goals({ activeOnly: true })).length, isPremiumNow());
  await r.organize.setGoalActive(id, active);
  useSession.getState().bump();
}

export async function deleteGoal(r: Repositories, id: string) {
  await r.organize.deleteGoal(id);
  useSession.getState().bump();
}

/**
 * Marks newly reached goals and queues a celebration. One-shot goals (yearly books,
 * custom) keep their completion date; recurring ones celebrate once per period
 * (completed_at is compared with the current period start).
 */
export async function checkGoalCelebrations(r: Repositories, celebrate = true): Promise<string[]> {
  const today = clock.today();
  const progress = await evaluateGoals(r, today);
  const reached: string[] = [];
  for (const p of progress) {
    const already = p.goal.completedAt && p.goal.completedAt.slice(0, 10) >= p.period.start;
    if (p.reached && !already) {
      await r.organize.markGoalCompleted(p.goal.id, clock.iso());
      reached.push(p.goal.id);
      track('goal_reached', { type: p.goal.type });
    }
  }
  if (celebrate && reached.length) useSession.getState().celebrate(reached);
  return reached;
}

export { LimitReachedError };
