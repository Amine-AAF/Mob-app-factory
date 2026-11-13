import { COLORS, SHAPES, type Glyph } from './patterns';
import { createRng } from './rng';
import type { Difficulty, MemoryChallenge, Skill, Translate } from './types';

/**
 * Memory challenges are fully determined by their spec (including `seed`):
 * what is shown, for how long, and the expected recall. The display timeline
 * is a pure function of elapsed time (`memoryFrameAt`), so the game state is
 * deterministic and testable without real timers.
 */
export type MemorySpec =
  | { kind: 'sequence'; tiles: 4 | 6 | 9; length: number; seed: number; showMs: number; gapMs: number }
  | { kind: 'pattern'; rows: number; cols: number; lit: number; seed: number; showMs: number }
  | { kind: 'number'; digits: number; seed: number; showMs: number; reverse?: boolean }
  | { kind: 'visual'; shown: number; seed: number; showMs: number; ask: 'missing' | 'present' };

export interface MemoryEntry {
  id: string;
  difficulty: Difficulty;
  spec: MemorySpec;
}

export interface MemoryRound {
  /** Tiles to flash in order (sequence), lit cells (pattern), digits (number). */
  items: number[];
  /** Visual memory: glyphs displayed during the memorize phase. */
  shownGlyphs: Glyph[];
  /** Visual memory: the 4 choices offered at recall time. */
  options: Glyph[];
  expected: number[];
}

const SKILL: Record<MemorySpec['kind'], Skill> = { sequence: 'sequence-memory', pattern: 'pattern-recall', number: 'number-recall', visual: 'visual-memory' };
const XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };

const glyphPool = (): Glyph[] => SHAPES.flatMap((shape) => COLORS.map((color) => ({ shape, color, rotation: 0, fill: 'solid' as const, count: 1, size: 'm' as const })));

export function buildMemoryRound(spec: MemorySpec): MemoryRound {
  const rng = createRng(spec.seed);
  switch (spec.kind) {
    case 'sequence': {
      // Consecutive repeats are avoided: a tile flashing twice in a row is hard to perceive.
      const items: number[] = [];
      while (items.length < spec.length) {
        const tile = rng.int(0, spec.tiles - 1);
        if (tile !== items[items.length - 1]) items.push(tile);
      }
      return { items, shownGlyphs: [], options: [], expected: items };
    }
    case 'pattern': {
      const cells = rng.shuffle(Array.from({ length: spec.rows * spec.cols }, (_, i) => i)).slice(0, spec.lit).sort((a, b) => a - b);
      return { items: cells, shownGlyphs: [], options: [], expected: cells };
    }
    case 'number': {
      const items = Array.from({ length: spec.digits }, (_, i) => (i === 0 ? rng.int(1, 9) : rng.int(0, 9)));
      return { items, shownGlyphs: [], options: [], expected: spec.reverse ? [...items].reverse() : items };
    }
    case 'visual': {
      const pool = rng.shuffle(glyphPool());
      const shown = pool.slice(0, spec.shown);
      const unseen = pool.slice(spec.shown);
      const correct = spec.ask === 'missing' ? (unseen[0] as Glyph) : (rng.pick(shown) as Glyph);
      const others = spec.ask === 'missing' ? rng.shuffle(shown).slice(0, 3) : unseen.slice(0, 3);
      const options = rng.shuffle([correct, ...others]);
      return { items: [], shownGlyphs: shown, options, expected: [options.indexOf(correct)] };
    }
  }
}

/** Total memorize-phase duration in ms, optionally relaxed for accessibility. */
export function memoryDisplayMs(spec: MemorySpec, relaxed = false): number {
  const factor = relaxed ? 1.5 : 1;
  if (spec.kind === 'sequence') return Math.round(spec.length * (spec.showMs + spec.gapMs) * factor);
  return Math.round(spec.showMs * factor);
}

export type MemoryFrame = { phase: 'show'; activeTile: number | null } | { phase: 'recall' };

/** What the memorize phase displays `elapsedMs` after it started. Pure and deterministic. */
export function memoryFrameAt(spec: MemorySpec, round: MemoryRound, elapsedMs: number, relaxed = false): MemoryFrame {
  if (elapsedMs >= memoryDisplayMs(spec, relaxed)) return { phase: 'recall' };
  if (spec.kind !== 'sequence') return { phase: 'show', activeTile: null };
  const factor = relaxed ? 1.5 : 1;
  const slot = (spec.showMs + spec.gapMs) * factor;
  const index = Math.floor(elapsedMs / slot);
  const within = elapsedMs - index * slot;
  return { phase: 'show', activeTile: within < spec.showMs * factor ? (round.items[index] ?? null) : null };
}

export function compileMemory(entry: MemoryEntry, position: number): MemoryChallenge {
  const round = buildMemoryRound(entry.spec);
  return {
    id: entry.id,
    category: 'memory',
    difficulty: entry.difficulty,
    skill: SKILL[entry.spec.kind],
    position,
    estimatedSeconds: Math.round(memoryDisplayMs(entry.spec) / 1000) + 15,
    xp: XP[entry.difficulty],
    premium: entry.difficulty === 'hard',
    spec: entry.spec,
    answer: round.expected,
  };
}

const glyphId = (g: Glyph) => `${g.shape}|${g.color}`;

export function checkMemory(c: MemoryChallenge): string[] {
  const problems: string[] = [];
  const s = c.spec;
  const round = buildMemoryRound(s);
  if (JSON.stringify(round.expected) !== JSON.stringify(c.answer)) problems.push('answer does not match the seeded round');
  if (JSON.stringify(buildMemoryRound(s)) !== JSON.stringify(round)) problems.push('round generation is not deterministic');
  switch (s.kind) {
    case 'sequence':
      if (s.length < 2 || s.length > 12) problems.push('sequence length out of range');
      if (s.showMs < 300 || s.gapMs < 150) problems.push('flashes too fast to perceive');
      if (round.items.some((x) => x < 0 || x >= s.tiles)) problems.push('tile out of range');
      break;
    case 'pattern':
      if (s.lit < 2 || s.lit >= s.rows * s.cols) problems.push('lit cell count out of range');
      if (new Set(round.items).size !== s.lit) problems.push('duplicate lit cells');
      if (s.showMs < 800) problems.push('display too short');
      break;
    case 'number':
      if (s.digits < 3 || s.digits > 12) problems.push('digit count out of range');
      if (s.showMs < 200 * s.digits) problems.push('display too short for the number of digits');
      break;
    case 'visual': {
      const ids = round.options.map(glyphId);
      if (new Set(ids).size !== 4) problems.push('visual options must be distinct');
      const shown = new Set(round.shownGlyphs.map(glyphId));
      const matching = ids.filter((id) => (s.ask === 'missing' ? !shown.has(id) : shown.has(id)));
      if (matching.length !== 1) problems.push('exactly one option must satisfy the question');
      if (s.shown < 3 || s.shown > 12) problems.push('shown glyph count out of range');
      break;
    }
  }
  return problems;
}

/** Equality between a recall attempt and the expected answer (pattern recall ignores order). */
export function memoryAnswerCorrect(c: MemoryChallenge, taps: number[]): boolean {
  if (c.spec.kind === 'pattern') {
    const a = [...new Set(taps)].sort((x, y) => x - y);
    return a.length === c.answer.length && a.every((v, i) => v === c.answer[i]);
  }
  return taps.length === c.answer.length && taps.every((v, i) => v === c.answer[i]);
}

export function memorySignature(c: MemoryChallenge): string {
  return JSON.stringify(c.spec);
}

export function explainMemory(c: MemoryChallenge, t: Translate): { explanation: string[]; answerLabel: string } {
  const s = c.spec;
  const round = buildMemoryRound(s);
  switch (s.kind) {
    case 'sequence':
      return { explanation: [t('mem.explain.sequence', { count: s.length })], answerLabel: round.items.map((i) => i + 1).join(' → ') };
    case 'pattern':
      return { explanation: [t('mem.explain.pattern', { count: s.lit })], answerLabel: t('mem.cellsLabel', { count: s.lit }) };
    case 'number':
      return {
        explanation: [t(s.reverse ? 'mem.explain.numberReverse' : 'mem.explain.number', { digits: round.items.join('') })],
        answerLabel: round.expected.join(''),
      };
    case 'visual':
      return { explanation: [t(s.ask === 'missing' ? 'mem.explain.visualMissing' : 'mem.explain.visualPresent')], answerLabel: t('pat.optionLabel', { n: (c.answer[0] ?? 0) + 1 }) };
  }
}
