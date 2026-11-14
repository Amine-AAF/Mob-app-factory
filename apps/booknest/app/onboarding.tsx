import { Button, Chip, Icon, Text, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Page, Paper, Serif } from '@/components/ui';
import { repos } from '@/database';
import { goalPeriod } from '@/features/goals/goals';
import { useToday } from '@/hooks';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { createGoal } from '@/services/goalService';
import { ensurePermission, syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

const PILLARS: { icon: IconName; key: string }[] = [
  { icon: 'library', key: 'library' },
  { icon: 'timer', key: 'track' },
  { icon: 'chatbox-ellipses', key: 'remember' },
  { icon: 'shield-checkmark', key: 'private' },
];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const set = usePreferences((s) => s.set);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<number | null>(12);
  const [reminder, setReminder] = useState(false);
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    try {
      const r = repos();
      if (goal && !(await r.organize.goals({ activeOnly: true })).some((g) => g.type === 'books_per_year')) {
        const p = goalPeriod({ type: 'books_per_year', periodStart: today, periodEnd: null }, today);
        await createGoal(r, { type: 'books_per_year', target: goal, periodStart: p.start });
      }
      if (reminder && (await ensurePermission(t)) === 'granted') {
        const daily = (await r.organize.notificationSettings()).find((s) => s.kind === 'daily');
        if (daily) await r.organize.saveNotificationSetting({ ...daily, enabled: true });
        await syncNotifications(r, t);
      }
      set({ onboardingCompleted: true });
      track('onboarding_completed', { ui_language: i18n.language, yearly_goal: !!goal, reminder });
      startPostOnboardingServices(r, i18n);
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page edges={['top', 'bottom']} testID="onboarding">
      {step === 0 ? (
        <View style={{ gap: 20, paddingTop: 24 }}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="book" size={44} color="#F7EBD3" />
            </View>
            <Serif size={34} center>
              BookNest
            </Serif>
            <Text tone="muted" center>
              {t('onboarding.tagline')}
            </Text>
          </View>
          {PILLARS.map((p) => (
            <Paper key={p.key}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Icon name={p.icon} size={24} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{t(`onboarding.pillars.${p.key}.title`)}</Text>
                  <Text variant="bodySmall" tone="muted">
                    {t(`onboarding.pillars.${p.key}.body`)}
                  </Text>
                </View>
              </View>
            </Paper>
          ))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {INTERFACE_LANGUAGES.map((l) => (
              <Chip
                key={l}
                label={LANGUAGE_NAMES[l]}
                selected={i18n.language === l}
                onPress={() => {
                  set({ interfaceLanguage: l });
                  void i18n.changeLanguage(l);
                }}
              />
            ))}
          </View>
          <Button label={t('onboarding.start')} size="lg" onPress={() => setStep(1)} testID="onboarding-next" />
        </View>
      ) : (
        <View style={{ gap: 18, paddingTop: 24 }}>
          <Serif size={28}>{t('onboarding.goalTitle')}</Serif>
          <Text tone="muted">{t('onboarding.goalBody')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[6, 12, 24, 50].map((n) => (
              <Chip key={n} label={t('onboarding.booksN', { count: n })} selected={goal === n} onPress={() => setGoal(n)} testID={`goal-${n}`} />
            ))}
            <Chip label={t('onboarding.noGoal')} selected={goal == null} onPress={() => setGoal(null)} />
          </View>
          <Paper>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{t('onboarding.reminderTitle')}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t('onboarding.reminderBody')}
                </Text>
              </View>
              <Switch value={reminder} onValueChange={setReminder} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t('onboarding.reminderTitle')} />
            </View>
          </Paper>
          <Text variant="caption" tone="subtle">
            {t('onboarding.privacy')}
          </Text>
          <Button label={t('onboarding.finish')} size="lg" onPress={() => void finish()} loading={busy} testID="onboarding-finish" />
          <Button label={t('common.back')} variant="ghost" onPress={() => setStep(0)} />
        </View>
      )}
    </Page>
  );
}
