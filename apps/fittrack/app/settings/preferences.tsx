import { Card, Chip, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Segmented, Stepper, ToggleRow } from '@/components/ui';
import { LEVELS, PROGRAM_GOALS } from '@/content/types';
import { repos } from '@/database';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

/** Language and units are independent choices (e.g. French interface with pounds and miles). */
export default function Preferences() {
  const { t, i18n } = useTranslation();
  const p = usePreferences();

  const setLanguage = async (lng: InterfaceLanguage | null) => {
    p.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng ?? i18n.options.fallbackLng?.toString() ?? 'en');
    void syncNotifications(repos(), i18n.t);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.preferences') }} />
      <SectionHeader title={t('settings.language')} />
      <Row wrap gap={2}>
        {INTERFACE_LANGUAGES.map((l) => (
          <Chip key={l} label={LANGUAGE_NAMES[l]} selected={(p.interfaceLanguage ?? i18n.language) === l} onPress={() => void setLanguage(l)} testID={`lang-${l}`} />
        ))}
      </Row>
      <SectionHeader title={t('settings.units')} />
      <Card>
        <Text variant="caption" tone="muted">{t('settings.weightUnit')}</Text>
        <Segmented value={p.weightUnit} onChange={(v) => p.set({ weightUnit: v })} options={[{ value: 'kg', label: t('units.kgLong') }, { value: 'lb', label: t('units.lbLong') }]} testID="unit-weight" />
        <Text variant="caption" tone="muted">{t('settings.distanceUnit')}</Text>
        <Segmented value={p.distanceUnit} onChange={(v) => p.set({ distanceUnit: v })} options={[{ value: 'km', label: t('units.kmLong') }, { value: 'mi', label: t('units.miLong') }]} />
        <Text variant="caption" tone="muted">{t('settings.lengthUnit')}</Text>
        <Segmented value={p.lengthUnit} onChange={(v) => p.set({ lengthUnit: v })} options={[{ value: 'cm', label: t('units.cmLong') }, { value: 'in', label: t('units.inLong') }]} />
        <Text variant="caption" tone="subtle">{t('settings.unitsNote')}</Text>
      </Card>
      <SectionHeader title={t('settings.theme')} />
      <Segmented value={p.theme} onChange={(v) => p.set({ theme: v })} options={[{ value: 'system', label: t('settings.themeSystem') }, { value: 'light', label: t('settings.themeLight') }, { value: 'dark', label: t('settings.themeDark') }]} />
      <SectionHeader title={t('settings.workout')} />
      <Card>
        <Stepper label={t('settings.defaultRest')} value={p.defaultRestSec} min={0} max={600} step={15} unit={t('units.sec')} onChange={(v) => p.set({ defaultRestSec: v ?? 60 })} />
        <ToggleRow title={t('settings.autoRest')} subtitle={t('settings.autoRestSub')} value={p.autoStartRest} onChange={(v) => p.set({ autoStartRest: v })} icon="timer-outline" />
        <ToggleRow title={t('settings.sound')} value={p.sound} onChange={(v) => p.set({ sound: v })} icon="volume-high-outline" />
        <ToggleRow title={t('settings.vibration')} value={p.vibration} onChange={(v) => p.set({ vibration: v, haptics: v })} icon="phone-portrait-outline" />
        <ToggleRow title={t('settings.restNotification')} subtitle={t('settings.restNotificationSub')} value={p.restNotification} onChange={(v) => p.set({ restNotification: v })} icon="notifications-outline" />
        <ToggleRow title={t('settings.keepScreenOn')} value={p.keepScreenOn} onChange={(v) => p.set({ keepScreenOn: v })} icon="sunny-outline" />
      </Card>
      <SectionHeader title={t('profile.myProfile')} />
      <Card>
        <Text variant="caption" tone="muted">{t('builder.level')}</Text>
        <Row wrap gap={2}>{LEVELS.map((l) => <Chip key={l} label={t(`levels.${l}`)} selected={p.level === l} onPress={() => p.set({ level: l })} />)}</Row>
        <Text variant="caption" tone="muted">{t('builder.goal')}</Text>
        <Row wrap gap={2}>{PROGRAM_GOALS.map((g) => <Chip key={g} label={t(`goals.${g}`)} selected={p.goal === g} onPress={() => p.set({ goal: g })} />)}</Row>
        <Stepper label={t('routine.weeklyTarget')} value={p.weeklyTarget} min={1} max={7} unit={t('onboarding.perWeek')} onChange={(v) => p.set({ weeklyTarget: v ?? 3 })} />
      </Card>
    </Screen>
  );
}
