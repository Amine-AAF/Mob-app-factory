import { Button, Card, Chip, Row, Screen, Stack as UIStack, Text } from '@factory/design-system';
import { addDays, fromDayKey, startOfWeek } from '@factory/app-core';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { InfoNote, Stepper, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { useData } from '@/hooks';
import { fmt } from '@/i18n';
import { ensurePermission, syncNotifications, testReminder } from '@/services/reminders';
import { useSession } from '@/store/session';
import type { NotificationSetting, Weekday } from '@/types';

/** Every notification is opt-in, configurable and contains no personal or body data. */
export default function NotificationsSettings() {
  const { t, i18n } = useTranslation();
  const today = useSession((s) => s.today);
  const { data } = useData((r) => r.settings.notifications());
  const monday = startOfWeek(today);

  const save = async (s: NotificationSetting) => {
    if (s.enabled && (await ensurePermission(t)) !== 'granted') {
      Alert.alert(t('notifications.deniedTitle'), t('notifications.deniedBody'));
      return;
    }
    await repos().settings.setNotification(s);
    useSession.getState().bump();
    await syncNotifications(repos(), i18n.t);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.notifications') }} />
      <InfoNote text={t('notifications.privacy')} icon="lock-closed-outline" />
      {(data ?? []).map((s) => (
        <Card key={s.kind}>
          <ToggleRow title={t(`notifications.kinds.${s.kind}.title`)} subtitle={t(`notifications.kinds.${s.kind}.desc`)} value={s.enabled} onChange={(v) => void save({ ...s, enabled: v })} testID={`notif-${s.kind}`} />
          {s.enabled ? (
            <UIStack gap={3}>
              <Row gap={3}>
                <Stepper label={t('notifications.hour')} value={s.hour} min={0} max={23} onChange={(v) => void save({ ...s, hour: v ?? 0 })} />
                <Stepper label={t('notifications.minute')} value={s.minute} min={0} max={55} step={5} onChange={(v) => void save({ ...s, minute: v ?? 0 })} />
              </Row>
              {s.kind === 'routine' || s.kind === 'weekly_goal' || s.kind === 'progress_summary' ? (
                <Row wrap gap={2}>
                  {Array.from({ length: 7 }, (_, w) => w as Weekday).map((w) => {
                    const on = s.weekdays.includes(w);
                    const single = s.kind !== 'routine';
                    return (
                      <Chip
                        key={w}
                        label={fmt.weekdayShort(fromDayKey(addDays(monday, w)))}
                        selected={on}
                        onPress={() => void save({ ...s, weekdays: single ? [w] : on ? s.weekdays.filter((x) => x !== w) : [...s.weekdays, w].sort() })}
                      />
                    );
                  })}
                </Row>
              ) : null}
              {s.kind === 'workout_reminder' ? <Text variant="caption" tone="subtle">{t('notifications.workoutHint')}</Text> : null}
            </UIStack>
          ) : null}
        </Card>
      ))}
      <Button label={t('notifications.test')} variant="secondary" icon="notifications" onPress={() => void testReminder(t)} />
    </Screen>
  );
}
