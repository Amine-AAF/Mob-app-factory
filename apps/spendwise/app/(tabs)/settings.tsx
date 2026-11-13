import { Badge, Card, Chip, Divider, ListRow, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { SwitchRow } from '@/components/inputs';
import { mutate, useData } from '@/hooks';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { ALL_THRESHOLDS } from '@/features/budgets/budgets';
import { recordError } from '@/services/analytics';
import { reloadSession } from '@/services/boot';
import { askNotificationPermission } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useMainCurrency } from '@/store/session';
import type { AppSettings } from '@/database/repositories/core';

const LINKS: { href: Href; key: string; icon: IconName }[] = [
  { href: '/accounts', key: 'accounts.title', icon: 'wallet-outline' },
  { href: '/categories', key: 'categories.title', icon: 'pricetags-outline' },
  { href: '/recurring', key: 'recurring.title', icon: 'repeat-outline' },
  { href: '/subscriptions', key: 'subs.title', icon: 'tv-outline' },
  { href: '/goals', key: 'goals.title', icon: 'flag-outline' },
  { href: '/calculators', key: 'calculators.title', icon: 'calculator-outline' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const isPremium = useIsPremium();
  const main = useMainCurrency();
  const { data: settings } = useData((r) => r.settings.getAll(), []);

  async function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    try {
      await mutate((r) => r.settings.set(key, value));
      await reloadSession();
    } catch (e) {
      recordError(e, 'settings');
    }
  }

  async function toggleNotifications(key: 'budgetNotifications' | 'subscriptionReminders', value: boolean) {
    if (value) {
      const permission = await askNotificationPermission(t('notifications.channel'));
      if (permission !== 'granted') {
        Alert.alert(t('settings.notificationsDenied'));
        return;
      }
    }
    await setSetting(key, value);
  }

  function setLanguage(lng: InterfaceLanguage | null) {
    prefs.set({ interfaceLanguage: lng });
    void i18n.changeLanguage(lng ?? 'en');
  }

  const thresholds = settings?.alertThresholds ?? [];
  const toggleThreshold = (v: number) => setSetting('alertThresholds', thresholds.includes(v) ? thresholds.filter((x) => x !== v) : [...thresholds, v].sort((a, b) => a - b));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(5), paddingTop: theme.spacing(2), paddingBottom: theme.spacing(10) }}>
        <Stack gap={4}>
          <Text variant="title" accessibilityRole="header">
            {t('settings.title')}
          </Text>

          <Card onPress={() => router.push('/paywall?source=settings')} tone={isPremium ? 'primary' : 'accent'} accessibilityLabel={t('settings.premium')}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="subheading">{t('settings.premium')}</Text>
              {isPremium ? <Badge label={t('settings.premiumActive')} tone="success" icon="checkmark" /> : <Badge label={t('common.premium')} tone="accent" icon="star" />}
            </Row>
          </Card>

          <Text variant="label" tone="muted">
            {t('settings.money')}
          </Text>
          <Card>
            <ListRow title={t('settings.mainCurrency')} subtitle={main} icon="cash-outline" onPress={() => router.push('/currency')} />
            {LINKS.map((l) => (
              <ListRow key={l.key} title={t(l.key)} icon={l.icon} onPress={() => router.push(l.href)} testID={`settings-${l.key}`} />
            ))}
          </Card>

          <Text variant="label" tone="muted">
            {t('settings.general')}
          </Text>
          <Card>
            <Text variant="subheading">{t('settings.language')}</Text>
            <Row gap={2} wrap>
              <Chip label={t('settings.languageSystem')} selected={prefs.interfaceLanguage === null} onPress={() => setLanguage(null)} />
              {INTERFACE_LANGUAGES.map((l) => (
                <Chip key={l} label={LANGUAGE_NAMES[l]} selected={prefs.interfaceLanguage === l} onPress={() => setLanguage(l)} testID={`lang-${l}`} />
              ))}
            </Row>
            <Divider />
            <Text variant="subheading">{t('settings.theme')}</Text>
            <Row gap={2} wrap>
              {(['system', 'light', 'dark'] as const).map((k) => (
                <Chip key={k} label={t(`settings.themes.${k}`)} selected={prefs.theme === k} onPress={() => prefs.set({ theme: k })} testID={`theme-${k}`} />
              ))}
            </Row>
            <Divider />
            <SwitchRow label={t('privacy.mode')} description={t('privacy.modeDesc')} value={prefs.privacyMode} onChange={(v) => prefs.set({ privacyMode: v })} testID="settings-privacy-mode" />
          </Card>

          <Text variant="label" tone="muted">
            {t('settings.alerts')}
          </Text>
          <Card>
            <Text variant="subheading">{t('settings.thresholds')}</Text>
            <Text variant="caption" tone="muted">
              {t('settings.thresholdsDesc')}
            </Text>
            <Row gap={2} wrap>
              {ALL_THRESHOLDS.map((v) => (
                <Chip key={v} label={`${v}%`} selected={thresholds.includes(v)} onPress={() => toggleThreshold(v)} testID={`threshold-${v}`} />
              ))}
            </Row>
            <Divider />
            <SwitchRow label={t('settings.budgetNotifications')} description={t('settings.budgetNotificationsDesc')} value={!!settings?.budgetNotifications} onChange={(v) => toggleNotifications('budgetNotifications', v)} />
            <SwitchRow label={t('settings.subscriptionReminders')} description={t('settings.subscriptionRemindersDesc')} value={!!settings?.subscriptionReminders} onChange={(v) => toggleNotifications('subscriptionReminders', v)} />
          </Card>

          <Card>
            <ListRow title={t('settings.data')} icon="server-outline" onPress={() => router.push('/data')} testID="settings-data" />
            <ListRow title={t('settings.privacy')} icon="shield-checkmark-outline" onPress={() => router.push('/privacy')} testID="settings-privacy" />
          </Card>

          <Text variant="label" tone="muted">
            {t('settings.about')}
          </Text>
          <Card tone="alt">
            <Text variant="subheading">{t('app.name')}</Text>
            <Text variant="caption" tone="muted">
              {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {t('settings.disclaimer')}
            </Text>
          </Card>
          <AdBanner screen="settings" />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
