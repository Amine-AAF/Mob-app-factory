import type { QuestionText, TextTable } from '@/types/content';

import { enA } from './en-a';
import { enB } from './en-b';

export const en: TextTable<QuestionText> = { ...enA, ...enB };
