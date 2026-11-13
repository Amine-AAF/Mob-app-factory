import type { Level, ModuleId, RoleTag } from '@/content/types';
import type { LessonSummary } from '@/database/repositories/contentRepository';
import type { UserProfile } from '@/database/repositories/profileRepository';

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const OBJECTIVE_MODULES: Record<UserProfile['objectives'][number], ModuleId[]> = {
  meetings: ['workplace'],
  writing: ['workplace'],
  technical: ['technical'],
  interviews: ['interview'],
  vocabulary: ['technical', 'workplace'],
  speaking: ['workplace', 'interview'],
};

const ROLE_TAGS: Record<UserProfile['role'], RoleTag[]> = {
  student: ['student', 'any'],
  java: ['java'],
  react: ['react', 'fullstack'],
  fullstack: ['fullstack', 'react', 'java'],
  devops: ['devops'],
  qa: ['qa'],
  architect: ['architect'],
  other: ['any'],
};

/**
 * Scores a lesson for a profile. Higher is better. Pure and deterministic.
 * - Level fit dominates: same level > one level below > one above; two away is discouraged.
 * - Objectives and role add relevance.
 * - Locked lessons are pushed down for free users but not hidden.
 */
export function scoreLesson(lesson: LessonSummary, profile: UserProfile, isPremium: boolean): number {
  const gap = LEVEL_RANK[lesson.level] - LEVEL_RANK[profile.englishLevel];
  let score = gap === 0 ? 30 : gap === -1 ? 18 : gap === 1 ? 12 : 0;
  if (profile.objectives.some((o) => OBJECTIVE_MODULES[o].includes(lesson.moduleId))) score += 20;
  const tags = ROLE_TAGS[profile.role];
  if (lesson.roles.some((r) => tags.includes(r))) score += 15;
  else if (lesson.roles.includes('any')) score += 8;
  if (lesson.premium && !isPremium) score -= 25;
  // Stable tie-breaker: earlier lessons first.
  return score - lesson.position / 1000;
}

export function recommendLessons(
  lessons: LessonSummary[],
  profile: UserProfile | null,
  completed: ReadonlySet<string>,
  isPremium: boolean,
  count = 3,
): LessonSummary[] {
  const pending = lessons.filter((l) => !completed.has(l.id));
  if (!profile) return pending.filter((l) => !l.premium || isPremium).slice(0, count);
  return [...pending].sort((a, b) => scoreLesson(b, profile, isPremium) - scoreLesson(a, profile, isPremium)).slice(0, count);
}

/** Lesson to resume: most recently touched lesson that is started but not completed. */
export function continueLesson(
  lessons: LessonSummary[],
  statuses: Map<string, { status: 'started' | 'completed'; updatedAt: string }>,
): LessonSummary | null {
  let best: { lesson: LessonSummary; at: string } | null = null;
  for (const l of lessons) {
    const s = statuses.get(l.id);
    if (s?.status === 'started' && (!best || s.updatedAt > best.at)) best = { lesson: l, at: s.updatedAt };
  }
  return best?.lesson ?? null;
}

export function canAccessLesson(lesson: Pick<LessonSummary, 'premium'>, isPremium: boolean): boolean {
  return !lesson.premium || isPremium;
}
