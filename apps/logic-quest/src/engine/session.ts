import { checkAnswer } from './answers';
import type { Challenge, PlayerAnswer } from './types';

/**
 * Pure game-session state machine. Time is always passed in explicitly
 * (`nowMs`), so sessions are deterministic and fully testable; the UI drives
 * it from a timer hook. In timed mode only answering time counts: the clock
 * pauses while feedback and explanations are displayed.
 */
export type SessionMode = 'standard' | 'timed' | 'daily' | 'mixed';
export type QuestionPhase = 'answering' | 'retry' | 'correct' | 'failed';

export interface SessionConfig {
  mode: SessionMode;
  challengeIds: string[];
  /** null = untimed. */
  timeLimitMs: number | null;
  /** Attempts allowed before the solution is shown (timed mode uses 1). */
  maxAttempts: number;
}

export interface QuestionResult {
  challengeId: string;
  correct: boolean;
  attempts: number;
  hintUsed: boolean;
  revealed: boolean;
  timeMs: number;
}

export interface QuestionState {
  challengeId: string;
  phase: QuestionPhase;
  attempts: number;
  hintUsed: boolean;
  /** Answering time spent on this question so far. */
  activeMs: number;
}

export interface SessionState {
  config: SessionConfig;
  index: number;
  question: QuestionState;
  results: QuestionResult[];
  /** Answering time used in the whole session (timed mode budget). */
  usedMs: number;
  /** Last time the clock was sampled while answering, or null when paused. */
  clockFrom: number | null;
  finished: boolean;
  endReason: 'completed' | 'time' | 'quit' | null;
}

const isAnswering = (p: QuestionPhase) => p === 'answering' || p === 'retry';

function newQuestion(id: string): QuestionState {
  return { challengeId: id, phase: 'answering', attempts: 0, hintUsed: false, activeMs: 0 };
}

export function startSession(config: SessionConfig, nowMs: number): SessionState {
  if (config.challengeIds.length === 0) throw new Error('A session needs at least one challenge');
  if (config.maxAttempts < 1) throw new Error('maxAttempts must be >= 1');
  return {
    config,
    index: 0,
    question: newQuestion(config.challengeIds[0] as string),
    results: [],
    usedMs: 0,
    clockFrom: nowMs,
    finished: false,
    endReason: null,
  };
}

/** Accumulates elapsed answering time up to `nowMs`. */
function sample(state: SessionState, nowMs: number): SessionState {
  if (state.clockFrom === null) return state;
  const delta = Math.max(0, nowMs - state.clockFrom);
  return { ...state, usedMs: state.usedMs + delta, clockFrom: nowMs, question: { ...state.question, activeMs: state.question.activeMs + delta } };
}

const pause = (s: SessionState): SessionState => ({ ...s, clockFrom: null });

export function remainingMs(state: SessionState, nowMs: number): number | null {
  if (state.config.timeLimitMs === null) return null;
  const running = state.clockFrom === null ? 0 : Math.max(0, nowMs - state.clockFrom);
  return Math.max(0, state.config.timeLimitMs - state.usedMs - running);
}

/** Ends a timed session when the budget runs out. Call regularly from the UI. */
export function tick(state: SessionState, nowMs: number): SessionState {
  if (state.finished) return state;
  // Always sample (answer times feed the statistics), but only timed sessions can run out.
  const s = sample(state, nowMs);
  if (s.config.timeLimitMs !== null && s.usedMs >= s.config.timeLimitMs) {
    // The question being answered when time runs out is not counted.
    return { ...pause(s), usedMs: s.config.timeLimitMs as number, finished: true, endReason: 'time' };
  }
  return s;
}

export interface SubmitOutcome {
  state: SessionState;
  correct: boolean;
  /** Present when the question is settled (solved, or failed after the last attempt). */
  result?: QuestionResult;
}

/** Validates the answer with the engine. Ignores submissions outside the answering phase. */
export function submitAnswer(state: SessionState, challenge: Challenge, answer: PlayerAnswer, nowMs: number): SubmitOutcome {
  const ticked = tick(state, nowMs);
  if (ticked.finished || !isAnswering(ticked.question.phase) || challenge.id !== ticked.question.challengeId) return { state: ticked, correct: false };
  const q = { ...ticked.question, attempts: ticked.question.attempts + 1 };
  const correct = checkAnswer(challenge, answer);
  if (correct || q.attempts >= ticked.config.maxAttempts) {
    const result: QuestionResult = { challengeId: q.challengeId, correct, attempts: q.attempts, hintUsed: q.hintUsed, revealed: !correct, timeMs: q.activeMs };
    return { state: { ...pause(ticked), question: { ...q, phase: correct ? 'correct' : 'failed' }, results: [...ticked.results, result] }, correct, result };
  }
  // Wrong but attempts remain: the clock pauses on the "not quite" feedback.
  return { state: { ...pause(ticked), question: { ...q, phase: 'retry' } }, correct: false };
}

/** From the "not quite" feedback, try the same question again. */
export function retry(state: SessionState, nowMs: number): SessionState {
  if (state.finished || state.question.phase !== 'retry') return state;
  return { ...state, clockFrom: nowMs, question: { ...state.question, phase: 'answering' } };
}

/** Gives up on the current question and shows the solution (no XP). */
export function revealSolution(state: SessionState, nowMs: number): { state: SessionState; result?: QuestionResult } {
  const s = tick(state, nowMs);
  if (s.finished || !isAnswering(s.question.phase)) return { state: s };
  const q = s.question;
  const result: QuestionResult = { challengeId: q.challengeId, correct: false, attempts: q.attempts, hintUsed: q.hintUsed, revealed: true, timeMs: q.activeMs };
  return { state: { ...pause(s), question: { ...q, phase: 'failed' }, results: [...s.results, result] }, result };
}

export function applyHint(state: SessionState): SessionState {
  if (state.finished || !isAnswering(state.question.phase)) return state;
  return { ...state, question: { ...state.question, hintUsed: true } };
}

/** Moves to the next question once the current one is settled. */
export function nextQuestion(state: SessionState, nowMs: number): SessionState {
  if (state.finished || isAnswering(state.question.phase)) return state;
  const index = state.index + 1;
  const id = state.config.challengeIds[index];
  if (id === undefined) return { ...pause(state), finished: true, endReason: 'completed' };
  return { ...state, index, question: newQuestion(id), clockFrom: nowMs };
}

export function quitSession(state: SessionState, nowMs: number): SessionState {
  if (state.finished) return state;
  return { ...pause(sample(state, nowMs)), finished: true, endReason: 'quit' };
}

export interface SessionSummary {
  answered: number;
  correct: number;
  hintsUsed: number;
  /** All answered questions correct on the first try without hints (at least 5 answered). */
  perfect: boolean;
  accuracy: number;
}

export const PERFECT_SESSION_MIN = 5;

export function summarize(state: SessionState): SessionSummary {
  const answered = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const hintsUsed = state.results.filter((r) => r.hintUsed).length;
  const perfect = answered >= PERFECT_SESSION_MIN && state.results.every((r) => r.correct && r.attempts === 1 && !r.hintUsed);
  return { answered, correct, hintsUsed, perfect, accuracy: answered ? correct / answered : 0 };
}
