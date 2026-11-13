import type { DeductionEntry, DeductionSpec, Difficulty, Formula, Literal, LogicOption, MathSpec } from '@/engine';

import { GENERATED_DEDUCTION } from './data/deduction-generated';

/**
 * 80 logical-deduction challenges:
 *   20 ordering · 12 grid deduction · 12 truth-tellers & liars · 10 code locks   (solver-generated, frozen)
 *   16 conditional reasoning · 10 mathematical reasoning                          (hand-authored)
 * Every puzzle is re-solved by brute force in the content tests: unique
 * solution, no redundant clue, no give-away.
 */
const L = (atom: string, neg = false): Literal => (neg ? { atom, neg: true } : { atom });
const IF = (a: Literal, b: Literal): Formula => ({ if: [a, b] });
const OR = (a: Literal, b: Literal): Formula => ({ or: [a, b] });
const AND = (a: Literal, b: Literal): Formula => ({ and: [a, b] });
const NONE: LogicOption = { none: true };
const logic = (premises: Formula[], options: LogicOption[]): DeductionSpec => ({ type: 'logic', premises, options });

/** Conditional reasoning: each item exercises a different inference (or a classic fallacy). */
const LOGIC: [Difficulty, DeductionSpec][] = [
  // Modus ponens
  ['easy', logic([IF(L('rain'), L('match')), L('rain')], [L('match', true), L('match'), L('rain', true), NONE])],
  // Modus tollens
  ['easy', logic([IF(L('alarm'), L('late', true)), L('late')], [L('alarm'), L('late', true), L('alarm', true), NONE])],
  // Disjunctive syllogism
  ['easy', logic([OR(L('rain'), L('snow')), L('rain', true)], [L('snow', true), L('rain'), NONE, L('snow')])],
  // Fallacy: affirming the consequent
  ['easy', logic([IF(L('study'), L('exam')), L('exam')], [L('study'), L('study', true), L('exam', true), NONE])],
  // Fallacy: denying the antecedent
  ['easy', logic([IF(L('password'), L('door')), L('password', true)], [L('door', true), L('door'), L('password'), NONE])],
  // Modus ponens with negations
  ['easy', logic([IF(L('charged', true), L('phone', true)), L('charged', true)], [L('phone'), L('charged'), L('phone', true), NONE])],
  // Hypothetical syllogism
  ['medium', logic([IF(L('rain'), L('water')), IF(L('water'), L('bloom')), L('rain')], [L('bloom'), L('bloom', true), L('water', true), NONE])],
  // Chained modus tollens
  ['medium', logic([IF(L('train'), L('meeting')), IF(L('meeting'), L('late')), L('late', true)], [L('train'), L('meeting'), L('train', true), NONE])],
  // Conjunction elimination then modus ponens
  ['medium', logic([AND(L('bakery'), L('snow')), IF(L('snow'), L('school'))], [L('school', true), L('school'), L('bakery', true), NONE])],
  // Modus tollens then disjunctive syllogism
  ['medium', logic([IF(L('switch'), L('lamp')), L('lamp', true), OR(L('switch'), L('door'))], [L('door', true), L('switch'), L('door'), NONE])],
  // Fallacy: affirming the consequent along a chain
  ['medium', logic([IF(L('charged'), L('phone')), IF(L('phone'), L('alarm')), L('alarm')], [L('charged'), L('charged', true), L('phone', true), NONE])],
  // Contraposition (the conclusion is itself a conditional)
  ['hard', logic([IF(L('rain'), L('match'))], [IF(L('match'), L('rain')), IF(L('rain', true), L('match', true)), IF(L('match', true), L('rain', true)), NONE])],
  // Constructive dilemma
  ['hard', logic([IF(L('bakery'), L('bread')), IF(L('bakery', true), L('late'))], [AND(L('bread'), L('late')), L('bread'), OR(L('bread'), L('late')), NONE])],
  // Two-step: modus ponens twice, conclusion is a conjunction
  ['hard', logic([IF(L('lamp'), L('door', true)), L('lamp'), IF(L('door', true), L('alarm'))], [AND(L('door'), L('alarm')), AND(L('door', true), L('alarm')), OR(L('door'), L('alarm', true)), NONE])],
  // Modus tollens inside a disjunction
  ['hard', logic([OR(L('train'), L('snow')), IF(L('snow'), L('school')), L('school', true)], [L('snow'), L('train', true), L('train'), NONE])],
  // Trap: "or" is inclusive, so nothing follows about the other part
  ['hard', logic([OR(L('rain'), L('match')), L('rain')], [L('match'), L('match', true), L('rain', true), NONE])],
];

type WithoutType<T> = T extends unknown ? Omit<T, 'type'> : never;
const math = (spec: WithoutType<MathSpec>): DeductionSpec => ({ type: 'math', ...spec }) as DeductionSpec;

const MATH: [Difficulty, DeductionSpec][] = [
  ['easy', math({ t: 'headsLegs', theme: 'farm', heads: 10, legs: 28 })],
  ['easy', math({ t: 'sumDiff', theme: 'numbers', sum: 30, diff: 6 })],
  ['easy', math({ t: 'consecutive', count: 3, sum: 33, ask: 'smallest' })],
  ['medium', math({ t: 'headsLegs', theme: 'bikes', heads: 15, legs: 37 })],
  ['medium', math({ t: 'ages', ratioNow: 3, years: 5, ratioLater: 2, ask: 'younger' })],
  ['medium', math({ t: 'sumDiff', theme: 'shop', sum: 110, diff: 100 })],
  ['medium', math({ t: 'handshakes', handshakes: 28 })],
  ['hard', math({ t: 'headsLegs', theme: 'bugs', heads: 20, legs: 136 })],
  ['hard', math({ t: 'ages', ratioNow: 4, years: 6, ratioLater: 2, ask: 'older' })],
  ['hard', math({ t: 'consecutive', count: 5, sum: 215, ask: 'largest' })],
];

const groups: [Difficulty, DeductionSpec][][] = [
  GENERATED_DEDUCTION.ordering.map((e) => [e.difficulty, e.spec]),
  LOGIC,
  GENERATED_DEDUCTION.grid.map((e) => [e.difficulty, e.spec]),
  GENERATED_DEDUCTION.knights.map((e) => [e.difficulty, e.spec]),
  GENERATED_DEDUCTION.code.map((e) => [e.difficulty, e.spec]),
  MATH,
];

/** Interleaves puzzle types inside each difficulty so consecutive challenges vary. */
function interleave(difficulty: Difficulty): DeductionSpec[] {
  const queues = groups.map((g) => g.filter(([d]) => d === difficulty).map(([, s]) => s));
  const out: DeductionSpec[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) {
    const next = q.shift();
    if (next) out.push(next);
  }
  return out;
}

export const DEDUCTION_SPECS: DeductionEntry[] = (['easy', 'medium', 'hard'] as const).flatMap((difficulty) =>
  interleave(difficulty).map((spec, i) => ({ id: `ded-${difficulty[0]}-${String(i + 1).padStart(3, '0')}`, difficulty, spec })),
);
