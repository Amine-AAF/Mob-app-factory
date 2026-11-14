import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { SwitchRow } from '@/components/forms';
import { links } from '@/config/brand';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

export default function Privacy() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.privacy') }} />
      <Card tone="primary">
        <Stack gap={2}>
          {(['local', 'photos', 'noAccount', 'permissions', 'export'] as const).map((k) => (
            <Text key={k} variant="bodySmall">{`• ${t(`privacy.points.${k}`)}`}</Text>
          ))}
        </Stack>
      </Card>
      <Card>
        <SwitchRow
          label={t('privacy.analytics')}
          subtitle={t('privacy.analyticsHint')}
          value={consent}
          onChange={(v) => {
            set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
      </Card>
      {ads.privacyOptionsRequired ? <Button variant="secondary" label={t('privacy.adsChoices')} onPress={() => void showPrivacyOptions()} /> : null}
      <Text variant="caption" tone="muted">
        {t('privacy.ads')}
      </Text>
      {links.privacyPolicy ? <Button variant="ghost" label={t('privacy.policy')} onPress={() => void Linking.openURL(links.privacyPolicy as string)} /> : null}
    </Screen>
  );
}
