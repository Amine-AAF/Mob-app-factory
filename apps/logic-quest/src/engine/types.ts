/**
 * Core, language-independent challenge model.
 *
 * A challenge record never stores user-facing text: titles, instructions,
 * explanations and hints are rendered from localized templates by
 * `describeChallenge`. Answers are never hand-written: they are computed
 * from the challenge's rule (sequences, patterns, memory) or proven unique by
 * a brute-force solver (deduction). See src/engine/README.md.
 */
import type { DeductionSpec } from './deduction/types';
import type { MemorySpec } from './memory';
import type { PatternBoard, PatternRule } from './patterns';
import type { SequenceRule } from './sequences';

export const CATEGORIES = ['sequence', 'pattern', 'deduction', 'memory'] as const;
export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Skill =
  // Number sequences
  | 'arithmetic'
  | 'geometric'
  | 'recursive'
  | 'alternating'
  | 'differences'
  | 'figurate'
  | 'missing-number'
  // Patterns
  | 'shape-sequence'
  | 'rotation'
  | 'color-pattern'
  | 'grid-pattern'
  | 'symmetry'
  | 'transformation'
  // Deduction
  | 'ordering'
  | 'grid-deduction'
  | 'conditional'
  | 'truth-statements'
  | 'elimination'
  | 'math-reasoning'
  // Memory
  | 'sequence-memory'
  | 'pattern-recall'
  | 'number-recall'
  | 'visual-memory';

export interface ChallengeMeta {
  /** Stable, unique, never reused (e.g. "seq-e-001"). */
  id: string;
  category: Category;
  difficulty: Difficulty;
  skill: Skill;
  /** Display order inside its category+difficulty (progressive). */
  position: number;
  estimatedSeconds: number;
  xp: number;
  /** Requires Premium to play. */
  premium: boolean;
}

export type AnswerInput = 'choice' | 'keypad' | 'taps';

export interface SequenceChallenge extends ChallengeMeta {
  category: 'sequence';
  rule: SequenceRule;
  /** Terms as displayed; exactly one is null (the missing term). */
  terms: (number | null)[];
  missingIndex: number;
  input: 'choice' | 'keypad';
  options: number[];
  answer: number;
}

export interface PatternChallenge extends ChallengeMeta {
  category: 'pattern';
  rule: PatternRule;
  board: PatternBoard;
  /** Index of the correct option in `board.options`. */
  answer: number;
}

export interface DeductionChallenge extends ChallengeMeta {
  category: 'deduction';
  spec: DeductionSpec;
  input: 'choice' | 'keypad';
  /** Option keys rendered by the deduction describer (choice input only). */
  options: string[];
  /** Index into options (choice) or the numeric answer (keypad). */
  answer: number;
}

export interface MemoryChallenge extends ChallengeMeta {
  category: 'memory';
  spec: MemorySpec;
  /** Expected recall, derived from the spec's seed. */
  answer: number[];
}

export type Challenge = SequenceChallenge | PatternChallenge | DeductionChallenge | MemoryChallenge;

/** What the player submits. */
export type PlayerAnswer =
  | { kind: 'number'; value: number }
  | { kind: 'option'; index: number }
  | { kind: 'taps'; values: number[] };

/** Translation function injected into the engine (i18next `t` bound to the "content" namespace). */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

export interface ChallengeText {
  title: string;
  instructions: string;
  /** Main prompt lines (e.g. logic clues). Empty for purely visual challenges. */
  prompt: string[];
  /** Localized label for each option (choice input), in option order. */
  optionLabels: string[];
  hint: string;
  /** Explanation of the solution. Only shown after the answer is submitted. */
  explanation: string[];
  /** The correct answer, rendered for display after submission. */
  answerLabel: string;
}
