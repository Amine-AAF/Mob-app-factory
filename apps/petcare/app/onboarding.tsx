import { Button, Card, FadeIn, Icon, OptionCard, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { repos } from '@/database';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { usePreferences } from '@/store/preferences';

const FEATURES: { icon: IconName; key: string }[] = [
  { icon: 'paw-outline', key: 'profiles' },
  { icon: 'medkit-outline', key: 'health' },
  { icon: 'notifications-outline', key: 'reminders' },
  { icon: 'lock-closed-outline', key: 'privacy' },
];

/** Three short steps: welcome, not-a-vet notice, first pet. No account, no permission prompt. */
export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const setPrefs = usePreferences((s) => s.set);
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);

  const finish = (createPet: boolean) => {
    track('onboarding_completed', { species: 'unknown', ui_language: i18n.language });
    startPostOnboardingServices(repos(), i18n);
    if (createPet) router.replace('/pet/edit?onboarding=1');
    else {
      setPrefs({ onboardingCompleted: true });
      router.replace('/(tabs)');
    }
  };

  return (
    <Screen
      footer={
        step === 0 ? (
          <Button label={t('onboarding.start')} onPress={() => setStep(1)} testID="onboarding-next" />
        ) : step === 1 ? (
          <Button label={t('onboarding.understand')} onPress={() => setStep(2)} disabled={!accepted} testID="onboarding-accept" />
        ) : (
          <Stack gap={2}>
            <Button label={t('onboarding.addFirstPet')} icon="add" onPress={() => finish(true)} testID="onboarding-add-pet" />
            <Button label={t('onboarding.later')} variant="ghost" onPress={() => finish(false)} />
          </Stack>
        )
      }
    >
      {step === 0 ? (
        <FadeIn>
          <Stack gap={5}>
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="paw" size={48} color={theme.colors.primary} />
              </View>
            </View>
            <Text variant="display" center>
              {t('onboarding.title')}
            </Text>
            <Text tone="muted" center>
              {t('onboarding.subtitle')}
            </Text>
            {FEATURES.map((f) => (
              <Row key={f.key} gap={3}>
                <Icon name={f.icon} size={22} color={theme.colors.accent} />
                <Text style={{ flex: 1 }}>{t(`onboarding.features.${f.key}`)}</Text>
              </Row>
            ))}
            <Row wrap gap={2} style={{ justifyContent: 'center' }}>
              {INTERFACE_LANGUAGES.map((l) => (
                <Button
                  key={l}
                  label={LANGUAGE_NAMES[l]}
                  size="md"
                  variant={i18n.language === l ? 'primary' : 'secondary'}
                  onPress={() => {
                    i18n.changeLanguage(l);
                    setPrefs({ interfaceLanguage: l });
                  }}
                />
              ))}
            </Row>
          </Stack>
        </FadeIn>
      ) : step === 1 ? (
        <FadeIn>
          <Stack gap={4}>
            <Text variant="title">{t('onboarding.disclaimerTitle')}</Text>
            <Card tone="alt">
              <Text>{t('disclaimer.full')}</Text>
            </Card>
            <OptionCard role="checkbox" title={t('onboarding.disclaimerAccept')} selected={accepted} onPress={() => setAccepted((a) => !a)} testID="onboarding-checkbox" />
          </Stack>
        </FadeIn>
      ) : (
        <FadeIn>
          <Stack gap={4}>
            <Text variant="title">{t('onboarding.readyTitle')}</Text>
            <Text tone="muted">{t('onboarding.readyBody')}</Text>
            <Card tone="accent">
              <Text variant="bodySmall">{t('onboarding.privacyNote')}</Text>
            </Card>
          </Stack>
        </FadeIn>
      )}
    </Screen>
  );
}
