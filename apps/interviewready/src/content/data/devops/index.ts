import type { QuestionPack } from '@/types/content';

import { core } from './core';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

export const pack: QuestionPack = { core, text: { en, fr, es } };
