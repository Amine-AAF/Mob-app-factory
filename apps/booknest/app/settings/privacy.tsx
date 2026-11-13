import { Button, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Page, Paper, Section } from '@/components/ui';
import { links } from '@/config/brand';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

export default function Privacy() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);

  return (
    <Page edges={['bottom']}>
      <Paper tone="primary">
        <Text style={{ fontWeight: '700' }}>{t('privacy.headline')}</Text>
        <Text variant="bodySmall">{t('privacy.summary')}</Text>
      </Paper>
      {(['local', 'notes', 'ads', 'analytics', 'permissions', 'covers', 'delete'] as const).map((k) => (
        <View key={k} style={{ gap: 2 }}>
          <Text style={{ fontWeight: '700' }}>{t(`privacy.points.${k}.title`)}</Text>
          <Text variant="bodySmall" tone="muted">
            {t(`privacy.points.${k}.body`)}
          </Text>
        </View>
      ))}
      <Section title={t('privacy.choices')}>
        <Paper style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{t('privacy.analytics')}</Text>
              <Text variant="caption" tone="muted">
                {t('privacy.analyticsHint')}
              </Text>
            </View>
            <Switch
              value={consent}
              onValueChange={(v) => {
                set({ analyticsConsent: v });
                setAnalyticsConsent(v);
              }}
              trackColor={{ true: theme.colors.primary }}
              accessibilityLabel={t('privacy.analytics')}
            />
          </View>
          {ads.privacyOptionsRequired ? <Button label={t('privacy.adChoices')} variant="secondary" onPress={() => void showPrivacyOptions()} /> : null}
        </Paper>
      </Section>
      {links.privacyPolicy ? <Button label={t('privacy.policy')} variant="ghost" onPress={() => void Linking.openURL(links.privacyPolicy!)} /> : null}
      {links.terms ? <Button label={t('privacy.terms')} variant="ghost" onPress={() => void Linking.openURL(links.terms!)} /> : null}
    </Page>
  );
}
