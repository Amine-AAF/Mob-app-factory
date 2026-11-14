import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { canAdd, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { recordError } from '@/services/analytics';
import { useIsPremium } from '@/store/session';

type Resource = 'items' | 'outfits';

/**
 * Opens the item editor / outfit builder, or explains the free limit with a link to the
 * paywall. Existing data is never touched when over a limit: only adding is blocked.
 */
export function useLimitedAdd(): (resource: Resource) => Promise<void> {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  return useCallback(
    async (resource: Resource) => {
      try {
        const count = resource === 'items' ? await repos().wardrobe.count() : await repos().outfits.count();
        if (!canAdd(resource, count, isPremium)) {
          Alert.alert(t('common.premium.limitTitle'), t(resource === 'items' ? 'common.premium.itemsLimit' : 'common.premium.outfitsLimit', { count: FREE_LIMITS[resource] }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.premium.seePlans'), onPress: () => router.push({ pathname: '/paywall', params: { source: resource === 'items' ? 'items_limit' : 'outfits_limit' } }) },
          ]);
          return;
        }
        router.push(resource === 'items' ? '/item/edit' : '/outfit/builder');
      } catch (e) {
        recordError(e, 'home_quick_add');
        Alert.alert(t('common.error'));
      }
    },
    [isPremium, t],
  );
}
