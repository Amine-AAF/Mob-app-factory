import { permutations } from '../rng';

import type {
  CodeSpec,
  Formula,
  GridCategory,
  GridClue,
  GridSpec,
  KnightsSpec,
  KnightStatement,
  Literal,
  LogicOption,
  LogicSpec,
  MathSpec,
  OrderingClue,
  OrderingSpec,
  ValueRef,
} from './types';

/* ---------------------------------------------------------------- ordering */

export function orderingClueHolds(clue: OrderingClue, order: string[]): boolean {
  const p = (name: string) => order.indexOf(name);
  const last = order.length - 1;
  switch (clue.t) {
    case 'above':
      return p(clue.a) < p(clue.b);
    case 'directlyAbove':
      return p(clue.a) + 1 === p(clue.b);
    case 'first':
      return p(clue.a) === 0;
    case 'last':
      return p(clue.a) === last;
    case 'notFirst':
      return p(clue.a) !== 0;
    case 'notLast':
      return p(clue.a) !== last;
    case 'between': {
      const [a, b, c] = [p(clue.a), p(clue.b), p(clue.c)];
      return (b < a && a < c) || (c < a && a < b);
    }
    case 'adjacent':
      return Math.abs(p(clue.a) - p(clue.b)) === 1;
    case 'notAdjacent':
      return Math.abs(p(clue.a) - p(clue.b)) !== 1;
    case 'position':
      return p(clue.a) === clue.pos;
    case 'notPosition':
      return p(clue.a) !== clue.pos;
  }
}

/** Every order satisfying all clues (a valid puzzle has exactly one). */
export function solveOrdering(spec: Pick<OrderingSpec, 'people' | 'clues'>): string[][] {
  return permutations(spec.people).filter((order) => spec.clues.every((c) => orderingClueHolds(c, order)));
}

/* -------------------------------------------------------------------- grid */

export type GridAssignment = Partial<Record<GridCategory, Record<string, string>>>; // category -> person -> value

const split = (v: ValueRef) => {
  const [cat, value] = v.split('.') as [GridCategory, string];
  return { cat, value };
};

function ownerOf(a: GridAssignment, v: ValueRef): string | undefined {
  const { cat, value } = split(v);
  const map = a[cat] ?? {};
  return Object.keys(map).find((person) => map[person] === value);
}

export function gridClueHolds(clue: GridClue, a: GridAssignment): boolean {
  switch (clue.t) {
    case 'is':
      return ownerOf(a, clue.v) === clue.who;
    case 'isNot':
      return ownerOf(a, clue.v) !== clue.who;
    case 'same':
      return ownerOf(a, clue.v1) === ownerOf(a, clue.v2);
    case 'notSame':
      return ownerOf(a, clue.v1) !== ownerOf(a, clue.v2);
  }
}

export function solveGrid(spec: Pick<GridSpec, 'people' | 'values' | 'clues'>): GridAssignment[] {
  const cats = Object.keys(spec.values) as GridCategory[];
  let partial: GridAssignment[] = [{}];
  for (const cat of cats) {
    const values = spec.values[cat] as string[];
    const next: GridAssignment[] = [];
    for (const base of partial) {
      for (const perm of permutations(values)) {
        next.push({ ...base, [cat]: Object.fromEntries(spec.people.map((person, i) => [person, perm[i] as string])) });
      }
    }
    partial = next;
  }
  return partial.filter((a) => spec.clues.every((c) => gridClueHolds(c, a)));
}

/* ------------------------------------------------------------ propositional */

export type Model = Record<string, boolean>;

const isLiteral = (f: Formula | LogicOption): f is Literal => 'atom' in f;

export function evalFormula(f: Formula, m: Model): boolean {
  const lit = (l: Literal) => (l.neg ? !m[l.atom] : !!m[l.atom]);
  if (isLiteral(f)) return lit(f);
  if ('if' in f) return !lit(f.if[0]) || lit(f.if[1]);
  if ('or' in f) return lit(f.or[0]) || lit(f.or[1]);
  return lit(f.and[0]) && lit(f.and[1]);
}

export function atomsOf(fs: (Formula | LogicOption)[]): string[] {
  const out = new Set<string>();
  const add = (l: Literal) => out.add(l.atom);
  for (const f of fs) {
    if ('none' in f) continue;
    if (isLiteral(f)) add(f);
    else if ('if' in f) f.if.forEach(add);
    else if ('or' in f) f.or.forEach(add);
    else f.and.forEach(add);
  }
  return [...out].sort();
}

/** All truth assignments that satisfy every premise. */
export function premiseModels(spec: Pick<LogicSpec, 'premises' | 'options'>): Model[] {
  const atoms = atomsOf([...spec.premises, ...spec.options]);
  const models: Model[] = [];
  for (let mask = 0; mask < 1 << atoms.length; mask++) {
    const m: Model = Object.fromEntries(atoms.map((a, i) => [a, Boolean(mask & (1 << i))]));
    if (spec.premises.every((p) => evalFormula(p, m))) models.push(m);
  }
  return models;
}

/** Indexes of the options that are *necessarily* true given the premises. */
export function entailedOptions(spec: LogicSpec): number[] {
  const models = premiseModels(spec);
  return spec.options.map((o, i) => ('none' in o ? -1 : models.every((m) => evalFormula(o, m)) ? i : -1)).filter((i) => i >= 0);
}

/** The single correct option: the entailed one, or "nothing follows" when none is. */
export function solveLogic(spec: LogicSpec): number[] {
  const entailed = entailedOptions(spec);
  if (entailed.length > 0) return entailed;
  const none = spec.options.findIndex((o) => 'none' in o);
  return none >= 0 ? [none] : [];
}

/* ---------------------------------------------------------------- knights */

export type KnightAssignment = Record<string, boolean>; // true = truth-teller

export function knightStatementTrue(s: KnightStatement, a: KnightAssignment, people: string[]): boolean {
  switch (s.t) {
    case 'liar':
      return !a[s.x];
    case 'truthful':
      return !!a[s.x];
    case 'bothLiars':
      return !a[s.x] && !a[s.y];
    case 'bothTruthful':
      return !!a[s.x] && !!a[s.y];
    case 'same':
      return a[s.x] === a[s.y];
    case 'different':
      return a[s.x] !== a[s.y];
    case 'oneOfLiar':
      return !a[s.x] || !a[s.y];
    case 'atLeastOneLiar':
      return people.some((p) => !a[p]);
    case 'exactlyLiars':
      return people.filter((p) => !a[p]).length === s.n;
  }
}

export function solveKnights(spec: KnightsSpec): KnightAssignment[] {
  const out: KnightAssignment[] = [];
  for (let mask = 0; mask < 1 << spec.people.length; mask++) {
    const a: KnightAssignment = Object.fromEntries(spec.people.map((p, i) => [p, Boolean(mask & (1 << i))]));
    // A truth-teller's statement is true; a liar's statement is false.
    if (spec.statements.every((st) => knightStatementTrue(st.says, a, spec.people) === a[st.by])) out.push(a);
  }
  return out;
}

export const assignmentKey = (people: string[], a: KnightAssignment) => people.map((p) => (a[p] ? 'T' : 'L')).join('');

/* ------------------------------------------------------------------- codes */

export function codeFeedback(secret: string, guess: string): { correct: number; misplaced: number } {
  let correct = 0;
  let misplaced = 0;
  [...guess].forEach((d, i) => {
    if (secret[i] === d) correct++;
    else if (secret.includes(d)) misplaced++;
  });
  return { correct, misplaced };
}

/** All codes with distinct digits matching every clue. */
export function solveCode(spec: Pick<CodeSpec, 'digits' | 'clues'>): string[] {
  const out: string[] = [];
  const max = 10 ** spec.digits;
  for (let n = 0; n < max; n++) {
    const code = String(n).padStart(spec.digits, '0');
    if (new Set(code).size !== code.length) continue;
    if (spec.clues.every((c) => {
      const f = codeFeedback(code, c.guess);
      return f.correct === c.correct && f.misplaced === c.misplaced;
    })) out.push(code);
  }
  return out;
}

/* -------------------------------------------------------------------- math */

export const LEGS = { farm: [2, 4], bikes: [2, 3], bugs: [6, 8] } as const;

/** Every non-negative integer solution; valid puzzles have exactly one positive solution. */
export function solveMath(spec: MathSpec): number[] {
  switch (spec.t) {
    case 'headsLegs': {
      const [l1, l2] = LEGS[spec.theme];
      const out: number[] = [];
      for (let second = 1; second < spec.heads; second++) {
        const first = spec.heads - second;
        if (first * l1 + second * l2 === spec.legs) out.push(second);
      }
      return out;
    }
    case 'ages': {
      const out: number[] = [];
      for (let y = 1; y <= 100; y++) {
        const x = spec.ratioNow * y;
        if (x + spec.years === spec.ratioLater * (y + spec.years)) out.push(spec.ask === 'younger' ? y : x);
      }
      return out;
    }
    case 'sumDiff': {
      const out: number[] = [];
      for (let small = 1; small < spec.sum; small++) {
        const large = small + spec.diff;
        if (small + large === spec.sum) out.push(spec.theme === 'shop' ? small : large);
      }
      return out;
    }
    case 'consecutive': {
      const out: number[] = [];
      for (let first = 1; first <= spec.sum; first++) {
        let total = 0;
        for (let k = 0; k < spec.count; k++) total += first + k;
        if (total === spec.sum) out.push(spec.ask === 'smallest' ? first : first + spec.count - 1);
      }
      return out;
    }
    case 'handshakes': {
      const out: number[] = [];
      for (let n = 2; n <= 100; n++) if ((n * (n - 1)) / 2 === spec.handshakes) out.push(n);
      return out;
    }
  }
}
