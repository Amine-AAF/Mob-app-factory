import { Button, Icon, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Stepper, TextField } from '@/components/ui';
import { repos } from '@/database';
import { fmt, INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { usePreferences } from '@/store/preferences';

type Goal = 'university' | 'school' | 'certification' | 'training' | 'self';
const GOALS: { id: Goal; icon: 'school' | 'library' | 'shield-checkmark' | 'briefcase' | 'compass' }[] = [
  { id: 'university', icon: 'school' },
  { id: 'school', icon: 'library' },
  { id: 'certification', icon: 'shield-checkmark' },
  { id: 'training', icon: 'briefcase' },
  { id: 'self', icon: 'compass' },
];

/** Three short steps; no account, everything stays on the device. */
export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(prefs.learnerName);
  const [goal, setGoal] = useState<Goal>('university');
  const [minutes, setMinutes] = useState(prefs.dailyMinutes);

  const setLanguage = (lng: InterfaceLanguage) => {
    prefs.set({ interfaceLanguage: lng });
    void i18n.changeLanguage(lng);
  };

  const finish = async (openTemplates: boolean) => {
    prefs.set({ onboardingCompleted: true, learnerName: name.trim(), dailyMinutes: minutes });
    await repos().settings.set('learnerProfile', { goal });
    track('onboarding_completed', { ui_language: i18n.language, daily_minutes: minutes });
    startPostOnboardingServices(repos(), i18n);
    router.replace('/(tabs)');
    if (openTemplates) router.push({ pathname: '/templates', params: { category: goal === 'certification' ? 'certification' : goal === 'self' ? 'roadmap' : goal === 'school' ? 'exam' : 'university' } });
  };

  return (
    <Screen
      footer={
        <Row gap={3}>
          {step > 0 ? <Button label={t('common.back')} variant="secondary" onPress={() => setStep(step - 1)} /> : null}
          <View style={{ flex: 1 }}>
            {step < 2 ? (
              <Button label={t('common.continue')} onPress={() => setStep(step + 1)} testID="onboarding-next" />
            ) : (
              <Button label={t('onboarding.useTemplate')} onPress={() => finish(true)} testID="onboarding-finish" />
            )}
          </View>
        </Row>
      }
    >
      <Row gap={2}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? theme.colors.primary : theme.colors.border }} />
        ))}
      </Row>
      {step === 0 ? (
        <Stack gap={4}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="planet" size={38} color={theme.colors.primary} />
          </View>
          <Text variant="display">{t('onboarding.welcomeTitle')}</Text>
          <Text tone="muted">{t('onboarding.welcomeBody')}</Text>
          <Stack gap={2}>
            {(['privacy', 'offline', 'noAccount'] as const).map((k) => (
              <Row key={k} gap={2}>
                <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text variant="bodySmall" style={{ flex: 1 }}>
                  {t(`onboarding.promise.${k}`)}
                </Text>
              </Row>
            ))}
          </Stack>
          <Text variant="label" tone="subtle">
            {t('settings.language')}
          </Text>
          <Row gap={2} wrap>
            {INTERFACE_LANGUAGES.map((lng) => (
              <Button key={lng} size="md" label={LANGUAGE_NAMES[lng]} variant={i18n.language === lng ? 'primary' : 'secondary'} onPress={() => setLanguage(lng)} />
            ))}
          </Row>
        </Stack>
      ) : null}
      {step === 1 ? (
        <Stack gap={3}>
          <Text variant="title">{t('onboarding.goalTitle')}</Text>
          <TextField label={t('onboarding.nameLabel')} placeholder={t('onboarding.namePlaceholder')} value={name} onChangeText={setName} maxLength={40} hint={t('onboarding.nameHint')} />
          {GOALS.map((g) => (
            <OptionCard key={g.id} title={t(`onboarding.goals.${g.id}`)} icon={g.icon} selected={goal === g.id} onPress={() => setGoal(g.id)} testID={`goal-${g.id}`} />
          ))}
        </Stack>
      ) : null}
      {step === 2 ? (
        <Stack gap={4}>
          <Text variant="title">{t('onboarding.timeTitle')}</Text>
          <Text tone="muted">{t('onboarding.timeBody')}</Text>
          <Stepper label={t('onboarding.dailyMinutes')} value={minutes} onChange={setMinutes} min={10} max={480} step={10} format={fmt.duration} />
          <Text variant="bodySmall" tone="subtle">
            {t('onboarding.timeHint')}
          </Text>
          <Button label={t('onboarding.startEmpty')} variant="ghost" onPress={() => finish(false)} testID="onboarding-empty" />
        </Stack>
      ) : null}
    </Screen>
  );
}
