import type { QuestionText, TextTable } from '@/types/content';

import { esA } from './es-a';
import { esB } from './es-b';

export const es: TextTable<QuestionText> = { ...esA, ...esB };
