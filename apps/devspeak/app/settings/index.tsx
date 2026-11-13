import { Card, Chip, Divider, ListRow, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import Constants from 'expo-constants';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import { useChangeLanguage } from '@/features/profile/LanguagePicker';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { repos } from '@/database';
import { refreshReminder } from '@/services/reminders';
import { usePreferences, type TranslationPreference } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const isPremium = useIsPremium();
  const changeLanguage = useChangeLanguage();

  const translationOptions: { value: TranslationPreference; label: string }[] = [
    { value: 'auto', label: t('settings.translationsAuto') },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'none', label: t('settings.translationsNone') },
  ];

  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.title') }} />
      <Screen edges={[]}>
        <Card style={{ paddingVertical: 0 }}>
          <ListRow icon="person-circle-outline" title={t('settings.profile')} subtitle={t('settings.profileDesc')} onPress={() => router.push('/settings/profile')} testID="settings-profile" />
          <Divider />
          <ListRow icon="notifications-outline" title={t('settings.notifications')} subtitle={t('settings.notificationsDesc')} onPress={() => router.push('/settings/notifications')} testID="settings-notifications" />
          <Divider />
          <ListRow icon="diamond-outline" title={t('settings.premium')} subtitle={isPremium ? t('paywall.active') : undefined} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })} />
        </Card>

        <Text variant="label" tone="muted">
          {t('settings.language')}
        </Text>
        <Row wrap gap={2}>
          {INTERFACE_LANGUAGES.map((l) => (
            <Chip
              key={l}
              label={LANGUAGE_NAMES[l]}
              selected={i18n.language === l}
              onPress={async () => {
                await changeLanguage(l);
                refreshReminder(repos().preferences, i18n.t).catch(() => undefined);
              }}
              testID={`settings-lang-${l}`}
            />
          ))}
        </Row>

        <Text variant="label" tone="muted">
          {t('settings.translations')}
        </Text>
        <Row wrap gap={2}>
          {translationOptions.map((o) => (
            <Chip key={o.value} label={o.label} selected={prefs.translationLanguage === o.value} onPress={() => prefs.set({ translationLanguage: o.value })} />
          ))}
        </Row>

        <Text variant="label" tone="muted">
          {t('settings.theme')}
        </Text>
        <Row wrap gap={2}>
          {(['system', 'light', 'dark'] as const).map((m) => (
            <Chip key={m} label={t(`settings.theme${m[0]!.toUpperCase()}${m.slice(1)}`)} selected={prefs.theme === m} onPress={() => prefs.set({ theme: m })} testID={`theme-${m}`} />
          ))}
        </Row>

        <Text variant="label" tone="muted">
          {t('settings.speechRate')}
        </Text>
        <Row wrap gap={2}>
          {(
            [
              [0.75, 'settings.speechSlow'],
              [0.95, 'settings.speechNormal'],
            ] as const
          ).map(([rate, key]) => (
            <Chip key={key} label={t(key)} selected={prefs.speechRate === rate} onPress={() => prefs.set({ speechRate: rate })} />
          ))}
        </Row>

        <Text variant="label" tone="muted">
          {t('settings.privacy')}
        </Text>
        <Card style={{ paddingVertical: 0 }}>
          <ListRow
            icon="analytics-outline"
            title={t('settings.analytics')}
            right={
              <Switch
                value={prefs.analyticsConsent}
                onValueChange={(v) => {
                  prefs.set({ analyticsConsent: v });
                  setAnalyticsConsent(v);
                }}
                accessibilityLabel={t('settings.analytics')}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              />
            }
          />
          {adsState().privacyOptionsRequired ? (
            <>
              <Divider />
              <ListRow icon="shield-checkmark-outline" title={t('settings.adsPrivacy')} onPress={() => void showPrivacyOptions()} />
            </>
          ) : null}
          <Divider />
          <ListRow icon="document-lock-outline" title={t('settings.privacyPolicy')} onPress={() => router.push('/settings/privacy')} />
          <Divider />
          <ListRow icon="server-outline" title={t('settings.data')} subtitle={t('settings.dataDesc')} onPress={() => router.push('/settings/data')} testID="settings-data" />
        </Card>

        <Stack gap={1} style={{ alignItems: 'center', marginTop: 8 }}>
          <Text variant="caption" tone="subtle">
            {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
          </Text>
          <Text variant="caption" tone="subtle" center>
            {t('settings.contentNote')}
          </Text>
        </Stack>
      </Screen>
    </>
  );
}
