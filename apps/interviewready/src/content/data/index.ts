import type { QuestionPack, QuizPack } from '@/types/content';

import { pack as behavioral } from './behavioral';
import { pack as databases } from './databases';
import { pack as devops } from './devops';
import { pack as frontend } from './frontend';
import { pack as general } from './general';
import { pack as java } from './java';
import { pack as software } from './software';

/**
 * Registry of content packs. Each pack lives in its own folder:
 *   data/<category>/core.ts  language-neutral records
 *   data/<category>/en.ts    English text (source language)
 *   data/<category>/fr.ts    French text
 *   data/<category>/es.ts    Spanish text
 * Add a pack here once its validation passes (src/__tests__/content.test.ts).
 * Writing and translation rules: src/content/CONTENT_BRIEF.md.
 */
export const questionPacks: QuestionPack[] = [general, behavioral, software, java, frontend, databases, devops];

export const quizPacks: QuizPack[] = [];
