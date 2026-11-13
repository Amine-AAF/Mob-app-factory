import { Button, FadeIn, Icon, OptionCard, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SwitchRow } from '@/components/forms';
import { useLeaf } from '@/components/leaf';
import { repos } from '@/database';
import type { ClimateProfile } from '@/domain/seasons';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { askPermission } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

const CLIMATES: ClimateProfile[] = ['north', 'south', 'tropical', 'none'];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const prefs = usePreferences();
  const [step, setStep] = useState(0);
  const [climate, setClimate] = useState<ClimateProfile>(prefs.climate);
  const [reminders, setReminders] = useState(true);
  const [busy, setBusy] = useState(false);

  const setLanguage = (lng: InterfaceLanguage) => {
    void i18n.changeLanguage(lng);
    prefs.set({ interfaceLanguage: lng });
  };

  const finish = async () => {
    setBusy(true);
    // Permission is asked only if the user wants reminders; refusing keeps the app fully usable.
    if (reminders) await askPermission(t);
    prefs.set({ onboardingCompleted: true, climate, notificationsEnabled: reminders });
    track('onboarding_completed', { ui_language: i18n.language, climate });
    startPostOnboardingServices(repos(), i18n);
    router.replace('/(tabs)');
  };

  return (
    <Screen
      footer={
        step < 2 ? (
          <Button label={t('common.continue')} onPress={() => setStep(step + 1)} testID="onboarding-next" />
        ) : (
          <Button label={t('onboarding.start')} onPress={() => void finish()} loading={busy} testID="onboarding-finish" />
        )
      }
    >
      {step === 0 ? (
        <FadeIn>
          <Stack gap={5}>
            <View style={{ alignItems: 'center', paddingTop: 24, gap: 16 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="leaf" size={48} color={theme.colors.primary} />
              </View>
              <Text variant="display" center>
                {t('onboarding.welcomeTitle')}
              </Text>
              <Text tone="muted" center>
                {t('onboarding.welcomeBody')}
              </Text>
            </View>
            <Stack gap={2}>
              {(['collection', 'reminders', 'journal', 'offline'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Icon name={{ collection: 'grid-outline', reminders: 'notifications-outline', journal: 'book-outline', offline: 'lock-closed-outline' }[k] as 'leaf'} size={20} color={theme.colors.primary} />
                  <Text style={{ flex: 1 }}>{t(`onboarding.points.${k}`)}</Text>
                </View>
              ))}
            </Stack>
            <Stack gap={2}>
              <Text variant="label" tone="muted">
                {t('settings.language')}
              </Text>
              {INTERFACE_LANGUAGES.map((lng) => (
                <OptionCard key={lng} title={LANGUAGE_NAMES[lng]} selected={i18n.language === lng} onPress={() => setLanguage(lng)} />
              ))}
            </Stack>
          </Stack>
        </FadeIn>
      ) : step === 1 ? (
        <FadeIn>
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.climateTitle')}</Text>
            <Text tone="muted">{t('onboarding.climateBody')}</Text>
            {CLIMATES.map((c) => (
              <OptionCard key={c} title={t(`climate.${c}`)} subtitle={t(`climate.${c}Hint`)} selected={climate === c} onPress={() => setClimate(c)} testID={`climate-${c}`} />
            ))}
          </Stack>
        </FadeIn>
      ) : (
        <FadeIn>
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.remindersTitle')}</Text>
            <Text tone="muted">{t('onboarding.remindersBody')}</Text>
            <SwitchRow label={t('onboarding.enableReminders')} subtitle={t('onboarding.remindersHint')} value={reminders} onChange={setReminders} />
            <Text variant="bodySmall" tone="subtle">
              {t('onboarding.privacyNote')}
            </Text>
          </Stack>
        </FadeIn>
      )}
    </Screen>
  );
}
