import { Button, Card, FadeIn, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';

/** Step 1 + 2: welcome and language. */
export default function OnboardingWelcome() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const setPrefs = usePreferences((s) => s.set);
  const language = (INTERFACE_LANGUAGES as readonly string[]).includes(i18n.language) ? (i18n.language as InterfaceLanguage) : 'en';

  return (
    <Screen testID="onboarding-welcome" footer={<Button label={t('onboarding.start')} size="lg" onPress={() => router.push('/onboarding/currency')} testID="onboarding-start" />}>
      <FadeIn>
        <Stack gap={4}>
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="airplane" size={36} color={theme.colors.onPrimary} />
          </View>
          <Text variant="display" accessibilityRole="header">
            {t('onboarding.welcomeTitle')}
          </Text>
          <Text variant="subheading" tone="primary">
            {t('app.tagline')}
          </Text>
          <Text tone="muted">{t('onboarding.welcomeBody')}</Text>
          <Card tone="alt">
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
              <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
                {t('onboarding.welcomeNote')}
              </Text>
            </Row>
          </Card>
          <ChoiceChips
            label={t('onboarding.languageTitle')}
            options={INTERFACE_LANGUAGES}
            value={language}
            labelOf={(l) => LANGUAGE_NAMES[l]}
            onChange={(l) => {
              setPrefs({ interfaceLanguage: l });
              i18n.changeLanguage(l).catch(() => undefined);
            }}
            testID="onboarding-language"
          />
        </Stack>
      </FadeIn>
    </Screen>
  );
}
