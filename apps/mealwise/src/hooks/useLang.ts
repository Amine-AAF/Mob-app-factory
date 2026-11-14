import { useTranslation } from 'react-i18next';

import { APP_LANGUAGES, type AppLanguage } from '@/domain/types';
import { usePreferences } from '@/store/preferences';

/** Translation function + current app language + unit preferences. */
export function useLang() {
  const { t, i18n } = useTranslation();
  const lng = ((APP_LANGUAGES as readonly string[]).includes(i18n.language) ? i18n.language : 'en') as AppLanguage;
  const system = usePreferences((s) => s.unitSystem);
  const keepOriginalUnits = usePreferences((s) => s.keepOriginalUnits);
  const currency = usePreferences((s) => s.currency);
  return { t, i18n, lng, system, keepOriginalUnits, currency };
}
