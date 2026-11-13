/**
 * Logical deduction puzzles are stored as structured specs. Their text is
 * rendered from localized templates and their answer is computed by a
 * brute-force solver, which also proves that the solution is unique.
 */

/* ---------------------------------------------------------------- ordering */
export type OrderingTheme = 'race' | 'height' | 'age' | 'queue';

export type OrderingClue =
  | { t: 'above'; a: string; b: string }
  | { t: 'directlyAbove'; a: string; b: string }
  | { t: 'first'; a: string }
  | { t: 'last'; a: string }
  | { t: 'notFirst'; a: string }
  | { t: 'notLast'; a: string }
  | { t: 'between'; a: string; b: string; c: string }
  | { t: 'adjacent'; a: string; b: string }
  | { t: 'notAdjacent'; a: string; b: string }
  | { t: 'position'; a: string; pos: number }
  | { t: 'notPosition'; a: string; pos: number };

export interface OrderingSpec {
  type: 'ordering';
  theme: OrderingTheme;
  people: string[];
  clues: OrderingClue[];
  /** 'at': who is at 0-based position `pos`; 'positionOf': where is `who`. */
  ask: { kind: 'at'; pos: number } | { kind: 'positionOf'; who: string };
}

/* -------------------------------------------------------------------- grid */
export type GridCategory = 'pet' | 'drink' | 'sport' | 'instrument' | 'house';

/** "category.value", e.g. "pet.cat". */
export type ValueRef = `${GridCategory}.${string}`;

export type GridClue =
  | { t: 'is'; who: string; v: ValueRef }
  | { t: 'isNot'; who: string; v: ValueRef }
  | { t: 'same'; v1: ValueRef; v2: ValueRef }
  | { t: 'notSame'; v1: ValueRef; v2: ValueRef };

export interface GridSpec {
  type: 'grid';
  people: string[];
  /** Values per category; each list has exactly people.length values. */
  values: Partial<Record<GridCategory, string[]>>;
  clues: GridClue[];
  ask: { kind: 'whoHas'; v: ValueRef } | { kind: 'whatHas'; who: string; category: GridCategory };
}

/* ------------------------------------------------------------ propositional */
export type Literal = { atom: string; neg?: boolean };
export type Formula = Literal | { if: [Literal, Literal] } | { or: [Literal, Literal] } | { and: [Literal, Literal] };
/** "Nothing can be concluded for sure" option. */
export type LogicOption = Formula | { none: true };

export interface LogicSpec {
  type: 'logic';
  premises: Formula[];
  options: LogicOption[];
}

/* ---------------------------------------------------------------- knights */
export type KnightStatement =
  | { t: 'liar' | 'truthful'; x: string }
  | { t: 'bothLiars' | 'bothTruthful' | 'same' | 'different' | 'oneOfLiar'; x: string; y: string }
  | { t: 'atLeastOneLiar' }
  | { t: 'exactlyLiars'; n: number };

export interface KnightsSpec {
  type: 'knights';
  people: string[];
  statements: { by: string; says: KnightStatement }[];
}

/* ------------------------------------------------------------------- codes */
export interface CodeSpec {
  type: 'code';
  digits: 3 | 4;
  /** Each clue: a guess with how many digits are right and well placed / right but misplaced. */
  clues: { guess: string; correct: number; misplaced: number }[];
}

/* -------------------------------------------------------------------- math */
export type MathSpec =
  | { type: 'math'; t: 'headsLegs'; theme: 'farm' | 'bikes' | 'bugs'; heads: number; legs: number }
  | { type: 'math'; t: 'ages'; ratioNow: number; years: number; ratioLater: number; ask: 'younger' | 'older' }
  | { type: 'math'; t: 'sumDiff'; theme: 'numbers' | 'shop'; sum: number; diff: number }
  | { type: 'math'; t: 'consecutive'; count: number; sum: number; ask: 'smallest' | 'largest' }
  | { type: 'math'; t: 'handshakes'; handshakes: number };

export type DeductionSpec = OrderingSpec | GridSpec | LogicSpec | KnightsSpec | CodeSpec | MathSpec;
