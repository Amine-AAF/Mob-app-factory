import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { Alert } from 'react-native';

import { canAdd, FREE_LIMITS } from '@/config/limits';

/**
 * Returns true when one more outfit can be created. Otherwise explains the free limit and
 * offers the paywall. Existing outfits are never hidden or removed.
 */
export function ensureCanAddOutfit(t: TFunction, count: number, isPremium: boolean): boolean {
  if (canAdd('outfits', count, isPremium)) return true;
  Alert.alert(t('common.premium.limitTitle'), t('common.premium.outfitsLimit', { count: FREE_LIMITS.outfits }), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.premium.seePlans'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'outfits_limit' } }) },
  ]);
  return false;
}

export function openPaywall(source: string): void {
  router.push({ pathname: '/paywall', params: { source } });
}
