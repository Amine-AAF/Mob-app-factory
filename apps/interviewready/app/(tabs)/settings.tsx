import { Card, Chip, ListRow, Row, Screen, SectionHeader, Stack, Text, useTheme, type ThemePreference } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import { appManifest } from '@/config/brand';
import { useAdsStateVersion } from '@/hooks/useAds';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

const THEMES: { value: ThemePreference; key: 'themeSystem' | 'themeLight' | 'themeDark' }[] = [
  { value: 'system', key: 'themeSystem' },
  { value: 'light', key: 'themeLight' },
  { value: 'dark', key: 'themeDark' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  useAdsStateVersion();

  const chooseLanguage = (lng: InterfaceLanguage | null) => {
    prefs.set({ interfaceLanguage: lng });
    // "Device language" keeps the language resolved at boot until the next start.
    if (lng) i18n.changeLanguage(lng).catch(() => undefined);
  };

  const toggleAnalytics = (value: boolean) => {
    prefs.set({ analyticsConsent: value });
    setAnalyticsConsent(value);
  };

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('settings.title')}
      </Text>

      <SectionHeader title={t('settings.language')} />
      <Row wrap gap={2}>
        <Chip label={t('settings.languageSystem')} selected={prefs.interfaceLanguage === null} onPress={() => chooseLanguage(null)} />
        {INTERFACE_LANGUAGES.map((lng) => (
          <Chip key={lng} label={LANGUAGE_NAMES[lng]} selected={prefs.interfaceLanguage === lng} onPress={() => chooseLanguage(lng)} testID={`lang-${lng}`} />
        ))}
      </Row>

      <SectionHeader title={t('settings.theme')} />
      <Row wrap gap={2}>
        {THEMES.map((th) => (
          <Chip key={th.value} label={t(`settings.${th.key}`)} selected={prefs.theme === th.value} onPress={() => prefs.set({ theme: th.value })} />
        ))}
      </Row>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="subheading">{t('settings.analytics')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('settings.analyticsHint')}
            </Text>
          </Stack>
          <Switch
            value={prefs.analyticsConsent}
            onValueChange={toggleAnalytics}
            accessibilityLabel={t('settings.analytics')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
          />
        </Row>
      </Card>

      {adsState().privacyOptionsRequired ? (
        <ListRow title={t('settings.adChoices')} subtitle={t('settings.adChoicesHint')} icon="options-outline" onPress={() => void showPrivacyOptions()} testID="settings-ad-choices" />
      ) : null}

      <SectionHeader title={t('settings.account')} />
      <ListRow title={t('settings.profile')} subtitle={t('settings.profileHint')} icon="person-circle-outline" onPress={() => router.push('/onboarding')} testID="settings-profile" />
      <ListRow title={t('settings.premium')} icon="diamond-outline" onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })} />
      <ListRow title={t('data.title')} subtitle={t('settings.dataHint')} icon="server-outline" onPress={() => router.push('/data')} testID="settings-data" />

      <Text variant="caption" tone="subtle" center>
        {t('settings.version', { version: appManifest.version })}
      </Text>
    </Screen>
  );
}
