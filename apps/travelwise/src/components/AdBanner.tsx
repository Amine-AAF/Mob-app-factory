import { Text, useTheme } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { BannerScreen } from '@/features/premium/limits';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { useIsPremium } from '@/store/session';

/**
 * Discreet anchored banner, labelled "Advertisement" and separated from content so it
 * can't be mistaken for an app control. Only rendered on the browse screens listed in
 * BANNER_SCREENS; never for Premium users.
 */
export function AdBanner({ screen }: { screen: BannerScreen }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (isPremium || !sdk || failed || !adUnits.banner || !bannerAllowed(screen)) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }} testID="ad-banner">
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
