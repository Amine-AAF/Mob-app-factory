import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { SwitchRow } from '@/components/forms';
import { ScreenHeader } from '@/components/ui';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

const POINTS = ['local', 'noUpload', 'noAccount', 'ads', 'permissions', 'delete'] as const;

export default function Privacy() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL;

  return (
    <Screen>
      <ScreenHeader title={t('settings.privacy')} back />
      <Card>
        <Stack gap={3}>
          {POINTS.map((p) => (
            <Stack key={p} gap={1}>
              <Text variant="subheading">{t(`privacy.${p}.title`)}</Text>
              <Text variant="bodySmall" tone="muted">
                {t(`privacy.${p}.body`)}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Card>
      <Card>
        <SwitchRow
          label={t('privacy.analytics')}
          subtitle={t('privacy.analyticsHint')}
          value={consent}
          onValueChange={(v) => {
            set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
      </Card>
      {ads.privacyOptionsRequired ? <Button label={t('privacy.adChoices')} variant="secondary" icon="options-outline" onPress={() => void showPrivacyOptions()} /> : null}
      {privacyUrl ? <Button label={t('privacy.policy')} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(privacyUrl)} /> : null}
    </Screen>
  );
}
