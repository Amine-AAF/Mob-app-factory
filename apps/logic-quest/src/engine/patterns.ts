import { createRng, hashString } from './rng';
import type { Difficulty, PatternChallenge, Skill, Translate } from './types';

/**
 * Visual patterns are built from glyphs (shape, color, rotation, fill, count,
 * size). The board and the correct answer are generated from a rule, never
 * drawn by hand. Glyph equality is *visual*: rotations are normalized by the
 * shape's rotational symmetry (a square turned 90° looks the same).
 */
export const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'arrow'] as const;
export type Shape = (typeof SHAPES)[number];
export const COLORS = ['blue', 'orange', 'green', 'purple', 'red'] as const;
export type GlyphColor = (typeof COLORS)[number];
export type Fill = 'solid' | 'outline';
export type Size = 's' | 'm' | 'l';

export interface Glyph {
  shape: Shape;
  color: GlyphColor;
  /** Degrees clockwise, multiple of 45. */
  rotation: number;
  fill: Fill;
  /** Number of copies drawn in the cell (1–4). */
  count: number;
  size: Size;
}

/** Rotational symmetry period in degrees (0 = rotation is invisible). */
export const ROTATION_PERIOD: Record<Shape, number> = { circle: 0, square: 90, triangle: 120, diamond: 360, star: 72, heart: 360, arrow: 360 };
/** Shapes whose outline variant is visually distinct. */
const HAS_OUTLINE: Record<Shape, boolean> = { circle: true, square: true, triangle: true, diamond: true, star: true, heart: true, arrow: false };

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function normalizedRotation(g: Pick<Glyph, 'shape' | 'rotation'>): number {
  const p = ROTATION_PERIOD[g.shape];
  return p === 0 ? 0 : mod(g.rotation, p);
}

/** Key identifying how a glyph *looks*. Two glyphs with the same key are indistinguishable. */
export function glyphKey(g: Glyph): string {
  return [g.shape, g.color, normalizedRotation(g), HAS_OUTLINE[g.shape] ? g.fill : 'solid', g.count, g.size].join('|');
}

/* --------------------------------------------------------------------- rules */

export type Cycle<T> = { cycle: readonly T[] };
export type Step = { start: number; step: number };

export interface RowGlyphRule {
  shape: Cycle<Shape>;
  color: Cycle<GlyphColor>;
  fill?: Cycle<Fill>;
  size?: Cycle<Size>;
  rotation?: Cycle<number> | Step;
  count?: Cycle<number> | Step;
}

export type Axis = 'const' | 'row' | 'col' | 'latin' | 'latin2';
export type CellAttr<T> = { by: Axis; values: readonly T[] };

export interface MatrixGlyphRule {
  shape: CellAttr<Shape>;
  color: CellAttr<GlyphColor>;
  fill?: CellAttr<Fill>;
  count?: CellAttr<number>;
  rotation?: CellAttr<number>;
}

export type Transform =
  | { kind: 'rotate'; deg: number }
  | { kind: 'swapFill' }
  | { kind: 'addCount'; by: number }
  | { kind: 'setColor'; color: GlyphColor }
  | { kind: 'grow' };

export type PatternRule =
  | { type: 'row'; length: number; missing: number; glyph: RowGlyphRule }
  | { type: 'matrix'; missing: number; glyph: MatrixGlyphRule }
  | { type: 'symmetry'; axis: 'vertical' | 'horizontal' | 'rotational'; half: readonly string[]; color: GlyphColor }
  | { type: 'analogy'; a: Partial<Glyph> & Pick<Glyph, 'shape' | 'color'>; c: Partial<Glyph> & Pick<Glyph, 'shape' | 'color'>; transforms: readonly Transform[] };

export type PatternBoard =
  | { type: 'row'; cells: (Glyph | null)[]; options: Glyph[] }
  | { type: 'matrix'; cells: (Glyph | null)[]; options: Glyph[] }
  | { type: 'analogy'; cells: (Glyph | null)[]; options: Glyph[] }
  | { type: 'symmetry'; axis: 'vertical' | 'horizontal' | 'rotational'; rows: number; cols: number; given: number[][]; options: number[][][]; color: GlyphColor };

export interface PatternSpec {
  id: string;
  difficulty: Difficulty;
  rule: PatternRule;
}

/* ---------------------------------------------------------------- evaluation */

const isStep = (r: Cycle<number> | Step | undefined): r is Step => !!r && 'step' in r;
const cyc = <T>(r: Cycle<T> | undefined, i: number, fallback: T): T => (r ? (r.cycle[i % r.cycle.length] as T) : fallback);
const num = (r: Cycle<number> | Step | undefined, i: number, fallback: number) => (r === undefined ? fallback : isStep(r) ? r.start + r.step * i : cyc(r, i, fallback));

export function rowGlyphAt(rule: RowGlyphRule, i: number): Glyph {
  return {
    shape: cyc(rule.shape, i, 'circle'),
    color: cyc(rule.color, i, 'blue'),
    fill: cyc(rule.fill, i, 'solid'),
    size: cyc(rule.size, i, 'm'),
    rotation: mod(num(rule.rotation, i, 0), 360),
    count: num(rule.count, i, 1),
  };
}

function axisIndex(by: Axis, r: number, c: number): number {
  switch (by) {
    case 'const':
      return 0;
    case 'row':
      return r;
    case 'col':
      return c;
    case 'latin':
      return mod(r + c, 3);
    case 'latin2':
      return mod(r - c, 3);
  }
}

const cell = <T>(a: CellAttr<T> | undefined, r: number, c: number, fallback: T): T => (a ? (a.values[axisIndex(a.by, r, c)] as T) : fallback);

export function matrixGlyphAt(rule: MatrixGlyphRule, r: number, c: number): Glyph {
  return {
    shape: cell(rule.shape, r, c, 'circle'),
    color: cell(rule.color, r, c, 'blue'),
    fill: cell(rule.fill, r, c, 'solid'),
    count: cell(rule.count, r, c, 1),
    rotation: mod(cell(rule.rotation, r, c, 0), 360),
    size: 'm',
  };
}

const fullGlyph = (g: Partial<Glyph> & Pick<Glyph, 'shape' | 'color'>): Glyph => ({ rotation: 0, fill: 'solid', count: 1, size: 'm', ...g });

export function applyTransforms(g: Glyph, transforms: readonly Transform[]): Glyph {
  return transforms.reduce<Glyph>((acc, tr) => {
    switch (tr.kind) {
      case 'rotate':
        return { ...acc, rotation: mod(acc.rotation + tr.deg, 360) };
      case 'swapFill':
        return { ...acc, fill: acc.fill === 'solid' ? 'outline' : 'solid' };
      case 'addCount':
        return { ...acc, count: acc.count + tr.by };
      case 'setColor':
        return { ...acc, color: tr.color };
      case 'grow':
        return { ...acc, size: acc.size === 's' ? 'm' : 'l' };
    }
  }, g);
}

/* --------------------------------------------------------------- symmetry */

export type Bits = number[][];

const parseBits = (rows: readonly string[]): Bits => rows.map((r) => [...r].map((ch) => (ch === '1' ? 1 : 0)));

/** The half that completes the figure. */
export function completeSymmetry(axis: 'vertical' | 'horizontal' | 'rotational', given: Bits): Bits {
  const rows = given.length;
  const cols = given[0]?.length ?? 0;
  if (axis === 'vertical') return given.map((row) => [...row].reverse());
  if (axis === 'horizontal') return [...given].reverse().map((row) => [...row]);
  // 180° rotation: the missing right half is the given left half rotated.
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => given[rows - 1 - r]?.[cols - 1 - c] ?? 0));
}

const bitsKey = (b: Bits) => b.map((r) => r.join('')).join('/');

/* ------------------------------------------------------------- distractors */

function glyphVariants(answer: Glyph, pool: Glyph[]): Glyph[] {
  const shapes = [...new Set(pool.map((g) => g.shape))];
  const colors = [...new Set(pool.map((g) => g.color))];
  const out: Glyph[] = [];
  for (const s of [...shapes, ...SHAPES]) out.push({ ...answer, shape: s });
  for (const c of [...colors, ...COLORS]) out.push({ ...answer, color: c });
  for (const d of [45, 90, 180, 270, -90]) out.push({ ...answer, rotation: mod(answer.rotation + d, 360) });
  for (const d of [1, -1, 2]) if (answer.count + d >= 1 && answer.count + d <= 4) out.push({ ...answer, count: answer.count + d });
  out.push({ ...answer, fill: answer.fill === 'solid' ? 'outline' : 'solid' });
  for (const s of ['s', 'm', 'l'] as const) out.push({ ...answer, size: s });
  return out;
}

/** Picks 3 plausible, visually distinct wrong options. Glyphs seen on the board are preferred traps. */
function pickGlyphDistractors(answer: Glyph, board: Glyph[], seed: number): Glyph[] {
  const rng = createRng(seed);
  const answerKey = glyphKey(answer);
  const seen = new Set<string>([answerKey]);
  const take = (list: Glyph[]) => {
    const picked: Glyph[] = [];
    for (const g of list) {
      const k = glyphKey(g);
      if (!seen.has(k) && g.count >= 1 && g.count <= 4) {
        seen.add(k);
        picked.push(g);
      }
    }
    return picked;
  };
  // Prefer variants that differ in exactly one attribute (hardest to rule out).
  const variants = take(rng.shuffle(glyphVariants(answer, board)));
  const boardTraps = take(rng.shuffle(board));
  const ordered = [...variants.slice(0, 2), ...boardTraps.slice(0, 1), ...variants.slice(2)];
  return ordered.slice(0, 3);
}

/* ------------------------------------------------------------------ compile */

const XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };
const SECONDS: Record<Difficulty, number> = { easy: 30, medium: 45, hard: 70 };

export function patternSkill(rule: PatternRule): Skill {
  switch (rule.type) {
    case 'matrix':
      return 'grid-pattern';
    case 'symmetry':
      return 'symmetry';
    case 'analogy':
      return 'transformation';
    case 'row': {
      const g = rule.glyph;
      if (g.rotation && (isStep(g.rotation) ? g.rotation.step !== 0 : g.rotation.cycle.length > 1)) return 'rotation';
      if (g.shape.cycle.length === 1 && g.color.cycle.length > 1) return 'color-pattern';
      if (g.count && (isStep(g.count) ? g.count.step !== 0 : g.count.cycle.length > 1)) return 'transformation';
      return 'shape-sequence';
    }
  }
}

export function compilePattern(spec: PatternSpec, position: number): PatternChallenge {
  const seed = hashString(spec.id);
  const rule = spec.rule;
  let board: PatternBoard;
  let answer = 0;
  const shuffleOptions = <T>(correct: T, wrong: T[]): { options: T[]; answer: number } => {
    const all = [correct, ...wrong];
    // Size-safe: with fewer than 3 distractors the checker rejects the board ("4 options expected").
    const order = createRng(seed ^ 0xa11ce).shuffle(all.map((_, i) => i));
    const options = order.map((i) => all[i] as T);
    return { options, answer: order.indexOf(0) };
  };

  switch (rule.type) {
    case 'row': {
      const full = Array.from({ length: rule.length }, (_, i) => rowGlyphAt(rule.glyph, i));
      const correct = full[rule.missing] as Glyph;
      const shuffled = shuffleOptions(correct, pickGlyphDistractors(correct, full, seed));
      board = { type: 'row', cells: full.map((g, i) => (i === rule.missing ? null : g)), options: shuffled.options };
      answer = shuffled.answer;
      break;
    }
    case 'matrix': {
      const full = Array.from({ length: 9 }, (_, i) => matrixGlyphAt(rule.glyph, Math.floor(i / 3), i % 3));
      const correct = full[rule.missing] as Glyph;
      const shuffled = shuffleOptions(correct, pickGlyphDistractors(correct, full, seed));
      board = { type: 'matrix', cells: full.map((g, i) => (i === rule.missing ? null : g)), options: shuffled.options };
      answer = shuffled.answer;
      break;
    }
    case 'analogy': {
      const a = fullGlyph(rule.a);
      const b = applyTransforms(a, rule.transforms);
      const c = fullGlyph(rule.c);
      const correct = applyTransforms(c, rule.transforms);
      // Classic traps: applying only part of the change, or copying B.
      const partial = rule.transforms.map((_, i) => applyTransforms(c, rule.transforms.filter((__, j) => j !== i)));
      const traps = [...partial, b, applyTransforms(c, rule.transforms.map((tr) => (tr.kind === 'rotate' ? { ...tr, deg: -tr.deg } : tr)))];
      const seen = new Set([glyphKey(correct), glyphKey(c)]);
      const wrong: Glyph[] = [];
      for (const g of [...traps, ...pickGlyphDistractors(correct, [a, b, c], seed)]) {
        if (wrong.length < 3 && !seen.has(glyphKey(g)) && g.count >= 1 && g.count <= 4) {
          seen.add(glyphKey(g));
          wrong.push(g);
        }
      }
      const shuffled = shuffleOptions(correct, wrong);
      board = { type: 'analogy', cells: [a, b, c, null], options: shuffled.options };
      answer = shuffled.answer;
      break;
    }
    case 'symmetry': {
      const given = parseBits(rule.half);
      const correct = completeSymmetry(rule.axis, given);
      const rng = createRng(seed);
      const flip = (b: Bits, r: number, c: number) => b.map((row, i) => row.map((v, j) => (i === r && j === c ? 1 - v : v)));
      const rows = correct.length;
      const cols = correct[0]?.length ?? 0;
      const candidates: Bits[] = [
        given.map((r) => [...r]), // copied instead of mirrored
        flip(correct, rng.int(0, rows - 1), rng.int(0, cols - 1)),
        [...correct].reverse(), // mirrored on the wrong axis
        correct.map((r) => [...r].reverse()),
      ];
      for (let i = 0; i < 12; i++) candidates.push(flip(correct, rng.int(0, rows - 1), rng.int(0, cols - 1)));
      const seen = new Set([bitsKey(correct)]);
      const wrong: Bits[] = [];
      for (const b of candidates) {
        if (wrong.length < 3 && !seen.has(bitsKey(b))) {
          seen.add(bitsKey(b));
          wrong.push(b);
        }
      }
      const shuffled = shuffleOptions(correct, wrong);
      board = { type: 'symmetry', axis: rule.axis, rows, cols, given, options: shuffled.options, color: rule.color };
      answer = shuffled.answer;
      break;
    }
  }

  return {
    id: spec.id,
    category: 'pattern',
    difficulty: spec.difficulty,
    skill: patternSkill(rule),
    position,
    estimatedSeconds: SECONDS[spec.difficulty],
    xp: XP[spec.difficulty],
    premium: spec.difficulty === 'hard',
    rule,
    board,
    answer,
  };
}

/** The correct glyph (or bit grid) recomputed from the rule, independently of the board. */
export function expectedPatternAnswer(rule: PatternRule): Glyph | Bits {
  switch (rule.type) {
    case 'row':
      return rowGlyphAt(rule.glyph, rule.missing);
    case 'matrix':
      return matrixGlyphAt(rule.glyph, Math.floor(rule.missing / 3), rule.missing % 3);
    case 'analogy':
      return applyTransforms(fullGlyph(rule.c), rule.transforms);
    case 'symmetry':
      return completeSymmetry(rule.axis, parseBits(rule.half));
  }
}

/* --------------------------------------------------------- ambiguity check */

type AttrName = 'shape' | 'color' | 'fill' | 'size' | 'rotation' | 'count';
const ATTRS: AttrName[] = ['shape', 'color', 'fill', 'size', 'rotation', 'count'];
const attrValue = (g: Glyph, a: AttrName): string | number => (a === 'rotation' ? normalizedRotation(g) : a === 'fill' ? (HAS_OUTLINE[g.shape] ? g.fill : 'solid') : g[a]);

/** For a row: the shortest period consistent with the visible cells must predict the answer. */
function checkRowAttribute(cells: (Glyph | null)[], missing: number, answer: Glyph, attr: AttrName): string | null {
  const visible = cells.map((g, i) => [i, g ? attrValue(g, attr) : null] as const).filter((p) => p[1] !== null);
  const values = visible.map((p) => p[1]);
  // Constant step (numeric progressions such as rotation +90° or count +1), on raw values.
  if (attr === 'rotation' || attr === 'count') {
    const raw = (g: Glyph) => (attr === 'rotation' ? g.rotation : g.count);
    const steps = new Set<number>();
    for (let i = 1; i < cells.length; i++) {
      const g0 = cells[i - 1];
      const g1 = cells[i];
      if (g0 && g1) steps.add(attr === 'rotation' ? mod(raw(g1) - raw(g0), 360) : raw(g1) - raw(g0));
    }
    if (steps.size === 1 && visible.length >= 3) {
      const step = [...steps][0] as number;
      const prev = cells[missing - 1] ?? cells[missing + 1];
      if (prev) {
        const base = raw(prev);
        const predicted = cells[missing - 1] ? base + step : base - step;
        const norm = attr === 'rotation' ? normalizedRotation({ shape: answer.shape, rotation: predicted }) : predicted;
        if (norm !== attrValue(answer, attr)) return `${attr}: constant step predicts ${norm}`;
        return null;
      }
    }
  }
  for (let p = 1; p <= cells.length; p++) {
    const byResidue = new Map<number, string | number>();
    let consistent = true;
    for (const [i, v] of visible) {
      const prev = byResidue.get(i % p);
      if (prev !== undefined && prev !== v) consistent = false;
      byResidue.set(i % p, v as string | number);
    }
    if (!consistent) continue;
    const predicted = byResidue.get(missing % p);
    if (predicted === undefined) return `${attr}: not determined by the visible cells`;
    if (predicted !== attrValue(answer, attr)) return `${attr}: a period of ${p} predicts ${predicted}`;
    return null;
  }
  return values.length ? null : `${attr}: no visible value`;
}

/** For a 3×3 matrix: every plausible model (constant rows, constant columns, Latin square) that fits must agree. */
function checkMatrixAttribute(cells: (Glyph | null)[], missing: number, answer: Glyph, attr: AttrName): string | null {
  const v = (r: number, c: number) => {
    const g = cells[r * 3 + c];
    return g ? attrValue(g, attr) : null;
  };
  const mr = Math.floor(missing / 3);
  const mc = missing % 3;
  const truth = attrValue(answer, attr);
  const preds: { model: string; value: string | number }[] = [];
  const line = (get: (k: number) => string | number | null) => [0, 1, 2].map(get).filter((x): x is string | number => x !== null);
  const rowsConst = [0, 1, 2].every((r) => new Set(line((c) => v(r, c))).size <= 1);
  if (rowsConst) preds.push({ model: 'constant rows', value: line((c) => v(mr, c))[0] as string | number });
  const colsConst = [0, 1, 2].every((c) => new Set(line((r) => v(r, c))).size <= 1);
  if (colsConst) preds.push({ model: 'constant columns', value: line((r) => v(r, mc))[0] as string | number });
  const all = new Set(cells.filter(Boolean).map((g) => attrValue(g as Glyph, attr)));
  const latin = all.size === 3 && [0, 1, 2].every((k) => new Set(line((c) => v(k, c))).size === line((c) => v(k, c)).length && new Set(line((r) => v(r, k))).size === line((r) => v(r, k)).length);
  if (latin) {
    const inRow = new Set(line((c) => v(mr, c)));
    const missingValue = [...all].find((x) => !inRow.has(x));
    if (missingValue !== undefined) preds.push({ model: 'one of each per row and column', value: missingValue });
  }
  if (preds.length === 0) return `${attr}: no simple model explains the grid`;
  const bad = preds.find((p) => p.value !== truth);
  return bad ? `${attr}: "${bad.model}" predicts ${bad.value}` : null;
}

/** Integrity check of a compiled pattern challenge. Returns problems (empty = valid). */
export function checkPattern(c: PatternChallenge): string[] {
  const problems: string[] = [];
  const b = c.board;
  const expected = expectedPatternAnswer(c.rule);
  if (b.options.length !== 4) problems.push('4 options expected');
  if (c.answer < 0 || c.answer >= b.options.length) problems.push('answer index out of range');

  if (b.type === 'symmetry') {
    const keys = b.options.map(bitsKey);
    if (new Set(keys).size !== keys.length) problems.push('options are not visually distinct');
    if (keys[c.answer] !== bitsKey(expected as Bits)) problems.push('answer does not complete the symmetry');
    if (keys.filter((k) => k === bitsKey(expected as Bits)).length !== 1) problems.push('several options complete the figure');
    const ones = b.given.flat().reduce((s, x) => s + x, 0);
    if (ones < 3 || ones > b.given.flat().length - 2) problems.push('figure too empty or too full');
    if (bitsKey(b.given) === bitsKey(expected as Bits)) problems.push('half is already symmetric; mirroring is not tested');
    return problems;
  }

  const options = b.options as Glyph[];
  const keys = options.map(glyphKey);
  if (new Set(keys).size !== keys.length) problems.push('options are not visually distinct');
  if (keys[c.answer] !== glyphKey(expected as Glyph)) problems.push('answer does not follow the rule');
  if (options.some((g) => g.count < 1 || g.count > 4)) problems.push('count out of range');
  const cells = b.cells as (Glyph | null)[];
  if (cells.filter((g) => g === null).length !== 1) problems.push('exactly one missing cell expected');
  if (cells.some((g) => g && (g.count < 1 || g.count > 4))) problems.push('board count out of range');
  const missing = cells.indexOf(null);

  if (c.rule.type === 'row') {
    for (const attr of ATTRS) {
      const issue = checkRowAttribute(cells, missing, expected as Glyph, attr);
      if (issue) problems.push(`ambiguous ${issue}`);
    }
  }
  if (c.rule.type === 'matrix') {
    for (const attr of ATTRS) {
      const issue = checkMatrixAttribute(cells, missing, expected as Glyph, attr);
      if (issue) problems.push(`ambiguous ${issue}`);
    }
  }
  if (c.rule.type === 'analogy') {
    const [a, bb, cc] = cells as Glyph[];
    if (glyphKey(a as Glyph) === glyphKey(bb as Glyph)) problems.push('A and B look identical: the change is invisible');
    if (glyphKey(cc as Glyph) === glyphKey(expected as Glyph)) problems.push('C and the answer look identical');
    for (const tr of c.rule.transforms) {
      // Every single change must be visible on both A and C, otherwise the explanation lies.
      if (glyphKey(applyTransforms(a as Glyph, [tr])) === glyphKey(a as Glyph) || glyphKey(applyTransforms(cc as Glyph, [tr])) === glyphKey(cc as Glyph)) problems.push(`transform ${tr.kind} is invisible`);
      if (tr.kind === 'rotate' && (ROTATION_PERIOD[(a as Glyph).shape] === 0 || ROTATION_PERIOD[(cc as Glyph).shape] === 0)) problems.push('rotation applied to a rotation-invariant shape');
      if (tr.kind === 'swapFill' && (!HAS_OUTLINE[(a as Glyph).shape] || !HAS_OUTLINE[(cc as Glyph).shape])) problems.push('fill change on a shape without outline variant');
    }
  }
  return problems;
}

export function patternSignature(c: PatternChallenge): string {
  return JSON.stringify(c.rule);
}

/* ---------------------------------------------------------------- describe */

export function describeGlyph(g: Glyph, t: Translate): string {
  const parts = [`${g.count > 1 ? `${g.count} × ` : ''}${t(`pat.shape.${g.shape}`)}`, t(`pat.color.${g.color}`)];
  if (HAS_OUTLINE[g.shape] && g.fill === 'outline') parts.push(t('pat.fill.outline'));
  if (g.size !== 'm') parts.push(t(`pat.size.${g.size}`));
  const rot = normalizedRotation(g);
  if (rot !== 0) parts.push(`${rot}°`);
  return parts.join(' · ');
}

export function describeBits(bits: Bits, t: Translate): string {
  return t('pat.bitsLabel', { rows: bits.map((r) => r.map((v) => (v ? '■' : '□')).join('')).join(' / ') });
}

const listOf = <T>(values: readonly T[], label: (v: T) => string) => values.map(label).join(' → ');

export function explainPattern(c: PatternChallenge, t: Translate): string[] {
  const rule = c.rule;
  const lines: string[] = [];
  switch (rule.type) {
    case 'row': {
      const g = rule.glyph;
      if (g.shape.cycle.length > 1) lines.push(t('pat.explain.shapeCycle', { list: listOf(g.shape.cycle, (s) => t(`pat.shape.${s}`)) }));
      if (g.color.cycle.length > 1) lines.push(t('pat.explain.colorCycle', { list: listOf(g.color.cycle, (s) => t(`pat.color.${s}`)) }));
      if (g.fill && g.fill.cycle.length > 1) lines.push(t('pat.explain.fillCycle', { list: listOf(g.fill.cycle, (s) => t(`pat.fill.${s}`)) }));
      if (g.size && g.size.cycle.length > 1) lines.push(t('pat.explain.sizeCycle', { list: listOf(g.size.cycle, (s) => t(`pat.size.${s}`)) }));
      if (g.rotation) {
        if (isStep(g.rotation) && g.rotation.step !== 0) lines.push(t(g.rotation.step > 0 ? 'pat.explain.rotateClockwise' : 'pat.explain.rotateCounter', { deg: Math.abs(g.rotation.step) }));
        else if (!isStep(g.rotation) && g.rotation.cycle.length > 1) lines.push(t('pat.explain.rotationCycle', { list: listOf(g.rotation.cycle, (d) => `${d}°`) }));
      }
      if (g.count) {
        if (isStep(g.count) && g.count.step !== 0) lines.push(t(g.count.step > 0 ? 'pat.explain.countUp' : 'pat.explain.countDown', { count: Math.abs(g.count.step) }));
        else if (!isStep(g.count) && g.count.cycle.length > 1) lines.push(t('pat.explain.countCycle', { list: g.count.cycle.join(' → ') }));
      }
      break;
    }
    case 'matrix': {
      const g = rule.glyph;
      const entries: [string, CellAttr<string | number> | undefined, (v: string | number) => string][] = [
        ['shape', g.shape, (v) => t(`pat.shape.${v}`)],
        ['color', g.color, (v) => t(`pat.color.${v}`)],
        ['fill', g.fill, (v) => t(`pat.fill.${v}`)],
        ['count', g.count, (v) => String(v)],
        ['rotation', g.rotation, (v) => `${v}°`],
      ];
      for (const [name, attr, label] of entries) {
        if (!attr || attr.by === 'const') continue;
        const key = attr.by === 'row' ? 'pat.explain.matrixRow' : attr.by === 'col' ? 'pat.explain.matrixCol' : 'pat.explain.matrixLatin';
        lines.push(t(key, { attr: t(`pat.attr.${name}`), list: attr.values.map(label).join(', ') }));
      }
      break;
    }
    case 'analogy':
      lines.push(t('pat.explain.analogyIntro'));
      for (const tr of rule.transforms) {
        if (tr.kind === 'rotate') lines.push(t(tr.deg > 0 ? 'pat.explain.trRotateClockwise' : 'pat.explain.trRotateCounter', { deg: Math.abs(tr.deg) }));
        else if (tr.kind === 'swapFill') lines.push(t('pat.explain.trSwapFill'));
        else if (tr.kind === 'addCount') lines.push(t(tr.by > 0 ? 'pat.explain.trAddCount' : 'pat.explain.trRemoveCount', { count: Math.abs(tr.by) }));
        else if (tr.kind === 'setColor') lines.push(t('pat.explain.trSetColor', { color: t(`pat.color.${tr.color}`) }));
        else lines.push(t('pat.explain.trGrow'));
      }
      break;
    case 'symmetry':
      lines.push(t(`pat.explain.symmetry_${rule.axis}`));
      break;
  }
  const expected = expectedPatternAnswer(rule);
  lines.push(t('pat.explain.answer', { answer: rule.type === 'symmetry' ? t('pat.optionLabel', { n: c.answer + 1 }) : describeGlyph(expected as Glyph, t) }));
  return lines;
}
