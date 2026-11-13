import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { links } from '@/config/brand';

const SECTIONS = ['storage', 'account', 'analytics', 'ads', 'purchases', 'rights'] as const;

/** In-app privacy summary. The full policy must also be hosted publicly (Play Console requirement). */
export default function Privacy() {
  const { t } = useTranslation();
  return (
    <>
      <RouterStack.Screen options={{ title: t('privacy.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('privacy.intro')}</Text>
        {SECTIONS.map((s) => (
          <Card key={s}>
            <Stack gap={1}>
              <Text variant="subheading">{t(`privacy.${s}Title`)}</Text>
              <Text variant="bodySmall">{t(`privacy.${s}Body`)}</Text>
            </Stack>
          </Card>
        ))}
        {links.privacyPolicy ? <Button label={t('privacy.fullPolicy')} variant="secondary" icon="open-outline" onPress={() => Linking.openURL(links.privacyPolicy as string)} /> : null}
      </Screen>
    </>
  );
}
