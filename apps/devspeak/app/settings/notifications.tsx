import { Button, Card, Chip, ListRow, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import { repos } from '@/database';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { DEFAULT_REMINDER, loadReminder, saveReminder, testReminder, type ReminderSettings } from '@/services/reminders';

const TIMES: [number, number][] = [
  [7, 30],
  [9, 0],
  [12, 30],
  [18, 0],
  [19, 0],
  [21, 0],
];

export default function NotificationSettings() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadReminder(repos().preferences).then(setSettings).catch((e) => recordError(e, 'reminder_load'));
  }, []);

  const label = (h: number, m: number) => fmt.date(new Date(2026, 0, 1, h, m), { hour: 'numeric', minute: '2-digit' });

  const apply = async (next: ReminderSettings) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await saveReminder(repos().preferences, next, t);
      setSettings(res.settings);
      if (next.enabled && res.permission !== 'granted') setMessage(t('notifications.denied'));
      else if (res.settings.enabled) setMessage(t('notifications.saved', { time: label(res.settings.hour, res.settings.minute) }));
    } catch (e) {
      recordError(e, 'reminder_save');
      setMessage(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('notifications.title') }} />
      <Screen edges={[]}>
        <Card style={{ paddingVertical: 0 }}>
          <ListRow
            icon="notifications-outline"
            title={t('notifications.enable')}
            subtitle={t('notifications.enableDesc')}
            right={
              <Switch
                value={settings.enabled}
                disabled={busy}
                onValueChange={(enabled) => void apply({ ...settings, enabled })}
                accessibilityLabel={t('notifications.enable')}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                testID="reminder-switch"
              />
            }
          />
        </Card>
        {settings.enabled ? (
          <Stack gap={2}>
            <Text variant="label" tone="muted">
              {t('notifications.time')}
            </Text>
            <Row wrap gap={2}>
              {TIMES.map(([h, m]) => (
                <Chip key={`${h}:${m}`} label={label(h, m)} selected={settings.hour === h && settings.minute === m} onPress={() => void apply({ enabled: true, hour: h, minute: m })} />
              ))}
            </Row>
          </Stack>
        ) : null}
        {message ? (
          <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
        <Button
          label={t('notifications.test')}
          variant="secondary"
          icon="paper-plane-outline"
          onPress={async () => {
            const p = await testReminder(t);
            setMessage(p === 'granted' ? t('notifications.testSent') : t('notifications.denied'));
          }}
        />
      </Screen>
    </>
  );
}
