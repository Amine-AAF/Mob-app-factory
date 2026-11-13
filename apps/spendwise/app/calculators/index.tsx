import { Card, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';

const CALCULATOR_TOOLS: readonly { id: 'budget' | 'savings' | 'split' | 'salary' | 'debt'; icon: IconName }[] = [
  { id: 'budget', icon: 'pie-chart-outline' },
  { id: 'savings', icon: 'flag-outline' },
  { id: 'split', icon: 'people-outline' },
  { id: 'salary', icon: 'briefcase-outline' },
  { id: 'debt', icon: 'trending-down-outline' },
];

export default function CalculatorsHub() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen edges={[]} testID="calculators-hub">
      <RouterStack.Screen options={{ title: t('calculators.title') }} />
      <Text tone="muted">{t('calculators.subtitle')}</Text>
      <Stack gap={3}>
        {CALCULATOR_TOOLS.map((tool) => (
          <Card key={tool.id} onPress={() => router.push(`/calculators/${tool.id}`)} accessibilityLabel={t(`calculators.tools.${tool.id}.title`)} testID={`calc-${tool.id}`}>
            <Row gap={3}>
              <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
                <Icon name={tool.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subheading">{t(`calculators.tools.${tool.id}.title`)}</Text>
                <Text variant="caption" tone="muted">
                  {t(`calculators.tools.${tool.id}.desc`)}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
          </Card>
        ))}
      </Stack>
      <Text variant="caption" tone="subtle" center>
        {t('common.notFinancialAdvice')}
      </Text>
      <AdBanner screen="calculators" />
    </Screen>
  );
}
