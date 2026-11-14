import { Screen } from '@factory/design-system';
import { resolveLanguage } from '@factory/localization';
import { getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import { ChipSelect, SelectField } from '@/components/forms';
import { ScreenHeader } from '@/components/ui';
import { COMMON_CURRENCIES } from '@/domain/money';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, setDateOrder, type InterfaceLanguage } from '@/i18n';
import { mutate } from '@/services/mutations';
import { usePreferences, type DateFormatPreference } from '@/store/preferences';

export default function Regional() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();

  const setLanguage = async (lng: InterfaceLanguage | null) => {
    prefs.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng ?? resolveLanguage(null, getLocales().map((l) => l.languageCode), INTERFACE_LANGUAGES, 'en'));
    // Re-plan reminders so scheduled texts use the new language.
    await mutate(async () => undefined);
  };

  return (
    <Screen>
      <ScreenHeader title={t('settings.regional')} back />
      <ChipSelect
        label={t('settings.language')}
        options={['device', ...INTERFACE_LANGUAGES] as const}
        value={prefs.interfaceLanguage ?? 'device'}
        onChange={(v) => v && void setLanguage(v === 'device' ? null : v)}
        renderLabel={(v) => (v === 'device' ? t('settings.deviceLanguage') : LANGUAGE_NAMES[v])}
      />
      <ChipSelect label={t('settings.theme')} options={['system', 'light', 'dark'] as const} value={prefs.theme} onChange={(v) => v && prefs.set({ theme: v })} renderLabel={(v) => t(`themes.${v}`)} />
      <ChipSelect label={t('fields.units')} options={['metric', 'imperial'] as const} value={prefs.units} onChange={(v) => v && prefs.set({ units: v })} renderLabel={(v) => t(`units.${v}`)} />
      <ChipSelect
        label={t('settings.dateFormat')}
        options={['auto', 'dmy', 'mdy', 'ymd'] as const}
        value={prefs.dateFormat}
        onChange={(v: DateFormatPreference | null) => {
          if (!v) return;
          prefs.set({ dateFormat: v });
          setDateOrder(v);
          void mutate(async () => undefined);
        }}
        renderLabel={(v) => t(`dateFormats.${v}`)}
      />
      <SelectField label={t('settings.defaultCurrency')} options={COMMON_CURRENCIES} value={prefs.currency} renderLabel={(c) => c} onChange={(c) => c && prefs.set({ currency: c })} icon="cash-outline" />
    </Screen>
  );
}
