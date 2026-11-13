import { Card, Divider, ListRow, Screen, SectionHeader, Text } from '@factory/design-system';
import { resolveLanguage } from '@factory/localization';
import Constants from 'expo-constants';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { ChoiceChips, Segmented, ToggleRow } from '@/components/ui';
import { links } from '@/config/brand';
import { repos } from '@/database';
import { UNIT_SYMBOLS } from '@/features/format/format';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { setTranslator } from '@/services/boot';
import { syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const premium = useIsPremium();
  const prefs = usePreferences();

  const setLanguage = async (lng: InterfaceLanguage | null) => {
    prefs.set({ interfaceLanguage: lng });
    await i18n.changeLanguage(lng ?? resolveLanguage(null, getLocales().map((l) => l.languageCode), INTERFACE_LANGUAGES, 'en'));
    setTranslator(i18n.t.bind(i18n));
    // Notification texts are rebuilt in the new language.
    syncNotifications(repos(), i18n.t.bind(i18n)).catch(() => undefined);
  };

  const { units } = prefs;
  return (
    <Screen>
      <Text variant="title">{t('settings.title')}</Text>

      <Card tone={premium ? 'primary' : 'default'}>
        <ListRow icon="diamond-outline" title={premium ? t('settings.premiumActive') : t('settings.goPremium')} onPress={() => router.push('/paywall')} />
      </Card>

      <SectionHeader title={t('settings.general')} />
      <Card>
        <ChoiceChips
          label={t('settings.language')}
          value={prefs.interfaceLanguage ?? 'system'}
          options={[{ value: 'system', label: t('settings.systemLanguage') }, ...INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))]}
          onChange={(v) => void setLanguage(v === 'system' ? null : (v as InterfaceLanguage))}
        />
        <Text variant="label" tone="muted">
          {t('settings.theme')}
        </Text>
        <Segmented value={prefs.theme} options={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t(`settings.themes.${v}`) }))} onChange={(theme) => prefs.set({ theme })} />
        <ToggleRow label={t('settings.haptics')} value={prefs.haptics} onChange={(haptics) => prefs.set({ haptics })} />
      </Card>

      <SectionHeader title={t('settings.units')} />
      <Card>
        <ListRow icon="speedometer-outline" title={t('settings.units')} subtitle={[UNIT_SYMBOLS[units.distance], UNIT_SYMBOLS[units.volume], UNIT_SYMBOLS[units.consumption], prefs.currency].join(' · ')} onPress={() => router.push('/settings/units')} />
        <Divider />
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} />
        <Divider />
        <ListRow icon="pie-chart-outline" title={t('settings.budget')} onPress={() => router.push('/budget')} />
      </Card>

      <SectionHeader title={t('tabs.vehicles')} />
      <Card>
        <ListRow icon="checkbox-outline" title={t('settings.templates')} onPress={() => router.push('/templates')} />
        <Divider />
        <ListRow icon="folder-open-outline" title={t('documents.title')} onPress={() => router.push('/documents')} />
        <Divider />
        <ListRow icon="git-compare-outline" title={t('settings.compare')} onPress={() => router.push('/compare')} />
        <Divider />
        <ListRow icon="document-text-outline" title={t('settings.reports')} onPress={() => router.push('/reports')} />
      </Card>

      <SectionHeader title={t('settings.data')} />
      <Card>
        <ListRow icon="cloud-download-outline" title={t('settings.data')} onPress={() => router.push('/settings/data')} />
        <Divider />
        <ListRow icon="lock-closed-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
        {links.privacyPolicy ? (
          <>
            <Divider />
            <ListRow icon="open-outline" title={t('settings.privacyPolicy')} onPress={() => void Linking.openURL(links.privacyPolicy!)} />
          </>
        ) : null}
        {links.terms ? (
          <>
            <Divider />
            <ListRow icon="open-outline" title={t('settings.terms')} onPress={() => void Linking.openURL(links.terms!)} />
          </>
        ) : null}
      </Card>

      <Text variant="caption" tone="subtle" center>
        AutoCare · {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </Screen>
  );
}
