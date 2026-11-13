import { Button, Card, Row, Screen, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { Stepper, ToggleRow } from '@/components/forms';
import { Notice, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { NOTIFICATION_KINDS, type NotificationKind, type NotificationSetting } from '@/domain/types';
import { useRepo } from '@/hooks/useData';
import { askPermission, cancelAll, sendTest, syncNotifications } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';

/** Reminder settings. Each kind can be turned off; texts never contain personal details. */
export default function NotificationSettings() {
  const { t, i18n } = useTranslation();
  const enabled = usePreferences((s) => s.notificationsEnabled);
  const names = usePreferences((s) => s.notificationEventNames);
  const set = usePreferences((s) => s.set);
  const { data, reload } = useRepo((r) => r.settings.notifications(), []);
  const [denied, setDenied] = useState(false);

  const resync = () => syncNotifications(repos(), i18n.t);

  const toggleMaster = async (on: boolean) => {
    if (on) {
      const p = await askPermission(t);
      if (p !== 'granted') {
        setDenied(true);
        return;
      }
      set({ notificationsEnabled: true });
      await resync();
    } else {
      set({ notificationsEnabled: false });
      await cancelAll();
    }
  };

  const update = async (s: NotificationSetting) => {
    await repos().settings.setNotification(s);
    reload();
    await resync();
  };

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('settings.notifications')} />
      <Card>
        <ToggleRow label={t('notificationsSettings.master')} value={enabled} onChange={(v) => void toggleMaster(v)} testID="notif-master" />
        <ToggleRow label={t('notificationsSettings.showNames')} hint={t('notificationsSettings.showNamesHint')} value={names} onChange={(v) => {
          set({ notificationEventNames: v });
          void resync();
        }} />
      </Card>
      {denied ? (
        <Notice tone="warning" icon="notifications-off" title={t('notificationsSettings.deniedTitle')}>
          <Stack gap={2}>
            <Text variant="bodySmall">{t('notificationsSettings.deniedBody')}</Text>
            <Button size="md" variant="secondary" label={t('notificationsSettings.openSettings')} onPress={() => void Linking.openSettings()} />
          </Stack>
        </Notice>
      ) : null}
      <Notice icon="lock-closed">{t('notificationsSettings.privacy')}</Notice>
      {enabled && data
        ? NOTIFICATION_KINDS.map((kind: NotificationKind) => {
            const s = data[kind];
            return (
              <Card key={kind}>
                <ToggleRow label={t(`notificationsSettings.kinds.${kind}.title`)} hint={t(`notificationsSettings.kinds.${kind}.hint`)} value={s.enabled} onChange={(v) => void update({ ...s, enabled: v })} />
                {s.enabled ? (
                  <>
                    {kind !== 'vendor_meeting' || s.leadDays > 0 ? (
                      <Stepper label={t('notificationsSettings.leadDays')} value={s.leadDays} min={kind === 'deadline_soon' ? 1 : 0} max={60} onChange={(leadDays) => void update({ ...s, leadDays })} />
                    ) : (
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Text variant="bodySmall" tone="muted">
                          {t('notificationsSettings.oneHourBefore')}
                        </Text>
                        <Button size="md" variant="ghost" label={t('notificationsSettings.dayBefore')} onPress={() => void update({ ...s, leadDays: 1 })} />
                      </Row>
                    )}
                    {kind !== 'vendor_meeting' ? <Stepper label={t('notificationsSettings.hour')} value={s.hour} min={6} max={22} onChange={(hour) => void update({ ...s, hour })} /> : null}
                  </>
                ) : null}
              </Card>
            );
          })
        : null}
      <Button
        variant="secondary"
        icon="notifications-outline"
        label={t('notificationsSettings.test')}
        onPress={() => void sendTest(t).then((p) => (p === 'granted' ? Alert.alert(t('notificationsSettings.testSent')) : setDenied(true)))}
      />
    </Screen>
  );
}
