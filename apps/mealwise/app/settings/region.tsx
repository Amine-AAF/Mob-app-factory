import { Chip, Row, Screen, Text } from '@factory/design-system';
import { resolveLanguage } from '@factory/localization';
import { getLocales } from 'expo-localization';
import { Switch, View } from 'react-native';

import { Segmented, Stepper } from '@/components/ui';
import { CURRENCIES, formatMoney } from '@/domain/budget';
import { displayQuantity } from '@/domain/quantity';
import { APP_LANGUAGES } from '@/domain/types';
import { useLang } from '@/hooks/useLang';
import { fmt, LANGUAGE_NAMES } from '@/i18n';
import { scheduleSync } from '@/services/planning';
import { usePreferences, type DietPreference, type TimeFormat } from '@/store/preferences';

/** Language, units, currency, week start, time format, household and diet. */
export default function RegionSettings() {
  const { t, i18n, lng } = useLang();
  const prefs = usePreferences();
  const currencies = [...new Set([prefs.currency, ...CURRENCIES])];
  const sample = (system: 'metric' | 'imperial') => {
    const d = displayQuantity(500, 'g', { system, lng });
    const v = displayQuantity(250, 'ml', { system, lng });
    return `${t(`units.${d.unit}`, { count: d.value ?? 0, amount: d.amount })} · ${t(`units.${v.unit}`, { count: v.value ?? 0, amount: v.amount })}`;
  };

  return (
    <Screen edges={[]}>
      <Text variant="label" tone="muted">
        {t('settings.language')}
      </Text>
      <Row gap={2} wrap>
        <Chip
          label={t('settings.deviceLanguage')}
          selected={prefs.interfaceLanguage === null}
          onPress={() => {
            prefs.set({ interfaceLanguage: null });
            const device = resolveLanguage(null, getLocales().map((l) => l.languageCode), APP_LANGUAGES, 'en');
            void i18n.changeLanguage(device).then(() => scheduleSync(i18n.t.bind(i18n), device));
          }}
        />
        {APP_LANGUAGES.map((l) => (
          <Chip
            key={l}
            label={LANGUAGE_NAMES[l]}
            selected={prefs.interfaceLanguage === l}
            onPress={() => {
              prefs.set({ interfaceLanguage: l });
              void i18n.changeLanguage(l).then(() => scheduleSync(i18n.t.bind(i18n), l));
            }}
            testID={`settings-lang-${l}`}
          />
        ))}
      </Row>

      <Text variant="label" tone="muted">
        {t('settings.units')}
      </Text>
      <Segmented
        value={prefs.unitSystem}
        onChange={(v) => prefs.set({ unitSystem: v })}
        options={[
          { value: 'metric', label: t('settings.metric') },
          { value: 'imperial', label: t('settings.imperial') },
        ]}
        testID="settings-units"
      />
      <Text variant="bodySmall" tone="subtle">
        {t('settings.example', { example: sample(prefs.unitSystem) })}
      </Text>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text>{t('settings.keepOriginal')}</Text>
          <Text variant="caption" tone="muted">
            {t('settings.keepOriginalHint')}
          </Text>
        </View>
        <Switch value={prefs.keepOriginalUnits} onValueChange={(v) => prefs.set({ keepOriginalUnits: v })} accessibilityLabel={t('settings.keepOriginal')} />
      </Row>

      <Text variant="label" tone="muted">
        {t('settings.currency')}
      </Text>
      <Row gap={2} wrap>
        {currencies.map((c) => (
          <Chip key={c} label={c} selected={prefs.currency === c} onPress={() => prefs.set({ currency: c })} />
        ))}
      </Row>
      <Text variant="bodySmall" tone="subtle">
        {t('settings.example', { example: formatMoney(12.5, prefs.currency, lng) })}
      </Text>

      <Text variant="label" tone="muted">
        {t('settings.weekStarts')}
      </Text>
      <Segmented
        value={prefs.firstDayOfWeek}
        onChange={(v) => prefs.set({ firstDayOfWeek: v })}
        options={[
          { value: 'monday', label: t('settings.monday') },
          { value: 'sunday', label: t('settings.sunday') },
        ]}
      />

      <Text variant="label" tone="muted">
        {t('settings.timeFormat')}
      </Text>
      <Segmented<TimeFormat>
        value={prefs.timeFormat}
        onChange={(v) => prefs.set({ timeFormat: v })}
        options={[
          { value: 'auto', label: t('settings.auto') },
          { value: '24h', label: '24 h' },
          { value: '12h', label: '12 h' },
        ]}
      />
      <Text variant="bodySmall" tone="subtle">
        {t('settings.example', { example: `${fmt.date(new Date(2026, 10, 13), { dateStyle: 'medium' })} · ${fmt.time(new Date(2026, 10, 13, 19, 30))}` })}
      </Text>

      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading">{t('settings.householdSize')}</Text>
        <Stepper value={prefs.householdSize} onChange={(v) => prefs.set({ householdSize: v })} min={1} max={12} label={t('settings.householdSize')} />
      </Row>
      <Text variant="label" tone="muted">
        {t('onboarding.dietTitle')}
      </Text>
      <Row gap={2} wrap>
        {(['none', 'vegetarian', 'vegan'] as DietPreference[]).map((d) => (
          <Chip key={d} label={t(`diet.${d}`)} selected={prefs.diet === d} onPress={() => prefs.set({ diet: d })} />
        ))}
      </Row>
    </Screen>
  );
}
