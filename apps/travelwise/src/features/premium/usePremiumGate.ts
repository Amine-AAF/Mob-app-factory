import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useRewardedAd } from '@/hooks/useRewardedAd';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

import { activeTripCount, PremiumLimitError } from './guard';
import { canCreateActiveTrip, canEarnBonusSlot, FREE_LIMITS, type PremiumFeature } from './limits';

/** UI helpers around Premium: open the paywall, explain a limit, offer a rewarded slot. */
export function usePremiumGate() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const bonus = usePreferences((s) => s.bonusTripSlots);
  const setPrefs = usePreferences((s) => s.set);
  const rewarded = useRewardedAd(canEarnBonusSlot(isPremium, bonus));

  const openPaywall = useCallback((source: PremiumFeature | 'settings' | 'limit') => router.push({ pathname: '/paywall', params: { source } }), []);

  const explainLimit = useCallback(
    (limit: PremiumLimitError['limit']) => {
      const buttons: { text: string; style?: 'cancel'; onPress?: () => void }[] = [{ text: t('common.cancel'), style: 'cancel' }];
      if (limit === 'active_trips' && canEarnBonusSlot(isPremium, bonus) && rewarded.ready) {
        buttons.push({
          text: t('premium.watchAdForSlot'),
          onPress: () => {
            rewarded.show(() => setPrefs({ bonusTripSlots: usePreferences.getState().bonusTripSlots + 1 })).catch(() => undefined);
          },
        });
      }
      buttons.push({ text: t('premium.seePremium'), onPress: () => openPaywall('limit') });
      Alert.alert(
        t('premium.limitTitle'),
        limit === 'active_trips' ? t('premium.limitTrips', { count: FREE_LIMITS.activeTrips }) : t('premium.limitDocuments', { count: FREE_LIMITS.documents }),
        buttons,
      );
    },
    [t, isPremium, bonus, rewarded, setPrefs, openPaywall],
  );

  /** Checks the active-trip limit before opening the new-trip form. */
  const startNewTrip = useCallback(async () => {
    if (canCreateActiveTrip(isPremium, await activeTripCount(), bonus)) router.push('/trip/new');
    else explainLimit('active_trips');
  }, [isPremium, bonus, explainLimit]);

  return { isPremium, openPaywall, explainLimit, startNewTrip };
}
