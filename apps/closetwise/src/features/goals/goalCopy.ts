import type { TFunction } from 'i18next';

import type { GoalProgress } from '@/domain/goals';
import type { GoalKind } from '@/domain/types';

/**
 * Wording for goals and challenges. Always encouraging: progress is described as what was
 * achieved, "stay under" goals as being within the limit, and going over is framed as a fresh start.
 */

export type GoalUnit = 'items' | 'purchases' | 'outfits' | 'amount' | 'percent' | 'days' | 'pieces';

export function goalUnit(kind: GoalKind): GoalUnit {
  switch (kind) {
    case 'wear_forgotten':
      return 'items';
    case 'reduce_impulse':
      return 'purchases';
    case 'create_outfits':
      return 'outfits';
    case 'monthly_budget':
      return 'amount';
    case 'organize':
      return 'percent';
    case 'capsule':
    case 'challenge_capsule':
      return 'pieces';
    case 'challenge_7x7':
    case 'challenge_30_looks':
    case 'challenge_no_shopping':
      return 'days';
  }
}

/** "Stay under" goals: the target is a limit, not something to reach. */
export const isLimitGoal = (kind: GoalKind) => kind === 'reduce_impulse' || kind === 'monthly_budget';

export const isCapsuleGoal = (kind: GoalKind) => kind === 'capsule' || kind === 'challenge_capsule';

/** Integer targets for counts, 1–100 for percentages, any positive amount for budgets. */
export function isValidTarget(kind: GoalKind, target: number | null): target is number {
  if (target == null || !Number.isFinite(target) || target <= 0) return false;
  const unit = goalUnit(kind);
  if (unit === 'amount') return true;
  if (!Number.isInteger(target)) return false;
  return unit === 'percent' ? target <= 100 : target <= 10000;
}

/** Formats a value in the goal's unit ("12", "45%", "€80"). */
export function formatGoalValue(kind: GoalKind, value: number, money: (n: number) => string): string {
  const unit = goalUnit(kind);
  if (unit === 'amount') return money(value);
  if (unit === 'percent') return `${value}%`;
  return String(value);
}

/** One short, kind sentence describing where the goal stands. */
export function goalCopy(kind: GoalKind, p: GoalProgress, t: TFunction, money: (n: number) => string): string {
  const value = formatGoalValue(kind, p.value, money);
  const target = formatGoalValue(kind, p.target, money);
  if (isLimitGoal(kind)) {
    if (p.done) return t('goals.copy.limitDone');
    return p.withinLimit ? t('goals.copy.withinLimit', { value, target }) : t('goals.copy.overLimit');
  }
  if (p.done) return t('goals.copy.done');
  if (kind === 'challenge_no_shopping') {
    return p.withinLimit === false ? t('goals.copy.freshStart', { count: p.value }) : t('goals.copy.streak', { count: p.value });
  }
  if (p.value <= 0) return t('goals.copy.start');
  if (p.ratio >= 0.5) return t('goals.copy.halfway', { value, target });
  return t('goals.copy.progress', { value, target });
}

export function goalProgressTone(kind: GoalKind, p: GoalProgress): 'primary' | 'success' | 'warning' | 'accent' {
  if (p.done) return 'success';
  if (isLimitGoal(kind) || kind === 'challenge_no_shopping') return p.withinLimit === false ? 'accent' : 'success';
  return 'primary';
}
