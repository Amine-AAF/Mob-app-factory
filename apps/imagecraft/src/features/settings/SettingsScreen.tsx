import { Card, Chip, Divider, ListRow, Row, Screen, Stack, Text } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ToggleRow } from '@/components/controls';
import { PremiumCard } from '@/components/monetization';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { restore } from '@/services/monetization';
import { deleteAllData, setAnalytics, updatePreferences } from '@/services/settingsActions';
import { repos } from '@/database';
import { useSession } from '@/store/session';
import { OUTPUT_FORMATS } from '@/types/image';

/** Preferences, privacy controls, Premium restore, data deletion, about. */
export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const prefs = useSession((s) => s.preferences);
  const consent = useSession((s) => s.analyticsConsent);
  const storeAvailable = useSession((s) => s.storeAvailable);
  const [message, setMessage] = useState<string | null>(null);

  const safe = (p: Promise<unknown>, ctx: string) => p.catch((e) => recordError(e, ctx));

  const confirmDelete = () =>
    Alert.alert(t('settings.deleteAllTitle'), t('settings.deleteAllMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteAllConfirm'), style: 'destructive', onPress: () => void safe(deleteAllData().then(() => setMessage(t('settings.deleted'))), 'delete_all') },
    ]);

  return (
    <Screen testID="settings-screen">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.settings')}
      </Text>
      <PremiumCard source="settings" />

      <Card>
        <Text variant="label" tone="muted">
          {t('settings.language')}
        </Text>
        <Row gap={2} wrap>
          <Chip label={t('settings.systemLanguage')} selected={prefs.language === null} onPress={() => void safe(updatePreferences({ language: null }, i18n), 'lang')} />
          {INTERFACE_LANGUAGES.map((l) => (
            <Chip key={l} label={LANGUAGE_NAMES[l]} selected={prefs.language === l} onPress={() => void safe(updatePreferences({ language: l }, i18n), 'lang')} testID={`lang-${l}`} />
          ))}
        </Row>
        <Text variant="label" tone="muted">
          {t('settings.theme')}
        </Text>
        <Row gap={2} wrap>
          {(['system', 'light', 'dark'] as const).map((th) => (
            <Chip key={th} label={t(`settings.themes.${th}`)} selected={prefs.theme === th} onPress={() => void safe(updatePreferences({ theme: th }), 'theme')} testID={`theme-${th}`} />
          ))}
        </Row>
      </Card>

      <Card>
        <Text variant="label" tone="muted">
          {t('settings.defaultFormat')}
        </Text>
        <Row gap={2} wrap>
          {OUTPUT_FORMATS.map((f) => (
            <Chip key={f} label={t(`format.names.${f}`)} selected={prefs.defaultFormat === f} onPress={() => void safe(updatePreferences({ defaultFormat: f }), 'format')} />
          ))}
        </Row>
        <Text variant="label" tone="muted">
          {t('settings.defaultQuality')}
        </Text>
        <Row gap={2} wrap>
          {[60, 75, 85, 95].map((q) => (
            <Chip key={q} label={`${q} %`} selected={prefs.defaultQuality === q} onPress={() => void safe(updatePreferences({ defaultQuality: q }), 'quality')} />
          ))}
        </Row>
        <ToggleRow label={t('settings.keepProjects')} hint={t('settings.keepProjectsHint')} value={prefs.keepProjects} onChange={(v) => void safe(updatePreferences({ keepProjects: v }), 'keep_projects')} />
      </Card>

      <Card>
        <Text variant="label" tone="muted">
          {t('settings.privacy')}
        </Text>
        <ToggleRow label={t('settings.analytics')} hint={t('settings.analyticsHint')} value={consent} onChange={(v) => void safe(setAnalytics(v), 'analytics')} testID="analytics-toggle" />
        <Divider />
        {adsState().privacyOptionsRequired ? <ListRow icon="megaphone-outline" title={t('settings.adChoices')} onPress={() => void showPrivacyOptions()} /> : null}
        <ListRow icon="shield-checkmark-outline" title={t('privacy.title')} subtitle={t('privacy.badge')} onPress={() => router.push('/privacy')} />
        <ListRow
          icon="refresh-circle-outline"
          title={t('settings.restore')}
          onPress={() =>
            void restore(repos())
              .then((s) => setMessage(s?.isPremium ? t('settings.restored') : storeAvailable ? t('settings.nothingToRestore') : t('premium.storeUnavailable')))
              .catch((e) => {
                recordError(e, 'restore');
                setMessage(t('premium.storeUnavailable'));
              })
          }
        />
        <ListRow icon="trash-outline" title={t('settings.deleteAll')} subtitle={t('settings.deleteAllHint')} onPress={confirmDelete} testID="delete-all" />
      </Card>
      {message ? (
        <Text variant="bodySmall" tone="success" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      <Stack gap={1}>
        <Text variant="caption" tone="muted" center>
          {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
        <Text variant="caption" tone="subtle" center>
          {t('app.slogan')}
        </Text>
      </Stack>
    </Screen>
  );
}
