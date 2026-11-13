import { useTranslation } from 'react-i18next';

import type { InterfaceLanguage } from '@/i18n';
import { resolveTranslationLanguage, usePreferences } from '@/store/preferences';

/** Language of helper translations to show next to English content (null = none). */
export function useTranslationLanguage(): 'fr' | 'es' | null {
  const { i18n } = useTranslation();
  const pref = usePreferences((s) => s.translationLanguage);
  return resolveTranslationLanguage(pref, (i18n.language as InterfaceLanguage) ?? 'en');
}
