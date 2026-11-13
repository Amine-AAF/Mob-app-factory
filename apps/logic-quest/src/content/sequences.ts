import type { SequenceRule, SequenceSpec } from '@/engine';

/**
 * 100 number-sequence challenges across 21 rule families.
 * Only the RULE is authored: terms, answer, distractors and explanation are
 * computed by the engine, and `checkSequence` rejects any ambiguous puzzle.
 * Order inside each difficulty = progression order.
 */
type Row = [rule: SequenceRule, length: number, missing?: number];

const arith = (start: number, step: number): SequenceRule => ({ kind: 'arithmetic', start, step });
const geo = (start: number, ratio: number): SequenceRule => ({ kind: 'geometric', start, ratio });
const div = (start: number, divisor: number): SequenceRule => ({ kind: 'division', start, divisor });
const fib = (a: number, b: number, plus = 0): SequenceRule => ({ kind: 'fibonacci', a, b, plus });
const trib = (a: number, b: number, c: number): SequenceRule => ({ kind: 'tribonacci', a, b, c });
const prod = (a: number, b: number): SequenceRule => ({ kind: 'product', a, b });
const inter = (s1: number, d1: number, s2: number, d2: number): SequenceRule => ({ kind: 'interleave', first: { start: s1, step: d1 }, second: { start: s2, step: d2 } });
const interMix = (s1: number, r: number, s2: number, d: number): SequenceRule => ({ kind: 'interleaveMix', first: { start: s1, ratio: r }, second: { start: s2, step: d } });
const ops = (start: number, ...list: [('+' | '-' | '×'), number][]): SequenceRule => ({ kind: 'cycleOps', start, ops: list.map(([op, value]) => ({ op, value })) });
const grow = (start: number, step: number, growth: number): SequenceRule => ({ kind: 'growingStep', start, step, growth });
const dbl = (start: number, step: number, factor: number): SequenceRule => ({ kind: 'doublingStep', start, step, factor });
const zig = (start: number, step: number, growth: number): SequenceRule => ({ kind: 'zigzag', start, step, growth });
const sq = (offset: number, add = 0): SequenceRule => ({ kind: 'power', exponent: 2, offset, add });
const cube = (offset: number, add = 0): SequenceRule => ({ kind: 'power', exponent: 3, offset, add });
const tri = (offset: number, add = 0): SequenceRule => ({ kind: 'triangular', offset, add });
const pronic = (offset: number): SequenceRule => ({ kind: 'pronic', offset });
const primes = (offset: number, add = 0): SequenceRule => ({ kind: 'primes', offset, add });
const primeGaps = (start: number, offset: number): SequenceRule => ({ kind: 'primeGaps', start, offset });
const pow2 = (offset: number, add: number): SequenceRule => ({ kind: 'powerOfTwo', offset, add });
const affine = (start: number, mul: number, add: number): SequenceRule => ({ kind: 'affine', start, mul, add });
const fact = (start: number, firstMultiplier: number): SequenceRule => ({ kind: 'factorialStep', start, firstMultiplier });
const stairs = (start: number, step: number, repeat: number): SequenceRule => ({ kind: 'stairs', start, step, repeat });

const EASY: Row[] = [
  [arith(2, 3), 6],
  [arith(5, 5), 6],
  [arith(40, -4), 6],
  [arith(1, 7), 6, 3],
  [geo(1, 2), 6],
  [stairs(1, 1, 2), 7],
  [arith(11, 9), 6],
  [div(96, 2), 6],
  [geo(2, 3), 5],
  [arith(100, -15), 6],
  [fib(1, 1), 7],
  [sq(1), 6],
  [arith(3, 4), 6, 2],
  [inter(1, 1, 10, 10), 7],
  [stairs(5, 5, 2), 7],
  [grow(2, 1, 1), 6],
  [tri(1), 6],
  [geo(5, 2), 5],
  [arith(64, -8), 6, 4],
  [primes(0), 6],
  [arith(7, 11), 6],
  [div(243, 3), 6],
  [fib(2, 2), 7],
  [inter(2, 2, 20, -1), 7],
  [geo(1, 4), 5],
  [sq(2), 5],
  [arith(13, 6), 6, 3],
  [grow(1, 2, 2), 6],
  [stairs(10, -2, 2), 7],
  [pronic(1), 6],
  [geo(3, 2), 6, 4],
  [fib(3, 4), 6],
  [arith(250, -25), 6],
  [inter(5, 5, 100, -10), 7],
  [primes(2), 6],
];

const MEDIUM: Row[] = [
  [ops(1, ['+', 3], ['×', 2]), 6],
  [grow(4, 2, 3), 6],
  [inter(3, 4, 50, -5), 8],
  [sq(1, 1), 6],
  [fib(1, 3), 7],
  [geo(1, -2), 6],
  [tri(2), 6],
  [dbl(3, 1, 2), 6],
  [primeGaps(1, 0), 6],
  [affine(1, 2, 1), 6],
  [ops(2, ['×', 3], ['-', 1]), 6],
  [cube(1), 5],
  [zig(10, 1, 1), 8],
  [pronic(3), 6, 3],
  [grow(50, -1, -1), 6],
  [inter(1, 2, 2, 3), 8],
  [fact(1, 1), 6],
  [pow2(0, 1), 6],
  [sq(3, -1), 6],
  [fib(2, 5), 7, 5],
  [dbl(1, 3, 2), 6],
  [ops(10, ['+', 5], ['-', 2]), 7],
  [affine(2, 3, -1), 6],
  [trib(1, 1, 2), 7],
  [primes(4, 1), 6],
  [div(10000, 10), 5],
  [tri(1, 2), 6],
  [inter(20, -3, 1, 4), 8, 6],
  [interMix(1, 2, 30, -4), 8],
  [zig(30, 2, 2), 8],
  [geo(-1, 3), 5],
  [grow(3, 3, 2), 6, 4],
  [ops(5, ['+', 4], ['+', 4], ['×', 2]), 8],
  [pow2(1, -1), 6],
  [cube(2, -1), 5],
];

const HARD: Row[] = [
  [prod(1, 2), 6],
  [trib(0, 1, 2), 7],
  [fib(1, 2, 1), 7],
  [affine(5, 2, -3), 6],
  [primeGaps(10, 2), 6],
  [zig(50, 3, 3), 8],
  [ops(3, ['×', 2], ['+', 5], ['-', 3]), 8],
  [fact(2, 2), 6],
  [cube(1, 1), 6],
  [interMix(3, 3, 64, -8), 8],
  [dbl(5, 2, 3), 6],
  [sq(4, 5), 6, 3],
  [prod(2, 3), 6],
  [trib(1, 2, 3), 7, 5],
  [fib(4, 1, -1), 7],
  [affine(3, 3, 2), 6],
  [primes(6, -1), 6],
  [pow2(2, 3), 6],
  [ops(1, ['×', 4], ['-', 2]), 6],
  [grow(2, 5, 4), 6, 4],
  [interMix(2, -2, 9, 7), 8],
  [geo(3, -3), 6],
  [zig(7, 4, 1), 8, 6],
  [fact(1, 2), 6],
  [cube(3, -10), 5],
  [dbl(100, -1, 2), 6],
  [fib(10, -3), 7],
  [affine(1, 4, -2), 6],
  [primeGaps(2, 4), 6, 4],
  [tri(5, -5), 6],
];

const LEVELS: [SequenceSpec['difficulty'], Row[]][] = [
  ['easy', EASY],
  ['medium', MEDIUM],
  ['hard', HARD],
];

export const SEQUENCE_SPECS: SequenceSpec[] = LEVELS.flatMap(([difficulty, rows]) =>
  rows.map(([rule, length, missing], i) => ({
    id: `seq-${difficulty[0]}-${String(i + 1).padStart(3, '0')}`,
    difficulty,
    rule,
    length,
    ...(missing !== undefined ? { missing } : {}),
  })),
);
