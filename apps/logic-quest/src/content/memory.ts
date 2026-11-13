import type { MemoryEntry, MemorySpec } from '@/engine';

/**
 * 60 memory challenges (15 per mechanic) with a smooth difficulty ramp.
 * Each record is fully determined by its parameters and `seed`.
 */
type Level = { d: MemoryEntry['difficulty']; spec: MemorySpec };

const seed = (kind: string, i: number) => 1000 + i * 97 + kind.length * 13;

// Sequence memory: repeat the order in which tiles light up.
const SEQUENCE: Level[] = Array.from({ length: 15 }, (_, i) => {
  const d = i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard';
  const tiles = (i < 5 ? 4 : i < 10 ? 6 : 9) as 4 | 6 | 9;
  return { d, spec: { kind: 'sequence', tiles, length: 3 + Math.floor(i / 2), seed: seed('sequence', i), showMs: Math.max(450, 700 - i * 15), gapMs: 250 } };
});

// Pattern recall: remember which cells were lit (any order).
const PATTERN: Level[] = Array.from({ length: 15 }, (_, i) => {
  const d = i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard';
  const size = i < 5 ? 3 : i < 10 ? 4 : 5;
  return { d, spec: { kind: 'pattern', rows: size, cols: size, lit: 3 + Math.floor(i * 0.6), seed: seed('pattern', i), showMs: Math.max(1600, 2600 - i * 60) } };
});

// Number recall: type the digits back; hard levels ask for them in reverse order.
const NUMBER: Level[] = Array.from({ length: 15 }, (_, i) => {
  const d = i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard';
  const digits = i < 10 ? 4 + Math.floor(i / 2) : 4 + Math.floor((i - 10) / 2);
  return { d, spec: { kind: 'number', digits, seed: seed('number', i), showMs: 900 + digits * 450, reverse: i >= 10 } };
});

// Visual memory: which symbol was (not) shown?
const VISUAL: Level[] = Array.from({ length: 15 }, (_, i) => {
  const d = i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard';
  return { d, spec: { kind: 'visual', shown: 3 + Math.floor(i / 2), seed: seed('visual', i), showMs: 2500 + i * 200, ask: i % 3 === 1 ? 'present' : 'missing' } };
});

const ALL = [SEQUENCE, PATTERN, NUMBER, VISUAL];

/** Per difficulty, mechanics are interleaved (sequence, pattern, number, visual, …). */
export const MEMORY_SPECS: MemoryEntry[] = (['easy', 'medium', 'hard'] as const).flatMap((difficulty) => {
  const queues = ALL.map((list) => list.filter((l) => l.d === difficulty));
  const ordered: Level[] = [];
  for (let k = 0; queues.some((q) => q.length); k++) {
    const next = queues[k % queues.length]?.shift();
    if (next) ordered.push(next);
  }
  return ordered.map((l, i) => ({ id: `mem-${difficulty[0]}-${String(i + 1).padStart(3, '0')}`, difficulty, spec: l.spec }));
});
