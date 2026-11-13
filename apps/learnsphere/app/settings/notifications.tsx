import { Button, Screen, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { TimeField } from '@/components/pickers';
import { Panel, Stepper, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { DEFAULT_NOTIFICATION_SETTINGS, NOTIFICATION_KINDS, type NotificationKind, type NotificationSettings } from '@/features/notifications/plan';
import { fmt } from '@/i18n';
import { ensurePermission, getPermission, rescheduleAll, sendTestNotification } from '@/services/notifications';

/** Every reminder is optional, off by default and individually configurable. */
export default function NotificationSettingsScreen() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permission, setPermission] = useState<string>('undetermined');

  useEffect(() => {
    void repos().settings.notificationSettings().then(setSettings);
    void getPermission().then(setPermission);
  }, []);

  const update = async (kind: NotificationKind, patch: Partial<NotificationSettings[NotificationKind]>) => {
    const next = { ...settings[kind], ...patch };
    if (patch.enabled) {
      const p = await ensurePermission(i18n.t);
      setPermission(p);
      if (p !== 'granted') {
        Alert.alert(t('notifications.deniedTitle'), t('notifications.deniedBody'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('notifications.openSettings'), onPress: () => Linking.openSettings() },
        ]);
        return;
      }
    }
    setSettings({ ...settings, [kind]: next });
    await repos().settings.setNotificationSetting(kind, next);
    await rescheduleAll(repos(), i18n.t);
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.notifications') }} />
      <Text variant="bodySmall" tone="muted">
        {t('notifications.intro')}
      </Text>
      {permission === 'denied' ? (
        <Text variant="bodySmall" tone="warning">
          {t('notifications.deniedBody')}
        </Text>
      ) : null}
      {NOTIFICATION_KINDS.map((kind) => {
        const s = settings[kind];
        return (
          <Panel key={kind} title={t(`notifications.kinds.${kind}.title`)}>
            <ToggleRow title={t('common.enabled')} subtitle={t(`notifications.kinds.${kind}.desc`)} value={s.enabled} onChange={(v) => update(kind, { enabled: v })} testID={`notif-${kind}`} />
            {s.enabled && kind === 'session' ? <Stepper label={t('notifications.leadTime')} value={s.leadMinutes} onChange={(v) => update(kind, { leadMinutes: v })} min={0} max={120} step={5} format={fmt.duration} /> : null}
            {s.enabled && kind !== 'session' ? <TimeField label={t('notifications.time')} value={s.hour * 60 + s.minute} onChange={(m) => update(kind, { hour: Math.floor(m / 60), minute: m % 60 })} /> : null}
          </Panel>
        );
      })}
      <Button
        variant="secondary"
        icon="notifications-outline"
        label={t('notifications.test')}
        onPress={async () => {
          const p = await sendTestNotification(i18n.t);
          setPermission(p);
          if (p !== 'granted') Alert.alert(t('notifications.deniedTitle'), t('notifications.deniedBody'));
        }}
      />
    </Screen>
  );
}
