import { Button, Chip, Icon, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Segmented, Stepper } from '@/components/ui';
import { CURRENCIES } from '@/domain/budget';
import { APP_LANGUAGES, type AppLanguage, type UnitSystem } from '@/domain/types';
import { useLang } from '@/hooks/useLang';
import { LANGUAGE_NAMES } from '@/i18n';
import { track } from '@/services/analytics';
import { startPostOnboardingServices } from '@/services/boot';
import { regionalDefaults, usePreferences, type DietPreference } from '@/store/preferences';

const STEPS = 3;

export default function Onboarding() {
  const { t, i18n, lng } = useLang();
  const theme = useTheme();
  const prefs = usePreferences();
  const [step, setStep] = useState(0);
  const [defaults] = useState(() => {
    const loc = getLocales()[0];
    return regionalDefaults(loc?.regionCode, loc?.currencyCode);
  });
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(defaults.unitSystem);
  const [currency, setCurrency] = useState<string>(defaults.currency);
  const [household, setHousehold] = useState(prefs.householdSize);
  const [diet, setDiet] = useState<DietPreference>('none');

  const setLanguage = (l: AppLanguage) => {
    prefs.set({ interfaceLanguage: l });
    void i18n.changeLanguage(l);
  };

  const finish = () => {
    prefs.set({ onboardingCompleted: true, unitSystem, currency, firstDayOfWeek: defaults.firstDayOfWeek, householdSize: household, diet });
    track('onboarding_completed', { ui_language: lng, unit_system: unitSystem, diet });
    startPostOnboardingServices(i18n);
    router.replace('/(tabs)');
  };

  const currencyOptions = [...new Set([currency, ...CURRENCIES])].slice(0, 12);

  return (
    <Screen
      edges={['top']}
      footer={
        <Row gap={3}>
          {step > 0 ? (
            <View style={{ flex: 1 }}>
              <Button label={t('common.back')} variant="secondary" onPress={() => setStep(step - 1)} />
            </View>
          ) : null}
          <View style={{ flex: 2 }}>
            <Button label={step < STEPS - 1 ? t('common.continue') : t('onboarding.start')} onPress={() => (step < STEPS - 1 ? setStep(step + 1) : finish())} testID="onboarding-next" />
          </View>
        </Row>
      }
    >
      <Row gap={2} style={{ justifyContent: 'center', marginTop: 8 }} accessibilityLabel={t('onboarding.step', { current: step + 1, total: STEPS })}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={{ height: 6, width: i === step ? 28 : 10, borderRadius: 3, backgroundColor: i <= step ? theme.colors.primary : theme.colors.border }} />
        ))}
      </Row>

      {step === 0 ? (
        <Stack gap={4}>
          <View style={{ alignItems: 'center', gap: 12, marginTop: 24 }}>
            <View style={{ width: 96, height: 96, borderRadius: 32, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 52, lineHeight: 64 }} maxFontSizeMultiplier={1}>
                🥗
              </Text>
            </View>
            <Text variant="display" center>
              {t('onboarding.welcomeTitle')}
            </Text>
            <Text tone="muted" center>
              {t('onboarding.welcomeBody')}
            </Text>
          </View>
          {(
            [
              ['calendar', 'onboarding.point1'],
              ['cart', 'onboarding.point2'],
              ['file-tray-full', 'onboarding.point3'],
              ['cloud-offline', 'onboarding.point4'],
            ] as const
          ).map(([icon, key]) => (
            <Row key={key} gap={3}>
              <Icon name={icon} size={22} color={theme.colors.accent} />
              <Text style={{ flex: 1 }}>{t(key)}</Text>
            </Row>
          ))}
          <Text variant="label" tone="muted" style={{ marginTop: 8 }}>
            {t('settings.language')}
          </Text>
          <Row gap={2} wrap>
            {APP_LANGUAGES.map((l) => (
              <Chip key={l} label={LANGUAGE_NAMES[l]} selected={lng === l} onPress={() => setLanguage(l)} testID={`lang-${l}`} />
            ))}
          </Row>
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack gap={4}>
          <Text variant="title">{t('onboarding.regionTitle')}</Text>
          <Text tone="muted">{t('onboarding.regionBody')}</Text>
          <Text variant="label" tone="muted">
            {t('settings.units')}
          </Text>
          <Segmented
            value={unitSystem}
            onChange={setUnitSystem}
            options={[
              { value: 'metric', label: t('settings.metric') },
              { value: 'imperial', label: t('settings.imperial') },
            ]}
          />
          <Text variant="bodySmall" tone="subtle">
            {unitSystem === 'metric' ? t('settings.metricExample') : t('settings.imperialExample')}
          </Text>
          <Text variant="label" tone="muted">
            {t('settings.currency')}
          </Text>
          <Row gap={2} wrap>
            {currencyOptions.map((c) => (
              <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
            ))}
          </Row>
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack gap={4}>
          <Text variant="title">{t('onboarding.householdTitle')}</Text>
          <Text tone="muted">{t('onboarding.householdBody')}</Text>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('settings.householdSize')}</Text>
            <Stepper value={household} onChange={setHousehold} min={1} max={12} label={t('settings.householdSize')} />
          </Row>
          <Text variant="label" tone="muted">
            {t('onboarding.dietTitle')}
          </Text>
          {(['none', 'vegetarian', 'vegan'] as const).map((d) => (
            <OptionCard key={d} title={t(`diet.${d}`)} subtitle={t(`diet.${d}Hint`)} selected={diet === d} onPress={() => setDiet(d)} icon={d === 'none' ? 'restaurant-outline' : 'leaf-outline'} />
          ))}
          <Text variant="bodySmall" tone="subtle">
            {t('onboarding.privacyNote')}
          </Text>
        </Stack>
      ) : null}
    </Screen>
  );
}
