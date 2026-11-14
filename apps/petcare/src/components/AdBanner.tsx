import { Text, useTheme } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Anchored adaptive banner, labelled and separated from content so it can't be
 * confused with app controls. Only rendered at the bottom of browse screens
 * (Home, My Pets, Care). Never on documents, health or treatment screens.
 * Requests are non-personalised and carry no keywords or content URL.
 */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd
        unitId={adUnits.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
