import { Button, Card, Divider, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { Stepper, SwitchRow } from '@/components/forms';
import { isTypeEnabled } from '@/domain/notificationPlan';
import { TASK_TYPES, type TaskType } from '@/domain/types';
import { useData, useMutation } from '@/hooks/useData';
import { askPermission, getPermission, sendTest } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

/**
 * Reminder settings: global switch and time, per task type, and — when opened from a plant —
 * per plant and task type. Each reminder can be disabled individually.
 */
export default function NotificationSettings() {
  const { t } = useTranslation();
  const mutate = useMutation();
  const prefs = usePreferences();
  const { plantId } = useLocalSearchParams<{ plantId?: string }>();
  const [permission, setPermission] = useState<string>('undetermined');
  const { data } = useData(async (r) => ({ settings: await r.notifications.all(), plant: plantId ? await r.plants.get(plantId) : null }), [plantId]);
  const settings = data?.settings ?? [];

  useEffect(() => {
    void getPermission().then(setPermission);
  }, []);

  const setType = (type: TaskType, enabled: boolean) => void mutate((r) => r.notifications.set(plantId ?? null, type, enabled));
  const enabledFor = (type: TaskType) => (plantId ? isTypeEnabled(settings, plantId, type) : (settings.find((s) => s.plantId === null && s.taskType === type)?.enabled ?? true));
  const setGlobal = (patch: Partial<{ notificationsEnabled: boolean; reminderHour: number; reminderMinute: number }>) => {
    prefs.set(patch);
    void mutate(async () => undefined);
  };

  const request = async () => {
    const r = await askPermission(t);
    setPermission(r);
    if (r === 'denied') void Linking.openSettings();
    else void mutate(async () => undefined);
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: data?.plant ? t('notifSettings.forPlant', { plant: data.plant.nickname }) : t('settings.notifications') }} />
      {permission !== 'granted' ? (
        <Card tone="accent">
          <Text variant="subheading">{t('notifSettings.permissionTitle')}</Text>
          <Text variant="bodySmall">{t('notifSettings.permissionBody')}</Text>
          <Button size="md" label={permission === 'denied' ? t('notifSettings.openSettings') : t('notifSettings.allow')} onPress={() => void request()} />
        </Card>
      ) : null}

      {!plantId ? (
        <Card>
          <SwitchRow label={t('notifSettings.enabled')} subtitle={t('notifSettings.enabledHint')} value={prefs.notificationsEnabled} onChange={(v) => setGlobal({ notificationsEnabled: v })} testID="notif-global" />
          <Divider />
          <Stack gap={2} style={{ paddingTop: 8 }}>
            <Stepper label={t('notifSettings.hour')} value={prefs.reminderHour} onChange={(v) => setGlobal({ reminderHour: v })} min={0} max={23} suffix="h" />
            <Stepper label={t('notifSettings.minute')} value={prefs.reminderMinute} onChange={(v) => setGlobal({ reminderMinute: v })} min={0} max={59} suffix="min" />
          </Stack>
          <Text variant="caption" tone="muted">
            {t('notifSettings.antiSpam')}
          </Text>
        </Card>
      ) : (
        <Text variant="bodySmall" tone="muted">
          {t('notifSettings.plantHint')}
        </Text>
      )}

      <SectionHeader title={t('notifSettings.byType')} />
      <Card>
        {TASK_TYPES.map((type, i) => (
          <Stack key={type} gap={0}>
            {i > 0 ? <Divider /> : null}
            <SwitchRow label={t(`taskTypes.${type}`)} value={enabledFor(type)} onChange={(v) => setType(type, v)} testID={`notif-${type}`} />
          </Stack>
        ))}
      </Card>
      {!plantId && permission === 'granted' ? <Button variant="secondary" icon="notifications-outline" label={t('notifSettings.test')} onPress={() => void sendTest(t)} /> : null}
    </Screen>
  );
}
