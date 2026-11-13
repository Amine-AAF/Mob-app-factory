import { checkDeduction, deductionSignature, describeDeduction } from './deduction';
import { checkMemory, explainMemory, memoryAnswerCorrect, memorySignature, buildMemoryRound } from './memory';
import { checkPattern, describeBits, describeGlyph, explainPattern, patternSignature, type Glyph } from './patterns';
import { checkSequence, explainSequence, sequenceSignature } from './sequences';
import type { Challenge, ChallengeText, PlayerAnswer, Translate } from './types';

/**
 * Single entry point for answer validation. Returns false for any malformed
 * or out-of-range answer: the game can never award points for an invalid answer.
 */
export function checkAnswer(c: Challenge, answer: PlayerAnswer): boolean {
  const validIndex = (i: number, length: number) => Number.isInteger(i) && i >= 0 && i < length;
  switch (c.category) {
    case 'sequence':
      if (c.input === 'choice') return answer.kind === 'option' && validIndex(answer.index, c.options.length) && c.options[answer.index] === c.answer;
      return answer.kind === 'number' && Number.isFinite(answer.value) && answer.value === c.answer;
    case 'pattern':
      return answer.kind === 'option' && validIndex(answer.index, c.board.options.length) && answer.index === c.answer;
    case 'deduction':
      if (c.input === 'choice') return answer.kind === 'option' && validIndex(answer.index, c.options.length) && answer.index === c.answer;
      return answer.kind === 'number' && Number.isFinite(answer.value) && answer.value === c.answer;
    case 'memory':
      if (c.spec.kind === 'visual') return answer.kind === 'option' && answer.index === c.answer[0];
      return answer.kind === 'taps' && answer.values.every((v) => Number.isInteger(v)) && memoryAnswerCorrect(c, answer.values);
  }
}

/** Integrity problems of a challenge (empty = valid). Used by content validation and daily generation. */
export function checkChallenge(c: Challenge): string[] {
  const base: string[] = [];
  if (!/^[a-z0-9-]+$/.test(c.id)) base.push('id must be lowercase kebab-case');
  if (!(c.xp > 0)) base.push('xp must be positive');
  if (!(c.estimatedSeconds > 0)) base.push('estimatedSeconds must be positive');
  switch (c.category) {
    case 'sequence':
      return [...base, ...checkSequence(c)];
    case 'pattern':
      return [...base, ...checkPattern(c)];
    case 'deduction':
      return [...base, ...checkDeduction(c)];
    case 'memory':
      return [...base, ...checkMemory(c)];
  }
}

/** Signature for duplicate detection: two challenges with the same signature are the same puzzle. */
export function challengeSignature(c: Challenge): string {
  switch (c.category) {
    case 'sequence':
      return `seq:${sequenceSignature(c)}`;
    case 'pattern':
      return `pat:${patternSignature(c)}`;
    case 'deduction':
      return `ded:${deductionSignature(c)}`;
    case 'memory':
      return `mem:${memorySignature(c)}`;
  }
}

/** The answer a correct player would submit (used by tests and the solution reveal). */
export function correctAnswer(c: Challenge): PlayerAnswer {
  switch (c.category) {
    case 'sequence':
      return c.input === 'choice' ? { kind: 'option', index: c.options.indexOf(c.answer) } : { kind: 'number', value: c.answer };
    case 'pattern':
      return { kind: 'option', index: c.answer };
    case 'deduction':
      return c.input === 'choice' ? { kind: 'option', index: c.answer } : { kind: 'number', value: c.answer };
    case 'memory':
      return c.spec.kind === 'visual' ? { kind: 'option', index: c.answer[0] ?? 0 } : { kind: 'taps', values: [...c.answer] };
  }
}

/** All user-facing text of a challenge, in the language of `t`. */
export function describeChallenge(c: Challenge, t: Translate): ChallengeText {
  switch (c.category) {
    case 'sequence': {
      const kind = c.rule.kind;
      return {
        title: t(`seq.title.${kind}`),
        instructions: t(c.missingIndex === c.terms.length - 1 ? 'seq.instructions.next' : 'seq.instructions.missing'),
        prompt: [],
        optionLabels: c.options.map(String),
        hint: t(`seq.hint.${kind}`),
        explanation: explainSequence(c, t),
        answerLabel: String(c.answer),
      };
    }
    case 'pattern': {
      const b = c.board;
      const optionLabels = b.type === 'symmetry' ? b.options.map((o) => describeBits(o, t)) : (b.options as Glyph[]).map((g) => describeGlyph(g, t));
      return {
        title: t(`pat.title.${c.skill}`),
        instructions: t(b.type === 'symmetry' ? `pat.instructions.symmetry_${b.axis}` : `pat.instructions.${b.type}`),
        prompt: [],
        optionLabels,
        hint: t(`pat.hint.${c.skill}`),
        explanation: explainPattern(c, t),
        answerLabel: optionLabels[c.answer] ?? '',
      };
    }
    case 'deduction':
      return describeDeduction(c, t);
    case 'memory': {
      const s = c.spec;
      const { explanation, answerLabel } = explainMemory(c, t);
      const params = s.kind === 'sequence' ? { count: s.length } : s.kind === 'pattern' ? { count: s.lit } : s.kind === 'number' ? { count: s.digits } : { count: s.shown };
      const optionLabels = s.kind === 'visual' ? buildMemoryRound(s).options.map((g) => describeGlyph(g, t)) : [];
      return {
        title: t(`mem.title.${s.kind}`),
        instructions: t(s.kind === 'number' && s.reverse ? 'mem.instructions.numberReverse' : s.kind === 'visual' ? `mem.instructions.visual_${s.ask}` : `mem.instructions.${s.kind}`, params),
        prompt: [],
        optionLabels,
        hint: t('mem.hint'),
        explanation,
        answerLabel,
      };
    }
  }
}
