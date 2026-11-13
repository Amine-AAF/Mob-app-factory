import { levelFromXp, type LevelInfo } from '@factory/app-core';

import type { Difficulty } from './types';

/**
 * Deterministic XP rules. XP is granted once per challenge (first correct
 * solve) and once per daily challenge; the storage layer enforces this with a
 * unique (source, source_id) ledger key, and this function returns 0 when the
 * reward was already granted.
 */
export interface XpInput {
  baseXp: number;
  correct: boolean;
  /** 1 for the first attempt. */
  attempt: number;
  hintUsed: boolean;
  /** The player saw the solution of this challenge in an earlier game. */
  previouslyRevealed: boolean;
  alreadyRewarded: boolean;
}

export const XP_FACTORS = { retry: 0.5, hint: 0.5, previouslyRevealed: 0.25 } as const;

export function computeXp(i: XpInput): number {
  if (!i.correct || i.alreadyRewarded || !(i.baseXp > 0) || i.attempt < 1) return 0;
  let factor = 1;
  if (i.attempt > 1) factor *= XP_FACTORS.retry;
  if (i.hintUsed) factor *= XP_FACTORS.hint;
  if (i.previouslyRevealed) factor *= XP_FACTORS.previouslyRevealed;
  return Math.max(1, Math.round(i.baseXp * factor));
}

export const DAILY_XP: Record<Difficulty, number> = { easy: 40, medium: 60, hard: 80 };

export function computeDailyXp(difficulty: Difficulty, i: Omit<XpInput, 'baseXp' | 'previouslyRevealed'>): number {
  return computeXp({ ...i, baseXp: DAILY_XP[difficulty], previouslyRevealed: false });
}

export type Rank = 'novice' | 'apprentice' | 'thinker' | 'strategist' | 'mastermind' | 'grandmaster';

export function rankForLevel(level: number): Rank {
  if (level >= 17) return 'grandmaster';
  if (level >= 12) return 'mastermind';
  if (level >= 8) return 'strategist';
  if (level >= 5) return 'thinker';
  if (level >= 3) return 'apprentice';
  return 'novice';
}

export function playerLevel(totalXp: number): LevelInfo & { rank: Rank } {
  const info = levelFromXp(totalXp);
  return { ...info, rank: rankForLevel(info.level) };
}
