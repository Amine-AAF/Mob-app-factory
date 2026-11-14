import type { QuizPack } from '@/types/content';

import { splitItems } from './authoring';
import { itemsA } from './en-a';
import { itemsB } from './en-b';
import { esA } from './es-a';
import { esB } from './es-b';
import { frA } from './fr-a';
import { frB } from './fr-b';

const { core, text: en } = splitItems([...itemsA, ...itemsB]);

/** All quiz items: 160 MCQ and true/false questions linked to library questions. */
export const pack: QuizPack = { core, text: { en, fr: { ...frA, ...frB }, es: { ...esA, ...esB } } };
