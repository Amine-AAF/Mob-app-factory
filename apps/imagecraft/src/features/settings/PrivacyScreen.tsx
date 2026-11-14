import { Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

const SECTIONS = ['local', 'noAccount', 'permissions', 'storage', 'ads', 'analytics', 'purchases', 'deletion'] as const;

/** In-app privacy summary. Matches store/privacy-policy.md and the Data Safety form. */
export default function PrivacyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Screen edges={[]} testID="privacy-screen">
      <Card tone="primary">
        <Row gap={2}>
          <Icon name="shield-checkmark" size={22} color={theme.colors.primary} />
          <Text variant="heading" style={{ flex: 1 }}>
            {t('privacy.badge')}
          </Text>
        </Row>
      </Card>
      {SECTIONS.map((s) => (
        <Stack key={s} gap={1}>
          <Text variant="subheading">{t(`privacy.sections.${s}.title`)}</Text>
          <Text variant="bodySmall" tone="muted">
            {t(`privacy.sections.${s}.body`)}
          </Text>
        </Stack>
      ))}
    </Screen>
  );
}
