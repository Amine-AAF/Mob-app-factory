import { Button, Card, Screen, Stack } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InfoNote, ToggleRow } from '@/components/ui';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

export default function PrivacySettings() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);

  return (
    <>
      <RouterStack.Screen options={{ title: t('privacy.title') }} />
      <Screen edges={[]}>
        <Card>
          <Stack gap={3}>
            <InfoNote icon="phone-portrait-outline" text={t('privacy.local')} />
            <InfoNote icon="cloud-offline-outline" text={t('privacy.noUpload')} />
            <InfoNote icon="key-outline" text={t('privacy.permissions')} />
            <InfoNote icon="megaphone-outline" text={t('privacy.ads')} />
            <InfoNote icon="download-outline" text={t('privacy.export')} />
          </Stack>
        </Card>
        <Card>
          <ToggleRow
            label={t('privacy.analytics')}
            hint={t('privacy.analyticsHint')}
            value={consent}
            onChange={(v) => {
              usePreferences.getState().set({ analyticsConsent: v });
              setAnalyticsConsent(v);
            }}
          />
          {ads.privacyOptionsRequired ? <Button label={t('privacy.adsChoices')} icon="options-outline" variant="secondary" size="md" onPress={() => void showPrivacyOptions()} /> : null}
        </Card>
      </Screen>
    </>
  );
}
