import { Button, Card, Divider, Row, Screen, SectionHeader, Stack, Text, type ThemePreference } from '@factory/design-system';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Alert, Switch } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { CURRENCY_CODES } from '@/constants/currencies';
import { repos, wipeAllData } from '@/database';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { recordError, setAnalyticsConsent } from '@/services/analytics';
import { wipeAllFiles } from '@/services/files';
import { usePreferences } from '@/store/preferences';
import { notifyDataChanged } from '@/store/session';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const THEME_KEYS = { system: 'settings.themeSystem', light: 'settings.themeLight', dark: 'settings.themeDark' } as const;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const language = (INTERFACE_LANGUAGES as readonly string[]).includes(i18n.language) ? (i18n.language as (typeof INTERFACE_LANGUAGES)[number]) : 'en';

  const confirmDeleteAll = () =>
    Alert.alert(t('settings.deleteAllTitle'), t('settings.deleteAllMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteAllConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await wipeAllData(repos().db);
            wipeAllFiles();
            notifyDataChanged();
            Alert.alert(t('settings.deleted'));
          } catch (e) {
            recordError(e, 'wipe');
            Alert.alert(t('tripForm.errors.generic'));
          }
        },
      },
    ]);

  return (
    <Screen testID="settings-screen">
      <Text variant="title" accessibilityRole="header">
        {t('settings.title')}
      </Text>

      <SectionHeader title={t('settings.general')} />
      <Card>
        <ChoiceChips
          label={t('settings.language')}
          options={INTERFACE_LANGUAGES}
          value={language}
          labelOf={(l) => LANGUAGE_NAMES[l]}
          onChange={(l) => {
            prefs.set({ interfaceLanguage: l });
            i18n.changeLanguage(l).catch(() => undefined);
          }}
          testID="settings-language"
        />
        <Divider />
        <ChoiceChips label={t('settings.theme')} options={THEMES} value={prefs.theme} labelOf={(v) => t(THEME_KEYS[v])} onChange={(v) => prefs.set({ theme: v })} testID="settings-theme" />
        <Divider />
        <ChoiceChips label={t('settings.defaultCurrency')} options={CURRENCY_CODES} value={prefs.defaultCurrency} labelOf={(c) => c} onChange={(c) => prefs.set({ defaultCurrency: c })} />
      </Card>

      <SectionHeader title={t('settings.privacyTitle')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('settings.privacySummary')}
        </Text>
        <Divider />
        <Row style={{ justifyContent: 'space-between' }} gap={3}>
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="subheading">{t('settings.analytics')}</Text>
            <Text variant="caption" tone="subtle">
              {t('settings.analyticsHint')}
            </Text>
          </Stack>
          <Switch
            value={prefs.analyticsConsent}
            accessibilityLabel={t('settings.analytics')}
            onValueChange={(v) => {
              prefs.set({ analyticsConsent: v });
              setAnalyticsConsent(v);
            }}
          />
        </Row>
      </Card>

      <SectionHeader title={t('settings.data')} />
      <Card>
        <Button label={t('settings.deleteAll')} variant="danger" icon="trash-outline" onPress={confirmDeleteAll} testID="settings-delete-all" />
      </Card>

      <SectionHeader title={t('settings.about')} />
      <Text variant="bodySmall" tone="muted">
        {t('app.tagline')}
      </Text>
      <Text variant="caption" tone="subtle">
        {t('settings.version', { version: Constants.expoConfig?.version ?? '—' })}
      </Text>
    </Screen>
  );
}
