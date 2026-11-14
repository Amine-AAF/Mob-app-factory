import { Button, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { Panel, ToggleRow } from '@/components/ui';
import { links } from '@/config/brand';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

const FACTS = ['local', 'noAccount', 'noUpload', 'noContentToAds', 'permissions', 'deletion'] as const;

export default function Privacy() {
  const { t } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const [, force] = useState(0);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.privacy') }} />
      <Stack gap={3}>
        {FACTS.map((f) => (
          <Row key={f} gap={3} style={{ alignItems: 'flex-start' }}>
            <Icon name="shield-checkmark" size={20} color={theme.colors.success} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t(`privacy.facts.${f}`)}
            </Text>
          </Row>
        ))}
      </Stack>
      <Panel title={t('privacy.choices')} icon="options-outline">
        <ToggleRow
          title={t('privacy.analytics')}
          subtitle={t('privacy.analyticsHelp')}
          value={prefs.analyticsConsent}
          onChange={(v) => {
            prefs.set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
        {adsState().privacyOptionsRequired ? <Button size="md" variant="secondary" label={t('privacy.adChoices')} onPress={showPrivacyOptions} /> : null}
      </Panel>
      {links.privacyPolicy ? <Button variant="ghost" label={t('privacy.policy')} onPress={() => Linking.openURL(links.privacyPolicy as string)} /> : null}
      {links.terms ? <Button variant="ghost" label={t('privacy.terms')} onPress={() => Linking.openURL(links.terms as string)} /> : null}
    </Screen>
  );
}
