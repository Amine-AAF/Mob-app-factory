import type { Axis, Fill, Glyph, GlyphColor, PatternRule, PatternSpec, Shape, Size, Transform } from '@/engine';

/**
 * 80 visual pattern challenges: rows (shape / color / rotation / count / fill
 * progressions), 3×3 matrices, symmetry completion and visual analogies.
 * Only rules are authored; boards, options and answers are generated and
 * `checkPattern` rejects ambiguous boards.
 */
interface RowOpts {
  shape: Shape[];
  color: GlyphColor[];
  fill?: Fill[];
  size?: Size[];
  rot?: number[] | { start: number; step: number };
  count?: number[] | { start: number; step: number };
}

const row = (length: number, missing: number, o: RowOpts): PatternRule => ({
  type: 'row',
  length,
  missing,
  glyph: {
    shape: { cycle: o.shape },
    color: { cycle: o.color },
    ...(o.fill ? { fill: { cycle: o.fill } } : {}),
    ...(o.size ? { size: { cycle: o.size } } : {}),
    ...(o.rot ? { rotation: Array.isArray(o.rot) ? { cycle: o.rot } : o.rot } : {}),
    ...(o.count ? { count: Array.isArray(o.count) ? { cycle: o.count } : o.count } : {}),
  },
});

type By<T> = [Axis, T[]];
const matrix = (missing: number, o: { shape: By<Shape>; color: By<GlyphColor>; count?: By<number>; fill?: By<Fill>; rot?: By<number> }): PatternRule => ({
  type: 'matrix',
  missing,
  glyph: {
    shape: { by: o.shape[0], values: o.shape[1] },
    color: { by: o.color[0], values: o.color[1] },
    ...(o.count ? { count: { by: o.count[0], values: o.count[1] } } : {}),
    ...(o.fill ? { fill: { by: o.fill[0], values: o.fill[1] } } : {}),
    ...(o.rot ? { rotation: { by: o.rot[0], values: o.rot[1] } } : {}),
  },
});

const sym = (axis: 'vertical' | 'horizontal' | 'rotational', color: GlyphColor, ...half: string[]): PatternRule => ({ type: 'symmetry', axis, half, color });

type G = Partial<Glyph> & Pick<Glyph, 'shape' | 'color'>;
const analogy = (a: G, c: G, ...transforms: Transform[]): PatternRule => ({ type: 'analogy', a, c, transforms });
const rotate = (deg: number): Transform => ({ kind: 'rotate', deg });
const swapFill: Transform = { kind: 'swapFill' };
const addCount = (by: number): Transform => ({ kind: 'addCount', by });
const setColor = (color: GlyphColor): Transform => ({ kind: 'setColor', color });
const grow: Transform = { kind: 'grow' };

const EASY: PatternRule[] = [
  row(6, 5, { shape: ['circle', 'square'], color: ['blue'] }),
  row(6, 5, { shape: ['star'], color: ['orange', 'blue'] }),
  row(6, 5, { shape: ['triangle', 'circle', 'square'], color: ['green'] }),
  row(5, 4, { shape: ['arrow'], color: ['purple'], rot: { start: 0, step: 90 } }),
  row(6, 5, { shape: ['heart'], color: ['red', 'blue', 'green'] }),
  row(6, 3, { shape: ['square', 'diamond'], color: ['orange'] }),
  row(4, 3, { shape: ['circle'], color: ['blue'], count: { start: 1, step: 1 } }),
  row(6, 5, { shape: ['star'], color: ['green'], fill: ['solid', 'outline'] }),
  row(6, 4, { shape: ['triangle'], color: ['purple', 'orange', 'red'] }),
  row(6, 5, { shape: ['square'], color: ['red'], size: ['s', 'm', 'l'] }),
  row(5, 4, { shape: ['arrow'], color: ['green'], rot: { start: 0, step: 45 } }),
  row(6, 2, { shape: ['heart', 'star', 'circle'], color: ['purple'] }),
  row(4, 3, { shape: ['diamond'], color: ['orange'], count: { start: 4, step: -1 } }),
  row(6, 5, { shape: ['circle'], color: ['green', 'green', 'blue'] }),
  matrix(8, { shape: ['row', ['circle', 'square', 'triangle']], color: ['const', ['blue']] }),
  matrix(8, { shape: ['const', ['star']], color: ['col', ['red', 'green', 'orange']] }),
  matrix(4, { shape: ['col', ['heart', 'diamond', 'circle']], color: ['const', ['purple']] }),
  matrix(7, { shape: ['row', ['square', 'star', 'heart']], color: ['const', ['orange']] }),
  sym('vertical', 'blue', '10', '11', '01', '10'),
  sym('vertical', 'green', '11', '01', '01', '11'),
  sym('vertical', 'purple', '01', '11', '10', '00'),
  sym('horizontal', 'orange', '1001', '0110'),
  sym('horizontal', 'red', '1100', '1011'),
  analogy({ shape: 'circle', color: 'blue' }, { shape: 'square', color: 'green' }, swapFill),
  analogy({ shape: 'arrow', color: 'orange' }, { shape: 'arrow', color: 'purple', rotation: 90 }, rotate(90)),
  analogy({ shape: 'star', color: 'red' }, { shape: 'triangle', color: 'blue' }, addCount(1)),
  analogy({ shape: 'heart', color: 'green', size: 's' }, { shape: 'diamond', color: 'orange', size: 's' }, grow),
  analogy({ shape: 'square', color: 'purple' }, { shape: 'circle', color: 'purple' }, setColor('orange')),
];

const MEDIUM: PatternRule[] = [
  row(6, 5, { shape: ['circle', 'square', 'triangle'], color: ['blue', 'orange'] }),
  row(6, 5, { shape: ['arrow'], color: ['green', 'red'], rot: { start: 0, step: 90 } }),
  row(6, 5, { shape: ['star', 'heart'], color: ['purple'], fill: ['solid', 'solid', 'outline'] }),
  row(6, 4, { shape: ['diamond'], color: ['blue', 'green', 'orange'], count: [1, 2] }),
  row(7, 6, { shape: ['heart'], color: ['red'], rot: { start: 0, step: -90 }, size: ['s', 'l'] }),
  row(6, 5, { shape: ['triangle', 'square'], color: ['orange'], count: [1, 2, 3] }),
  row(6, 3, { shape: ['circle', 'star', 'diamond'], color: ['green', 'purple'] }),
  row(7, 6, { shape: ['arrow'], color: ['blue'], rot: { start: 45, step: 45 }, count: [1, 2] }),
  row(6, 5, { shape: ['square'], color: ['red', 'blue', 'green'], fill: ['outline', 'solid'] }),
  row(6, 5, { shape: ['heart', 'diamond'], color: ['orange'], size: ['s', 'm', 'l'] }),
  row(7, 6, { shape: ['star'], color: ['purple', 'green'], count: [1, 2, 3] }),
  row(6, 2, { shape: ['triangle', 'circle', 'heart'], color: ['blue'], fill: ['solid', 'outline'] }),
  matrix(8, { shape: ['latin', ['circle', 'square', 'triangle']], color: ['const', ['blue']] }),
  matrix(8, { shape: ['row', ['star', 'heart', 'diamond']], color: ['col', ['red', 'blue', 'green']] }),
  matrix(4, { shape: ['latin', ['square', 'star', 'circle']], color: ['row', ['orange', 'purple', 'green']] }),
  matrix(8, { shape: ['const', ['diamond']], color: ['latin', ['blue', 'orange', 'red']], count: ['col', [1, 2, 3]] }),
  matrix(6, { shape: ['col', ['heart', 'triangle', 'square']], color: ['const', ['green']], count: ['row', [1, 2, 3]] }),
  matrix(2, { shape: ['latin', ['circle', 'diamond', 'star']], color: ['col', ['purple', 'red', 'blue']] }),
  sym('vertical', 'orange', '100', '110', '011', '001', '111', '010'),
  sym('vertical', 'blue', '011', '100', '110', '001', '101', '011'),
  sym('horizontal', 'green', '101100', '010011', '110001'),
  sym('horizontal', 'purple', '011010', '100101', '001110'),
  sym('vertical', 'red', '110', '001', '100', '011', '010', '101'),
  analogy({ shape: 'arrow', color: 'blue' }, { shape: 'arrow', color: 'green', rotation: 180 }, rotate(90), addCount(1)),
  analogy({ shape: 'circle', color: 'red' }, { shape: 'star', color: 'blue' }, swapFill, addCount(2)),
  analogy({ shape: 'heart', color: 'orange', size: 's' }, { shape: 'triangle', color: 'purple', size: 's' }, grow, swapFill),
  analogy({ shape: 'diamond', color: 'green' }, { shape: 'heart', color: 'blue' }, rotate(180), setColor('red')),
  analogy({ shape: 'square', color: 'blue', count: 3 }, { shape: 'star', color: 'orange', count: 2 }, addCount(-1), swapFill),
];

const HARD: PatternRule[] = [
  row(7, 6, { shape: ['circle', 'square', 'triangle'], color: ['blue', 'orange'], fill: ['solid', 'solid', 'outline', 'outline'] }),
  row(7, 6, { shape: ['arrow', 'heart'], color: ['green', 'purple', 'red'], rot: { start: 0, step: 90 } }),
  row(7, 5, { shape: ['star', 'diamond', 'circle'], color: ['red', 'blue'], count: [1, 2, 3, 2] }),
  row(8, 7, { shape: ['heart'], color: ['orange', 'green', 'blue'], rot: { start: 0, step: 45 }, size: ['s', 'm'] }),
  row(7, 6, { shape: ['triangle', 'square'], color: ['purple', 'purple', 'orange'], count: [1, 2, 3], fill: ['outline', 'solid'] }),
  row(8, 4, { shape: ['diamond', 'arrow'], color: ['blue'], rot: { start: 0, step: 135 }, count: [3, 2, 1] }),
  row(7, 6, { shape: ['circle', 'star'], color: ['green', 'red', 'orange'], size: ['l', 'm', 's'], fill: ['solid', 'outline'] }),
  row(8, 7, { shape: ['arrow'], color: ['purple', 'blue'], rot: [0, 90, 270, 180], count: [1, 2] }),
  row(7, 6, { shape: ['square', 'heart', 'triangle', 'circle'], color: ['orange', 'blue'], count: [2, 1] }),
  matrix(8, { shape: ['latin', ['circle', 'square', 'triangle']], color: ['latin2', ['blue', 'orange', 'green']] }),
  matrix(8, { shape: ['latin', ['star', 'heart', 'diamond']], color: ['latin2', ['red', 'purple', 'blue']], count: ['col', [1, 2, 3]] }),
  matrix(0, { shape: ['latin2', ['square', 'circle', 'star']], color: ['latin', ['green', 'orange', 'purple']], count: ['row', [3, 2, 1]] }),
  matrix(4, { shape: ['latin', ['triangle', 'diamond', 'heart']], color: ['col', ['blue', 'red', 'green']], fill: ['row', ['solid', 'outline', 'solid']] }),
  matrix(8, { shape: ['row', ['arrow', 'arrow', 'arrow']], color: ['latin', ['orange', 'blue', 'purple']], rot: ['col', [0, 90, 180]] }),
  matrix(5, { shape: ['latin2', ['heart', 'star', 'square']], color: ['latin', ['red', 'green', 'blue']], count: ['latin', [1, 2, 3]] }),
  sym('rotational', 'blue', '100', '110', '011', '001', '101', '010'),
  sym('rotational', 'green', '011', '101', '100', '010', '110', '001'),
  sym('rotational', 'purple', '110', '010', '001', '101', '100', '011'),
  sym('rotational', 'orange', '001', '111', '010', '100', '011', '101'),
  sym('horizontal', 'red', '110010', '001101', '101011'),
  analogy({ shape: 'arrow', color: 'blue', size: 's' }, { shape: 'arrow', color: 'red', size: 's', rotation: 90 }, rotate(-90), grow, addCount(1)),
  analogy({ shape: 'heart', color: 'green' }, { shape: 'diamond', color: 'orange', count: 2 }, rotate(180), swapFill, addCount(1)),
  analogy({ shape: 'star', color: 'purple', size: 's', count: 2 }, { shape: 'circle', color: 'blue', size: 's', count: 3 }, setColor('orange'), grow, addCount(-1)),
  analogy({ shape: 'triangle', color: 'red' }, { shape: 'square', color: 'green', count: 2 }, swapFill, setColor('blue'), addCount(2)),
];

const LEVELS: [PatternSpec['difficulty'], PatternRule[]][] = [
  ['easy', EASY],
  ['medium', MEDIUM],
  ['hard', HARD],
];

export const PATTERN_SPECS: PatternSpec[] = LEVELS.flatMap(([difficulty, rules]) =>
  rules.map((rule, i) => ({ id: `pat-${difficulty[0]}-${String(i + 1).padStart(3, '0')}`, difficulty, rule })),
);
