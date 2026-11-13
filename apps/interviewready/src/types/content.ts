/**
 * InterviewReady content model.
 *
 * Content is split in two layers so translations stay controlled:
 *  - a language-neutral "core" record (id, taxonomy, difficulty, premium flag…),
 *  - one localized text record per supported language, keyed by the same id.
 * The validation suite (src/content/validation.ts) checks that every core record
 * has a complete text record in every language, and nothing else.
 *
 * UI components never contain question text: they read it through src/content.
 */

export const CONTENT_LOCALES = ['en', 'fr', 'es'] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Top-level library sections (the "category" field of the brief). */
export const CATEGORIES = [
  'general',
  'behavioral',
  'software',
  'java',
  'frontend',
  'databases',
  'devops',
  'ai-data',
  'job-specific',
  'hr-salary',
] as const;
export type CategoryId = (typeof CATEGORIES)[number];

/** How a question is answered; drives the Answer Builder template and the card layout. */
export type QuestionKind = 'general' | 'behavioral' | 'technical' | 'hr';

/** Answer structures offered by the Answer Builder. */
export type AnswerStructure =
  | 'star' // Situation, Task, Action, Result
  | 'motivation' // Motivation, relevant experience, skills, expected contribution
  | 'present-past-future' // "Tell me about yourself"
  | 'technical' // Definition, how it works, example, trade-offs
  | 'negotiation'; // Anchor, justification, flexibility, close

/** Topics (sub-categories). Each topic belongs to exactly one category (see taxonomy.ts). */
export type TopicId =
  // general
  | 'introduction'
  | 'strengths-weaknesses'
  | 'motivation'
  | 'career-goals'
  | 'company-fit'
  | 'work-style'
  // behavioral
  | 'leadership'
  | 'teamwork'
  | 'communication'
  | 'problem-solving'
  | 'conflict'
  | 'adaptability'
  | 'time-management'
  | 'decision-making'
  | 'accountability'
  | 'critical-thinking'
  // software
  | 'programming-fundamentals'
  | 'oop'
  | 'data-structures'
  | 'algorithms'
  | 'design-patterns'
  | 'clean-code'
  | 'testing'
  | 'debugging'
  // java
  | 'java-fundamentals'
  | 'java-collections'
  | 'java-streams'
  | 'java-concurrency'
  | 'jvm'
  | 'spring-boot'
  | 'rest-apis'
  | 'dependency-injection'
  | 'microservices'
  // frontend
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'react-native'
  | 'html-css'
  | 'state-management'
  | 'web-performance'
  // databases
  | 'sql'
  | 'postgresql'
  | 'mongodb'
  | 'indexes'
  | 'transactions'
  | 'query-optimization'
  | 'database-design'
  // devops
  | 'docker'
  | 'kubernetes'
  | 'ci-cd'
  | 'git'
  | 'cloud'
  | 'monitoring'
  | 'security'
  // ai-data
  | 'machine-learning'
  | 'deep-learning'
  | 'llm'
  | 'rag'
  | 'embeddings'
  | 'vector-databases'
  | 'prompt-engineering'
  | 'ai-architecture'
  | 'data-engineering'
  // hr-salary
  | 'salary-expectations'
  | 'negotiation'
  | 'notice-availability'
  | 'career-change'
  | 'employment-gaps'
  | 'remote-work'
  | 'questions-for-recruiter'
  // job-specific: role-centric questions (non-technical roles and role scenarios)
  | 'project-management'
  | 'product-management'
  | 'business-analysis'
  | 'it-support'
  | 'cybersecurity'
  | 'finance'
  | 'marketing'
  | 'human-resources';

export const JOB_ROLES = [
  'software-developer',
  'backend-developer',
  'frontend-developer',
  'fullstack-developer',
  'mobile-developer',
  'devops-engineer',
  'data-engineer',
  'data-scientist',
  'ai-engineer',
  'cybersecurity-analyst',
  'project-manager',
  'product-manager',
  'business-analyst',
  'it-support',
  'finance-analyst',
  'marketing-specialist',
  'hr-specialist',
] as const;
export type JobRoleId = (typeof JOB_ROLES)[number];

/** Skills a question assesses (the "skillsAssessed" field). */
export const SKILLS = [
  'self-presentation',
  'self-awareness',
  'motivation',
  'career-planning',
  'culture-fit',
  'leadership',
  'teamwork',
  'communication',
  'problem-solving',
  'conflict-management',
  'adaptability',
  'time-management',
  'decision-making',
  'accountability',
  'critical-thinking',
  'technical-knowledge',
  'system-design',
  'code-quality',
  'analytical-thinking',
  'negotiation',
  'professionalism',
  'customer-focus',
  'business-acumen',
  'stakeholder-management',
] as const;
export type SkillId = (typeof SKILLS)[number];

/** Language-neutral part of an interview question. */
export interface QuestionCore {
  /** Stable, unique, never reused. Format: <category-prefix>-<number>, e.g. "beh-012". */
  id: string;
  category: CategoryId;
  topic: TopicId;
  kind: QuestionKind;
  difficulty: Difficulty;
  /** Roles this question is relevant for. Empty array = relevant for every role. */
  jobRoles: JobRoleId[];
  skills: SkillId[];
  structure: AnswerStructure;
  premium: boolean;
}

/** Localized part of an interview question. */
export interface QuestionText {
  question: string;
  /** What the interviewer is trying to learn. */
  intent: string;
  /**
   * Model answer (general/behavioral/hr) or expected answer (technical).
   * Presented as an example to adapt, never as a script to recite.
   */
  expectedAnswer: string;
  /** Pedagogical explanation: why this answer works / the concept behind it. */
  explanation: string;
  /** Concrete example (code, scenario, wording) when it helps. */
  example?: string;
  tips: string[];
  commonMistakes: string[];
  followUpQuestions: string[];
}

/** A fully resolved question for one language (what the UI consumes). */
export interface Question extends QuestionCore, QuestionText {
  language: ContentLocale;
}

export type QuizType = 'mcq' | 'true-false';

export interface QuizCore {
  /** Format: q-<category-prefix>-<number>, e.g. "q-java-004". */
  id: string;
  type: QuizType;
  category: CategoryId;
  topic: TopicId;
  difficulty: Difficulty;
  /** Index of the correct option. For true/false: 0 = true, 1 = false. */
  correctIndex: number;
  /** Optional link to the library question that teaches the concept. */
  relatedQuestionId?: string;
  premium: boolean;
}

export interface QuizText {
  prompt: string;
  /** MCQ: 3-4 options. True/false: omitted (the UI renders localized True/False). */
  options?: string[];
  explanation: string;
}

export interface QuizItem extends QuizCore, QuizText {
  language: ContentLocale;
}

/** Text records of one content file, keyed by id. */
export type TextTable<T> = Record<string, T>;

/** One content pack = a set of core records + their texts in every language. */
export interface QuestionPack {
  core: QuestionCore[];
  text: Record<ContentLocale, TextTable<QuestionText>>;
}

export interface QuizPack {
  core: QuizCore[];
  text: Record<ContentLocale, TextTable<QuizText>>;
}
