import { diffDays } from '@factory/app-core';

import { JOB_ROLE_META } from '@/content/taxonomy';
import type { CategoryId, Difficulty, JobRoleId, QuestionCore } from '@/types/content';

import { dailyTarget } from '../progress/plan';
import { matchesRole } from '../questions/search';

/**
 * Personalised preparation plan, generated locally from the bundled library and
 * stored as a snapshot (so it stays stable even if the content grows later).
 * It schedules study, quizzes, flashcard review and periodic mock interviews.
 * It promises preparation, never a job offer.
 */

export const PATH_LENGTHS = [7, 14, 30, 60] as const;
export type PathLength = (typeof PATH_LENGTHS)[number];

export type PathTask =
  | { id: string; kind: 'study'; questionIds: string[] }
  | { id: string; kind: 'quiz'; category: CategoryId | null }
  | { id: string; kind: 'review' }
  | { id: string; kind: 'mock' };

export interface PathDay {
  index: number;
  tasks: PathTask[];
}

export interface LearningPlan {
  version: 1;
  role: JobRoleId | null;
  level: Difficulty;
  days: PathDay[];
}

export interface PlanInput {
  cores: readonly QuestionCore[];
  role: JobRoleId | null;
  level: Difficulty;
  length: PathLength;
  includePremium: boolean;
}

const LEVEL_RANK: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const QUIZ_CATEGORIES = new Set<CategoryId>(['software', 'java', 'frontend', 'databases', 'devops', 'ai-data', 'hr-salary', 'general', 'behavioral']);

/** Orders questions so the plan starts with what matters most for the role and level. */
export function orderForPlan(cores: readonly QuestionCore[], role: JobRoleId | null, level: Difficulty): QuestionCore[] {
  const meta = role ? JOB_ROLE_META[role] : null;
  const focus = meta?.focus ?? ['general', 'behavioral', 'hr-salary'];
  const coreTopics = new Set(meta?.coreTopics ?? []);
  const rank = (q: QuestionCore) => {
    const categoryRank = focus.indexOf(q.category) === -1 ? focus.length : focus.indexOf(q.category);
    const topicBoost = coreTopics.has(q.topic) ? 0 : 1;
    const levelGap = Math.max(0, LEVEL_RANK[q.difficulty] - LEVEL_RANK[level]);
    // Interleave categories instead of exhausting one before the next: rank by level gap first,
    // then core topics, then category order.
    return levelGap * 1000 + topicBoost * 100 + categoryRank;
  };
  return [...cores].sort((a, b) => rank(a) - rank(b) || (a.id < b.id ? -1 : 1));
}

export function generatePlan(input: PlanInput): LearningPlan {
  const pool = input.cores.filter((q) => (input.includePremium || !q.premium) && (!input.role || matchesRole(q, input.role)));
  const ordered = orderForPlan(pool, input.role, input.level);
  const perDay = dailyTarget(ordered.length, input.length);
  const focus = input.role ? JOB_ROLE_META[input.role].focus : (['general', 'behavioral'] as CategoryId[]);
  const quizCategories = focus.filter((c) => QUIZ_CATEGORIES.has(c));

  const days: PathDay[] = [];
  let cursor = 0;
  for (let d = 0; d < input.length; d++) {
    const tasks: PathTask[] = [];
    const isLast = d === input.length - 1;
    const isMockDay = (d + 1) % 7 === 0 || (isLast && input.length >= 7);
    const isReviewDay = !isMockDay && (d + 1) % 4 === 0;
    // Mock and review days are lighter on new material.
    const studyCount = isMockDay ? Math.ceil(perDay / 2) : isReviewDay ? Math.ceil(perDay * 0.7) : perDay;
    const ids = ordered.slice(cursor, cursor + studyCount).map((q) => q.id);
    cursor += ids.length;
    if (ids.length) tasks.push({ id: `d${d}-study`, kind: 'study', questionIds: ids });
    if (quizCategories.length) tasks.push({ id: `d${d}-quiz`, kind: 'quiz', category: quizCategories[d % quizCategories.length] ?? null });
    if (isReviewDay) tasks.push({ id: `d${d}-review`, kind: 'review' });
    if (isMockDay) tasks.push({ id: `d${d}-mock`, kind: 'mock' });
    days.push({ index: d, tasks });
  }
  return { version: 1, role: input.role, level: input.level, days };
}

/** Day of the plan for a local date (0-based), clamped to the plan length. */
export function currentDayIndex(startDay: string, today: string, length: number): number {
  return Math.min(Math.max(0, diffDays(startDay, today)), Math.max(0, length - 1));
}

export function taskCount(plan: LearningPlan): number {
  return plan.days.reduce((n, d) => n + d.tasks.length, 0);
}

export function planProgress(plan: LearningPlan, done: ReadonlySet<string>): { done: number; total: number; ratio: number } {
  const total = taskCount(plan);
  const completed = plan.days.reduce((n, d) => n + d.tasks.filter((t) => done.has(t.id)).length, 0);
  return { done: completed, total, ratio: total ? completed / total : 0 };
}
