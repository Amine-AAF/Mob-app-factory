import { addDays, computeStreak, levelFromXp } from '@factory/app-core';

import { CHALLENGES, DAILY_TEMPLATES } from '@/content';
import {
  applyHint,
  buildMemoryRound,
  checkAnswer,
  checkChallenge,
  checkSequence,
  codeFeedback,
  compilePattern,
  compileSequence,
  completeSymmetry,
  computeDailyXp,
  computeXp,
  correctAnswer,
  dailyChallengeFor,
  dailyTemplateFor,
  difficultyUnlocked,
  earnedAchievements,
  emptySolvedCounts,
  emptyStats,
  entailedOptions,
  generateTerms,
  glyphKey,
  hintsRemaining,
  memoryAnswerCorrect,
  memoryFrameAt,
  newlyEarned,
  nextQuestion,
  pickChallenges,
  playerLevel,
  remainingMs,
  retry,
  revealSolution,
  solveCode,
  solveKnights,
  solveMath,
  solveOrdering,
  startSession,
  submitAnswer,
  suggestDifficulty,
  summarize,
  tick,
  type Challenge,
  type MemoryChallenge,
  type SequenceChallenge,
} from '@/engine';

const byId = (id: string) => {
  const c = CHALLENGES.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c;
};

/* ------------------------------------------------------------ sequences */

describe('number sequence engine', () => {
  it('generates terms for every rule family', () => {
    expect(generateTerms({ kind: 'arithmetic', start: 2, step: 3 }, 5)).toEqual([2, 5, 8, 11, 14]);
    expect(generateTerms({ kind: 'geometric', start: 1, ratio: -2 }, 5)).toEqual([1, -2, 4, -8, 16]);
    expect(generateTerms({ kind: 'fibonacci', a: 1, b: 1 }, 7)).toEqual([1, 1, 2, 3, 5, 8, 13]);
    expect(generateTerms({ kind: 'tribonacci', a: 0, b: 1, c: 2 }, 6)).toEqual([0, 1, 2, 3, 6, 11]);
    expect(generateTerms({ kind: 'interleave', first: { start: 1, step: 1 }, second: { start: 10, step: 10 } }, 6)).toEqual([1, 10, 2, 20, 3, 30]);
    expect(generateTerms({ kind: 'cycleOps', start: 1, ops: [{ op: '+', value: 3 }, { op: '×', value: 2 }] }, 6)).toEqual([1, 4, 8, 11, 22, 25]);
    expect(generateTerms({ kind: 'growingStep', start: 2, step: 1, growth: 1 }, 5)).toEqual([2, 3, 5, 8, 12]);
    expect(generateTerms({ kind: 'zigzag', start: 10, step: 1, growth: 1 }, 6)).toEqual([10, 11, 9, 12, 8, 13]);
    expect(generateTerms({ kind: 'primes', offset: 0, add: 0 }, 6)).toEqual([2, 3, 5, 7, 11, 13]);
    expect(generateTerms({ kind: 'primeGaps', start: 1, offset: 0 }, 5)).toEqual([1, 3, 6, 11, 18]);
    expect(generateTerms({ kind: 'factorialStep', start: 1, firstMultiplier: 1 }, 6)).toEqual([1, 1, 2, 6, 24, 120]);
    expect(generateTerms({ kind: 'stairs', start: 1, step: 1, repeat: 2 }, 6)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(generateTerms({ kind: 'power', exponent: 3, offset: 1, add: 0 }, 4)).toEqual([1, 8, 27, 64]);
    expect(generateTerms({ kind: 'triangular', offset: 1, add: 0 }, 5)).toEqual([1, 3, 6, 10, 15]);
  });

  it('computes the answer from the rule, never from hand-written data', () => {
    const c = compileSequence({ id: 'seq-t-1', difficulty: 'easy', rule: { kind: 'arithmetic', start: 3, step: 4 }, length: 6, missing: 2 }, 0);
    expect(c.terms).toEqual([3, 7, null, 15, 19, 23]);
    expect(c.answer).toBe(11);
    expect(c.options).toContain(11);
    expect(checkSequence(c)).toEqual([]);
  });

  it('rejects ambiguous sequences that a simpler rule also explains', () => {
    // 1, 2, 4 ? — "doubling" (8) and "+1, +2, +3" (7) both fit with so few terms.
    const c = compileSequence({ id: 'seq-t-2', difficulty: 'easy', rule: { kind: 'geometric', start: 1, ratio: 2 }, length: 4 }, 0);
    expect(checkSequence(c).join(' ')).toMatch(/visible terms|ambiguous/);
    // A wrong stored answer is detected.
    const tampered = { ...c, answer: 9 } as SequenceChallenge;
    expect(checkSequence(tampered).join(' ')).toMatch(/answer does not follow/);
  });

  it('validates keypad and choice answers and rejects malformed input', () => {
    const keypad = CHALLENGES.find((c): c is SequenceChallenge => c.category === 'sequence' && c.input === 'keypad')!;
    expect(checkAnswer(keypad, { kind: 'number', value: keypad.answer })).toBe(true);
    expect(checkAnswer(keypad, { kind: 'number', value: keypad.answer + 1 })).toBe(false);
    expect(checkAnswer(keypad, { kind: 'number', value: Number.NaN })).toBe(false);
    expect(checkAnswer(keypad, { kind: 'option', index: 0 })).toBe(false);
    const choice = CHALLENGES.find((c): c is SequenceChallenge => c.category === 'sequence' && c.input === 'choice')!;
    expect(checkAnswer(choice, { kind: 'option', index: choice.options.indexOf(choice.answer) })).toBe(true);
    expect(checkAnswer(choice, { kind: 'option', index: 99 })).toBe(false);
    expect(checkAnswer(choice, { kind: 'option', index: -1 })).toBe(false);
  });
});

/* ------------------------------------------------------------- patterns */

describe('pattern recognition engine', () => {
  it('treats rotations that look identical as the same glyph', () => {
    const base = { color: 'blue' as const, fill: 'solid' as const, count: 1, size: 'm' as const };
    expect(glyphKey({ ...base, shape: 'square', rotation: 90 })).toBe(glyphKey({ ...base, shape: 'square', rotation: 0 }));
    expect(glyphKey({ ...base, shape: 'circle', rotation: 45 })).toBe(glyphKey({ ...base, shape: 'circle', rotation: 0 }));
    expect(glyphKey({ ...base, shape: 'arrow', rotation: 90 })).not.toBe(glyphKey({ ...base, shape: 'arrow', rotation: 0 }));
  });

  it('completes mirror and half-turn symmetry', () => {
    expect(completeSymmetry('vertical', [[1, 0], [0, 1]])).toEqual([[0, 1], [1, 0]]);
    expect(completeSymmetry('horizontal', [[1, 0], [0, 0]])).toEqual([[0, 0], [1, 0]]);
    expect(completeSymmetry('rotational', [[1, 0], [0, 0]])).toEqual([[0, 0], [0, 1]]);
  });

  it('rejects a row whose visible cells fit a shorter cycle', () => {
    // circle, square, circle, square, circle, ? with a 3-cycle declared: visible cells say "square".
    const c = compilePattern({ id: 'pat-t-1', difficulty: 'easy', rule: { type: 'row', length: 6, missing: 5, glyph: { shape: { cycle: ['circle', 'square', 'circle', 'square', 'circle', 'triangle'] }, color: { cycle: ['blue'] } } } }, 0);
    expect(checkChallenge(c).join(' ')).toMatch(/ambiguous|not determined/);
  });

  it('accepts only the correct option index', () => {
    const p = byId('pat-m-013');
    expect(checkAnswer(p, correctAnswer(p))).toBe(true);
    const wrong = ((correctAnswer(p) as { index: number }).index + 1) % 4;
    expect(checkAnswer(p, { kind: 'option', index: wrong })).toBe(false);
  });
});

/* ------------------------------------------------------------ deduction */

describe('logical deduction solvers', () => {
  it('solves ordering puzzles by brute force', () => {
    const sols = solveOrdering({ people: ['A', 'B', 'C'], clues: [{ t: 'above', a: 'A', b: 'B' }, { t: 'last', a: 'A' }] });
    expect(sols).toEqual([]);
    expect(solveOrdering({ people: ['A', 'B', 'C'], clues: [{ t: 'above', a: 'B', b: 'A' }, { t: 'first', a: 'C' }] })).toEqual([['C', 'B', 'A']]);
  });

  it('solves the classic truth-teller puzzle', () => {
    // A: "We are both liars." → A is a liar and B tells the truth.
    expect(solveKnights({ type: 'knights', people: ['A', 'B'], statements: [{ by: 'A', says: { t: 'bothLiars', x: 'A', y: 'B' } }] })).toEqual([{ A: false, B: true }]);
  });

  it('scores code-breaker feedback and finds the unique code', () => {
    expect(codeFeedback('123', '132')).toEqual({ correct: 1, misplaced: 2 });
    expect(codeFeedback('123', '456')).toEqual({ correct: 0, misplaced: 0 });
    const solutions = solveCode({ digits: 3, clues: [{ guess: '682', correct: 1, misplaced: 0 }, { guess: '614', correct: 0, misplaced: 1 }, { guess: '206', correct: 0, misplaced: 2 }, { guess: '738', correct: 0, misplaced: 0 }, { guess: '870', correct: 0, misplaced: 1 }] });
    expect(solutions).toEqual(['042']);
  });

  it('distinguishes valid inferences from fallacies', () => {
    const modusTollens = { type: 'logic' as const, premises: [{ if: [{ atom: 'a' }, { atom: 'b' }] as [{ atom: string }, { atom: string }] }, { atom: 'b', neg: true }], options: [{ atom: 'a' }, { atom: 'a', neg: true }, { none: true as const }] };
    expect(entailedOptions(modusTollens)).toEqual([1]);
    const affirmingConsequent = { ...modusTollens, premises: [modusTollens.premises[0]!, { atom: 'b' }] };
    expect(entailedOptions(affirmingConsequent)).toEqual([]);
  });

  it('solves word problems and proves uniqueness', () => {
    expect(solveMath({ type: 'math', t: 'headsLegs', theme: 'farm', heads: 10, legs: 28 })).toEqual([4]);
    expect(solveMath({ type: 'math', t: 'sumDiff', theme: 'shop', sum: 110, diff: 100 })).toEqual([5]);
    expect(solveMath({ type: 'math', t: 'handshakes', handshakes: 28 })).toEqual([8]);
    expect(solveMath({ type: 'math', t: 'ages', ratioNow: 3, years: 5, ratioLater: 2, ask: 'younger' })).toEqual([5]);
  });

  it('validates choice and keypad deduction answers', () => {
    for (const c of CHALLENGES.filter((x) => x.category === 'deduction')) {
      expect(checkAnswer(c, correctAnswer(c))).toBe(true);
      if (c.input === 'keypad') expect(checkAnswer(c, { kind: 'number', value: c.answer + 1 })).toBe(false);
      else expect(checkAnswer(c, { kind: 'option', index: (c.answer + 1) % c.options.length })).toBe(false);
    }
  });
});

/* --------------------------------------------------------------- memory */

describe('memory engine', () => {
  const seq = byId('mem-m-001') as MemoryChallenge;

  it('is deterministic for a given seed', () => {
    expect(buildMemoryRound(seq.spec)).toEqual(buildMemoryRound(seq.spec));
    expect(seq.answer).toEqual(buildMemoryRound(seq.spec).expected);
  });

  it('derives the display timeline purely from elapsed time', () => {
    const s = { kind: 'sequence' as const, tiles: 4 as const, length: 3, seed: 7, showMs: 500, gapMs: 250 };
    const round = buildMemoryRound(s);
    expect(memoryFrameAt(s, round, 0)).toEqual({ phase: 'show', activeTile: round.items[0] });
    expect(memoryFrameAt(s, round, 600)).toEqual({ phase: 'show', activeTile: null }); // gap
    expect(memoryFrameAt(s, round, 760)).toEqual({ phase: 'show', activeTile: round.items[1] });
    expect(memoryFrameAt(s, round, 2250)).toEqual({ phase: 'recall' });
    // Relaxed timing (accessibility) stretches the timeline by 1.5×.
    expect(memoryFrameAt(s, round, 2250, true).phase).toBe('show');
  });

  it('checks recall: order matters for sequences, not for lit cells', () => {
    const pattern = CHALLENGES.find((c): c is MemoryChallenge => c.category === 'memory' && c.spec.kind === 'pattern')!;
    expect(memoryAnswerCorrect(pattern, [...pattern.answer].reverse())).toBe(true);
    expect(memoryAnswerCorrect(pattern, pattern.answer.slice(1))).toBe(false);
    const sequence = CHALLENGES.find((c): c is MemoryChallenge => c.category === 'memory' && c.spec.kind === 'sequence' && c.answer.length > 2)!;
    expect(memoryAnswerCorrect(sequence, sequence.answer)).toBe(true);
    expect(memoryAnswerCorrect(sequence, [...sequence.answer].reverse())).toBe(false);
  });

  it('reverses the expected digits for reverse number recall', () => {
    const rev = CHALLENGES.find((c): c is MemoryChallenge => c.category === 'memory' && c.spec.kind === 'number' && !!c.spec.reverse)!;
    const round = buildMemoryRound(rev.spec);
    expect(rev.answer).toEqual([...round.items].reverse());
  });
});

/* ---------------------------------------------------------------- daily */

describe('daily challenge', () => {
  it('is deterministic for a given local date', () => {
    const a = dailyChallengeFor('2026-11-13', DAILY_TEMPLATES, CHALLENGES);
    const b = dailyChallengeFor('2026-11-13', DAILY_TEMPLATES, CHALLENGES);
    expect(a).toEqual(b);
    expect(a.challenge.id).toBe('daily-2026-11-13');
    expect(a.challenge.premium).toBe(false);
  });

  it('rotates templates day by day and changes the puzzle', () => {
    const ids = Array.from({ length: 30 }, (_, i) => dailyTemplateFor(addDays('2026-11-01', i), DAILY_TEMPLATES).id);
    expect(new Set(ids).size).toBe(30);
    const d1 = dailyChallengeFor('2026-11-13', DAILY_TEMPLATES, CHALLENGES).challenge;
    const d2 = dailyChallengeFor('2026-12-13', DAILY_TEMPLATES, CHALLENGES).challenge;
    expect(JSON.stringify(d1)).not.toEqual(JSON.stringify({ ...d2, id: d1.id }));
  });

  it('produces a valid, generated (non-fallback) puzzle every day for a year', () => {
    const failures: string[] = [];
    for (let i = 0; i < 365; i++) {
      const day = addDays('2026-11-01', i);
      const d = dailyChallengeFor(day, DAILY_TEMPLATES, CHALLENGES);
      const problems = checkChallenge(d.challenge);
      if (d.fallback || problems.length) failures.push(`${day} ${d.template.id}: ${problems.join('; ') || 'fallback'}`);
      if (!checkAnswer(d.challenge, correctAnswer(d.challenge))) failures.push(`${day}: correct answer rejected`);
    }
    expect(failures).toEqual([]);
  });
});

/* -------------------------------------------------------------- scoring */

describe('XP, levels and streaks', () => {
  const base = { baseXp: 20, correct: true, attempt: 1, hintUsed: false, previouslyRevealed: false, alreadyRewarded: false };

  it('awards full XP for a first-try solve and reduces it for retries and hints', () => {
    expect(computeXp(base)).toBe(20);
    expect(computeXp({ ...base, attempt: 2 })).toBe(10);
    expect(computeXp({ ...base, hintUsed: true })).toBe(10);
    expect(computeXp({ ...base, attempt: 2, hintUsed: true })).toBe(5);
    expect(computeXp({ ...base, previouslyRevealed: true })).toBe(5);
  });

  it('never awards XP for a wrong answer or a duplicate reward', () => {
    expect(computeXp({ ...base, correct: false })).toBe(0);
    expect(computeXp({ ...base, alreadyRewarded: true })).toBe(0);
    expect(computeXp({ ...base, attempt: 0 })).toBe(0);
    expect(computeDailyXp('hard', { correct: false, attempt: 1, hintUsed: false, alreadyRewarded: false })).toBe(0);
    expect(computeDailyXp('medium', { correct: true, attempt: 1, hintUsed: false, alreadyRewarded: false })).toBe(60);
  });

  it('progresses levels on the shared factory curve with Logic Quest ranks', () => {
    expect(playerLevel(0)).toMatchObject({ level: 1, rank: 'novice' });
    expect(playerLevel(299)).toMatchObject({ level: 2 });
    expect(playerLevel(300)).toMatchObject({ level: 3, rank: 'apprentice' });
    expect(playerLevel(1000).level).toBe(levelFromXp(1000).level);
    expect(playerLevel(50 * 16 * 17).rank).toBe('grandmaster');
  });

  it('counts streaks on local calendar days', () => {
    expect(computeStreak(['2026-11-10', '2026-11-11', '2026-11-12'], '2026-11-13')).toEqual({ current: 3, longest: 3 });
    expect(computeStreak(['2026-11-10', '2026-11-12', '2026-11-13'], '2026-11-13')).toEqual({ current: 2, longest: 2 });
  });
});

/* -------------------------------------------------------------- session */

describe('game session state machine', () => {
  const easy = CHALLENGES.filter((c) => c.category === 'pattern' && c.difficulty === 'easy').slice(0, 3);
  const wrongAnswer = (c: Challenge) => ({ kind: 'option' as const, index: ((correctAnswer(c) as { index: number }).index + 1) % 4 });

  it('runs a standard session: correct, retry then correct, reveal', () => {
    let s = startSession({ mode: 'standard', challengeIds: easy.map((c) => c.id), timeLimitMs: null, maxAttempts: 2 }, 0);
    let out = submitAnswer(s, easy[0]!, correctAnswer(easy[0]!), 1000);
    expect(out.correct).toBe(true);
    expect(out.result).toMatchObject({ correct: true, attempts: 1, timeMs: 1000 });
    // A second submission of the settled question is ignored (no double reward).
    expect(submitAnswer(out.state, easy[0]!, correctAnswer(easy[0]!), 1100).result).toBeUndefined();
    s = nextQuestion(out.state, 2000);

    out = submitAnswer(s, easy[1]!, wrongAnswer(easy[1]!), 3000);
    expect(out.state.question.phase).toBe('retry');
    expect(out.result).toBeUndefined();
    s = retry(out.state, 4000);
    out = submitAnswer(s, easy[1]!, correctAnswer(easy[1]!), 5000);
    expect(out.result).toMatchObject({ correct: true, attempts: 2, timeMs: 2000 });
    s = nextQuestion(out.state, 6000);

    s = applyHint(s);
    const revealed = revealSolution(s, 7000);
    expect(revealed.result).toMatchObject({ correct: false, revealed: true, hintUsed: true });
    s = nextQuestion(revealed.state, 8000);
    expect(s).toMatchObject({ finished: true, endReason: 'completed' });
    expect(summarize(s)).toMatchObject({ answered: 3, correct: 2, hintsUsed: 1, perfect: false });
  });

  it('fails after the last attempt and refuses answers for another challenge', () => {
    const s = startSession({ mode: 'timed', challengeIds: [easy[0]!.id], timeLimitMs: 30_000, maxAttempts: 1 }, 0);
    expect(submitAnswer(s, easy[1]!, correctAnswer(easy[1]!), 100).result).toBeUndefined();
    const out = submitAnswer(s, easy[0]!, wrongAnswer(easy[0]!), 100);
    expect(out.result).toMatchObject({ correct: false, attempts: 1 });
  });

  it('pauses the timed clock during feedback and ends when time is up', () => {
    let s = startSession({ mode: 'timed', challengeIds: easy.map((c) => c.id), timeLimitMs: 30_000, maxAttempts: 1 }, 0);
    s = submitAnswer(s, easy[0]!, correctAnswer(easy[0]!), 10_000).state;
    // 60 s reading the explanation do not consume the budget.
    expect(remainingMs(s, 70_000)).toBe(20_000);
    s = nextQuestion(s, 70_000);
    s = tick(s, 85_000);
    expect(remainingMs(s, 85_000)).toBe(5_000);
    s = tick(s, 91_000);
    expect(s).toMatchObject({ finished: true, endReason: 'time' });
    // The unfinished question is not counted.
    expect(s.results).toHaveLength(1);
    expect(submitAnswer(s, easy[1]!, correctAnswer(easy[1]!), 92_000).result).toBeUndefined();
  });

  it('detects a perfect session', () => {
    const five = CHALLENGES.filter((c) => c.category === 'sequence' && c.difficulty === 'easy').slice(0, 5);
    let s = startSession({ mode: 'standard', challengeIds: five.map((c) => c.id), timeLimitMs: null, maxAttempts: 2 }, 0);
    five.forEach((c, i) => {
      s = submitAnswer(s, c, correctAnswer(c), i * 10 + 5).state;
      s = nextQuestion(s, i * 10 + 9);
    });
    expect(summarize(s).perfect).toBe(true);
  });
});

/* ---------------------------------------------------------- progression */

describe('progression, access and achievements', () => {
  it('unlocks difficulties by solving challenges', () => {
    const solved = emptySolvedCounts();
    expect(difficultyUnlocked('pattern', 'easy', solved)).toBe(true);
    expect(difficultyUnlocked('pattern', 'medium', solved)).toBe(false);
    solved.pattern.easy = 4;
    expect(difficultyUnlocked('pattern', 'medium', solved)).toBe(true);
    expect(difficultyUnlocked('pattern', 'hard', solved)).toBe(false);
  });

  it('queues unsolved challenges first, in progressive order, and gates Premium content', () => {
    const solved = new Set(['seq-e-001', 'seq-e-002']);
    const queue = pickChallenges({ pool: CHALLENGES, category: 'sequence', difficulty: 'easy', count: 5, solvedIds: solved, isPremium: false, seed: 1 });
    expect(queue.map((c) => c.id)).toEqual(['seq-e-003', 'seq-e-004', 'seq-e-005', 'seq-e-006', 'seq-e-007']);
    expect(pickChallenges({ pool: CHALLENGES, category: 'sequence', difficulty: 'hard', count: 5, solvedIds: solved, isPremium: false, seed: 1 })).toEqual([]);
    expect(pickChallenges({ pool: CHALLENGES, category: 'sequence', difficulty: 'hard', count: 5, solvedIds: solved, isPremium: true, seed: 1 })).toHaveLength(5);
    const mixed = pickChallenges({ pool: CHALLENGES, category: 'mixed', difficulty: 'easy', count: 8, solvedIds: solved, isPremium: true, seed: 3, excludeMemory: true });
    expect(new Set(mixed.map((c) => c.category)).size).toBe(3);
  });

  it('limits free hints and never limits Premium', () => {
    expect(hintsRemaining({ isPremium: false, usedToday: 0, adBonusToday: 0 })).toBe(3);
    expect(hintsRemaining({ isPremium: false, usedToday: 3, adBonusToday: 1 })).toBe(1);
    expect(hintsRemaining({ isPremium: false, usedToday: 9, adBonusToday: 0 })).toBe(0);
    expect(hintsRemaining({ isPremium: true, usedToday: 99, adBonusToday: 0 })).toBe(Infinity);
  });

  it('suggests a difficulty change only with enough evidence', () => {
    expect(suggestDifficulty('easy', [true, true, true])).toBe('easy');
    expect(suggestDifficulty('easy', Array(10).fill(true))).toBe('medium');
    expect(suggestDifficulty('hard', Array(10).fill(false))).toBe('medium');
  });

  it('earns achievements only from real statistics', () => {
    expect(earnedAchievements(emptyStats())).toEqual([]);
    const stats = { ...emptyStats(), solvedTotal: 1, bestStreak: 7 };
    expect(earnedAchievements(stats).sort()).toEqual(['first_challenge', 'streak_7']);
    expect(newlyEarned(stats, new Set(['first_challenge']))).toEqual(['streak_7']);
  });
});

describe('starting level', () => {
  it('lets experienced players start at medium but always makes them earn hard', () => {
    const solved = emptySolvedCounts();
    expect(difficultyUnlocked('memory', 'medium', solved, 'medium')).toBe(true);
    expect(difficultyUnlocked('memory', 'hard', solved, 'medium')).toBe(false);
  });
});
