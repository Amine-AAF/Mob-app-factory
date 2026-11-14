import { Button, FadeIn, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { recordError } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { completeOnboarding } from '@/services/settingsActions';

const STEPS: { key: 'welcome' | 'tools' | 'privacy'; icon: IconName }[] = [
  { key: 'welcome', icon: 'color-wand' },
  { key: 'tools', icon: 'apps' },
  { key: 'privacy', icon: 'shield-checkmark' },
];

/**
 * Short onboarding (3 screens, then the app). No account, and no permission is requested:
 * photos are chosen later with the system photo picker, one at a time.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const step = STEPS[index] ?? STEPS[0]!;
  const last = index === STEPS.length - 1;

  const finish = async () => {
    try {
      await completeOnboarding();
    } catch (e) {
      recordError(e, 'onboarding');
    }
    startPostOnboardingServices();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing(6), justifyContent: 'space-between' }} testID="onboarding">
      <Row style={{ justifyContent: 'flex-end' }}>
        {!last ? <Button size="md" variant="ghost" label={t('onboarding.skip')} onPress={() => void finish()} testID="onboarding-skip" /> : <View style={{ height: 44 }} />}
      </Row>
      <FadeIn key={step.key}>
        <Stack gap={5} style={{ alignItems: 'center' }}>
          <View style={{ width: 120, height: 120, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
            <Icon name={step.icon} size={56} color={theme.colors.primary} />
          </View>
          <Text variant="display" center accessibilityRole="header">
            {t(`onboarding.${step.key}.title`)}
          </Text>
          <Text tone="muted" center>
            {t(`onboarding.${step.key}.body`)}
          </Text>
        </Stack>
      </FadeIn>
      <Stack gap={4}>
        <Row gap={2} style={{ justifyContent: 'center' }} accessibilityLabel={t('onboarding.progress', { current: index + 1, total: STEPS.length })}>
          {STEPS.map((s, i) => (
            <View key={s.key} style={{ width: i === index ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === index ? theme.colors.primary : theme.colors.border }} />
          ))}
        </Row>
        <Button label={last ? t('onboarding.start') : t('onboarding.next')} onPress={() => (last ? void finish() : setIndex(index + 1))} testID="onboarding-next" />
      </Stack>
    </SafeAreaView>
  );
}
