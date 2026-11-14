import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { repos } from '@/database';
import type { NotificationKind, NotificationSetting } from '@/domain/types';
import { NotificationCard } from '@/features/settings/NotificationCard';
import { NOTIFICATION_ORDER } from '@/features/settings/logic';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { askPermission, cancelAllNotifications, getPermission } from '@/services/reminders';
import { Button, Card, Icon, Loading, Row, Screen, Stack, Text, useTheme } from '@/ui';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(() => repos().settings.notifications(), []);
  const [local, setLocal] = useState<NotificationSetting[] | null>(null);
  const [denied, setDenied] = useState(false);
  const settings = local ?? data ?? null;

  useEffect(() => {
    getPermission()
      .then((p) => setDenied(p === 'denied'))
      .catch(() => undefined);
  }, []);

  const persist = async (kind: NotificationKind, patch: Partial<Omit<NotificationSetting, 'kind'>>) => {
    setLocal((prev) => (prev ?? data ?? []).map((s) => (s.kind === kind ? { ...s, ...patch } : s)));
    try {
      await repos().settings.setNotification(kind, patch);
      afterWrite({ notifications: true });
    } catch (e) {
      recordError(e, 'notification_setting');
      Alert.alert(t('common.error'));
    }
  };

  const toggle = async (kind: NotificationKind, enabled: boolean) => {
    if (enabled) {
      const permission = await askPermission(t);
      if (permission !== 'granted') {
        setDenied(true);
        Alert.alert(t('settings.notifications.deniedTitle'), t('settings.notifications.deniedMessage'), [
          { text: t('common.close'), style: 'cancel' },
          { text: t('settings.notifications.openSettings'), onPress: () => void Linking.openSettings() },
        ]);
        return;
      }
      setDenied(false);
    }
    await persist(kind, { enabled });
  };

  const turnAllOff = async () => {
    setLocal((prev) => (prev ?? data ?? []).map((s) => ({ ...s, enabled: false })));
    try {
      await repos().settings.disableAllNotifications();
      await cancelAllNotifications();
      afterWrite();
    } catch (e) {
      recordError(e, 'notifications_off');
      Alert.alert(t('common.error'));
    }
  };

  const ordered = settings ? NOTIFICATION_ORDER.map((k) => settings.find((s) => s.kind === k)).filter((s): s is NotificationSetting => !!s) : [];

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.notifications.title') }} />
      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="lock-closed-outline" size={16} color={theme.colors.textMuted} />
          <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
            {t('settings.notifications.intro')}
          </Text>
        </Row>
      </Card>
      {denied ? (
        <Card tone="accent">
          <Text variant="heading">{t('settings.notifications.deniedTitle')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('settings.notifications.deniedMessage')}
          </Text>
          <Button small variant="secondary" label={t('settings.notifications.openSettings')} onPress={() => void Linking.openSettings()} style={{ alignSelf: 'flex-start' }} />
        </Card>
      ) : null}
      {!settings ? (
        <Loading />
      ) : (
        <Stack gap={3}>
          {ordered.map((s) => (
            <NotificationCard key={s.kind} setting={s} onToggle={(v) => void toggle(s.kind, v)} onChange={(patch) => void persist(s.kind, patch)} />
          ))}
          {ordered.some((s) => s.enabled) ? <Button variant="danger" icon="notifications-off-outline" label={t('settings.notifications.turnAllOff')} onPress={() => void turnAllOff()} /> : null}
        </Stack>
      )}
    </Screen>
  );
}
