/**
 * DevSpeak content model.
 *
 * All learning content is English (the learning language). Helper translations
 * are provided for each supported interface language other than English.
 * Content is pure data: UI components never hard-code lesson text.
 */

/** Interface languages that receive helper translations (English is the base). */
export type TranslationLocale = 'fr' | 'es';

/** A helper translation of an English string for every non-English interface language. */
export type Translated = Record<TranslationLocale, string>;

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type ModuleId = 'workplace' | 'technical' | 'interview';

/** Professional roles, used for recommendations. 'any' = relevant for everyone. */
export type RoleTag =
  | 'any'
  | 'java'
  | 'react'
  | 'fullstack'
  | 'devops'
  | 'qa'
  | 'architect'
  | 'student';

export type InterviewPath =
  | 'junior'
  | 'java'
  | 'spring'
  | 'react'
  | 'fullstack'
  | 'devops'
  | 'qa'
  | 'architect';

export interface LessonVocabulary {
  term: string;
  /** Plain-English definition, one sentence. */
  definition: string;
  /** Translation of the term itself. */
  translation: Translated;
}

export interface Expression {
  /** A natural phrase a professional would actually say. */
  phrase: string;
  /** When / why to use it, in simple English. */
  usage: string;
  translation: Translated;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: Translated;
}

export interface Dialogue {
  /** One-sentence scene setting in English. */
  context: string;
  lines: DialogueLine[];
}

export interface QuizQuestion {
  id: string;
  /**
   * 'choice' = pick the best answer.
   * 'fill'   = prompt contains "___" and options are candidate fillers.
   */
  type: 'choice' | 'fill';
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Why the correct answer is correct (shown after answering). */
  explanation: string;
}

export interface InterviewBlock {
  path: InterviewPath;
  question: string;
  questionTranslation: Translated;
  /** What the interviewer is really checking. */
  explanation: string;
  explanationTranslation: Translated;
  exampleAnswer: string;
  exampleAnswerTranslation: Translated;
  /** Alternative ways to phrase key parts of the answer. */
  alternatives: string[];
  /** An instruction for a practice exercise the learner does on their own. */
  practice: string;
  /** Checklist items the learner uses to self-assess their own answer. */
  selfAssessment: string[];
}

export interface Lesson {
  /** Stable id, e.g. "wp-01". Never change once shipped (progress references it). */
  id: string;
  moduleId: ModuleId;
  /** Grouping inside a module, e.g. "meetings", "java", "communication", "junior". */
  topic: string;
  title: string;
  titleTranslation: Translated;
  level: Level;
  premium: boolean;
  estimatedMinutes: number;
  roles: RoleTag[];
  objective: string;
  objectiveTranslation: Translated;
  situation: string;
  situationTranslation: Translated;
  vocabulary: LessonVocabulary[];
  expressions: Expression[];
  dialogue: Dialogue;
  quiz: QuizQuestion[];
  interview?: InterviewBlock;
}

export type VocabularyCategory =
  | 'programming'
  | 'web'
  | 'architecture'
  | 'data'
  | 'devops'
  | 'cloud'
  | 'testing'
  | 'security'
  | 'agile'
  | 'collaboration';

export interface VocabularyEntry {
  /** Stable id, e.g. "v-001". */
  id: string;
  term: string;
  definition: string;
  translation: Translated;
  example: string;
  category: VocabularyCategory;
  difficulty: Level;
  /** True when device TTS can pronounce it meaningfully (almost always true). */
  pronounceable: boolean;
  premium: boolean;
}

export interface DailyChallenge {
  /** Stable id, e.g. "dc-01". Challenges rotate by day index. */
  id: string;
  objective: string;
  objectiveTranslation: Translated;
  expression: Expression;
  /** Id of a VocabularyEntry. */
  techWordId: string;
  dialogue: Dialogue;
  quiz: QuizQuestion;
}
