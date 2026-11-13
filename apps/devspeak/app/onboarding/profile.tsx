import { zodResolver } from '@hookform/resolvers/zod';
import { Button, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { repos } from '@/database';
import { profileSchema, type UserProfile } from '@/database/repositories/profileRepository';
import { DailyTimeField, LevelField, ObjectivesField, RoleField } from '@/features/profile/ProfileFields';
import { LanguagePicker } from '@/features/profile/LanguagePicker';
import { recordError, setAnalyticsConsent, track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

const STEPS = ['level', 'role', 'goals', 'time', 'language'] as const;

export default function ProfileSetup() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const prefs = usePreferences();
  const { control, handleSubmit, trigger, formState } = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: { englishLevel: 'intermediate', role: 'fullstack', objectives: ['meetings', 'technical'], dailyMinutes: 10, displayName: '' },
    mode: 'onChange',
  });

  const current = STEPS[step] ?? 'level';
  const fieldForStep = { level: 'englishLevel', role: 'role', goals: 'objectives', time: 'dailyMinutes', language: 'displayName' } as const;

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const r = repos();
      const saved = await r.profile.save(values, clock.now());
      useSession.getState().setProfile(saved);
      prefs.set({ onboardingCompleted: true });
      setAnalyticsConsent(prefs.analyticsConsent);
      track('onboarding_completed', { level: saved.englishLevel, role: saved.role, ui_language: i18n.language });
      startPostOnboardingServices(r, i18n);
      router.replace('/(tabs)');
    } catch (e) {
      recordError(e, 'onboarding_save');
      setSaving(false);
    }
  });

  const next = async () => {
    if (!(await trigger(fieldForStep[current]))) return;
    if (step === STEPS.length - 1) await submit();
    else setStep((s) => s + 1);
  };

  const titles = {
    level: [t('onboarding.stepLevel'), undefined],
    role: [t('onboarding.stepRole'), undefined],
    goals: [t('onboarding.stepGoals'), t('onboarding.stepGoalsHint')],
    time: [t('onboarding.stepTime'), t('onboarding.stepTimeHint')],
    language: [t('onboarding.stepLanguage'), t('onboarding.stepLanguageHint')],
  } as const;
  const [title, hint] = titles[current];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <Stack gap={3} style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="arrow-back" label={t('common.back')} onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))} />
          <Text variant="caption" tone="muted">
            {t('onboarding.stepOf', { current: step + 1, total: STEPS.length })}
          </Text>
          <View style={{ width: 44 }} />
        </Row>
        <ProgressBar progress={(step + 1) / STEPS.length} label={t('onboarding.stepOf', { current: step + 1, total: STEPS.length })} />
      </Stack>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
            {t('onboarding.profileSubtitle')}
          </Text>
        ) : null}
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {hint ? <Text tone="muted">{hint}</Text> : null}
        {current === 'level' && <LevelField control={control} />}
        {current === 'role' && <RoleField control={control} />}
        {current === 'goals' && <ObjectivesField control={control} errors={formState.errors} />}
        {current === 'time' && <DailyTimeField control={control} />}
        {current === 'language' && (
          <Stack gap={5}>
            <LanguagePicker />
            <Stack gap={2}>
              <Text variant="subheading">{t('onboarding.nameLabel')}</Text>
              <Controller
                control={control}
                name="displayName"
                render={({ field }) => (
                  <TextInput
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    placeholder={t('onboarding.namePlaceholder')}
                    placeholderTextColor={theme.colors.textSubtle}
                    maxLength={30}
                    autoComplete="given-name"
                    accessibilityLabel={t('onboarding.nameLabel')}
                    style={{ minHeight: 50, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: 14, color: theme.colors.text, backgroundColor: theme.colors.surface, fontSize: 16 }}
                  />
                )}
              />
            </Stack>
            <Row style={{ alignItems: 'flex-start' }}>
              <Stack gap={1} style={{ flex: 1 }}>
                <Text variant="subheading">{t('onboarding.analyticsLabel')}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t('onboarding.analyticsHint')}
                </Text>
              </Stack>
              <Switch
                value={prefs.analyticsConsent}
                onValueChange={(v) => prefs.set({ analyticsConsent: v })}
                accessibilityLabel={t('onboarding.analyticsLabel')}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              />
            </Row>
          </Stack>
        )}
      </ScrollView>
      <View style={{ padding: 20 }}>
        <Button label={step === STEPS.length - 1 ? t('onboarding.finish') : t('common.continue')} onPress={next} loading={saving} testID="profile-next" />
      </View>
    </SafeAreaView>
  );
}
