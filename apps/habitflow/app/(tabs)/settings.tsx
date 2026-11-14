import type { ThemePreference } from '@factory/design-system';
import { Card, ListRow, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, View } from 'react-native';

import { Segmented, Stepper, Swatch } from '@/components/ui';
import { FREE_PALETTE, PALETTES, type PaletteId } from '@/config/brand';
import { repos } from '@/database';
import { resolveLanguage } from '@factory/localization';
import { getLocales } from 'expo-localization';

import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { setAnalyticsConsent } from '@/services/analytics';
import { syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

import manifest from '../../app.manifest.json';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const premium = useIsPremium();

  const toggleRow = (label: string, value: boolean, onChange: (v: boolean) => void, testID?: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} testID={testID} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
    </View>
  );

  const setLanguage = async (lng: (typeof INTERFACE_LANGUAGES)[number] | null) => {
    prefs.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng ?? resolveLanguage(null, getLocales().map((l) => l.languageCode), INTERFACE_LANGUAGES, 'en'));
    void syncNotifications(repos(), i18n.t);
  };

  return (
    <Screen testID="settings-screen">
      <Text variant="title">{t('settings.title')}</Text>

      <Card tone={premium ? 'alt' : 'primary'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })}>
        <Text variant="subheading">{premium ? t('settings.premiumActive') : t('settings.goPremium')}</Text>
        <Text variant="bodySmall" tone="muted">
          {premium ? t('settings.premiumManage') : t('settings.premiumPitch')}
        </Text>
      </Card>

      <SectionHeader title={t('settings.appearance')} />
      <Card>
        <Segmented<ThemePreference>
          value={prefs.theme}
          onChange={(theme) => prefs.set({ theme })}
          options={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t(`settings.theme.${v}`) }))}
        />
        <Text variant="caption" tone="muted">
          {t('settings.palette')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => {
            const locked = !premium && id !== FREE_PALETTE;
            return (
              <View key={id} style={{ alignItems: 'center', gap: 4, opacity: locked ? 0.5 : 1 }}>
                <Swatch
                  color={PALETTES[id].primary}
                  selected={(premium ? prefs.palette : FREE_PALETTE) === id}
                  label={t(`settings.palettes.${id}`)}
                  onPress={() => (locked ? router.push({ pathname: '/paywall', params: { source: 'palette' } }) : prefs.set({ palette: id }))}
                />
                <Text variant="caption" tone="muted">
                  {t(`settings.palettes.${id}`)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title={t('settings.language')} />
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[null, ...INTERFACE_LANGUAGES].map((lng) => {
            const selected = prefs.interfaceLanguage === lng;
            return (
              <Pressable
                key={lng ?? 'device'}
                onPress={() => void setLanguage(lng)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : 'transparent' }}
              >
                <Text variant="bodySmall" tone={selected ? 'primary' : 'default'}>
                  {lng ? LANGUAGE_NAMES[lng] : t('settings.deviceLanguage')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SectionHeader title={t('settings.today')} />
      <Card>
        {toggleRow(t('settings.showPlanner'), prefs.showPlannerOnToday, (v) => prefs.set({ showPlannerOnToday: v }))}
        {toggleRow(t('settings.showInsight'), prefs.showInsightOnToday, (v) => prefs.set({ showInsightOnToday: v }))}
        {toggleRow(t('settings.haptics'), prefs.haptics, (v) => prefs.set({ haptics: v }))}
        <Text variant="body">{t('settings.weeklyGoal')}</Text>
        <Stepper label={t('settings.weeklyGoal')} value={prefs.weeklyGoalPercent} min={30} max={100} step={5} onChange={(v) => prefs.set({ weeklyGoalPercent: v })} format={(v) => `${v}%`} />
      </Card>

      <Stack gap={0}>
        <ListRow icon="alarm-outline" title={t('settings.reminders')} subtitle={t('settings.remindersSub')} onPress={() => router.push('/settings/reminders')} />
        <ListRow icon="trophy-outline" title={t('settings.achievements')} onPress={() => router.push('/achievements')} />
        <ListRow icon="list-outline" title={t('settings.planner')} onPress={() => router.push('/planner')} />
        <ListRow icon="server-outline" title={t('settings.data')} subtitle={t('settings.dataSub')} onPress={() => router.push('/settings/data')} testID="data-settings" />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Stack>

      <Card>
        {toggleRow(t('settings.analytics'), prefs.analyticsConsent, (v) => {
          prefs.set({ analyticsConsent: v });
          setAnalyticsConsent(v);
        })}
        <Text variant="caption" tone="muted">
          {t('settings.analyticsHint')}
        </Text>
      </Card>

      <Text variant="caption" tone="subtle" center>
        {t('settings.version', { version: manifest.version })}
      </Text>
    </Screen>
  );
}
