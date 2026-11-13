import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { ToggleRow } from '@/components/forms';
import { ScreenTitle } from '@/components/ui';
import { links } from '@/config/brand';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

const SECTIONS = ['storage', 'account', 'guests', 'contacts', 'sharing', 'notifications', 'ads', 'analytics', 'purchases', 'rights'] as const;

/** In-app privacy summary. The full policy must also be hosted publicly (Play Console requirement). */
export default function Privacy() {
  const { t } = useTranslation();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);
  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('privacy.title')} />
      <Text tone="muted">{t('privacy.intro')}</Text>
      {SECTIONS.map((s) => (
        <Card key={s}>
          <Stack gap={1}>
            <Text variant="subheading">{t(`privacy.sections.${s}.title`)}</Text>
            <Text variant="bodySmall">{t(`privacy.sections.${s}.body`)}</Text>
          </Stack>
        </Card>
      ))}
      <Card>
        <ToggleRow
          label={t('privacy.analyticsToggle')}
          hint={t('privacy.analyticsHint')}
          value={consent}
          onChange={(v) => {
            set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
      </Card>
      {adsState().privacyOptionsRequired ? <Button variant="secondary" icon="options-outline" label={t('privacy.adChoices')} onPress={() => void showPrivacyOptions()} /> : null}
      {links.privacyPolicy ? <Button label={t('privacy.fullPolicy')} variant="secondary" icon="open-outline" onPress={() => void Linking.openURL(links.privacyPolicy as string)} /> : null}
    </Screen>
  );
}
