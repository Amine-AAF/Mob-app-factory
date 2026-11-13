import { createRng, hashString } from './rng';
import type { Difficulty, SequenceChallenge, Skill, Translate } from './types';

/**
 * Number sequences are defined by a rule; the terms, the missing value, the
 * distractors and the explanation are all derived from it. A sequence is
 * rejected (see `checkSequence`) if a *simpler* rule also fits the visible
 * terms but predicts a different answer — the puzzle must be unambiguous.
 */
export type Op = { op: '+' | '-' | '×'; value: number };

export type SequenceRule =
  | { kind: 'arithmetic'; start: number; step: number }
  | { kind: 'geometric'; start: number; ratio: number }
  | { kind: 'division'; start: number; divisor: number }
  | { kind: 'fibonacci'; a: number; b: number; plus?: number }
  | { kind: 'tribonacci'; a: number; b: number; c: number }
  | { kind: 'product'; a: number; b: number }
  | { kind: 'interleave'; first: { start: number; step: number }; second: { start: number; step: number } }
  | { kind: 'interleaveMix'; first: { start: number; ratio: number }; second: { start: number; step: number } }
  | { kind: 'cycleOps'; start: number; ops: Op[] }
  | { kind: 'growingStep'; start: number; step: number; growth: number }
  | { kind: 'doublingStep'; start: number; step: number; factor: number }
  | { kind: 'zigzag'; start: number; step: number; growth: number }
  | { kind: 'power'; exponent: 2 | 3; offset: number; add: number }
  | { kind: 'triangular'; offset: number; add: number }
  | { kind: 'pronic'; offset: number }
  | { kind: 'primes'; offset: number; add: number }
  | { kind: 'primeGaps'; start: number; offset: number }
  | { kind: 'powerOfTwo'; offset: number; add: number }
  | { kind: 'affine'; start: number; mul: number; add: number }
  | { kind: 'factorialStep'; start: number; firstMultiplier: number }
  | { kind: 'stairs'; start: number; step: number; repeat: number };

export type SequenceKind = SequenceRule['kind'];

export interface SequenceSpec {
  id: string;
  difficulty: Difficulty;
  rule: SequenceRule;
  /** Total number of terms displayed, including the missing one. */
  length: number;
  /** Index of the missing term (default: last). Never 0. */
  missing?: number;
  input?: 'choice' | 'keypad';
}

export const SEQUENCE_SKILL: Record<SequenceKind, Skill> = {
  arithmetic: 'arithmetic',
  geometric: 'geometric',
  division: 'geometric',
  fibonacci: 'recursive',
  tribonacci: 'recursive',
  product: 'recursive',
  interleave: 'alternating',
  interleaveMix: 'alternating',
  cycleOps: 'alternating',
  growingStep: 'differences',
  doublingStep: 'differences',
  zigzag: 'differences',
  power: 'figurate',
  triangular: 'figurate',
  pronic: 'figurate',
  primes: 'figurate',
  primeGaps: 'differences',
  powerOfTwo: 'geometric',
  affine: 'recursive',
  factorialStep: 'geometric',
  stairs: 'arithmetic',
};

/* --------------------------------------------------------------- generation */

const PRIMES = (() => {
  const out: number[] = [];
  for (let n = 2; out.length < 60; n++) if (out.every((p) => n % p !== 0)) out.push(n);
  return out;
})();

export function nthPrime(index: number): number {
  const p = PRIMES[index];
  if (p === undefined) throw new Error(`prime index ${index} out of range`);
  return p;
}

const applyOp = (x: number, o: Op) => (o.op === '+' ? x + o.value : o.op === '-' ? x - o.value : x * o.value);

/** Generates the first `count` terms of a rule. */
export function generateTerms(rule: SequenceRule, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = (k: number) => out[i - k] as number;
    switch (rule.kind) {
      case 'arithmetic':
        out.push(rule.start + rule.step * i);
        break;
      case 'geometric':
        out.push(rule.start * rule.ratio ** i);
        break;
      case 'division':
        out.push(rule.start / rule.divisor ** i);
        break;
      case 'fibonacci':
        out.push(i === 0 ? rule.a : i === 1 ? rule.b : x(1) + x(2) + (rule.plus ?? 0));
        break;
      case 'tribonacci':
        out.push(i === 0 ? rule.a : i === 1 ? rule.b : i === 2 ? rule.c : x(1) + x(2) + x(3));
        break;
      case 'product':
        out.push(i === 0 ? rule.a : i === 1 ? rule.b : x(1) * x(2));
        break;
      case 'interleave': {
        const s = i % 2 === 0 ? rule.first : rule.second;
        out.push(s.start + s.step * Math.floor(i / 2));
        break;
      }
      case 'interleaveMix':
        out.push(i % 2 === 0 ? rule.first.start * rule.first.ratio ** (i / 2) : rule.second.start + rule.second.step * Math.floor(i / 2));
        break;
      case 'cycleOps':
        out.push(i === 0 ? rule.start : applyOp(x(1), rule.ops[(i - 1) % rule.ops.length] as Op));
        break;
      case 'growingStep':
        out.push(i === 0 ? rule.start : x(1) + rule.step + (i - 1) * rule.growth);
        break;
      case 'doublingStep':
        out.push(i === 0 ? rule.start : x(1) + rule.step * rule.factor ** (i - 1));
        break;
      case 'zigzag':
        out.push(i === 0 ? rule.start : x(1) + (rule.step + (i - 1) * rule.growth) * ((i - 1) % 2 === 0 ? 1 : -1));
        break;
      case 'power':
        out.push((i + rule.offset) ** rule.exponent + rule.add);
        break;
      case 'triangular': {
        const n = i + rule.offset;
        out.push((n * (n + 1)) / 2 + rule.add);
        break;
      }
      case 'pronic': {
        const n = i + rule.offset;
        out.push(n * (n + 1));
        break;
      }
      case 'primes':
        out.push(nthPrime(i + rule.offset) + rule.add);
        break;
      case 'primeGaps':
        out.push(i === 0 ? rule.start : x(1) + nthPrime(rule.offset + i - 1));
        break;
      case 'powerOfTwo':
        out.push(2 ** (i + rule.offset) + rule.add);
        break;
      case 'affine':
        out.push(i === 0 ? rule.start : x(1) * rule.mul + rule.add);
        break;
      case 'factorialStep':
        out.push(i === 0 ? rule.start : x(1) * (rule.firstMultiplier + i - 1));
        break;
      case 'stairs':
        out.push(rule.start + rule.step * Math.floor(i / rule.repeat));
        break;
    }
  }
  return out;
}

/** Visible terms needed so the rule is identifiable, not just guessable. */
export function minKnownTerms(rule: SequenceRule): number {
  switch (rule.kind) {
    case 'arithmetic':
    case 'geometric':
    case 'division':
    case 'power':
    case 'triangular':
    case 'pronic':
    case 'powerOfTwo':
      return 4;
    case 'fibonacci':
    case 'product':
    case 'growingStep':
    case 'doublingStep':
    case 'primes':
    case 'primeGaps':
    case 'affine':
    case 'factorialStep':
      return 5;
    case 'zigzag':
    case 'tribonacci':
    case 'interleave':
    case 'interleaveMix':
      return 6;
    case 'stairs':
      return rule.repeat * 2 + 1;
    case 'cycleOps':
      return rule.ops.length * 2 + 1;
  }
}

/** Earliest index whose value can be explained from visible previous terms. */
function minMissingIndex(rule: SequenceRule): number {
  switch (rule.kind) {
    case 'tribonacci':
      return 3;
    case 'fibonacci':
    case 'product':
    case 'interleave':
    case 'interleaveMix':
      return 2;
    default:
      return 1;
  }
}

/* ----------------------------------------------------------- ambiguity check */

/** Lagrange evaluation of the polynomial through `pts` at x. */
function lagrange(pts: [number, number][], x: number): number {
  let sum = 0;
  pts.forEach(([xi, yi], i) => {
    let term = yi;
    pts.forEach(([xj], j) => {
      if (i !== j) term *= (x - xj) / (xi - xj);
    });
    sum += term;
  });
  return sum;
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/**
 * Predictions of "simple" models (linear, quadratic, geometric, Fibonacci)
 * that fit every visible term. Each returned value is what a reasonable
 * player could defend as the answer.
 */
export function simpleModelPredictions(terms: (number | null)[], missingIndex: number): { model: string; value: number }[] {
  const known = terms.map((v, i) => [i, v] as const).filter((p): p is readonly [number, number] => p[1] !== null) as [number, number][];
  const out: { model: string; value: number }[] = [];

  for (const degree of [1, 2]) {
    if (known.length < degree + 2) continue;
    const base = known.slice(0, degree + 1);
    if (known.every(([x, y]) => near(lagrange(base, x), y))) out.push({ model: degree === 1 ? 'linear' : 'quadratic', value: lagrange(base, missingIndex) });
  }

  // Constant integer ratio between consecutive visible neighbours.
  const ratios: number[] = [];
  for (let i = 1; i < terms.length; i++) {
    const a = terms[i - 1];
    const b = terms[i];
    if (a != null && b != null && a !== 0) ratios.push(b / a);
  }
  if (ratios.length >= 2 && ratios.every((r) => near(r, ratios[0] as number))) {
    const r = ratios[0] as number;
    const prev = terms[missingIndex - 1];
    if (prev != null) out.push({ model: 'geometric', value: prev * r });
  }

  // Each term is the sum of the two before it.
  if (missingIndex >= 2) {
    let fits = true;
    let checked = 0;
    for (let i = 2; i < terms.length; i++) {
      const [a, b, c] = [terms[i - 2], terms[i - 1], terms[i]];
      if (a == null || b == null || c == null) continue;
      checked++;
      if (!near(a + b, c)) fits = false;
    }
    const [a, b] = [terms[missingIndex - 2], terms[missingIndex - 1]];
    if (fits && checked >= 2 && a != null && b != null) out.push({ model: 'fibonacci', value: a + b });
  }
  return out;
}

export interface SequenceIssue {
  id: string;
  problem: string;
}

/** Full integrity check of a compiled sequence challenge. Returns problems (empty = valid). */
export function checkSequence(c: SequenceChallenge): string[] {
  const problems: string[] = [];
  const full = generateTerms(c.rule, c.terms.length);
  if (full.some((v) => !Number.isInteger(v))) problems.push('non-integer term');
  if (full.some((v) => Math.abs(v) > 99999)) problems.push('term too large to display');
  if (full[c.missingIndex] !== c.answer) problems.push('answer does not follow the rule');
  if (c.terms.filter((v) => v === null).length !== 1 || c.terms[c.missingIndex] !== null) problems.push('exactly one missing term expected');
  c.terms.forEach((v, i) => {
    if (i !== c.missingIndex && v !== full[i]) problems.push(`term ${i} does not follow the rule`);
  });
  if (c.missingIndex < minMissingIndex(c.rule)) problems.push('missing term cannot be derived from previous terms');
  if (c.terms.length - 1 < minKnownTerms(c.rule)) problems.push(`needs at least ${minKnownTerms(c.rule)} visible terms`);
  for (const p of simpleModelPredictions(c.terms, c.missingIndex)) {
    if (!near(p.value, c.answer)) problems.push(`ambiguous: a ${p.model} rule gives ${p.value}`);
  }
  if (c.input === 'choice') {
    if (c.options.length !== 4) problems.push('choice input needs 4 options');
    if (new Set(c.options).size !== c.options.length) problems.push('duplicate options');
    if (c.options.filter((o) => o === c.answer).length !== 1) problems.push('answer must appear exactly once in options');
  }
  return problems;
}

/* ------------------------------------------------------------------ compile */

const XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };
const SECONDS: Record<Difficulty, number> = { easy: 30, medium: 50, hard: 80 };

function distractors(full: number[], missing: number, seed: number): number[] {
  const answer = full[missing] as number;
  const prev = full[missing - 1] as number;
  const prev2 = full[missing - 2];
  const gap = prev2 !== undefined ? prev - prev2 : answer - prev;
  const allNonNegative = full.every((v) => v >= 0);
  const candidates = [
    prev + gap, // "the gap stays the same" trap
    answer + (gap || 1),
    answer - (gap || 1),
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + 10,
    answer - 10,
    answer * 2,
  ];
  const rng = createRng(seed);
  const unique = [...new Set(candidates)].filter((v) => v !== answer && Number.isInteger(v) && (!allNonNegative || v >= 0));
  // Keep the most plausible traps first, but vary which ones are used.
  const head = rng.shuffle(unique.slice(0, 5));
  return [...head, ...unique.slice(5)].slice(0, 3);
}

export function compileSequence(spec: SequenceSpec, position: number): SequenceChallenge {
  const missingIndex = spec.missing ?? spec.length - 1;
  const full = generateTerms(spec.rule, spec.length);
  const answer = full[missingIndex] as number;
  const input = spec.input ?? (spec.difficulty === 'easy' ? 'choice' : 'keypad');
  const seed = hashString(spec.id);
  const options = createRng(seed ^ 0x5eed).shuffle([answer, ...distractors(full, missingIndex, seed)]);
  return {
    id: spec.id,
    category: 'sequence',
    difficulty: spec.difficulty,
    skill: missingIndex < spec.length - 1 ? 'missing-number' : SEQUENCE_SKILL[spec.rule.kind],
    position,
    estimatedSeconds: SECONDS[spec.difficulty],
    xp: XP[spec.difficulty],
    premium: spec.difficulty === 'hard',
    rule: spec.rule,
    terms: full.map((v, i) => (i === missingIndex ? null : v)),
    missingIndex,
    input,
    options: input === 'choice' ? options : [],
    answer,
  };
}

/** Signature used to detect duplicate puzzles (same rule + same visible terms). */
export function sequenceSignature(c: SequenceChallenge): string {
  return `${c.rule.kind}:${c.terms.map((v) => (v === null ? '?' : v)).join(',')}`;
}

/* ---------------------------------------------------------------- describe */

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sup = (n: number) => String(n).replace(/./g, (ch) => SUP[ch] ?? ch);
/** "+ 3" / "− 3" with a true minus sign. */
const signed = (n: number) => (n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`);
const num = (n: number) => (n < 0 ? `(−${Math.abs(n)})` : String(n));
const opSymbol = (o: Op) => (o.op === '+' ? `+ ${o.value}` : o.op === '-' ? `− ${o.value}` : `× ${num(o.value)}`);

/** Explanation lines: the rule in words, then the exact calculation. */
export function explainSequence(c: SequenceChallenge, t: Translate): string[] {
  const r = c.rule;
  const m = c.missingIndex;
  const x = generateTerms(r, c.terms.length);
  const a = x[m] as number;
  const p1 = x[m - 1] as number;
  const p2 = x[m - 2] as number;
  let ruleLine: string;
  let calc: string;
  switch (r.kind) {
    case 'arithmetic':
      ruleLine = t(r.step >= 0 ? 'seq.explain.arithmeticUp' : 'seq.explain.arithmeticDown', { step: Math.abs(r.step) });
      calc = `${p1} ${signed(r.step)} = ${a}`;
      break;
    case 'geometric':
      ruleLine = t('seq.explain.geometric', { ratio: num(r.ratio) });
      calc = `${p1} × ${num(r.ratio)} = ${a}`;
      break;
    case 'division':
      ruleLine = t('seq.explain.division', { divisor: r.divisor });
      calc = `${p1} ÷ ${r.divisor} = ${a}`;
      break;
    case 'fibonacci':
      ruleLine = t(r.plus ? 'seq.explain.fibonacciPlus' : 'seq.explain.fibonacci', { plus: Math.abs(r.plus ?? 0), sign: (r.plus ?? 0) >= 0 ? '+' : '−' });
      calc = `${p2} + ${p1}${r.plus ? ` ${signed(r.plus)}` : ''} = ${a}`;
      break;
    case 'tribonacci':
      ruleLine = t('seq.explain.tribonacci');
      calc = `${x[m - 3]} + ${p2} + ${p1} = ${a}`;
      break;
    case 'product':
      ruleLine = t('seq.explain.product');
      calc = `${p2} × ${p1} = ${a}`;
      break;
    case 'interleave': {
      const s = m % 2 === 0 ? r.first : r.second;
      ruleLine = t('seq.explain.interleave', { step1: signed(r.first.step), step2: signed(r.second.step) });
      calc = `${p2} ${signed(s.step)} = ${a}`;
      break;
    }
    case 'interleaveMix':
      ruleLine = t('seq.explain.interleaveMix', { ratio: num(r.first.ratio), step: signed(r.second.step) });
      calc = m % 2 === 0 ? `${p2} × ${num(r.first.ratio)} = ${a}` : `${p2} ${signed(r.second.step)} = ${a}`;
      break;
    case 'cycleOps': {
      const o = r.ops[(m - 1) % r.ops.length] as Op;
      ruleLine = t('seq.explain.cycleOps', { ops: r.ops.map(opSymbol).join(', ') });
      calc = `${p1} ${opSymbol(o)} = ${a}`;
      break;
    }
    case 'growingStep': {
      const gaps = x.slice(1).map((v, i) => v - (x[i] as number));
      ruleLine = t('seq.explain.growingStep', { growth: signed(r.growth), gaps: gaps.slice(0, m).map(signed).join(', ') });
      calc = `${p1} ${signed(a - p1)} = ${a}`;
      break;
    }
    case 'doublingStep': {
      const gaps = x.slice(1).map((v, i) => v - (x[i] as number));
      ruleLine = t('seq.explain.doublingStep', { factor: r.factor, gaps: gaps.slice(0, m).map(signed).join(', ') });
      calc = `${p1} ${signed(a - p1)} = ${a}`;
      break;
    }
    case 'zigzag': {
      const gaps = x.slice(1).map((v, i) => v - (x[i] as number));
      ruleLine = t('seq.explain.zigzag', { gaps: gaps.slice(0, m).map(signed).join(', ') });
      calc = `${p1} ${signed(a - p1)} = ${a}`;
      break;
    }
    case 'power': {
      const n = m + r.offset;
      ruleLine = t(r.exponent === 2 ? (r.add ? 'seq.explain.squaresShifted' : 'seq.explain.squares') : r.add ? 'seq.explain.cubesShifted' : 'seq.explain.cubes', { add: signed(r.add) });
      calc = `${n}${sup(r.exponent)}${r.add ? ` ${signed(r.add)}` : ''} = ${a}`;
      break;
    }
    case 'triangular': {
      const n = m + r.offset;
      ruleLine = t(r.add ? 'seq.explain.triangularShifted' : 'seq.explain.triangular', { add: signed(r.add) });
      calc = `${n} × ${n + 1} ÷ 2${r.add ? ` ${signed(r.add)}` : ''} = ${a}`;
      break;
    }
    case 'pronic': {
      const n = m + r.offset;
      ruleLine = t('seq.explain.pronic');
      calc = `${n} × ${n + 1} = ${a}`;
      break;
    }
    case 'primes':
      ruleLine = t(r.add ? 'seq.explain.primesShifted' : 'seq.explain.primes', { add: signed(r.add) });
      calc = r.add ? `${a - r.add} ${signed(r.add)} = ${a}` : `${a}`;
      break;
    case 'primeGaps': {
      const gap = nthPrime(r.offset + m - 1);
      ruleLine = t('seq.explain.primeGaps');
      calc = `${p1} + ${gap} = ${a}`;
      break;
    }
    case 'powerOfTwo': {
      const n = m + r.offset;
      ruleLine = t(r.add ? 'seq.explain.powerOfTwoShifted' : 'seq.explain.powerOfTwo', { add: signed(r.add) });
      calc = `2${sup(n)}${r.add ? ` ${signed(r.add)}` : ''} = ${a}`;
      break;
    }
    case 'affine':
      ruleLine = t('seq.explain.affine', { mul: r.mul, add: signed(r.add) });
      calc = `${p1} × ${r.mul} ${signed(r.add)} = ${a}`;
      break;
    case 'factorialStep': {
      const k = r.firstMultiplier + m - 1;
      ruleLine = t('seq.explain.factorialStep', { first: r.firstMultiplier });
      calc = `${p1} × ${k} = ${a}`;
      break;
    }
    case 'stairs':
      ruleLine = t('seq.explain.stairs', { repeat: r.repeat, step: signed(r.step) });
      calc = `${a}`;
      break;
  }
  return [ruleLine, t('seq.calc', { calc })];
}
