import { EmptyState, Screen } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TripForm } from '@/components/TripForm';
import { updateTrip } from '@/features/trips/actions';
import { useTrip } from '@/features/trips/useTrips';
import { usePreferences } from '@/store/preferences';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const currency = usePreferences((s) => s.defaultCurrency);
  const { data } = useTrip(id);
  return (
    <Screen edges={[]} testID="edit-trip-screen">
      <Stack.Screen options={{ title: t('tripForm.editTitle') }} />
      {data === null ? <EmptyState icon="alert-circle-outline" title={t('tripDetail.notFound')} /> : null}
      {data ? <TripForm initial={data.trip} defaultCurrency={currency} submitLabel={t('common.save')} onSubmit={(input) => updateTrip(id, input)} onDone={() => router.back()} /> : null}
    </Screen>
  );
}
