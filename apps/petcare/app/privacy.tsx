import { Button, Card, Screen, Text } from '@factory/design-system';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

const SECTIONS = ['storage', 'files', 'ads', 'analytics', 'notifications', 'rights', 'medical'] as const;

/** Plain-language privacy summary. The full policy URL comes from EXPO_PUBLIC_PRIVACY_URL. */
export default function Privacy() {
  const { t } = useTranslation();
  const url = process.env.EXPO_PUBLIC_PRIVACY_URL;
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.privacy') }} />
      {SECTIONS.map((s) => (
        <Card key={s}>
          <Text variant="subheading">{t(`privacy.${s}.title`)}</Text>
          <Text variant="bodySmall" tone="muted">
            {t(`privacy.${s}.body`)}
          </Text>
        </Card>
      ))}
      {url ? <Button label={t('privacy.fullPolicy')} variant="secondary" icon="open-outline" onPress={() => Linking.openURL(url)} /> : null}
    </Screen>
  );
}
