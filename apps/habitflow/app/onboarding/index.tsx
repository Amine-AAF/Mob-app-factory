import { Button, Card, Chip, Icon, OptionCard, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitIcon } from '@/components/ui';
import { CATEGORY_ICONS } from '@/constants';
import { repos } from '@/database';
import { GOAL_SUGGESTIONS, ONBOARDING_GOALS, templateById } from '@/features/templates/data';
import { useToday } from '@/hooks';
import { recordError, track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { clock } from '@/services/clock';
import { createHabit } from '@/services/habitService';
import { ensurePermission, syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import type { HabitCategory } from '@/types';

type Step = 'welcome' | 'goals' | 'habits' | 'reminder';
const STEPS: Step[] = ['welcome', 'goals', 'habits', 'reminder'];
const REMINDER_TIMES = [{ h: 8, m: 0 }, { h: 12, m: 30 }, { h: 20, m: 0 }];

/** Short onboarding: every step after the first can be skipped; no account, ever. */
export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const today = useToday();
  const [step, setStep] = useState<Step>('welcome');
  const [goals, setGoals] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [reminder, setReminder] = useState<number | null>(2);
  const [busy, setBusy] = useState(false);

  const suggestions = [...new Set((goals.length ? goals : ONBOARDING_GOALS.slice(0, 3)).flatMap((g) => GOAL_SUGGESTIONS[g] ?? []))].slice(0, 8);
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, STEPS.indexOf(step) + 1)]!);

  const finish = async (withReminder: boolean) => {
    setBusy(true);
    try {
      const r = repos();
      for (const id of picked) {
        const tpl = templateById(id);
        if (!tpl) continue;
        await createHabit(
          { name: t(`templates.items.${id}.name`), description: t(`templates.items.${id}.desc`), icon: tpl.icon, color: tpl.color, category: tpl.category, startDate: today, durationMin: tpl.durationMin, notes: null, templateId: id, frequency: tpl.frequency, tracking: tpl.tracking },
          t,
          r,
        );
      }
      let reminderOn = false;
      if (withReminder && reminder !== null) {
        const time = REMINDER_TIMES[reminder]!;
        if ((await ensurePermission(t)) === 'granted') {
          await r.reminders.save({ habitId: null, hour: time.h, minute: time.m, days: [], enabled: true }, clock.now());
          reminderOn = true;
        }
      }
      usePreferences.getState().set({ onboardingCompleted: true, goals });
      track('onboarding_completed', { ui_language: i18n.language, goals: goals.length, habits_added: picked.length, reminder: reminderOn });
      startPostOnboardingServices(r, i18n);
      await syncNotifications(r, t);
      router.replace('/(tabs)');
    } catch (e) {
      recordError(e, 'onboarding');
      usePreferences.getState().set({ onboardingCompleted: true });
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  const skip = step === 'reminder' ? () => void finish(false) : next;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="onboarding">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={t('onboarding.stepA11y', { n: STEPS.indexOf(step) + 1, total: STEPS.length })}>
          {STEPS.map((s) => (
            <View key={s} style={{ width: s === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: s === step ? theme.colors.primary : theme.colors.border }} />
          ))}
        </View>
        {step !== 'welcome' ? <Button label={t('onboarding.skip')} variant="ghost" size="md" onPress={skip} testID="skip" /> : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, flexGrow: 1 }}>
        {step === 'welcome' ? (
          <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
            <View style={{ alignSelf: 'center', width: 96, height: 96, borderRadius: 32, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="checkmark-done" size={52} color={theme.colors.primary} />
            </View>
            <Text variant="display" center>
              HabitFlow
            </Text>
            <Text variant="subheading" tone="primary" center>
              {t('onboarding.tagline')}
            </Text>
            <Stack gap={2}>
              {(['track', 'streaks', 'plan', 'private'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Icon name={{ track: 'checkmark-circle', streaks: 'flame', plan: 'list', private: 'lock-closed' }[k] as IconName} size={20} color={theme.colors.primary} />
                  <Text variant="body" style={{ flex: 1 }}>
                    {t(`onboarding.points.${k}`)}
                  </Text>
                </View>
              ))}
            </Stack>
          </View>
        ) : null}

        {step === 'goals' ? (
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.goalsTitle')}</Text>
            <Text tone="muted">{t('onboarding.goalsBody')}</Text>
            {ONBOARDING_GOALS.map((g) => (
              <OptionCard
                key={g}
                role="checkbox"
                title={t(`onboarding.goals.${g}`)}
                icon={CATEGORY_ICONS[g as HabitCategory] as IconName}
                selected={goals.includes(g)}
                onPress={() => setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))}
                testID={`goal-${g}`}
              />
            ))}
          </Stack>
        ) : null}

        {step === 'habits' ? (
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.habitsTitle')}</Text>
            <Text tone="muted">{t('onboarding.habitsBody')}</Text>
            {suggestions.map((id) => {
              const tpl = templateById(id)!;
              const on = picked.includes(id);
              return (
                <Card key={id} onPress={() => setPicked((cur) => (on ? cur.filter((x) => x !== id) : [...cur, id]))} tone={on ? 'primary' : 'default'} accessibilityLabel={t(`templates.items.${id}.name`)} testID={`suggest-${id}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <HabitIcon icon={tpl.icon} color={tpl.color} />
                    <View style={{ flex: 1 }}>
                      <Text variant="subheading">{t(`templates.items.${id}.name`)}</Text>
                      <Text variant="caption" tone="muted">
                        {t(`templates.items.${id}.desc`)}
                      </Text>
                    </View>
                    <Icon name={on ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={on ? theme.colors.primary : theme.colors.textSubtle} />
                  </View>
                </Card>
              );
            })}
            <Text variant="caption" tone="subtle">
              {t('onboarding.habitsHint')}
            </Text>
          </Stack>
        ) : null}

        {step === 'reminder' ? (
          <Stack gap={3}>
            <Text variant="title">{t('onboarding.reminderTitle')}</Text>
            <Text tone="muted">{t('onboarding.reminderBody')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REMINDER_TIMES.map((time, i) => (
                <Chip key={i} label={`${String(time.h).padStart(2, '0')}:${String(time.m).padStart(2, '0')}`} selected={reminder === i} onPress={() => setReminder(i)} />
              ))}
            </View>
            <Text variant="caption" tone="subtle">
              {t('onboarding.reminderHint')}
            </Text>
          </Stack>
        ) : null}
      </ScrollView>

      <View style={{ padding: 20, gap: 8 }}>
        {step === 'reminder' ? (
          <Button label={t('onboarding.enableReminder')} icon="alarm-outline" onPress={() => void finish(true)} loading={busy} testID="finish" />
        ) : (
          <Button label={step === 'welcome' ? t('onboarding.start') : t('common.continue')} onPress={next} testID="next" />
        )}
      </View>
    </SafeAreaView>
  );
}
