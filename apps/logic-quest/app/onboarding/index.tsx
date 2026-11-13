import { Button, Chip, Icon, OptionCard, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Reveal } from '@/components/ui';
import { repos } from '@/database';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { setAnalyticsConsent, track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { usePreferences } from '@/store/preferences';
import { CATEGORY_META } from '@/theme/game';

const SLIDES: { key: string; icon: IconName }[] = [
  { key: 'welcome', icon: 'extension-puzzle' },
  { key: 'modes', icon: 'apps' },
  { key: 'explained', icon: 'bulb' },
];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<'easy' | 'medium'>('easy');
  const [consent, setConsent] = useState(false);

  const finish = () => {
    prefs.set({ onboardingCompleted: true, startingDifficulty: level, analyticsConsent: consent });
    setAnalyticsConsent(consent);
    track('onboarding_completed', { ui_language: i18n.language, starting_difficulty: level });
    startPostOnboardingServices(repos(), i18n);
    router.replace('/(tabs)');
  };

  if (step < SLIDES.length) {
    const slide = SLIDES[step]!;
    return (
      <Screen
        scroll={false}
        edges={['top', 'bottom']}
        testID={`onboarding-${slide.key}`}
        footer={
          <Row gap={3}>
            {step > 0 ? (
              <View style={{ flex: 1 }}>
                <Button label={t('common.back')} variant="secondary" onPress={() => setStep(step - 1)} />
              </View>
            ) : null}
            <View style={{ flex: 2 }}>
              <Button label={t('common.continue')} onPress={() => setStep(step + 1)} testID="onboarding-next" />
            </View>
          </Row>
        }
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
          <Reveal key={slide.key}>
            <Stack gap={5} style={{ alignItems: 'center' }}>
              <View style={{ width: 112, height: 112, borderRadius: 34, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={slide.icon} size={56} color={theme.colors.primary} />
              </View>
              <Text variant="display" center accessibilityRole="header">
                {t(`onboarding.${slide.key}.title`)}
              </Text>
              <Text tone="muted" center>
                {t(`onboarding.${slide.key}.body`)}
              </Text>
              {slide.key === 'modes' ? (
                <Row wrap gap={2} style={{ justifyContent: 'center' }}>
                  {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((c) => (
                    <Row key={c} gap={1} style={{ backgroundColor: theme.colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                      <Icon name={CATEGORY_META[c].icon} size={16} color={CATEGORY_META[c][theme.scheme]} />
                      <Text variant="bodySmall">{t(`category.${c}.name`)}</Text>
                    </Row>
                  ))}
                </Row>
              ) : null}
            </Stack>
          </Reveal>
          <Row gap={2} style={{ justifyContent: 'center' }} accessibilityLabel={t('onboarding.stepOf', { step: step + 1, total: SLIDES.length + 1 })}>
            {[...SLIDES, null].map((_, i) => (
              <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? theme.colors.primary : theme.colors.border }} />
            ))}
          </Row>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} testID="onboarding-setup" footer={<Button label={t('onboarding.start')} icon="play" onPress={finish} testID="onboarding-finish" />}>
      <Text variant="title" accessibilityRole="header">
        {t('onboarding.setup.title')}
      </Text>
      <Stack gap={2}>
        <Text variant="subheading">{t('settings.language')}</Text>
        <Row wrap gap={2}>
          {INTERFACE_LANGUAGES.map((lng) => (
            <Chip
              key={lng}
              label={LANGUAGE_NAMES[lng]}
              selected={i18n.language === lng}
              onPress={() => {
                prefs.set({ interfaceLanguage: lng });
                void i18n.changeLanguage(lng);
              }}
            />
          ))}
        </Row>
      </Stack>
      <Stack gap={2}>
        <Text variant="subheading">{t('onboarding.setup.level')}</Text>
        <OptionCard title={t('onboarding.setup.easyTitle')} subtitle={t('onboarding.setup.easyBody')} icon="leaf-outline" selected={level === 'easy'} onPress={() => setLevel('easy')} testID="level-easy" />
        <OptionCard title={t('onboarding.setup.mediumTitle')} subtitle={t('onboarding.setup.mediumBody')} icon="flash-outline" selected={level === 'medium'} onPress={() => setLevel('medium')} testID="level-medium" />
      </Stack>
      <Row gap={3} style={{ justifyContent: 'space-between', paddingVertical: 8 }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="subheading">{t('settings.analytics')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('settings.analyticsDesc')}
          </Text>
        </Stack>
        <Switch value={consent} onValueChange={setConsent} accessibilityLabel={t('settings.analytics')} />
      </Row>
      <Text variant="caption" tone="subtle">
        {t('onboarding.setup.privacy')}
      </Text>
    </Screen>
  );
}
