import { Button, FadeIn, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChoiceChips, SelectField } from '@/components/forms';
import { repos } from '@/database';
import { COMMON_CURRENCIES } from '@/domain/money';
import { i18nInstance, INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { askPermission } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';

const FEATURES = [
  { icon: 'calendar', key: 'plan' },
  { icon: 'people', key: 'guests' },
  { icon: 'mail-open', key: 'invite' },
  { icon: 'wallet', key: 'budget' },
  { icon: 'grid', key: 'seating' },
] as const;

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const set = usePreferences((s) => s.set);
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<string>(usePreferences.getState().defaultCurrency ?? (i18n.language === 'en' ? 'USD' : 'EUR'));

  const finish = async (notifications: boolean) => {
    if (notifications) await askPermission(t).catch(() => undefined);
    set({ onboardingCompleted: true, defaultCurrency: currency, notificationsEnabled: notifications });
    track('onboarding_completed', { ui_language: i18n.language });
    const inst = i18nInstance();
    if (inst) startPostOnboardingServices(repos(), inst);
    router.replace('/(tabs)');
  };

  if (step === 0) {
    return (
      <Screen footer={<Button label={t('onboarding.start')} onPress={() => setStep(1)} testID="onboarding-start" />}>
        <FadeIn>
          <Stack gap={5} style={{ paddingTop: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkles" size={36} color={theme.colors.onPrimary} />
            </View>
            <Text variant="display">{t('onboarding.title')}</Text>
            <Text tone="muted">{t('onboarding.subtitle')}</Text>
            <Stack gap={3}>
              {FEATURES.map((f) => (
                <Row key={f.key} gap={3}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={f.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={{ flex: 1 }}>{t(`onboarding.features.${f.key}`)}</Text>
                </Row>
              ))}
            </Stack>
          </Stack>
        </FadeIn>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen footer={<Button label={t('common.continue')} onPress={() => setStep(2)} testID="onboarding-next" />}>
        <Stack gap={5} style={{ paddingTop: 24 }}>
          <Text variant="title">{t('onboarding.prefsTitle')}</Text>
          <ChoiceChips
            label={t('settings.language')}
            value={(i18n.language as InterfaceLanguage) ?? 'en'}
            options={INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
            onChange={(l) => {
              set({ interfaceLanguage: l });
              i18n.changeLanguage(l).catch(() => undefined);
            }}
          />
          <SelectField label={t('settings.defaultCurrency')} value={currency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => c && setCurrency(c)} searchable icon="cash-outline" />
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Stack gap={2}>
          <Button label={t('onboarding.enableReminders')} icon="notifications" onPress={() => finish(true)} testID="onboarding-finish" />
          <Button label={t('onboarding.later')} variant="ghost" onPress={() => finish(false)} />
        </Stack>
      }
    >
      <Stack gap={4} style={{ paddingTop: 24 }}>
        <Text variant="title">{t('onboarding.privacyTitle')}</Text>
        {(['local', 'noAccount', 'share', 'contacts'] as const).map((k) => (
          <Row key={k} gap={3} style={{ alignItems: 'flex-start' }}>
            <Icon name="shield-checkmark" size={20} color={theme.colors.success} />
            <Text style={{ flex: 1 }}>{t(`onboarding.privacy.${k}`)}</Text>
          </Row>
        ))}
        <Text variant="bodySmall" tone="muted">
          {t('onboarding.remindersBody')}
        </Text>
      </Stack>
    </Screen>
  );
}
