import { Button, Chip, FadeIn, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Segmented } from '@/components/fields';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { startPostOnboardingServices } from '@/services/boot';
import { recordError } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';

const STEPS = 3;

const CATEGORIES: { key: string; icon: IconName }[] = [
  { key: 'everyday', icon: 'calculator-outline' },
  { key: 'money', icon: 'wallet-outline' },
  { key: 'convert', icon: 'swap-horizontal-outline' },
  { key: 'private', icon: 'lock-closed-outline' },
];

/** Three short screens, skippable at any time. Ads consent is requested only after this. */
export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const [step, setStep] = useState(0);

  const finish = () => {
    prefs.set({ onboardingCompleted: true });
    startPostOnboardingServices();
    router.replace('/(tabs)');
  };

  const pickLanguage = (lng: InterfaceLanguage) => {
    prefs.set({ interfaceLanguage: lng });
    i18n.changeLanguage(lng).catch((e) => recordError(e, 'onboarding_language'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="onboarding">
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <Row gap={2} accessibilityLabel={t('onboarding.progress', { step: step + 1, total: STEPS })}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? theme.colors.primary : theme.colors.border }} />
          ))}
        </Row>
        <Pressable onPress={finish} accessibilityRole="button" hitSlop={12} testID="onboarding-skip">
          <Text tone="muted" style={{ fontWeight: '600' }}>
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      </Row>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20, justifyContent: 'center' }}>
        {step === 0 ? (
          <FadeIn key="s0">
            <Stack gap={5} style={{ alignItems: 'center' }}>
              <View style={{ width: 112, height: 112, borderRadius: 34, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="calculator" size={58} color={theme.colors.onPrimary} />
              </View>
              <Text variant="display" center accessibilityRole="header">
                CalcWise
              </Text>
              <Text variant="subheading" center tone="muted">
                {t('onboarding.welcomeTitle')}
              </Text>
              <Text center tone="muted">
                {t('onboarding.welcomeBody')}
              </Text>
            </Stack>
          </FadeIn>
        ) : step === 1 ? (
          <FadeIn key="s1">
            <Stack gap={4}>
              <Text variant="title" accessibilityRole="header">
                {t('onboarding.categoriesTitle')}
              </Text>
              {CATEGORIES.map((c) => (
                <Row key={c.key} gap={3} style={{ padding: 14, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <Stack gap={1} style={{ flex: 1 }}>
                    <Text variant="subheading">{t(`onboarding.categories.${c.key}.title`)}</Text>
                    <Text variant="bodySmall" tone="muted">
                      {t(`onboarding.categories.${c.key}.body`)}
                    </Text>
                  </Stack>
                </Row>
              ))}
            </Stack>
          </FadeIn>
        ) : (
          <FadeIn key="s2">
            <Stack gap={4}>
              <Text variant="title" accessibilityRole="header">
                {t('onboarding.prefsTitle')}
              </Text>
              <Text variant="bodySmall" tone="muted">
                {t('settings.language')}
              </Text>
              <Row gap={2} wrap>
                {INTERFACE_LANGUAGES.map((lng) => (
                  <Chip key={lng} label={LANGUAGE_NAMES[lng]} selected={i18n.language === lng} onPress={() => pickLanguage(lng)} testID={`onboarding-lang-${lng}`} />
                ))}
              </Row>
              <Text variant="bodySmall" tone="muted">
                {t('settings.theme')}
              </Text>
              <Segmented
                testID="onboarding-theme"
                value={prefs.theme}
                onChange={(theme) => prefs.set({ theme })}
                options={[
                  { value: 'system', label: t('settings.themes.system') },
                  { value: 'light', label: t('settings.themes.light') },
                  { value: 'dark', label: t('settings.themes.dark') },
                ]}
              />
              <Text variant="caption" tone="subtle">
                {t('onboarding.prefsHint')}
              </Text>
            </Stack>
          </FadeIn>
        )}
      </ScrollView>

      <View style={{ padding: 20 }}>
        {step < STEPS - 1 ? <Button label={t('onboarding.next')} onPress={() => setStep((s) => s + 1)} testID="onboarding-next" /> : <Button label={t('onboarding.start')} icon="arrow-forward" onPress={finish} testID="onboarding-start" />}
      </View>
    </SafeAreaView>
  );
}
