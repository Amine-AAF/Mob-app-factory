import { OptionCard, Stack } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';

/** Changes the interface language immediately and persists the choice. */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const set = usePreferences((s) => s.set);
  return async (lng: InterfaceLanguage | null) => {
    set({ interfaceLanguage: lng });
    if (lng) await i18n.changeLanguage(lng);
  };
}

export function LanguagePicker() {
  const { i18n } = useTranslation();
  const change = useChangeLanguage();
  return (
    <Stack gap={2} accessibilityRole="radiogroup">
      {INTERFACE_LANGUAGES.map((l) => (
        <OptionCard key={l} title={LANGUAGE_NAMES[l]} selected={i18n.language === l} onPress={() => void change(l)} testID={`lang-${l}`} icon="language-outline" />
      ))}
    </Stack>
  );
}

export type { InterfaceLanguage };
