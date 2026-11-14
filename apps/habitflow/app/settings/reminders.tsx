import { Button, Card, Screen, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReminderSettings } from '@/components/ReminderSettings';
import { testReminder } from '@/services/reminders';

/** General daily check-in reminders. Habit-specific reminders live on each habit. */
export default function RemindersSettings() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <>
      <RouterStack.Screen options={{ title: t('reminders.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('reminders.intro')}</Text>
        <ReminderSettings habitId={null} />
        <Card tone="alt">
          <Text variant="bodySmall" tone="muted">
            {t('reminders.perHabitHint')}
          </Text>
          <Button
            label={t('reminders.test')}
            icon="notifications-outline"
            variant="secondary"
            size="md"
            onPress={async () => setMessage((await testReminder(t)) === 'granted' ? t('reminders.testSent') : t('reminders.permissionDenied'))}
          />
          {message ? (
            <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
              {message}
            </Text>
          ) : null}
        </Card>
      </Screen>
    </>
  );
}
