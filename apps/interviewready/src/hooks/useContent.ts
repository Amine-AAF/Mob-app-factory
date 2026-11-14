import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { allQuestions, allQuizzes } from '@/content';
import { CONTENT_LOCALES, type ContentLocale, type Question, type QuizItem } from '@/types/content';

/** Content follows the interface language (the whole library is translated). */
export function useContentLanguage(): ContentLocale {
  const { i18n } = useTranslation();
  const lng = i18n.language as ContentLocale;
  return CONTENT_LOCALES.includes(lng) ? lng : 'en';
}

export function useQuestions(): Question[] {
  const lng = useContentLanguage();
  return useMemo(() => allQuestions(lng), [lng]);
}

export function useQuizzes(): QuizItem[] {
  const lng = useContentLanguage();
  return useMemo(() => allQuizzes(lng), [lng]);
}
