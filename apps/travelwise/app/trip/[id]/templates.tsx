import { Badge, Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ITINERARY_TEMPLATES, TEMPLATES, l10n, type ItineraryTemplateKey } from '@/content/itineraryTemplates';
import { ItineraryValidationError } from '@/database/repositories/itinerary';
import { applyItineraryTemplate } from '@/features/itinerary/actions';
import { isItineraryTemplateFree } from '@/features/premium/limits';
import { usePremiumGate } from '@/features/premium/usePremiumGate';
import { recordError } from '@/services/analytics';

/** Pick an editable outline. Templates never contain real places or verified schedules. */
export default function TemplatesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const { isPremium, openPaywall } = usePremiumGate();
  const apply = (key: ItineraryTemplateKey) =>
    !isPremium && !isItineraryTemplateFree(key)
      ? openPaywall('all_templates')
      : applyItineraryTemplate(id, key, i18n.language)
      .then((added) => {
        Alert.alert(t('templates.applied', { count: added }));
        router.back();
      })
      .catch((e) => {
        if (e instanceof ItineraryValidationError) Alert.alert(t(`itinerary.errors.${e.code}`));
        else {
          recordError(e, 'template');
          Alert.alert(t('tripForm.errors.generic'));
        }
      });

  return (
    <Screen edges={[]} testID="templates-screen">
      <RouterStack.Screen options={{ headerShown: true, title: t('templates.title') }} />
      <Text variant="bodySmall" tone="muted">
        {t('templates.disclaimer')}
      </Text>
      <Stack gap={3}>
        {ITINERARY_TEMPLATES.map((key) => {
          const tpl = TEMPLATES[key];
          return (
            <Card key={key} onPress={() => apply(key)} accessibilityLabel={t(`templates.names.${key}`)} testID={`template-${key}`}>
              <Row gap={3}>
                <Icon name="copy-outline" size={20} color={theme.colors.primary} />
                <Stack gap={0.5} style={{ flex: 1 }}>
                  <Row gap={2}>
                    <Text variant="subheading">{t(`templates.names.${key}`)}</Text>
                    {!isPremium && !isItineraryTemplateFree(key) ? <Badge label="Premium" tone="accent" icon="lock-closed" /> : null}
                  </Row>
                  <Text variant="caption" tone="muted">
                    {t('templates.outline', { days: tpl.suggestedDays, first: l10n(tpl.first.title, i18n.language), last: l10n(tpl.last.title, i18n.language) })}
                  </Text>
                </Stack>
              </Row>
            </Card>
          );
        })}
      </Stack>
    </Screen>
  );
}
