import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { canAdd, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { recordError } from '@/services/analytics';
import { useIsPremium } from '@/store/session';

/** Shows the free-limit dialog with a link to the paywall. */
export function showItemLimit(t: TFunction): void {
  Alert.alert(t('common.premium.limitTitle'), t('common.premium.itemsLimit', { count: FREE_LIMITS.items }), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.premium.seePlans'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'items_limit' } }) },
  ]);
}

/** Opens the item editor, or the free-limit dialog when the free wardrobe is full. */
export function useAddItem(): (categoryKey?: string) => Promise<void> {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  return useCallback(
    async (categoryKey?: string) => {
      try {
        const count = await repos().wardrobe.count();
        if (!canAdd('items', count, isPremium)) {
          showItemLimit(t);
          return;
        }
        router.push({ pathname: '/item/edit', params: categoryKey ? { categoryKey } : {} });
      } catch (e) {
        recordError(e, 'add_item');
        Alert.alert(t('common.error'));
      }
    },
    [isPremium, t],
  );
}
