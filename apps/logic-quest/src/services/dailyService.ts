import type { DayKey } from '@factory/app-core';

import { CHALLENGES, DAILY_TEMPLATES } from '@/content';
import { repos, type Repositories } from '@/database';
import { dailyChallengeFor, type DailyChallenge, type QuestionResult } from '@/engine';
import { useSession } from '@/store/session';

import { track } from './analytics';
import { clock } from './clock';
import { refreshAchievements } from './gameService';

/** Memoized per day: generation is deterministic, so recomputing would give the same puzzle. */
let cache: DailyChallenge | null = null;

export function dailyFor(day: DayKey = clock.today()): DailyChallenge {
  if (cache?.day !== day) cache = dailyChallengeFor(day, DAILY_TEMPLATES, CHALLENGES);
  return cache;
}

export async function dailyStatus(day: DayKey = clock.today(), r: Repositories = repos()) {
  return r.progress.getDaily(day);
}

export async function settleDaily(daily: DailyChallenge, result: QuestionResult, r: Repositories = repos()): Promise<{ xp: number; achievements: string[] }> {
  const { xp } = await r.progress.recordDaily({ day: daily.day, challenge: daily.challenge, templateId: daily.template.id, result, now: clock.now().toISOString() });
  track('daily_challenge_completed', { template_id: daily.template.id, difficulty: daily.challenge.difficulty, correct: result.correct });
  const achievements = await refreshAchievements(daily.day, r);
  useSession.getState().bump();
  return { xp, achievements };
}
