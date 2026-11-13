import { Button, Card, Row, Screen, Stack, Text } from '@factory/design-system';
import { Linking, Switch, View } from 'react-native';

import { Note } from '@/components/ui';
import { links } from '@/config/brand';
import { useLang } from '@/hooks/useLang';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

/** What MealWise stores, what it never sends, and the user's choices. */
export default function Privacy() {
  const { t } = useLang();
  const consent = usePreferences((s) => s.analyticsConsent);
  const set = usePreferences((s) => s.set);

  return (
    <Screen edges={[]}>
      <Card>
        <Text variant="subheading">{t('privacy.localTitle')}</Text>
        <Stack gap={2}>
          {(['privacy.point1', 'privacy.point2', 'privacy.point3', 'privacy.point4', 'privacy.point5'] as const).map((k) => (
            <Text key={k} variant="bodySmall">
              • {t(k)}
            </Text>
          ))}
        </Stack>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{t('privacy.analytics')}</Text>
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
            accessibilityLabel={t('privacy.analytics')}
          />
        </Row>
      </Card>
      <Card>
        <Text variant="subheading">{t('privacy.ads')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('privacy.adsHint')}
        </Text>
        <Button label={t('privacy.adChoices')} size="md" variant="secondary" onPress={() => void showPrivacyOptions()} disabled={!adsState().privacyOptionsRequired && !adsState().initialized} />
      </Card>
      <Card>
        <Text variant="subheading">{t('privacy.permissions')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('privacy.permissionsHint')}
        </Text>
      </Card>
      {links.privacy ? <Button label={t('privacy.policy')} variant="ghost" onPress={() => void Linking.openURL(links.privacy)} /> : null}
      {links.terms ? <Button label={t('privacy.terms')} variant="ghost" onPress={() => void Linking.openURL(links.terms)} /> : null}
      <Note>{t('privacy.notMedical')}</Note>
    </Screen>
  );
}
