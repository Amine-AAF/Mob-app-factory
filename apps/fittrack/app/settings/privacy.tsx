import { Button, Card, Screen, Text } from '@factory/design-system';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { ToggleRow } from '@/components/ui';
import { links } from '@/config/brand';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

export default function Privacy() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.privacy') }} />
      <Card>
        {(['local', 'noAccount', 'noHealthShare', 'photos', 'ads'] as const).map((k) => (
          <Text key={k} variant="bodySmall">{`• ${t(`privacy.points.${k}`)}`}</Text>
        ))}
      </Card>
      <Card>
        <ToggleRow
          title={t('privacy.analytics')}
          subtitle={t('privacy.analyticsSub')}
          value={consent}
          onChange={(v) => {
            usePreferences.getState().set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
          testID="analytics-consent"
        />
      </Card>
      {ads.privacyOptionsRequired ? <Button label={t('privacy.adChoices')} variant="secondary" onPress={() => void showPrivacyOptions()} /> : null}
      {links.privacyPolicy ? <Button label={t('privacy.policy')} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(links.privacyPolicy!)} /> : null}
      {links.terms ? <Button label={t('privacy.terms')} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(links.terms!)} /> : null}
    </Screen>
  );
}
