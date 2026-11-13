import { Button, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TripForm } from '@/components/TripForm';
import { createTrip } from '@/features/trips/actions';
import { track } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

/** Step 4 (optional) + 5: create a first trip or go straight to the dashboard. */
export default function OnboardingFirstTrip() {
  const { t, i18n } = useTranslation();
  const currency = usePreferences((s) => s.defaultCurrency);
  const setPrefs = usePreferences((s) => s.set);
  const [creating, setCreating] = useState(false);
  const createdId = useRef<string | null>(null);

  const finish = () => {
    setPrefs({ onboardingCompleted: true });
    track('onboarding_completed', { ui_language: i18n.language, created_trip: !!createdId.current });
    router.replace('/(tabs)');
    if (createdId.current) router.push({ pathname: '/trip/[id]', params: { id: createdId.current } });
  };

  if (creating) {
    return (
      <Screen testID="onboarding-trip-form">
        <Text variant="title" accessibilityRole="header">
          {t('tripForm.createTitle')}
        </Text>
        <TripForm
          defaultCurrency={currency}
          submitLabel={t('common.create')}
          onSubmit={async (input) => {
            createdId.current = (await createTrip(input, 'onboarding')).id;
          }}
          onDone={finish}
        />
        <Button label={t('common.skip')} variant="ghost" onPress={finish} />
      </Screen>
    );
  }

  return (
    <Screen
      testID="onboarding-first-trip"
      footer={
        <Stack gap={2}>
          <Button label={t('onboarding.createFirstTrip')} size="lg" icon="add" onPress={() => setCreating(true)} testID="onboarding-create-trip" />
          <Button label={t('onboarding.later')} variant="ghost" onPress={finish} testID="onboarding-later" />
        </Stack>
      }
    >
      <Stack gap={3}>
        <Text variant="title" accessibilityRole="header">
          {t('onboarding.firstTripTitle')}
        </Text>
        <Text tone="muted">{t('onboarding.firstTripBody')}</Text>
      </Stack>
    </Screen>
  );
}
