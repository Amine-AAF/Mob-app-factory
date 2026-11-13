import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { Linking, Switch, View } from 'react-native';

import { Note, Stepper } from '@/components/ui';
import { repos } from '@/database';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { requestPermission, type NotificationSettings, type WeeklyReminder } from '@/services/notifications';
import { loadNotificationSettings, syncNotifications } from '@/services/planning';

/** expo weekday: 1 = Sunday … 7 = Saturday. */
const WEEKDAYS = [2, 3, 4, 5, 6, 7, 1];

function weekdayLabel(w: number): string {
  // 2026-11-15 is a Sunday.
  return fmt.weekday(new Date(2026, 10, 14 + w));
}

export default function NotificationSettingsScreen() {
  const { t, lng } = useLang();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [denied, setDenied] = useState(false);
  const [scheduled, setScheduled] = useState<number | null>(null);

  useEffect(() => {
    void loadNotificationSettings().then(setSettings);
  }, []);

  if (!settings) return <Screen edges={[]}>{null}</Screen>;

  const save = async (next: NotificationSettings) => {
    const enabling =
      (next.mealPrep.enabled && !settings.mealPrep.enabled) ||
      (next.weeklyPlanning.enabled && !settings.weeklyPlanning.enabled) ||
      (next.shopping.enabled && !settings.shopping.enabled) ||
      (next.expiry.enabled && !settings.expiry.enabled);
    if (enabling) {
      const permission = await requestPermission(t);
      if (permission !== 'granted') {
        setDenied(true);
        return;
      }
    }
    setDenied(false);
    setSettings(next);
    await repos().preferences.set('notifications', next);
    setScheduled(await syncNotifications(t, lng));
  };

  const weekly = (key: 'weeklyPlanning' | 'shopping', title: string, hint: string) => {
    const r: WeeklyReminder = settings[key];
    return (
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{title}</Text>
            <Text variant="caption" tone="muted">
              {hint}
            </Text>
          </View>
          <Switch value={r.enabled} onValueChange={(v) => void save({ ...settings, [key]: { ...r, enabled: v } })} accessibilityLabel={title} testID={`switch-${key}`} />
        </Row>
        {r.enabled ? (
          <Stack gap={2}>
            <Row gap={1} wrap>
              {WEEKDAYS.map((w) => (
                <Chip key={w} label={weekdayLabel(w)} selected={r.weekday === w} onPress={() => void save({ ...settings, [key]: { ...r, weekday: w } })} />
              ))}
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text>{t('notifications.time')}</Text>
              <Stepper value={r.hour} onChange={(h) => void save({ ...settings, [key]: { ...r, hour: h } })} min={6} max={22} label={t('notifications.time')} format={(h) => fmt.time(new Date(2026, 0, 1, h, r.minute))} />
            </Row>
          </Stack>
        ) : null}
      </Card>
    );
  };

  return (
    <Screen edges={[]}>
      <Text tone="muted">{t('notifications.intro')}</Text>
      {denied ? (
        <Card tone="alt">
          <Text tone="warning">{t('notifications.denied')}</Text>
          <Button label={t('notifications.openSettings')} size="md" variant="secondary" onPress={() => void Linking.openSettings()} />
        </Card>
      ) : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{t('notifications.mealPrep')}</Text>
            <Text variant="caption" tone="muted">
              {t('notifications.mealPrepHint')}
            </Text>
          </View>
          <Switch value={settings.mealPrep.enabled} onValueChange={(v) => void save({ ...settings, mealPrep: { ...settings.mealPrep, enabled: v } })} accessibilityLabel={t('notifications.mealPrep')} testID="switch-mealPrep" />
        </Row>
        {settings.mealPrep.enabled ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <Text>{t('notifications.minutesBefore')}</Text>
            <Stepper value={settings.mealPrep.minutesBefore} onChange={(m) => void save({ ...settings, mealPrep: { ...settings.mealPrep, minutesBefore: m } })} min={15} max={180} step={15} label={t('notifications.minutesBefore')} format={(m) => `${m} min`} />
          </Row>
        ) : null}
      </Card>

      {weekly('weeklyPlanning', t('notifications.planning'), t('notifications.planningHint'))}
      {weekly('shopping', t('notifications.shopping'), t('notifications.shoppingHint'))}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{t('notifications.expiry')}</Text>
            <Text variant="caption" tone="muted">
              {t('notifications.expiryHint')}
            </Text>
          </View>
          <Switch value={settings.expiry.enabled} onValueChange={(v) => void save({ ...settings, expiry: { ...settings.expiry, enabled: v } })} accessibilityLabel={t('notifications.expiry')} testID="switch-expiry" />
        </Row>
        {settings.expiry.enabled ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <Text>{t('notifications.daysBefore')}</Text>
            <Stepper value={settings.expiry.daysBefore} onChange={(d) => void save({ ...settings, expiry: { ...settings.expiry, daysBefore: d } })} min={0} max={7} label={t('notifications.daysBefore')} />
          </Row>
        ) : null}
      </Card>
      {scheduled !== null ? (
        <Text variant="caption" tone="muted">
          {t('notifications.scheduled', { count: scheduled })}
        </Text>
      ) : null}
      <Note>{t('notifications.localOnly')}</Note>
    </Screen>
  );
}
