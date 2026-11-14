import { Button, Card, Chip, Row, Screen, Text } from '@factory/design-system';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { TimeField, ToggleRow } from '@/components/fields';
import { repos } from '@/database';
import { formatTime, parseTime } from '@/domain/dates';
import { NOTIFICATION_CATEGORIES, type NotificationCategory, type NotificationSetting } from '@/domain/types';
import { formatLocale } from '@/i18n';
import { askNotificationPermission, notificationPermission, sendTestNotification, syncNotifications } from '@/services/notifications';

/** Every reminder category can be turned on/off and timed. Permission is asked only when needed. */
export default function NotificationSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduled, setScheduled] = useState<number | null>(null);

  useEffect(() => {
    repos().notificationSettings.all().then(setSettings);
    notificationPermission().then(setPermission);
  }, []);

  const save = async (s: NotificationSetting) => {
    if (s.enabled && permission !== 'granted') {
      const p = await askNotificationPermission(t);
      setPermission(p);
    }
    await repos().notificationSettings.save(s);
    setSettings((list) => list.map((x) => (x.category === s.category ? s : x)));
    setScheduled(await syncNotifications(repos(), t));
  };

  const withTime: NotificationCategory[] = ['vaccinations', 'treatments', 'walks', 'grooming', 'restock', 'weighIn'];

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.notifications') }} />
      {permission !== 'granted' ? (
        <Card tone="accent">
          <Text variant="subheading">{t(permission === 'denied' ? 'notifSettings.deniedTitle' : 'notifSettings.askTitle')}</Text>
          <Text variant="bodySmall">{t(permission === 'denied' ? 'notifSettings.deniedBody' : 'notifSettings.askBody')}</Text>
          {permission === 'denied' ? (
            <Button label={t('notifSettings.openSettings')} size="md" variant="secondary" onPress={() => Linking.openSettings()} />
          ) : (
            <Button label={t('notifSettings.allow')} size="md" onPress={async () => setPermission(await askNotificationPermission(t))} />
          )}
        </Card>
      ) : null}
      {NOTIFICATION_CATEGORIES.map((c) => {
        const s = settings.find((x) => x.category === c);
        if (!s) return null;
        return (
          <Card key={c}>
            <ToggleRow label={t(`notifSettings.categories.${c}`)} help={t(`notifSettings.help.${c}`)} value={s.enabled} onChange={(enabled) => save({ ...s, enabled })} testID={`notif-${c}`} />
            {s.enabled && withTime.includes(c) ? (
              <TimeField
                label={t('notifSettings.time')}
                value={formatTime(s.hour, s.minute)}
                required
                onChange={(v) => {
                  if (!v) return;
                  const { hour, minute } = parseTime(v);
                  save({ ...s, hour, minute });
                }}
              />
            ) : null}
            {s.enabled && c === 'grooming' ? (
              <Row wrap gap={2}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <Chip key={d} label={new Intl.DateTimeFormat(formatLocale(), { weekday: 'short' }).format(new Date(2026, 0, 4 + d))} selected={s.weekday === d} onPress={() => save({ ...s, weekday: d })} />
                ))}
              </Row>
            ) : null}
          </Card>
        );
      })}
      {scheduled != null ? (
        <Text variant="caption" tone="subtle">
          {t('notifSettings.scheduled', { count: scheduled })}
        </Text>
      ) : null}
      <Button label={t('notifSettings.test')} variant="secondary" icon="notifications-outline" onPress={async () => setPermission(await sendTestNotification(t))} />
      <Text variant="caption" tone="subtle">
        {t('notifSettings.footer')}
      </Text>
    </Screen>
  );
}
