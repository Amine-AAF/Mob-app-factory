import { createRng } from './rng';
import { CATEGORIES, type Category, type Challenge, type Difficulty } from './types';

/**
 * Progression and access rules (pure). Difficulty unlocks are earned by
 * solving challenges; Premium gates are explicit and listed in one place.
 */

/** Solved challenges needed at the previous difficulty (same category) to unlock the next one. */
export const UNLOCK_THRESHOLD = 4;

export type SolvedCounts = Record<Category, Record<Difficulty, number>>;

export const emptySolvedCounts = (): SolvedCounts =>
  Object.fromEntries(CATEGORIES.map((c) => [c, { easy: 0, medium: 0, hard: 0 }])) as SolvedCounts;

/**
 * `start` lets experienced players (chosen at onboarding) begin at medium;
 * hard must always be earned.
 */
export function difficultyUnlocked(category: Category, difficulty: Difficulty, solved: SolvedCounts, start: Difficulty = 'easy'): boolean {
  if (difficulty === 'easy') return true;
  if (difficulty === 'medium' && start !== 'easy') return true;
  const previous: Difficulty = difficulty === 'medium' ? 'easy' : 'medium';
  return solved[category][previous] >= UNLOCK_THRESHOLD;
}

export type TimerOption = 0 | 30 | 60 | 180;
export const TIMER_OPTIONS: TimerOption[] = [0, 30, 60, 180];

/** Everything Premium unlocks, in one place (paywall copy and gates read from here). */
export const PREMIUM = {
  hardDifficulty: true,
  mixedMode: true,
  marathonTimer: 180 as TimerOption,
  unlimitedHints: true,
  advancedStats: true,
  noAds: true,
} as const;

export const FREE_HINTS_PER_DAY = 3;
export const MAX_AD_HINTS_PER_DAY = 5;

export function canPlayChallenge(c: Pick<Challenge, 'premium'>, isPremium: boolean): boolean {
  return !c.premium || isPremium;
}

export function canUseTimer(timer: TimerOption, isPremium: boolean): boolean {
  return timer !== PREMIUM.marathonTimer || isPremium;
}

/** Hints left today; Infinity for Premium. */
export function hintsRemaining(input: { isPremium: boolean; usedToday: number; adBonusToday: number }): number {
  if (input.isPremium) return Infinity;
  return Math.max(0, FREE_HINTS_PER_DAY + input.adBonusToday - input.usedToday);
}

export function canEarnAdHint(input: { isPremium: boolean; adBonusToday: number }): boolean {
  return !input.isPremium && input.adBonusToday < MAX_AD_HINTS_PER_DAY;
}

export interface PickInput {
  pool: Challenge[];
  category: Category | 'mixed';
  difficulty: Difficulty | 'any';
  count: number;
  solvedIds: ReadonlySet<string>;
  isPremium: boolean;
  /** Seed for the order of replayed (already solved) challenges. */
  seed: number;
  /** Timed sessions exclude memory challenges (they have their own display timing). */
  excludeMemory?: boolean;
}

/**
 * Builds a session queue: unsolved challenges first, in their progressive
 * order, then already-solved ones (replays earn no XP) in a seeded order.
 */
export function pickChallenges(input: PickInput): Challenge[] {
  const playable = input.pool.filter(
    (c) =>
      canPlayChallenge(c, input.isPremium) &&
      (input.category === 'mixed' || c.category === input.category) &&
      (input.difficulty === 'any' || c.difficulty === input.difficulty) &&
      !(input.excludeMemory && c.category === 'memory'),
  );
  const order: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
  const byProgress = (a: Challenge, b: Challenge) => order[a.difficulty] - order[b.difficulty] || a.position - b.position;
  const rng = createRng(input.seed);
  const unsolved = playable.filter((c) => !input.solvedIds.has(c.id)).sort(byProgress);
  const solved = rng.shuffle(playable.filter((c) => input.solvedIds.has(c.id)));

  if (input.category !== 'mixed') return [...unsolved, ...solved].slice(0, input.count);

  // Mixed mode: round-robin across categories so every game varies.
  const queues = CATEGORIES.map((cat) => [...unsolved, ...solved].filter((c) => c.category === cat));
  const out: Challenge[] = [];
  const start = rng.int(0, CATEGORIES.length - 1);
  for (let round = 0; out.length < input.count && queues.some((q) => q.length); round++) {
    const q = queues[(start + round) % queues.length] as Challenge[];
    const next = q.shift();
    if (next) out.push(next);
  }
  return out;
}

/** Suggests moving up once the recent first-try accuracy is high. */
export function suggestDifficulty(current: Difficulty, recentFirstTry: boolean[]): Difficulty {
  if (recentFirstTry.length < 8) return current;
  const rate = recentFirstTry.filter(Boolean).length / recentFirstTry.length;
  if (rate >= 0.8 && current !== 'hard') return current === 'easy' ? 'medium' : 'hard';
  if (rate < 0.35 && current !== 'easy') return current === 'hard' ? 'medium' : 'easy';
  return current;
}
