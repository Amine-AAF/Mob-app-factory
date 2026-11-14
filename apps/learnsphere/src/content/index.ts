import { generalQuestions } from './quiz/general';
import { logicQuestions } from './quiz/logic';
import { mathQuestions } from './quiz/math';
import { scienceQuestions } from './quiz/science';
import type { QuizBank } from './types';

/**
 * Bundled content. Bump CONTENT_VERSION whenever bundled content changes:
 * the seed replaces bundled rows in one transaction and never touches user rows.
 * To add a bank: create `quiz/<id>.ts`, add it below and add `quiz.banks.<id>` to every locale.
 */
export const CONTENT_VERSION = 1;

export const QUIZ_BANKS: QuizBank[] = [
  { id: 'general', titleKey: 'general', icon: 'earth', color: '#2F80ED', questions: generalQuestions },
  { id: 'logic', titleKey: 'logic', icon: 'extension-puzzle', color: '#9B51E0', questions: logicQuestions },
  { id: 'math', titleKey: 'math', icon: 'calculator', color: '#EB5757', questions: mathQuestions },
  { id: 'science', titleKey: 'science', icon: 'flask', color: '#27AE60', questions: scienceQuestions },
];

export const BUNDLED_BANK_IDS = QUIZ_BANKS.map((b) => b.id);

export * from './types';
