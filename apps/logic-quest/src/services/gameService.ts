import type { DayKey } from '@factory/app-core';

import { repos, type Repositories } from '@/database';
import {
  canEarnAdHint,
  canUseTimer,
  difficultyUnlocked,
  hintsRemaining,
  newlyEarned,
  pickChallenges,
  hashString,
  type Category,
  type Challenge,
  type Difficulty,
  type QuestionResult,
  type SessionMode,
  type SessionState,
  type TimerOption,
  summarize,
} from '@/engine';
import { useSession } from '@/store/session';

import { countActivityForAds } from './ads';
import { track } from './analytics';
import { clock } from './clock';

/**
 * Orchestrates a game: builds the queue, persists every settled question,
 * awards XP (once per challenge), unlocks achievements from real statistics
 * and emits analytics. Screens call these functions; no game rule lives in React.
 */
export interface GameSetup {
  mode: Exclude<SessionMode, 'daily'>;
  category: Category | 'mixed';
  difficulty: Difficulty | 'any';
  timer: TimerOption;
}

export const SESSION_LENGTH = { standard: 5, mixed: 8, timed: 40 } as const;

export class AccessError extends Error {
  constructor(public readonly reason: 'premium' | 'locked' | 'empty') {
    super(`Game not available: ${reason}`);
  }
}

const newId = () => `s-${clock.now().getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Builds the challenge queue for a game, enforcing Premium and unlock rules. */
export async function buildQueue(setup: GameSetup, isPremium: boolean, r: Repositories = repos(), start: Difficulty = 'easy'): Promise<Challenge[]> {
  if (setup.mode === 'mixed' && !isPremium) throw new AccessError('premium');
  if (!canUseTimer(setup.timer, isPremium)) throw new AccessError('premium');
  if (setup.difficulty === 'hard' && !isPremium) throw new AccessError('premium');
  if (setup.category !== 'mixed' && setup.difficulty !== 'any') {
    if (!difficultyUnlocked(setup.category, setup.difficulty, await r.progress.solvedCounts(), start)) throw new AccessError('locked');
  }
  const pool = await r.content.list();
  const timed = setup.timer > 0;
  const queue = pickChallenges({
    pool,
    category: setup.category,
    difficulty: setup.difficulty,
    count: timed ? SESSION_LENGTH.timed : setup.mode === 'mixed' ? SESSION_LENGTH.mixed : SESSION_LENGTH.standard,
    solvedIds: await r.progress.solvedIds(),
    isPremium,
    seed: hashString(`${clock.now().getTime()}`),
    excludeMemory: timed,
  });
  if (queue.length === 0) throw new AccessError('empty');
  return queue;
}

export async function beginGame(setup: GameSetup, r: Repositories = repos()): Promise<string> {
  const id = newId();
  await r.progress.startSession({ id, mode: setup.timer > 0 ? 'timed' : setup.mode, category: setup.category, difficulty: setup.difficulty, timeLimitS: setup.timer, day: clock.today(), startedAt: clock.now().toISOString() });
  track('game_started', { mode: setup.timer > 0 ? 'timed' : setup.mode, category: setup.category, difficulty: setup.difficulty, timer: setup.timer });
  return id;
}

/** Re-evaluates achievements from the database and stores the new ones. */
export async function refreshAchievements(today: DayKey = clock.today(), r: Repositories = repos()): Promise<string[]> {
  const stats = await r.progress.stats(today);
  const unlocked = new Set((await r.progress.unlockedAchievements()).keys());
  const fresh = await r.progress.unlockAchievements(newlyEarned(stats, unlocked), clock.now().toISOString());
  fresh.forEach((id) => track('achievement_unlocked', { achievement_id: id }));
  useSession.getState().pushAchievements(fresh);
  return fresh;
}

export async function settleQuestion(sessionId: string, challenge: Challenge, result: QuestionResult, r: Repositories = repos()): Promise<{ xp: number; achievements: string[] }> {
  const { xp } = await r.progress.recordAnswer({ sessionId, challenge, result, day: clock.today(), now: clock.now().toISOString() });
  track('challenge_completed', { challenge_id: challenge.id, category: challenge.category, difficulty: challenge.difficulty, correct: result.correct, attempts: result.attempts, hint_used: result.hintUsed, xp });
  const achievements = await refreshAchievements(clock.today(), r);
  useSession.getState().bump();
  return { xp, achievements };
}

export async function endGame(sessionId: string, state: SessionState, setup: Pick<GameSetup, 'mode' | 'category'>, r: Repositories = repos()): Promise<string[]> {
  const summary = summarize(state);
  await r.progress.finishSession(sessionId, summary, state.endReason ?? 'quit', clock.now().toISOString());
  track('game_completed', { mode: state.config.mode, category: setup.category, answered: summary.answered, correct: summary.correct, perfect: summary.perfect, end_reason: state.endReason ?? 'quit' });
  if (summary.answered > 0) countActivityForAds();
  const achievements = await refreshAchievements(clock.today(), r);
  useSession.getState().bump();
  return achievements;
}

/* ------------------------------------------------------------------ hints */

export async function hintBalance(isPremium: boolean, r: Repositories = repos()): Promise<{ remaining: number; canEarn: boolean }> {
  const w = await r.progress.hintWallet(clock.today());
  return { remaining: hintsRemaining({ isPremium, usedToday: w.used, adBonusToday: w.adBonus }), canEarn: canEarnAdHint({ isPremium, adBonusToday: w.adBonus }) };
}

/** Spends one hint if available. Returns false when the free allowance is used up. */
export async function spendHint(isPremium: boolean, challenge: Challenge, source: 'free' | 'premium' | 'rewarded_ad', r: Repositories = repos()): Promise<boolean> {
  const { remaining } = await hintBalance(isPremium, r);
  if (remaining <= 0) return false;
  if (!isPremium) await r.progress.spendHint(clock.today(), clock.now().toISOString());
  track('hint_used', { challenge_id: challenge.id, category: challenge.category, source });
  return true;
}

/** Called only on the rewarded ad's EARNED_REWARD event. */
export async function grantAdHint(r: Repositories = repos()): Promise<void> {
  await r.progress.addAdHint(clock.today(), clock.now().toISOString());
}
