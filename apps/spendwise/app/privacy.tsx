import { Button, Card, Screen, Text } from '@factory/design-system';
import * as Linking from 'expo-linking';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SwitchRow } from '@/components/inputs';
import { links } from '@/config/brand';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

/** Honest summary of what SpendWise does with data (matches store/privacy-policy.md). */
export default function PrivacyScreen() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('privacyScreen.title') }} />
      {(['local', 'noBank', 'noUpload', 'encryption', 'ads', 'analytics', 'delete'] as const).map((k) => (
        <Card key={k}>
          <Text variant="subheading">{t(`privacyScreen.${k}Title`)}</Text>
          <Text variant="bodySmall" tone="muted">
            {t(`privacyScreen.${k}Body`)}
          </Text>
        </Card>
      ))}
      <Card tone="alt">
        <SwitchRow
          label={t('privacyScreen.analyticsToggle')}
          description={t('privacyScreen.analyticsToggleDesc')}
          value={consent}
          onChange={(v) => {
            set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
          testID="analytics-consent"
        />
      </Card>
      {ads.privacyOptionsRequired ? <Button label={t('privacyScreen.adChoices')} variant="secondary" onPress={showPrivacyOptions} /> : null}
      {links.privacyPolicy ? <Button label={t('privacyScreen.policy')} variant="ghost" icon="open-outline" onPress={() => Linking.openURL(links.privacyPolicy!)} /> : null}
    </Screen>
  );
}
