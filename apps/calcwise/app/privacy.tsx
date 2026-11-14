import { Card, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const ITEMS: { key: string; icon: IconName }[] = [
  { key: 'local', icon: 'phone-portrait-outline' },
  { key: 'noAccount', icon: 'person-remove-outline' },
  { key: 'analytics', icon: 'stats-chart-outline' },
  { key: 'ads', icon: 'megaphone-outline' },
  { key: 'purchases', icon: 'card-outline' },
  { key: 'delete', icon: 'trash-outline' },
];

/** Plain-language summary of what CalcWise does with data (matches the store Data Safety form). */
export default function PrivacySummary() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.privacySummary') }} />
      <Screen edges={[]} testID="privacy-screen">
        <Text tone="muted">{t('privacy.intro')}</Text>
        {ITEMS.map((item) => (
          <Card key={item.key}>
            <Row gap={3} style={{ alignItems: 'flex-start' }}>
              <Icon name={item.icon} size={22} color={theme.colors.primary} />
              <Stack gap={1} style={{ flex: 1 }}>
                <Text variant="subheading">{t(`privacy.items.${item.key}.title`)}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t(`privacy.items.${item.key}.body`)}
                </Text>
              </Stack>
            </Row>
          </Card>
        ))}
      </Screen>
    </>
  );
}
