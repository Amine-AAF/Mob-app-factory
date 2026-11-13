import { Button, Card, Icon, OptionCard, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Segmented, Stepper } from '@/components/ui';
import { LEVELS, type Level, type ProgramGoal } from '@/content/types';
import { repos } from '@/database';
import { recordError, track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { usePreferences } from '@/store/preferences';

type Step = 'welcome' | 'profile' | 'units' | 'safety';
const STEPS: Step[] = ['welcome', 'profile', 'units', 'safety'];
const GOALS: ProgramGoal[] = ['general_fitness', 'strength', 'muscle', 'endurance', 'mobility', 'consistency'];

/** Short onboarding. No account, ever; every choice can be changed later in Profile. */
export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const [step, setStep] = useState<Step>('welcome');
  const [level, setLevel] = useState<Level>(prefs.level);
  const [goal, setGoal] = useState<ProgramGoal>(prefs.goal);
  const [weekly, setWeekly] = useState<number>(prefs.weeklyTarget);
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, STEPS.indexOf(step) + 1)]!);

  const finish = () => {
    usePreferences.getState().set({ onboardingCompleted: true, level, goal, weeklyTarget: weekly });
    track('onboarding_completed', { ui_language: i18n.language, level, goal });
    try {
      startPostOnboardingServices(repos(), i18n);
    } catch (e) {
      recordError(e, 'onboarding');
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="onboarding">
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 12 }} accessibilityLabel={t('onboarding.stepA11y', { n: STEPS.indexOf(step) + 1, total: STEPS.length })}>
        {STEPS.map((s) => (
          <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: STEPS.indexOf(s) <= STEPS.indexOf(step) ? theme.colors.primary : theme.colors.border }} />
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, flexGrow: 1 }}>
        {step === 'welcome' ? (
          <Stack gap={4} style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="barbell" size={44} color={theme.colors.onPrimary} />
            </View>
            <Text variant="display">{t('onboarding.welcomeTitle')}</Text>
            <Text tone="muted">{t('onboarding.welcomeBody')}</Text>
            {(['plan', 'track', 'progress'] as const).map((k) => (
              <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Icon name={k === 'plan' ? 'calendar' : k === 'track' ? 'stopwatch' : 'trending-up'} size={22} color={theme.colors.primary} />
                <Text style={{ flex: 1 }}>{t(`onboarding.point.${k}`)}</Text>
              </View>
            ))}
            <Text variant="caption" tone="subtle">
              {t('onboarding.privacyNote')}
            </Text>
          </Stack>
        ) : null}

        {step === 'profile' ? (
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.levelTitle')}</Text>
            {LEVELS.map((l) => (
              <OptionCard key={l} title={t(`levels.${l}`)} subtitle={t(`onboarding.levelDesc.${l}`)} selected={level === l} onPress={() => setLevel(l)} testID={`level-${l}`} />
            ))}
            <Text variant="heading" style={{ marginTop: 8 }}>
              {t('onboarding.goalTitle')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GOALS.map((g) => (
                <View key={g} style={{ width: '48%' }}>
                  <OptionCard title={t(`goals.${g}`)} selected={goal === g} onPress={() => setGoal(g)} />
                </View>
              ))}
            </View>
            <Card>
              <Stepper label={t('onboarding.weeklyTarget')} value={weekly} min={1} max={7} onChange={(v) => setWeekly(v ?? 3)} unit={t('onboarding.perWeek')} />
              <Text variant="caption" tone="subtle">
                {t('onboarding.weeklyHint')}
              </Text>
            </Card>
          </Stack>
        ) : null}

        {step === 'units' ? (
          <Stack gap={4}>
            <Text variant="title">{t('onboarding.unitsTitle')}</Text>
            <Text tone="muted">{t('onboarding.unitsBody')}</Text>
            <Text variant="subheading">{t('settings.weightUnit')}</Text>
            <Segmented value={prefs.weightUnit} onChange={(v) => prefs.set({ weightUnit: v })} options={[{ value: 'kg', label: t('units.kgLong') }, { value: 'lb', label: t('units.lbLong') }]} />
            <Text variant="subheading">{t('settings.distanceUnit')}</Text>
            <Segmented value={prefs.distanceUnit} onChange={(v) => prefs.set({ distanceUnit: v })} options={[{ value: 'km', label: t('units.kmLong') }, { value: 'mi', label: t('units.miLong') }]} />
            <Text variant="subheading">{t('settings.lengthUnit')}</Text>
            <Segmented value={prefs.lengthUnit} onChange={(v) => prefs.set({ lengthUnit: v })} options={[{ value: 'cm', label: t('units.cmLong') }, { value: 'in', label: t('units.inLong') }]} />
          </Stack>
        ) : null}

        {step === 'safety' ? (
          <Stack gap={4}>
            <Text variant="title">{t('onboarding.safetyTitle')}</Text>
            <Card tone="alt">
              {(['advice', 'pain', 'estimates', 'private'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name={k === 'pain' ? 'medkit-outline' : k === 'private' ? 'lock-closed-outline' : k === 'estimates' ? 'calculator-outline' : 'information-circle-outline'} size={20} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ flex: 1 }}>
                    {t(`onboarding.safety.${k}`)}
                  </Text>
                </View>
              ))}
            </Card>
          </Stack>
        ) : null}
      </ScrollView>
      <View style={{ padding: 20, gap: 10 }}>
        {step === 'safety' ? <Button label={t('onboarding.start')} onPress={finish} testID="onboarding-finish" /> : <Button label={t('common.continue')} onPress={next} testID="onboarding-next" />}
      </View>
    </SafeAreaView>
  );
}
