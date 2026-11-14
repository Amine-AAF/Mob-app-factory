import { OptionCard, Screen, SectionHeader, Stack } from '@factory/design-system';
import type { ThemePreference } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChipSelect } from '@/components/forms';
import type { ClimateProfile } from '@/domain/seasons';
import { useMutation } from '@/hooks/useData';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const CLIMATES: ClimateProfile[] = ['north', 'south', 'tropical', 'none'];

export default function Preferences() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const mutate = useMutation();

  const setLanguage = (lng: InterfaceLanguage) => {
    void i18n.changeLanguage(lng);
    prefs.set({ interfaceLanguage: lng });
    // Notification texts are rebuilt in the new language.
    void mutate(async () => undefined);
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.preferences') }} />
      <SectionHeader title={t('settings.language')} />
      <Stack gap={2}>
        {INTERFACE_LANGUAGES.map((lng) => (
          <OptionCard key={lng} title={LANGUAGE_NAMES[lng]} selected={i18n.language === lng} onPress={() => setLanguage(lng)} testID={`lang-${lng}`} />
        ))}
      </Stack>
      <SectionHeader title={t('settings.theme')} />
      <ChipSelect options={THEMES} value={prefs.theme} onChange={(v) => prefs.set({ theme: v })} render={(v) => t(`settings.themes.${v}`)} />
      <SectionHeader title={t('settings.units')} />
      <ChipSelect options={['metric', 'imperial'] as const} value={prefs.units ?? 'metric'} onChange={(v) => prefs.set({ units: v })} render={(v) => t(`settings.unitSystems.${v}`)} />
      <ChipSelect options={['c', 'f'] as const} value={prefs.temperature ?? 'c'} onChange={(v) => prefs.set({ temperature: v })} render={(v) => (v === 'c' ? '°C' : '°F')} />
      <SectionHeader title={t('settings.climate')} />
      <Stack gap={2}>
        {CLIMATES.map((c) => (
          <OptionCard key={c} title={t(`climate.${c}`)} subtitle={t(`climate.${c}Hint`)} selected={prefs.climate === c} onPress={() => prefs.set({ climate: c })} />
        ))}
      </Stack>
    </Screen>
  );
}
