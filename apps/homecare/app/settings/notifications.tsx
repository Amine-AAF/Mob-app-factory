import { Button, Card, Divider, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { getPermission, type PermissionResult } from '@factory/notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { Stepper, SwitchRow, TimeField } from '@/components/forms';
import { PremiumLock } from '@/components/media';
import { Notice, ScreenHeader } from '@/components/ui';
import { repos } from '@/database';
import type { NotificationSettingsMap } from '@/database/repositories/settings';
import { NOTIFICATION_CATEGORIES, type NotificationCategory } from '@/domain/types';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';
import { isMasterEnabled, requestNotificationPermission, sendTest, setMasterEnabled, syncReminders } from '@/services/reminders';
import { useIsPremium } from '@/store/session';

/**
 * Reminder settings. Free: turn each kind on/off. Premium ("advanced reminders"):
 * choose how many days before and at what time.
 */
export default function NotificationSettings() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [settings, setSettings] = useState<NotificationSettingsMap | null>(null);
  const [master, setMaster] = useState(true);
  const [permission, setPermission] = useState<PermissionResult>('undetermined');
  const [scheduled, setScheduled] = useState<number | null>(null);

  useEffect(() => {
    const r = repos();
    void Promise.all([r.settings.notificationSettings(), isMasterEnabled(r), getPermission()]).then(([s, m, p]) => {
      setSettings(s);
      setMaster(m);
      setPermission(p);
    });
  }, []);

  const resync = async () => {
    const res = await syncReminders(repos(), t);
    setScheduled(res.scheduled);
    setPermission(res.permission);
  };

  const update = async (c: NotificationCategory, patch: Partial<NotificationSettingsMap[NotificationCategory]>) => {
    if (!settings) return;
    const next = { ...settings[c], ...patch };
    setSettings({ ...settings, [c]: next });
    await mutate(() => repos().settings.setNotificationSetting(c, next));
    await resync();
  };

  const toggleMaster = async (v: boolean) => {
    setMaster(v);
    if (v && permission !== 'granted') {
      const p = await requestNotificationPermission(t);
      setPermission(p);
    }
    await setMasterEnabled(repos(), v);
    await resync();
  };

  const test = async () => {
    const p = await sendTest(t);
    setPermission(p);
    if (p !== 'granted') Alert.alert(t('notifications.deniedTitle'), t('notifications.denied'));
  };

  return (
    <Screen>
      <ScreenHeader title={t('settings.notifications')} back />
      {permission === 'denied' ? (
        <Notice tone="warning" icon="notifications-off-outline">
          <Stack gap={2}>
            <Text variant="bodySmall">{t('notifications.denied')}</Text>
            <Button label={t('notifications.openSettings')} variant="secondary" size="md" onPress={() => void Linking.openSettings()} />
          </Stack>
        </Notice>
      ) : null}
      <Card>
        <SwitchRow label={t('notifications.master')} subtitle={t('notifications.masterHint')} value={master} onValueChange={(v) => void toggleMaster(v)} testID="notif-master" />
      </Card>
      {!isPremium ? <PremiumLock feature="advanced_reminders" message={t('notifications.advancedLocked')} /> : null}
      {settings && master
        ? NOTIFICATION_CATEGORIES.map((c) => (
            <Card key={c}>
              <SwitchRow label={t(`notifications.channels.${c}`)} subtitle={t(`notifications.hints.${c}`)} value={settings[c].enabled} onValueChange={(v) => void update(c, { enabled: v })} testID={`notif-${c}`} />
              {settings[c].enabled ? (
                <>
                  <Divider />
                  {isPremium ? (
                    <>
                      {c !== 'household' ? <Stepper label={t('notifications.daysBefore')} value={settings[c].daysBefore} min={0} max={90} onChange={(v) => void update(c, { daysBefore: v })} /> : null}
                      <TimeField label={t('notifications.time')} hour={settings[c].hour} minute={settings[c].minute} onChange={(h, m) => void update(c, { hour: h, minute: m })} />
                    </>
                  ) : (
                    <Text variant="caption" tone="muted">
                      {t('notifications.defaultTiming', { count: settings[c].daysBefore, time: fmt.time(settings[c].hour, settings[c].minute) })}
                    </Text>
                  )}
                </>
              ) : null}
            </Card>
          ))
        : null}
      <SectionHeader title={t('notifications.check')} />
      <Button label={t('notifications.test')} variant="secondary" icon="paper-plane-outline" onPress={() => void test()} />
      {scheduled !== null ? (
        <Text variant="caption" tone="subtle">
          {t('notifications.scheduledCount', { count: scheduled })}
        </Text>
      ) : null}
      <Text variant="caption" tone="subtle">
        {t('notifications.footnote')}
      </Text>
    </Screen>
  );
}
