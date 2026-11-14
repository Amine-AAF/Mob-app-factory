import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { screenAllowsAds, type AdScreen } from '@/config/adPlacements';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/**
 * Anchored adaptive banner, labelled and separated from content so it can't be mistaken
 * for an app control. Only allowed on browse screens (see config/adPlacements.ts);
 * never during outfit creation or planning. Premium removes it.
 */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount, screenAllowsAds: screenAllowsAds(screen) })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('common.ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
