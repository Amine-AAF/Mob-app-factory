import type { QuestionPack, QuizPack } from '@/types/content';

/**
 * Registry of content packs. Each pack lives in its own folder:
 *   data/<category>/core.ts  language-neutral records
 *   data/<category>/en.ts    English text (source language)
 *   data/<category>/fr.ts    French text
 *   data/<category>/es.ts    Spanish text
 * Add a pack here once its validation passes (src/__tests__/content.test.ts).
 */
export const questionPacks: QuestionPack[] = [];

export const quizPacks: QuizPack[] = [];
