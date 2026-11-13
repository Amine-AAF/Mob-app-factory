import { compileDeduction, compileMemory, compilePattern, compileSequence, type Category, type Challenge, type Difficulty } from '@/engine';

import { DAILY_TEMPLATES } from './daily';
import { DEDUCTION_SPECS } from './deduction';
import { MEMORY_SPECS } from './memory';
import { PATTERN_SPECS } from './patterns';
import { SEQUENCE_SPECS } from './sequences';

/** Bump after any content change: the database re-seeds the challenges table. */
export const CONTENT_VERSION = 1;

const positioned = <T extends { difficulty: Difficulty }>(specs: T[], compile: (s: T, position: number) => Challenge): Challenge[] => {
  const counters: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  return specs.map((s) => compile(s, counters[s.difficulty]++));
};

/** The compiled, language-independent challenge library (answers computed by the engine). */
export const CHALLENGES: Challenge[] = [
  ...positioned(SEQUENCE_SPECS, compileSequence),
  ...positioned(PATTERN_SPECS, compilePattern),
  ...positioned(DEDUCTION_SPECS, compileDeduction),
  ...positioned(MEMORY_SPECS, compileMemory),
];

const byId = new Map(CHALLENGES.map((c) => [c.id, c]));

export function getChallenge(id: string): Challenge | undefined {
  return byId.get(id);
}

export function challengesOf(category: Category, difficulty?: Difficulty): Challenge[] {
  return CHALLENGES.filter((c) => c.category === category && (!difficulty || c.difficulty === difficulty));
}

export { DAILY_TEMPLATES };
