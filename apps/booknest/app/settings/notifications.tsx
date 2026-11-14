import { Button, Chip, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Field, Page, Paper } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { fmt } from '@/i18n';
import { ensurePermission, getPermission, syncNotifications, testReminder } from '@/services/reminders';
import { useSession } from '@/store/session';
import type { NotificationKind, NotificationSetting } from '@/types';

const WEEKLY: NotificationKind[] = ['weekly_goal', 'challenge'];

/** All reminders are off by default, individually configurable, and worded without guilt. */
export default function NotificationSettings() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const { data } = useData((r) => r.organize.notificationSettings(), []);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [permission, setPermission] = useState<string>('undetermined');
  // Mirror the stored settings each time they are reloaded (derived during render, no effect needed).
  const [syncedData, setSyncedData] = useState<typeof data>(undefined);
  if (data && data !== syncedData) {
    setSyncedData(data);
    setSettings(data);
  }
  useEffect(() => {
    getPermission().then(setPermission).catch(() => undefined);
  }, []);

  const update = (kind: NotificationKind, patch: Partial<NotificationSetting>) =>
    run(async () => {
      const current = settings.find((s) => s.kind === kind)!;
      const next = { ...current, ...patch };
      if (patch.enabled) {
        const p = await ensurePermission(t);
        setPermission(p);
        if (p !== 'granted') {
          Alert.alert(t('notifications.permissionTitle'), t('notifications.permissionBody'), [
            { text: t('common.notNow'), style: 'cancel' },
            { text: t('notifications.openSettings'), onPress: () => void Linking.openSettings() },
          ]);
          return;
        }
      }
      await repos().organize.saveNotificationSetting(next);
      setSettings((prev) => prev.map((s) => (s.kind === kind ? next : s)));
      await syncNotifications(repos(), t);
      useSession.getState().bump();
    });

  const setTime = (s: NotificationSetting, value: string) => {
    const m = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return;
    void update(s.kind, { hour: Number(m[1]), minute: Number(m[2]) });
  };

  return (
    <Page edges={['bottom']}>
      <Text tone="muted">{t('notifications.intro')}</Text>
      {permission === 'denied' ? (
        <Paper tone="alt">
          <Text variant="bodySmall">{t('notifications.permissionBody')}</Text>
          <Button label={t('notifications.openSettings')} variant="secondary" onPress={() => void Linking.openSettings()} />
        </Paper>
      ) : null}
      {settings.map((s) => (
        <Paper key={s.kind} style={{ gap: 10 }} testID={`notif-${s.kind}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{t(`notifications.kinds.${s.kind}.title`)}</Text>
              <Text variant="caption" tone="muted">
                {t(`notifications.kinds.${s.kind}.hint`)}
              </Text>
            </View>
            <Switch value={s.enabled} onValueChange={(v) => void update(s.kind, { enabled: v })} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t(`notifications.kinds.${s.kind}.title`)} testID={`switch-${s.kind}`} />
          </View>
          {s.enabled ? (
            <>
              <Field label={t('notifications.time')} defaultValue={`${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`} onEndEditing={(e) => setTime(s, e.nativeEvent.text)} keyboardType="numbers-and-punctuation" maxLength={5} />
              {WEEKLY.includes(s.kind) ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <Chip key={d} label={fmt.weekdayShort(d)} selected={s.weekday === d} onPress={() => void update(s.kind, { weekday: d })} />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </Paper>
      ))}
      <Button label={t('notifications.test')} variant="secondary" icon="notifications-outline" onPress={() => void run(() => testReminder(t))} />
      <Text variant="caption" tone="subtle">
        {t('notifications.tone')}
      </Text>
    </Page>
  );
}
