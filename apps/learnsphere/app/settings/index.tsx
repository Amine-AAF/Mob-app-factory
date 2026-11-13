import { Button, Chip, Divider, Row, Screen, Stack, Text, type ThemePreference } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ColorPicker, Panel, Segmented, Stepper, TextField, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { fmt, INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { rescheduleAll } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const isPremium = useIsPremium();
  const [name, setName] = useState(prefs.learnerName);

  const setLanguage = async (lng: InterfaceLanguage) => {
    prefs.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng);
    // Reminders are re-created in the new language.
    await rescheduleAll(repos(), i18n.t);
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.general') }} />
      <Panel title={t('settings.profile')} icon="person-outline">
        <TextField label={t('onboarding.nameLabel')} value={name} onChangeText={setName} onBlur={() => prefs.set({ learnerName: name.trim() })} maxLength={40} />
        <Stepper label={t('onboarding.dailyMinutes')} value={prefs.dailyMinutes} onChange={(v) => prefs.set({ dailyMinutes: v })} min={10} max={480} step={10} format={fmt.duration} />
        <Text variant="caption" tone="subtle">
          {t('settings.dailyMinutesHelp')}
        </Text>
      </Panel>
      <Panel title={t('settings.language')} icon="language-outline">
        <Row gap={2} wrap>
          {INTERFACE_LANGUAGES.map((lng) => (
            <Chip key={lng} label={LANGUAGE_NAMES[lng]} selected={i18n.language === lng} onPress={() => setLanguage(lng)} />
          ))}
        </Row>
        <Text variant="caption" tone="subtle">
          {t('settings.contentLanguageNote')}
        </Text>
      </Panel>
      <Panel title={t('settings.appearance')} icon="contrast-outline">
        <Segmented<ThemePreference>
          value={prefs.theme}
          onChange={(v) => prefs.set({ theme: v })}
          options={[
            { value: 'system', label: t('settings.themes.system') },
            { value: 'light', label: t('settings.themes.light') },
            { value: 'dark', label: t('settings.themes.dark') },
          ]}
        />
        <Stack gap={2}>
          <Text variant="bodySmall" style={{ fontWeight: '600' }}>
            {t('settings.readingSize')}
          </Text>
          <Segmented
            value={prefs.readingSize}
            onChange={(v) => prefs.set({ readingSize: v })}
            options={[
              { value: 'normal', label: t('settings.sizes.normal') },
              { value: 'large', label: t('settings.sizes.large') },
              { value: 'xlarge', label: t('settings.sizes.xlarge') },
            ]}
          />
        </Stack>
        <Divider />
        {isPremium ? (
          <>
            <ColorPicker label={t('settings.accent')} value={prefs.accentColor ?? '#1F6F8B'} onChange={(c) => prefs.set({ accentColor: c })} />
            <Button size="md" variant="ghost" label={t('settings.resetAccent')} onPress={() => prefs.set({ accentColor: null })} />
          </>
        ) : (
          <Button size="md" variant="secondary" icon="sparkles-outline" label={`${t('settings.accent')} · ${t('premium.badge')}`} onPress={() => router.push({ pathname: '/paywall', params: { source: 'customization' } })} />
        )}
        <Button size="md" variant="secondary" icon="grid-outline" label={t('settings.dashboard')} onPress={() => router.push('/settings/dashboard')} />
      </Panel>
      <Panel title={t('settings.behaviour')} icon="phone-portrait-outline">
        <ToggleRow title={t('settings.haptics')} value={prefs.hapticsEnabled} onChange={(v) => prefs.set({ hapticsEnabled: v })} />
        <ToggleRow title={t('settings.keepAwake')} subtitle={t('settings.keepAwakeHelp')} value={prefs.keepScreenAwakeInFocus} onChange={(v) => prefs.set({ keepScreenAwakeInFocus: v })} />
      </Panel>
    </Screen>
  );
}
