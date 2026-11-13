/**
 * Logic Quest game engine: pure TypeScript, no React, no SDK, no I/O.
 *
 *   content specs ──compile──► Challenge records ──checkChallenge──► validated
 *                                   │
 *   UI ──submitAnswer──► session state machine ──checkAnswer──► result ──computeXp──► storage
 */
export * from './types';
export * from './rng';
export * from './sequences';
export * from './patterns';
export * from './memory';
export * from './deduction';
export * from './answers';
export * from './scoring';
export * from './session';
export * from './progression';
export * from './achievements';
export * from './daily';
export { generateChallenge, NAMES, GRID_VALUES, ATOMS, type DailyGenerator } from './generators';
