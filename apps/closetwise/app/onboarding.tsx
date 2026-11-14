import { resolveLanguage } from '@factory/localization';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { repos } from '@/database';
import { CURRENCIES, type Currency } from '@/domain/catalog';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { updateSettings } from '@/services/data';
import { askPermission } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useSettings } from '@/store/session';
import { Button, Card, ChoiceChips, FadeIn, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@/ui';

const STEPS: { key: 'digitalise' | 'plan' | 'value'; icons: IconName[] }[] = [
  { key: 'digitalise', icons: ['camera-outline', 'shirt-outline', 'pricetags-outline'] },
  { key: 'plan', icons: ['layers-outline', 'calendar-outline', 'airplane-outline'] },
  { key: 'value', icons: ['stats-chart-outline', 'water-outline', 'flag-outline'] },
];

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [notif, setNotif] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [finishing, setFinishing] = useState(false);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;

  const title = current.key === 'digitalise' ? t('onboarding.steps.digitalise.title') : current.key === 'plan' ? t('onboarding.steps.plan.title') : t('onboarding.steps.value.title');
  const body = current.key === 'digitalise' ? t('onboarding.steps.digitalise.body') : current.key === 'plan' ? t('onboarding.steps.plan.body') : t('onboarding.steps.value.body');

  const setLanguage = (choice: InterfaceLanguage | 'device' | null) => {
    if (!choice) return;
    const persisted = choice === 'device' ? null : choice;
    prefs.set({ interfaceLanguage: persisted });
    const lng = persisted ?? resolveLanguage(null, getLocales().map((l) => l.languageCode), INTERFACE_LANGUAGES, 'en');
    i18n.changeLanguage(lng).catch((e: unknown) => recordError(e, 'onboarding_language'));
  };

  const enableReminders = async () => {
    try {
      const p = await askPermission(t);
      if (p !== 'granted') {
        setNotif('denied');
        return;
      }
      await repos().settings.setNotification('planned_outfit', { enabled: true });
      await repos().settings.setNotification('trip_prep', { enabled: true });
      setNotif('granted');
    } catch (e) {
      recordError(e, 'onboarding_notifications');
      setNotif('denied');
    }
  };

  const finish = (addFirstItem: boolean) => {
    if (finishing) return;
    setFinishing(true);
    prefs.set({ onboardingCompleted: true });
    track('onboarding_completed', { ui_language: i18n.language });
    try {
      startPostOnboardingServices(repos(), i18n);
    } catch (e) {
      recordError(e, 'onboarding_services');
    }
    router.replace('/(tabs)');
    if (addFirstItem) router.push('/item/edit');
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Stack gap={2}>
          <Row gap={1} style={{ justifyContent: 'center', paddingBottom: theme.spacing(1) }} accessibilityLabel={t('onboarding.progress', { step: step + 1, total: STEPS.length })}>
            {STEPS.map((s, i) => (
              <View key={s.key} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? theme.colors.primary : theme.colors.border }} />
            ))}
          </Row>
          {last ? (
            <>
              <Button label={t('onboarding.addFirstItem')} icon="camera-outline" onPress={() => finish(true)} disabled={finishing} testID="onboarding-add-item" />
              <Button variant="ghost" label={t('onboarding.start')} onPress={() => finish(false)} disabled={finishing} testID="onboarding-finish" />
            </>
          ) : (
            <Row gap={2}>
              {step > 0 ? <Button variant="secondary" label={t('common.back')} onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
              <Button label={t('common.next')} onPress={() => setStep(step + 1)} style={{ flex: 2 }} testID="onboarding-next" />
            </Row>
          )}
        </Stack>
      }
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="accent">
          {t('common.appName')}
        </Text>
        {!last ? <Button small variant="ghost" label={t('common.skip')} onPress={() => setStep(STEPS.length - 1)} /> : null}
      </Row>

      <FadeIn key={current.key}>
        <Stack gap={5}>
          <Hero icons={current.icons} />
          <Stack gap={2}>
            <Text variant="label" tone="subtle">
              {t('onboarding.stepLabel', { step: step + 1, total: STEPS.length })}
            </Text>
            <Text variant="hero" accessibilityRole="header">
              {title}
            </Text>
            <Text tone="muted">{body}</Text>
          </Stack>

          {current.key === 'digitalise' ? (
            <ChoiceChips<InterfaceLanguage | 'device'>
              label={t('onboarding.language')}
              options={[{ value: 'device', label: t('onboarding.languageDevice') }, ...INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))]}
              value={prefs.interfaceLanguage ?? 'device'}
              onChange={setLanguage}
            />
          ) : null}

          {current.key === 'plan' ? (
            <Stack gap={2}>
              <ChoiceChips<Currency>
                label={t('onboarding.currency')}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                value={settings.currency as Currency}
                onChange={(c) => c && updateSettings({ currency: c }).catch((e: unknown) => recordError(e, 'onboarding_currency'))}
              />
              <Text variant="caption" tone="subtle">
                {t('onboarding.currencyHint')}
              </Text>
            </Stack>
          ) : null}

          {current.key === 'value' ? (
            <Stack gap={3}>
              <Card>
                <Row gap={2}>
                  <Icon name="notifications-outline" size={18} color={theme.colors.textMuted} />
                  <Text variant="heading" style={{ flex: 1 }}>
                    {t('onboarding.notifications.title')}
                  </Text>
                </Row>
                <Text variant="bodySmall" tone="muted">
                  {t('onboarding.notifications.body')}
                </Text>
                {notif === 'granted' ? (
                  <Text variant="bodySmall" tone="success">
                    {t('onboarding.notifications.enabled')}
                  </Text>
                ) : notif === 'denied' ? (
                  <Text variant="bodySmall" tone="warning">
                    {t('onboarding.notifications.denied')}
                  </Text>
                ) : (
                  <Button small variant="secondary" icon="notifications-outline" label={t('onboarding.notifications.enable')} onPress={() => void enableReminders()} style={{ alignSelf: 'flex-start' }} />
                )}
              </Card>
              <Row gap={2} style={{ alignItems: 'flex-start' }}>
                <Icon name="lock-closed-outline" size={16} color={theme.colors.textSubtle} />
                <Text variant="bodySmall" tone="subtle" style={{ flex: 1 }}>
                  {t('onboarding.privacy')}
                </Text>
              </Row>
            </Stack>
          ) : null}
        </Stack>
      </FadeIn>
    </Screen>
  );
}

/** Editorial "flat-lay" of three icons on soft tiles: no image download, works in both themes. */
function Hero({ icons }: { icons: IconName[] }) {
  const theme = useTheme();
  return (
    <View style={{ height: 200, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surfaceAlt, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing(3) }} accessible={false}>
      {icons.map((icon, i) => (
        <View
          key={icon}
          style={{
            width: i === 1 ? 92 : 72,
            height: i === 1 ? 122 : 96,
            borderRadius: theme.radius.lg,
            backgroundColor: i === 1 ? theme.colors.accentSoft : theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: i === 0 ? '-6deg' : i === 2 ? '6deg' : '0deg' }],
          }}
        >
          <Icon name={icon} size={i === 1 ? 36 : 28} color={theme.colors.text} />
        </View>
      ))}
    </View>
  );
}
