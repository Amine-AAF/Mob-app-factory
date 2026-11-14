import { Card, Chip, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEALTH_ICON } from '@/components/icons';
import { HEALTH_GUIDE } from '@/content/healthGuide';
import { HEALTH_CATEGORIES, type HealthCategory } from '@/domain/types';

/** Informative knowledge base. Never a diagnosis. */
export default function HealthGuide() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: HealthCategory }>();
  const [cat, setCat] = useState<HealthCategory>(params.category && (HEALTH_CATEGORIES as readonly string[]).includes(params.category) ? params.category : 'yellow_leaves');
  const entry = HEALTH_GUIDE[cat];

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('healthGuide.title') }} />
      <Card tone="accent">
        <Row gap={2}>
          <Icon name="information-circle-outline" size={20} color={theme.colors.accent} />
          <Text variant="subheading">{t('healthGuide.disclaimerTitle')}</Text>
        </Row>
        <Text variant="bodySmall">{t('healthGuide.disclaimer')}</Text>
      </Card>
      <Row wrap gap={2}>
        {HEALTH_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`healthCategories.${c}`)} icon={HEALTH_ICON[c]} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </Row>
      <SectionHeader title={t('healthGuide.possibleCauses')} />
      <Stack gap={2}>
        {entry.causes.map((c) => (
          <Card key={c}>
            <Text variant="subheading">{t(`healthGuide.causes.${c}.title`)}</Text>
            <Text variant="bodySmall" tone="muted">
              {t(`healthGuide.causes.${c}.body`)}
            </Text>
          </Card>
        ))}
      </Stack>
      <SectionHeader title={t('healthGuide.whatToCheck')} />
      <Stack gap={1}>
        {entry.checks.map((c) => (
          <Text key={c} variant="bodySmall">{`• ${t(`healthGuide.checks.${c}`)}`}</Text>
        ))}
      </Stack>
      <Text variant="caption" tone="subtle">
        {t('healthGuide.sources')}
      </Text>
    </Screen>
  );
}
