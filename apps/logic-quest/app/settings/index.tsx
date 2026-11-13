import { Card, Chip, Divider, ListRow, Row, Screen, Stack, Text } from '@factory/design-system';
import Constants from 'expo-constants';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import { repos } from '@/database';
import { useAsync } from '@/hooks';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { loadReminder, refreshReminder, saveReminder, type ReminderSettings } from '@/services/reminders';
import { usePreferences, type MotionPreference } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const REMINDER_TIMES = [8, 12, 18, 21] as const;

function ToggleRow({ title, subtitle, value, onChange, testID }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Row gap={3} style={{ justifyContent: 'space-between', minHeight: 56 }}>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={title} testID={testID} />
    </Row>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const isPremium = useIsPremium();
  const { data: loaded } = useAsync(() => loadReminder(repos().preferences), []);
  const [reminder, setReminder] = useState<ReminderSettings | null>(null);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const current = reminder ?? loaded ?? null;

  const updateReminder = async (next: ReminderSettings) => {
    const { settings, permission } = await saveReminder(repos().preferences, next, t);
    setReminder(settings);
    setReminderMsg(next.enabled && permission !== 'granted' ? t('settings.reminderDenied') : null);
  };

  const changeLanguage = async (lng: (typeof INTERFACE_LANGUAGES)[number]) => {
    prefs.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng);
    await refreshReminder(repos().preferences, i18n.t).catch(() => undefined);
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.title') }} />
      <Screen edges={[]} testID="settings">
        <Card onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })} tone={isPremium ? 'accent' : 'primary'}>
          <Text variant="subheading">{isPremium ? t('settings.premiumActive') : t('settings.goPremium')}</Text>
          <Text variant="bodySmall">{isPremium ? t('settings.manageHint') : t('settings.premiumHint')}</Text>
        </Card>

        <Text variant="heading">{t('settings.language')}</Text>
        <Row wrap gap={2}>
          {INTERFACE_LANGUAGES.map((lng) => (
            <Chip key={lng} label={LANGUAGE_NAMES[lng]} selected={i18n.language === lng} onPress={() => void changeLanguage(lng)} testID={`lang-${lng}`} />
          ))}
        </Row>

        <Text variant="heading">{t('settings.appearance')}</Text>
        <Row wrap gap={2}>
          {(['system', 'light', 'dark'] as const).map((th) => (
            <Chip key={th} label={t(`settings.theme_${th}`)} selected={prefs.theme === th} onPress={() => prefs.set({ theme: th })} testID={`theme-${th}`} />
          ))}
        </Row>

        <Text variant="heading">{t('settings.accessibility')}</Text>
        <Card>
          <ToggleRow title={t('settings.haptics')} value={prefs.haptics} onChange={(v) => prefs.set({ haptics: v })} />
          <Divider />
          <ToggleRow title={t('settings.relaxedTiming')} subtitle={t('settings.relaxedTimingDesc')} value={prefs.relaxedTiming} onChange={(v) => prefs.set({ relaxedTiming: v })} />
          <Divider />
          <Text variant="bodySmall" style={{ marginTop: 8 }}>
            {t('settings.motion')}
          </Text>
          <Row wrap gap={2}>
            {(['system', 'reduce', 'full'] as MotionPreference[]).map((m) => (
              <Chip key={m} label={t(`settings.motion_${m}`)} selected={prefs.motion === m} onPress={() => prefs.set({ motion: m })} />
            ))}
          </Row>
        </Card>

        <Text variant="heading">{t('settings.reminder')}</Text>
        <Card>
          <ToggleRow title={t('settings.reminderToggle')} subtitle={t('settings.reminderDesc')} value={!!current?.enabled} onChange={(v) => current && void updateReminder({ ...current, enabled: v })} testID="reminder-toggle" />
          {current?.enabled ? (
            <Row wrap gap={2}>
              {REMINDER_TIMES.map((h) => (
                <Chip key={h} label={`${String(h).padStart(2, '0')}:00`} selected={current.hour === h} onPress={() => void updateReminder({ ...current, hour: h, minute: 0 })} />
              ))}
            </Row>
          ) : null}
          {reminderMsg ? (
            <Text variant="bodySmall" tone="warning">
              {reminderMsg}
            </Text>
          ) : null}
        </Card>

        <Text variant="heading">{t('settings.privacy')}</Text>
        <Card>
          <ToggleRow
            title={t('settings.analytics')}
            subtitle={t('settings.analyticsDesc')}
            value={prefs.analyticsConsent}
            onChange={(v) => {
              prefs.set({ analyticsConsent: v });
              setAnalyticsConsent(v);
            }}
          />
          {adsState().privacyOptionsRequired ? <ListRow title={t('settings.adChoices')} icon="options-outline" onPress={() => void showPrivacyOptions()} /> : null}
          <ListRow title={t('settings.privacySummary')} icon="shield-checkmark-outline" onPress={() => router.push('/settings/privacy')} />
          <ListRow title={t('settings.data')} icon="server-outline" onPress={() => router.push('/settings/data')} testID="settings-data" />
        </Card>

        <Text variant="caption" tone="subtle" center>
          {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
      </Screen>
    </>
  );
}
