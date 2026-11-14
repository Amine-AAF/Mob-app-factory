import type { CategoryId, Difficulty, JobRoleId, Question, TopicId } from '@/types/content';

/**
 * Library search and filtering. Pure functions over the bundled questions, so they
 * work offline and are easy to test. Matching ignores case and accents, which
 * matters for French and Spanish ("négociation" matches "negociacion").
 */

export interface QuestionFilter {
  query?: string;
  categories?: readonly CategoryId[];
  topics?: readonly TopicId[];
  difficulties?: readonly Difficulty[];
  /** Questions relevant for this role: role-tagged ones plus shared ones (no role tag). */
  jobRole?: JobRoleId | null;
  /** Restrict to these ids (favorites, notes…). */
  ids?: ReadonlySet<string>;
  /** Hide Premium questions (they stay visible by default, shown as locked). */
  freeOnly?: boolean;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim();
}

export function matchesRole(q: Pick<Question, 'jobRoles'>, role: JobRoleId): boolean {
  return q.jobRoles.length === 0 || q.jobRoles.includes(role);
}

/** Relevance: matches in the question text weigh more than in answers or tips. */
function score(q: Question, terms: readonly string[]): number {
  const title = normalize(q.question);
  const body = normalize(`${q.intent} ${q.expectedAnswer} ${q.explanation} ${q.tips.join(' ')}`);
  let total = 0;
  for (const term of terms) {
    if (title.includes(term)) total += 3;
    else if (body.includes(term)) total += 1;
    else return 0; // every term must match somewhere
  }
  return total;
}

export function searchQuestions(questions: readonly Question[], filter: QuestionFilter): Question[] {
  const filtered = questions.filter(
    (q) =>
      (!filter.categories?.length || filter.categories.includes(q.category)) &&
      (!filter.topics?.length || filter.topics.includes(q.topic)) &&
      (!filter.difficulties?.length || filter.difficulties.includes(q.difficulty)) &&
      (!filter.jobRole || matchesRole(q, filter.jobRole)) &&
      (!filter.ids || filter.ids.has(q.id)) &&
      (!filter.freeOnly || !q.premium),
  );
  const terms = normalize(filter.query ?? '')
    .split(' ')
    .filter((t) => t.length >= 2);
  if (terms.length === 0) return filtered;
  return filtered
    .map((q) => ({ q, s: score(q, terms) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((r) => r.q);
}

/** Free users can read every question, but Premium answers stay locked. */
export function canReadAnswer(q: Pick<Question, 'premium'>, isPremium: boolean): boolean {
  return !q.premium || isPremium;
}
