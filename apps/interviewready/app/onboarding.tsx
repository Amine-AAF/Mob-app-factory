import { Button, Chip, Icon, OptionCard, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { allQuestionCores } from '@/content';
import { JOB_ROLE_META } from '@/content/taxonomy';
import { repos } from '@/database';
import { PREPARATION_GOALS, type PreparationGoal } from '@/database/repositories/profileRepository';
import { dailyTarget } from '@/features/progress/plan';
import { matchesRole } from '@/features/questions/search';
import { initAds } from '@/services/ads';
import { recordError, track } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { DIFFICULTIES, JOB_ROLES, type Difficulty, type JobRoleId } from '@/types/content';

const STEPS = ['intro', 'role', 'level', 'goal', 'days', 'plan'] as const;
const DAY_OPTIONS = [7, 14, 30, 60] as const;

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState(0);
  // Re-opened from Settings: start from the saved profile.
  const saved = useSession((s) => s.profile);
  const [role, setRole] = useState<JobRoleId | null>(saved?.jobRole ?? null);
  const [level, setLevel] = useState<Difficulty>(saved?.level ?? 'beginner');
  const [goal, setGoal] = useState<PreparationGoal>(saved?.goal ?? 'new-job');
  const [days, setDays] = useState<number | null>(saved ? saved.daysAvailable : 14);
  const [saving, setSaving] = useState(false);

  const current = STEPS[step]!;
  const roleCount = useMemo(() => {
    const cores = allQuestionCores().filter((q) => !q.premium);
    return role ? cores.filter((q) => matchesRole(q, role)).length : cores.length;
  }, [role]);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setSaving(true);
    try {
      const profile = { jobRole: role, level, goal, daysAvailable: days };
      await repos().profile.save(profile);
      useSession.getState().setProfile(profile);
      usePreferences.getState().set({ onboardingCompleted: true });
      track('onboarding_completed', { job_role: role ?? 'none', level, ui_language: i18n.language });
      if (role) track('job_role_selected', { job_role: role, source: 'onboarding' });
      router.replace('/(tabs)');
      initAds().catch((e) => recordError(e, 'onboarding_ads'));
    } catch (e) {
      recordError(e, 'onboarding_save');
      setSaving(false);
    }
  };

  const optional = current === 'role' || current === 'days';

  return (
    <Screen
      testID="onboarding"
      footer={
        <Stack gap={2}>
          {current === 'plan' ? (
            <Button label={t('onboarding.start')} onPress={finish} loading={saving} size="lg" testID="onboarding-finish" />
          ) : (
            <Button label={current === 'intro' ? t('onboarding.getStarted') : t('common.continue')} onPress={next} size="lg" testID="onboarding-next" />
          )}
          <Row style={{ justifyContent: 'space-between' }}>
            {step > 0 ? <Button label={t('common.back')} variant="ghost" onPress={back} /> : <View />}
            {optional ? (
              <Button
                label={t('common.skip')}
                variant="ghost"
                onPress={() => {
                  if (current === 'role') setRole(null);
                  if (current === 'days') setDays(null);
                  next();
                }}
                testID="onboarding-skip"
              />
            ) : null}
          </Row>
        </Stack>
      }
    >
      {step > 0 ? <ProgressBar progress={step / (STEPS.length - 1)} label={t('onboarding.progress', { step, total: STEPS.length - 1 })} /> : null}

      {current === 'intro' ? (
        <Stack gap={4} style={{ paddingTop: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="briefcase" size={38} color={theme.colors.primary} />
          </View>
          <Text variant="display">{t('app.name')}</Text>
          <Text variant="heading" tone="primary">
            {t('app.tagline')}
          </Text>
          <Text tone="muted">{t('onboarding.introBody')}</Text>
          {(['library', 'practice', 'offline'] as const).map((k) => (
            <Row key={k} gap={3}>
              <Icon name="checkmark-circle" size={22} color={theme.colors.success} />
              <Text style={{ flex: 1 }}>{t(`onboarding.feature.${k}`)}</Text>
            </Row>
          ))}
        </Stack>
      ) : null}

      {current === 'role' ? (
        <Stack gap={3}>
          <Text variant="title">{t('onboarding.roleTitle')}</Text>
          <Text tone="muted">{t('onboarding.roleHint')}</Text>
          {JOB_ROLES.map((r) => (
            <OptionCard key={r} title={t(`roles.${r}`)} icon={JOB_ROLE_META[r].icon} selected={role === r} onPress={() => setRole(r)} testID={`onboarding-role-${r}`} role="radio" />
          ))}
        </Stack>
      ) : null}

      {current === 'level' ? (
        <Stack gap={3}>
          <Text variant="title">{t('onboarding.levelTitle')}</Text>
          {DIFFICULTIES.map((d) => (
            <OptionCard key={d} title={t(`difficulty.${d}`)} subtitle={t(`levelHint.${d}`)} selected={level === d} onPress={() => setLevel(d)} role="radio" />
          ))}
        </Stack>
      ) : null}

      {current === 'goal' ? (
        <Stack gap={3}>
          <Text variant="title">{t('onboarding.goalTitle')}</Text>
          {PREPARATION_GOALS.map((g) => (
            <OptionCard key={g} title={t(`goals.${g}`)} selected={goal === g} onPress={() => setGoal(g)} role="radio" />
          ))}
        </Stack>
      ) : null}

      {current === 'days' ? (
        <Stack gap={3}>
          <Text variant="title">{t('onboarding.daysTitle')}</Text>
          <Text tone="muted">{t('onboarding.daysHint')}</Text>
          <Row wrap gap={2}>
            {DAY_OPTIONS.map((d) => (
              <Chip key={d} label={t('common.days', { count: d })} selected={days === d} onPress={() => setDays(d)} />
            ))}
          </Row>
        </Stack>
      ) : null}

      {current === 'plan' ? (
        <Stack gap={4}>
          <Text variant="title">{t('onboarding.planTitle')}</Text>
          <Text tone="muted">{role ? t('onboarding.planRole', { role: t(`roles.${role}`) }) : t('onboarding.planGeneral')}</Text>
          <Stack gap={2}>
            <Row gap={3}>
              <Icon name="library-outline" size={22} color={theme.colors.primary} />
              <Text style={{ flex: 1 }}>{t('onboarding.planQuestions', { count: roleCount })}</Text>
            </Row>
            <Row gap={3}>
              <Icon name="calendar-outline" size={22} color={theme.colors.primary} />
              <Text style={{ flex: 1 }}>{t('onboarding.planDaily', { count: dailyTarget(roleCount, days) })}</Text>
            </Row>
            <Row gap={3}>
              <Icon name="sunny-outline" size={22} color={theme.colors.primary} />
              <Text style={{ flex: 1 }}>{t('onboarding.planDailyQuestion')}</Text>
            </Row>
          </Stack>
          <Text variant="caption" tone="subtle">
            {t('onboarding.planDisclaimer')}
          </Text>
        </Stack>
      ) : null}
    </Screen>
  );
}
