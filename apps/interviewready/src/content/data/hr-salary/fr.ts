import type { QuestionText, TextTable } from '@/types/content';

import { frA } from './fr-a';
import { frB } from './fr-b';

export const fr: TextTable<QuestionText> = { ...frA, ...frB };
