import { Text, useTheme } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { adsSdk, adUnits, bannerAllowed, onAdsStateChange, type AdScreen } from '@/services/ads';
import { useIsPremium } from '@/store/session';

/**
 * Discreet, labelled banner. Allowed only on screens listed in AD_SCREENS (no personal amounts).
 * The ad request carries no keywords or content URL: nothing about the user's finances.
 */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, screen })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
