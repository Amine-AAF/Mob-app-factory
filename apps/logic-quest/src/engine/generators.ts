import { checkChallenge } from './answers';
import { compileDeduction } from './deduction';
import type { CodeSpec, GridCategory, GridClue, GridSpec, Literal, LogicOption, LogicSpec, KnightStatement, KnightsSpec, MathSpec, OrderingClue, OrderingSpec, OrderingTheme, ValueRef } from './deduction/types';
import { codeFeedback, gridClueHolds, knightStatementTrue, orderingClueHolds, solveCode, solveGrid, solveKnights, solveOrdering } from './deduction/solvers';
import { compileMemory, type MemorySpec } from './memory';
import { compilePattern, COLORS, type Glyph, type GlyphColor, type PatternRule, type Shape, type Transform } from './patterns';
import { createRng, permutations, type Rng } from './rng';
import { compileSequence, type SequenceKind, type SequenceRule } from './sequences';
import type { Challenge, Difficulty } from './types';

/**
 * Seeded puzzle generators used by the daily challenge. Every generated
 * puzzle goes through the same validators as the hand-authored library
 * (`checkChallenge`); invalid candidates are discarded deterministically.
 */
export const NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Finn', 'Gia', 'Hugo', 'Ines', 'Jon', 'Kai', 'Lea', 'Max', 'Nora', 'Omar', 'Pia', 'Raj', 'Sara', 'Tom', 'Uma', 'Yara', 'Zoe'] as const;

export const GRID_VALUES: Record<GridCategory, string[]> = {
  pet: ['cat', 'dog', 'fish', 'parrot'],
  drink: ['tea', 'coffee', 'juice', 'water'],
  sport: ['tennis', 'chess', 'swimming', 'cycling'],
  instrument: ['piano', 'guitar', 'violin', 'drums'],
  house: ['red', 'blue', 'green', 'yellow'],
};

export const ATOMS = ['rain', 'match', 'alarm', 'late', 'bakery', 'bread', 'lamp', 'switch', 'train', 'meeting', 'password', 'door', 'study', 'exam', 'water', 'bloom', 'charged', 'phone', 'snow', 'school'] as const;

export type DailyGenerator =
  | { kind: 'sequence'; rules: SequenceKind[] }
  | { kind: 'pattern'; board: 'row' | 'matrix' | 'analogy' | 'symmetry' }
  | { kind: 'ordering' }
  | { kind: 'grid' }
  | { kind: 'logic' }
  | { kind: 'knights' }
  | { kind: 'code' }
  | { kind: 'math' }
  | { kind: 'memory'; memory: MemorySpec['kind'] };

/* ---------------------------------------------------------------- sequences */

function randomSequence(kind: SequenceKind, rng: Rng, d: Difficulty): { rule: SequenceRule; length: number } {
  const hard = d === 'hard';
  switch (kind) {
    case 'arithmetic':
      return { rule: { kind, start: rng.int(1, 40), step: d === 'easy' ? rng.int(2, 9) : rng.pick([-7, -6, -4, 6, 7, 8, 9, 11, 12, 13]) }, length: 6 };
    case 'geometric':
      return { rule: { kind, start: rng.int(1, 5), ratio: d === 'easy' ? rng.pick([2, 3]) : rng.pick([3, -2, 4, -3]) }, length: 5 };
    case 'division': {
      const divisor = rng.pick([2, 3]);
      return { rule: { kind, start: divisor ** 5 * rng.int(1, 3), divisor }, length: 6 };
    }
    case 'fibonacci':
      return { rule: { kind, a: rng.int(1, 6), b: rng.int(2, 9), plus: hard ? rng.pick([1, 2, -1]) : 0 }, length: 7 };
    case 'tribonacci':
      return { rule: { kind, a: rng.int(0, 3), b: rng.int(1, 4), c: rng.int(2, 6) }, length: 7 };
    case 'interleave':
      return { rule: { kind, first: { start: rng.int(1, 15), step: rng.int(2, 6) }, second: { start: rng.int(40, 70), step: -rng.int(2, 7) } }, length: 8 };
    case 'cycleOps':
      return { rule: { kind, start: rng.int(1, 6), ops: [{ op: '+', value: rng.int(2, 6) }, { op: '×', value: 2 }] }, length: 6 };
    case 'growingStep':
      return { rule: { kind, start: rng.int(1, 12), step: rng.int(1, 5), growth: rng.int(1, 3) }, length: 6 };
    case 'doublingStep':
      return { rule: { kind, start: rng.int(1, 12), step: rng.int(1, 3), factor: 2 }, length: 6 };
    case 'zigzag':
      return { rule: { kind, start: rng.int(20, 50), step: rng.int(1, 4), growth: rng.int(1, 3) }, length: 8 };
    case 'power':
      return { rule: { kind, exponent: hard ? rng.pick([2, 3] as const) : 2, offset: rng.int(1, 6), add: rng.pick([-2, -1, 1, 2, 3]) }, length: 5 };
    case 'triangular':
      return { rule: { kind, offset: rng.int(1, 5), add: 0 }, length: 6 };
    case 'pronic':
      return { rule: { kind, offset: rng.int(1, 5) }, length: 6 };
    case 'primes':
      return { rule: { kind, offset: rng.int(0, 7), add: hard ? rng.pick([1, -1, 3]) : 0 }, length: 6 };
    case 'primeGaps':
      return { rule: { kind, start: rng.int(1, 20), offset: rng.int(0, 3) }, length: 6 };
    case 'powerOfTwo':
      return { rule: { kind, offset: rng.int(0, 3), add: rng.pick([-1, 1, 3]) }, length: 6 };
    case 'affine':
      return { rule: { kind, start: rng.int(1, 5), mul: rng.pick([2, 3]), add: rng.pick([-1, 1, 2, -2]) }, length: 6 };
    case 'factorialStep':
      return { rule: { kind, start: rng.int(1, 3), firstMultiplier: rng.int(1, 2) }, length: 6 };
    case 'stairs':
      return { rule: { kind, start: rng.int(1, 9), step: rng.int(2, 6), repeat: 2 }, length: 7 };
    case 'product':
      return { rule: { kind, a: rng.int(1, 2), b: rng.int(2, 3) }, length: 6 };
    case 'interleaveMix':
      return { rule: { kind, first: { start: rng.int(1, 3), ratio: 2 }, second: { start: rng.int(20, 40), step: -rng.int(2, 5) } }, length: 8 };
  }
}

/* ----------------------------------------------------------------- patterns */

const ROTATABLE: Shape[] = ['arrow', 'heart', 'diamond'];
const OUTLINABLE: Shape[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];

function randomPatternRule(board: 'row' | 'matrix' | 'analogy' | 'symmetry', rng: Rng, d: Difficulty): PatternRule {
  const level = d === 'easy' ? 1 : d === 'medium' ? 2 : 3;
  const distinct = <T>(pool: readonly T[], n: number) => rng.shuffle(pool).slice(0, n);
  switch (board) {
    case 'row': {
      const varying = rng.shuffle(['shape', 'color', 'rotation', 'count', 'fill']).slice(0, level);
      const rotates = varying.includes('rotation');
      const shapes = rotates ? distinct(ROTATABLE, varying.includes('shape') ? 2 : 1) : distinct(OUTLINABLE, varying.includes('shape') ? rng.int(2, 3) : 1);
      const length = rng.int(6, 7);
      const glyph = {
        shape: { cycle: shapes },
        color: { cycle: distinct(COLORS, varying.includes('color') ? rng.int(2, 3) : 1) },
        fill: varying.includes('fill') ? { cycle: ['solid', 'outline'] as const } : undefined,
        rotation: rotates ? { start: 0, step: rng.pick([45, 90, -90]) } : undefined,
        count: varying.includes('count') ? { cycle: [1, 2, 3] } : undefined,
      };
      return { type: 'row', length, missing: rng.int(Math.max(3, length - 3), length - 1), glyph };
    }
    case 'matrix':
      return {
        type: 'matrix',
        missing: rng.pick([8, 8, 4, 5, 7]),
        glyph: {
          shape: { by: rng.pick(['latin', 'row'] as const), values: distinct(OUTLINABLE, 3) },
          color: { by: rng.pick(['col', 'latin2'] as const), values: distinct(COLORS, 3) },
          count: level >= 2 ? { by: rng.pick(['col', 'row'] as const), values: [1, 2, 3] } : undefined,
          fill: level >= 3 ? { by: 'row', values: ['solid', 'outline', 'solid'] } : undefined,
        },
      };
    case 'analogy': {
      const options: Transform[] = [{ kind: 'rotate', deg: rng.pick([90, -90, 180, 45]) }, { kind: 'swapFill' }, { kind: 'addCount', by: 1 }, { kind: 'setColor', color: rng.pick(COLORS) }, { kind: 'grow' }];
      const transforms = rng.shuffle(options).slice(0, level);
      const rotates = transforms.some((tr) => tr.kind === 'rotate');
      const pool = rotates ? ['heart', 'diamond'] as Shape[] : OUTLINABLE;
      const [s1, s2] = distinct(pool, 2) as [Shape, Shape];
      const [c1, c2] = distinct(COLORS, 2) as [GlyphColor, GlyphColor];
      const a: Partial<Glyph> & Pick<Glyph, 'shape' | 'color'> = { shape: s1, color: c1, size: 's' };
      const c: Partial<Glyph> & Pick<Glyph, 'shape' | 'color'> = { shape: s2, color: c2, size: 's' };
      return { type: 'analogy', a, c, transforms };
    }
    case 'symmetry': {
      const rows = level === 1 ? 4 : 6;
      const cols = level === 1 ? 2 : 3;
      const half = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rng.next() < 0.45 ? '1' : '0')).join(''));
      return { type: 'symmetry', axis: level === 3 ? 'rotational' : rng.pick(['vertical', 'horizontal'] as const), half, color: rng.pick(COLORS) };
    }
  }
}

/* ---------------------------------------------------------------- deduction */

/** Adds random true clues until the solution is unique, then removes redundant ones. */
function minimalClues<C>(pool: C[], unique: (clues: C[]) => boolean, rng: Rng): C[] | null {
  const shuffled = rng.shuffle(pool);
  const chosen: C[] = [];
  for (const clue of shuffled) {
    chosen.push(clue);
    if (unique(chosen)) break;
  }
  if (!unique(chosen)) return null;
  for (let i = chosen.length - 1; i >= 0; i--) {
    const without = chosen.filter((_, j) => j !== i);
    if (unique(without)) chosen.splice(i, 1);
  }
  return chosen;
}

function makeClue(t: OrderingClue['t'], a: string, b: string, pos: number): OrderingClue | null {
  switch (t) {
    case 'above':
    case 'directlyAbove':
    case 'adjacent':
    case 'notAdjacent':
      return { t, a, b };
    case 'first':
    case 'last':
    case 'notFirst':
    case 'notLast':
      return { t, a };
    case 'position':
    case 'notPosition':
      return { t, a, pos };
    case 'between':
      return null; // built separately (needs three people)
  }
}

function randomOrdering(rng: Rng, d: Difficulty): OrderingSpec | null {
  const n = d === 'easy' ? 4 : 5;
  const people = rng.shuffle(NAMES).slice(0, n);
  const solution = rng.shuffle(people);
  const types: OrderingClue['t'][] = d === 'easy' ? ['above', 'first', 'last', 'notFirst', 'notLast'] : d === 'medium' ? ['above', 'directlyAbove', 'notFirst', 'notLast', 'adjacent', 'last'] : ['above', 'directlyAbove', 'between', 'notAdjacent', 'notPosition', 'notFirst'];
  const pool: OrderingClue[] = [];
  for (const a of people)
    for (const b of people) {
      if (a === b) continue;
      for (const t of types) {
        const clue = makeClue(t, a, b, people.indexOf(b));
        if (clue && orderingClueHolds(clue, solution)) pool.push(clue);
      }
      if (types.includes('between'))
        for (const c of people) if (c !== a && c !== b && orderingClueHolds({ t: 'between', a, b, c }, solution)) pool.push({ t: 'between', a, b, c });
    }
  const clues = minimalClues(pool, (cl) => solveOrdering({ people, clues: cl }).length === 1, rng);
  if (!clues) return null;
  const theme = rng.pick(['race', 'height', 'age', 'queue'] as OrderingTheme[]);
  const pos = rng.int(0, n - 1);
  return { type: 'ordering', theme, people, clues, ask: rng.next() < 0.7 ? { kind: 'at', pos } : { kind: 'positionOf', who: solution[pos] as string } };
}

function randomGrid(rng: Rng, d: Difficulty): GridSpec | null {
  const n = d === 'hard' ? 4 : 3;
  const people = rng.shuffle(NAMES).slice(0, n);
  const cats = rng.shuffle(Object.keys(GRID_VALUES) as GridCategory[]).slice(0, 2);
  const values: GridSpec['values'] = Object.fromEntries(cats.map((c) => [c, rng.shuffle(GRID_VALUES[c]).slice(0, n)]));
  const truth = Object.fromEntries(cats.map((c) => [c, Object.fromEntries(people.map((p, i) => [p, (values[c] as string[])[i] as string]))]));
  const refs = cats.flatMap((c) => (values[c] as string[]).map((v) => `${c}.${v}` as ValueRef));
  const pool: GridClue[] = [];
  for (const who of people) for (const v of refs) for (const t of ['is', 'isNot'] as const) if (gridClueHolds({ t, who, v }, truth)) pool.push({ t, who, v });
  for (const v1 of refs) for (const v2 of refs) if (v1.split('.')[0] !== v2.split('.')[0]) for (const t of ['same', 'notSame'] as const) if (gridClueHolds({ t, v1, v2 }, truth)) pool.push({ t, v1, v2 });
  const usable = d === 'easy' ? pool : pool.filter((c) => c.t !== 'is' || rng.next() < 0.3);
  const clues = minimalClues(usable, (cl) => solveGrid({ people, values, clues: cl }).length === 1, rng);
  if (!clues) return null;
  const target = rng.pick(refs.filter((r) => !clues.some((c) => c.t === 'is' && c.v === r)));
  return { type: 'grid', people, values, clues, ask: { kind: 'whoHas', v: target } };
}

function randomLogic(rng: Rng): LogicSpec {
  const [a, b, c] = rng.shuffle(ATOMS).slice(0, 3) as [string, string, string];
  const L = (atom: string, neg = false): Literal => (neg ? { atom, neg: true } : { atom });
  const none: LogicOption = { none: true };
  const schemas: (() => LogicSpec)[] = [
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, L(a)], options: [L(b), L(b, true), L(a, true), none] }),
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, L(b, true)], options: [L(a), L(a, true), L(b), none] }),
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, { if: [L(b), L(c)] }, L(a)], options: [L(c), L(c, true), L(b, true), none] }),
    () => ({ type: 'logic', premises: [{ or: [L(a), L(b)] }, L(a, true)], options: [L(b), L(b, true), L(a), none] }),
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, L(b)], options: [L(a), L(a, true), L(b, true), none] }),
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, L(a, true)], options: [L(b), L(b, true), L(a), none] }),
    () => ({ type: 'logic', premises: [{ if: [L(a), L(b)] }, { if: [L(b), L(c)] }, L(c, true)], options: [L(a, true), L(a), L(b), none] }),
  ];
  const spec = rng.pick(schemas)();
  return { ...spec, options: rng.shuffle(spec.options) };
}

function randomKnights(rng: Rng, d: Difficulty): KnightsSpec | null {
  const n = d === 'easy' ? 2 : 3;
  const people = rng.shuffle(NAMES).slice(0, n);
  const statement = (by: string): KnightStatement => {
    const others = people.filter((p) => p !== by);
    const x = rng.pick(others);
    const y = rng.pick(people.filter((p) => p !== x));
    const t = rng.pick(['liar', 'truthful', 'bothLiars', 'same', 'different', 'oneOfLiar', 'atLeastOneLiar', 'exactlyLiars'] as const);
    if (t === 'liar' || t === 'truthful') return { t, x };
    if (t === 'atLeastOneLiar') return { t };
    if (t === 'exactlyLiars') return { t, n: rng.int(1, n - 1) };
    return { t, x: rng.next() < 0.5 ? by : x, y: rng.next() < 0.5 ? y : x === by ? y : by };
  };
  const statements = people.map((by) => ({ by, says: statement(by) })).filter((st) => !('x' in st.says && 'y' in st.says && st.says.x === st.says.y));
  const spec: KnightsSpec = { type: 'knights', people, statements };
  return solveKnights(spec).length === 1 && statements.length === n ? spec : null;
}

function randomCode(rng: Rng, d: Difficulty): CodeSpec | null {
  const digits = d === 'hard' ? 4 : 3;
  const secret = rng.shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']).slice(0, digits);
  if (secret[0] === '0') return null;
  const code = secret.join('');
  const pool: CodeSpec['clues'] = [];
  for (let i = 0; i < 40; i++) {
    const guess = rng.shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).slice(0, digits).join('');
    const f = codeFeedback(code, guess);
    if (f.correct < digits && !pool.some((c) => c.guess === guess)) pool.push({ guess, ...f });
  }
  const clues = minimalClues(pool, (cl) => solveCode({ digits, clues: cl }).length === 1, rng);
  if (!clues || clues.length < 3 || clues.length > 6) return null;
  return { type: 'code', digits, clues };
}

function randomMath(rng: Rng): MathSpec {
  switch (rng.int(0, 4)) {
    case 0: {
      const theme = rng.pick(['farm', 'bikes', 'bugs'] as const);
      const legs = { farm: [2, 4], bikes: [2, 3], bugs: [6, 8] }[theme] as [number, number];
      const first = rng.int(3, 20);
      const second = rng.int(2, 15);
      return { type: 'math', t: 'headsLegs', theme, heads: first + second, legs: first * legs[0] + second * legs[1] };
    }
    case 1: {
      // Pick integer ages first, then derive consistent ratios.
      for (;;) {
        const young = rng.int(3, 15);
        const ratioNow = rng.int(3, 5);
        const years = rng.int(2, 15);
        const later = (ratioNow * young + years) / (young + years);
        if (Number.isInteger(later) && later >= 2) return { type: 'math', t: 'ages', ratioNow, years, ratioLater: later, ask: rng.pick(['younger', 'older'] as const) };
      }
    }
    case 2: {
      const small = rng.int(5, 60);
      const diff = rng.int(4, 40);
      return { type: 'math', t: 'sumDiff', theme: rng.pick(['numbers', 'shop'] as const), sum: small * 2 + diff, diff };
    }
    case 3: {
      const count = rng.int(3, 5);
      const first = rng.int(4, 60);
      return { type: 'math', t: 'consecutive', count, sum: Array.from({ length: count }, (_, k) => first + k).reduce((s, v) => s + v, 0), ask: rng.pick(['smallest', 'largest'] as const) };
    }
    default: {
      const n = rng.int(5, 16);
      return { type: 'math', t: 'handshakes', handshakes: (n * (n - 1)) / 2 };
    }
  }
}

function randomMemory(kind: MemorySpec['kind'], rng: Rng, d: Difficulty): MemorySpec {
  const level = d === 'easy' ? 0 : d === 'medium' ? 1 : 2;
  const seed = rng.int(1, 2 ** 30);
  switch (kind) {
    case 'sequence':
      return { kind, tiles: ([4, 6, 9] as const)[level] as 4 | 6 | 9, length: 4 + level * 2, seed, showMs: 650 - level * 100, gapMs: 250 };
    case 'pattern':
      return { kind, rows: 3 + level, cols: 3 + level, lit: 4 + level * 2, seed, showMs: 2200 };
    case 'number':
      return { kind, digits: 5 + level * 2, seed, showMs: 3000 + level * 1000, reverse: level === 2 };
    case 'visual':
      return { kind, shown: 4 + level * 2, seed, showMs: 3500 + level * 1000, ask: level === 1 ? 'present' : 'missing' };
  }
}

/* --------------------------------------------------------------- dispatcher */

/**
 * Generates a valid challenge for `seed`, trying successive sub-seeds until
 * the candidate passes every integrity check. Returns null if none is found
 * within the attempt budget (callers fall back to the library).
 */
export function generateChallenge(id: string, generator: DailyGenerator, difficulty: Difficulty, seed: number, attempts = 60): Challenge | null {
  for (let k = 0; k < attempts; k++) {
    const rng = createRng(seed + k * 7919);
    let candidate: Challenge | null = null;
    switch (generator.kind) {
      case 'sequence': {
        const { rule, length } = randomSequence(rng.pick(generator.rules), rng, difficulty);
        const missing = difficulty !== 'easy' && rng.next() < 0.3 ? length - 2 : undefined;
        candidate = compileSequence({ id, difficulty, rule, length, missing }, 0);
        break;
      }
      case 'pattern':
        candidate = compilePattern({ id, difficulty, rule: randomPatternRule(generator.board, rng, difficulty) }, 0);
        break;
      case 'memory':
        candidate = compileMemory({ id, difficulty, spec: randomMemory(generator.memory, rng, difficulty) }, 0);
        break;
      default: {
        const spec =
          generator.kind === 'ordering'
            ? randomOrdering(rng, difficulty)
            : generator.kind === 'grid'
              ? randomGrid(rng, difficulty)
              : generator.kind === 'logic'
                ? randomLogic(rng)
                : generator.kind === 'knights'
                  ? randomKnights(rng, difficulty)
                  : generator.kind === 'code'
                    ? randomCode(rng, difficulty)
                    : randomMath(rng);
        if (spec) candidate = compileDeduction({ id, difficulty, spec }, 0);
      }
    }
    if (candidate && checkChallenge(candidate).length === 0) return { ...candidate, premium: false };
  }
  return null;
}

/** Exposed for tests: every permutation helper used by generators is deterministic. */
export const _internal = { permutations, minimalClues, knightStatementTrue };
