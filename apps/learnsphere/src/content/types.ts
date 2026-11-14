/**
 * Bundled learning content types (quiz banks, templates, achievements).
 * Bundled content ships in English; it is never machine-translated.
 */

export type QuestionType = 'single' | 'multiple' | 'true_false' | 'short_answer' | 'matching';
export type Difficulty = 1 | 2 | 3;

interface QuestionBase {
  /** Stable, unique id, e.g. "gk-001". Never reuse an id for a different question. */
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  /** Why the answer is correct (1–3 sentences). Shown after answering. */
  explanation: string;
  tags?: string[];
}

/** Multiple choice, exactly one correct option (index into `options`). */
export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single';
  options: string[];
  correct: number;
}

/** Multiple choice, two or more correct options (indexes into `options`). */
export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple';
  options: string[];
  correct: number[];
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false';
  correct: boolean;
}

/** Free text; graded case/accent/whitespace-insensitively against `accepted`. */
export interface ShortAnswerQuestion extends QuestionBase {
  type: 'short_answer';
  accepted: string[];
}

/** Match each left item with its right item. Pairs are shown shuffled. */
export interface MatchingQuestion extends QuestionBase {
  type: 'matching';
  pairs: { left: string; right: string }[];
}

export type QuizQuestion = SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion | MatchingQuestion;

export interface QuizBank {
  id: string;
  /** i18n key suffix for the bank title: `quiz.banks.<id>` */
  titleKey: string;
  icon: string;
  color: string;
  questions: QuizQuestion[];
}
