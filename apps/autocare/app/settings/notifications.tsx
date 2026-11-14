import { Button, Card, Divider, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { InfoNote, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { useAsync } from '@/hooks';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { ensurePermission, getPermission, syncNotifications, testReminder } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import type { NotificationCategory } from '@/types';
import { formatTime } from '@/utils';

const HOURS = [7, 8, 9, 12, 18, 20];

/** Every reminder type can be turned off, and its time chosen. All local. */
export default function NotificationSettings() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const enabled = usePreferences((s) => s.notificationsEnabled);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined' | null>(null);
  const { data: settings } = useAsync(() => repos().notificationSettings.all(), []);

  useEffect(() => {
    getPermission().then(setPermission).catch(() => setPermission(null));
  }, []);

  const toggleAll = async (on: boolean) => {
    usePreferences.getState().set({ notificationsEnabled: on });
    if (on) setPermission(await ensurePermission(t));
    await syncNotifications(repos(), t);
  };

  const update = async (category: NotificationCategory, patch: { enabled?: boolean; hour?: number }) => {
    await repos().notificationSettings.set(category, patch.hour !== undefined ? { ...patch, minute: 0 } : patch, clock.now());
    afterWrite();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.notifications') }} />
      <Screen edges={[]}>
        <Card>
          <ToggleRow label={t('settings.notificationsAll')} value={enabled} onChange={(v) => void toggleAll(v)} />
          {permission === 'denied' ? (
            <Stack gap={2}>
              <Text variant="bodySmall" tone="danger">
                {t('settings.permissionDenied')}
              </Text>
              <Button label={t('settings.openSettings')} variant="secondary" size="md" onPress={() => void Linking.openSettings()} />
            </Stack>
          ) : null}
          <Button label={t('settings.test')} icon="notifications-outline" variant="secondary" size="md" onPress={async () => setPermission(await testReminder(t))} />
        </Card>
        {enabled ? (
          <Card>
            {(settings ?? []).map((s, i) => (
              <Stack key={s.category} gap={2}>
                {i > 0 ? <Divider /> : null}
                <ToggleRow label={t(`notificationCategories.${s.category}`)} value={s.enabled} onChange={(v) => void update(s.category, { enabled: v })} />
                {s.enabled ? (
                  <Row gap={2} wrap accessibilityLabel={t('settings.notificationTime')}>
                    {HOURS.map((h) => (
                      <Button key={h} label={formatTime(h, 0)} size="md" variant={s.hour === h ? 'primary' : 'secondary'} onPress={() => void update(s.category, { hour: h })} />
                    ))}
                  </Row>
                ) : null}
              </Stack>
            ))}
          </Card>
        ) : null}
        <InfoNote icon="analytics-outline" text={t('common.estimatedLong')} />
        {!premium ? <InfoNote icon="diamond-outline" text={t('settings.advancedReminders')} /> : null}
      </Screen>
    </>
  );
}
