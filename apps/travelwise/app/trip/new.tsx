import { Screen } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { TripForm } from '@/components/TripForm';
import { createTrip } from '@/features/trips/actions';
import { usePreferences } from '@/store/preferences';

export default function NewTripScreen() {
  const { t } = useTranslation();
  const currency = usePreferences((s) => s.defaultCurrency);
  const createdId = useRef<string | null>(null);
  return (
    <Screen edges={[]} testID="new-trip-screen">
      <Stack.Screen options={{ title: t('tripForm.createTitle') }} />
      <TripForm
        defaultCurrency={currency}
        submitLabel={t('common.create')}
        onSubmit={async (input) => {
          createdId.current = (await createTrip(input)).id;
        }}
        onDone={() => {
          if (createdId.current) router.replace({ pathname: '/trip/[id]', params: { id: createdId.current } });
          else router.back();
        }}
      />
    </Screen>
  );
}
