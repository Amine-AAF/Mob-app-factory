import { computeStreak } from '@factory/app-core';

import type { CategoryId, JobRoleId, QuestionCore } from '@/types/content';

import { matchesRole } from '../questions/search';

export interface PreparationProgress {
  studied: number;
  total: number;
  /** 0..1 */
  ratio: number;
  byCategory: { category: CategoryId; studied: number; total: number }[];
}

/** Share of the role's questions marked as studied, overall and per category. */
export function preparationProgress(cores: readonly QuestionCore[], studied: ReadonlySet<string>, role: JobRoleId | null): PreparationProgress {
  const scope = role ? cores.filter((q) => matchesRole(q, role)) : cores;
  const map = new Map<CategoryId, { studied: number; total: number }>();
  let done = 0;
  for (const q of scope) {
    const entry = map.get(q.category) ?? { studied: 0, total: 0 };
    entry.total += 1;
    if (studied.has(q.id)) {
      entry.studied += 1;
      done += 1;
    }
    map.set(q.category, entry);
  }
  return {
    studied: done,
    total: scope.length,
    ratio: scope.length ? done / scope.length : 0,
    byCategory: [...map.entries()].map(([category, v]) => ({ category, ...v })),
  };
}

export function streak(activeDays: readonly string[], today: string): { current: number; longest: number } {
  return computeStreak(activeDays, today);
}
