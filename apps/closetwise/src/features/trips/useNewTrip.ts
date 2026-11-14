import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { canAdd, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

/** Free users plan one upcoming/ongoing trip at a time; Premium unlocks more. */
export function useNewTrip(): () => Promise<void> {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  return async () => {
    try {
      const count = await repos().trips.activeCount(clock.today());
      if (!canAdd('activeTrips', count, isPremium)) {
        Alert.alert(t('common.premium.limitTitle'), t('common.premium.tripsLimit', { count: FREE_LIMITS.activeTrips }), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.premium.seePlans'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'trips' } }) },
        ]);
        return;
      }
      router.push('/trips/edit');
    } catch (e) {
      recordError(e, 'new_trip');
      Alert.alert(t('common.error'));
    }
  };
}
