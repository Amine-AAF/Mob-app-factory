import { Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { AdScreen } from '@/features/ads/policy';
import { useAdsStateVersion } from '@/hooks/useAds';
import { adsSdk, adUnits, bannerAllowed } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Anchored adaptive banner, labelled and separated from content so it cannot be
 * mistaken for an app control. Renders nothing unless the screen is allow-listed in
 * `features/ads/policy.ts`, consent allows ads, the user is not Premium and the
 * first sessions (grace period) are over.
 */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [failed, setFailed] = useState(false);
  useAdsStateVersion();

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount, screen })) return null;
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
