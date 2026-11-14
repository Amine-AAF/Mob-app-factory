import { Badge, Card, Divider, ListRow, Screen, SectionHeader, Text } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '@/components/ui';
import { LANGUAGE_NAMES, currentLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function SettingsTab() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const prefs = usePreferences();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen testID="settings-tab">
      <ScreenHeader title={t('settings.title')} />
      <Card tone={isPremium ? 'primary' : 'accent'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })} accessibilityLabel={t('premium.title')}>
        <Badge label={isPremium ? t('premium.active') : t('premium.free')} tone={isPremium ? 'success' : 'accent'} icon="diamond-outline" />
        <Text variant="heading">{isPremium ? t('premium.thanks') : t('premium.cta')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('premium.short')}
        </Text>
      </Card>

      <SectionHeader title={t('settings.general')} />
      <Card>
        <ListRow icon="language-outline" title={t('settings.language')} subtitle={prefs.interfaceLanguage ? LANGUAGE_NAMES[currentLanguage()] : `${t('settings.deviceLanguage')} (${LANGUAGE_NAMES[currentLanguage()]})`} onPress={() => router.push('/settings/regional')} />
        <Divider />
        <ListRow icon="globe-outline" title={t('settings.regional')} subtitle={`${t(`units.${prefs.units}`)} · ${t(`dateFormats.${prefs.dateFormat}`)}`} onPress={() => router.push('/settings/regional')} />
        <Divider />
        <ListRow icon="contrast-outline" title={t('settings.theme')} subtitle={t(`themes.${prefs.theme}`)} onPress={() => router.push('/settings/regional')} />
        <Divider />
        <ListRow icon="home-outline" title={t('homes.manage')} onPress={() => router.push('/homes')} />
      </Card>

      <SectionHeader title={t('settings.remindersData')} />
      <Card>
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} testID="settings-notifications" />
        <Divider />
        <ListRow icon="cloud-download-outline" title={t('settings.data')} subtitle={t('settings.dataHint')} onPress={() => router.push('/settings/data')} testID="settings-data" />
        <Divider />
        <ListRow icon="lock-closed-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Card>

      <Text variant="caption" tone="subtle" center>
        {t('settings.version', { version })}
      </Text>
    </Screen>
  );
}
