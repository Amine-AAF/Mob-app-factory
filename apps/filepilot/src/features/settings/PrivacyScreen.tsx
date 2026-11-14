import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { links } from '@/config/brand';

const SECTIONS = ['processing', 'lifecycle', 'storage', 'sharing', 'history', 'analytics', 'ads', 'purchases', 'permissions', 'rights'] as const;

/** In-app privacy summary and file-processing lifecycle. The full policy must also be hosted publicly. */
export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <Screen edges={[]} testID="privacy">
      <Text tone="muted">{t('privacy.intro')}</Text>
      {SECTIONS.map((s) => (
        <Card key={s}>
          <Stack gap={1}>
            <Text variant="subheading">{t(`privacy.${s}Title`)}</Text>
            <Text variant="bodySmall">{t(`privacy.${s}Body`)}</Text>
          </Stack>
        </Card>
      ))}
      {links.privacyPolicy ? <Button label={t('privacy.fullPolicy')} variant="secondary" icon="open-outline" onPress={() => void Linking.openURL(links.privacyPolicy as string)} /> : null}
    </Screen>
  );
}
