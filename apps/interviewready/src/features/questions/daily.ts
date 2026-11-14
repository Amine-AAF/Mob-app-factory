import { dayIndex, seededShuffle } from '@factory/app-core';

import type { JobRoleId, QuestionCore } from '@/types/content';

import { matchesRole } from './search';

/** Fixed seed: the daily rotation must be identical on every device and after reinstall. */
const ROTATION_SEED = 20261114;

/**
 * Question of the day. Deterministic from the local date (and the user's role),
 * so it works offline and does not change during the day.
 *
 * The pool is free questions only, so every user can read the full model answer.
 * With a role, the pool is the role's questions (role-specific + shared), which keeps
 * the daily question relevant while staying stable.
 */
export function dailyQuestionId(day: string, cores: readonly QuestionCore[], role: JobRoleId | null): string | null {
  const free = cores.filter((q) => !q.premium);
  const pool = role ? free.filter((q) => matchesRole(q, role)) : free;
  const source = pool.length > 0 ? pool : free;
  if (source.length === 0) return null;
  // Sort by id first so the result never depends on pack registration order.
  const rotation = seededShuffle(
    [...source].sort((a, b) => (a.id < b.id ? -1 : 1)),
    ROTATION_SEED,
  );
  const index = ((dayIndex(day) % rotation.length) + rotation.length) % rotation.length;
  return rotation[index]?.id ?? null;
}
