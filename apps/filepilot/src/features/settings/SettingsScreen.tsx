import { Card, Divider, ListRow, Screen, SectionHeader, Text, useTheme, type ThemePreference } from '@factory/design-system';
import Constants from 'expo-constants';
import { getLocales } from 'expo-localization';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Switch } from 'react-native';

import { QualitySlider, SegmentedControl } from '@/components/controls';
import { appManifest, links } from '@/config/brand';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, fmt, type InterfaceLanguage } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { recordError } from '@/services/analytics';
import type { ImageFormat } from '@/services/files/formats';
import { restore } from '@/services/monetization';
import { changeAnalyticsConsent, changeLanguage, clearTemporaryFiles, deleteAllData, outputsUsage, updatePreferences } from '@/services/settingsActions';
import { repos } from '@/database';
import { useSession } from '@/store/session';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = useSession((s) => s.preferences);
  const consent = useSession((s) => s.analyticsConsent);
  const entitlement = useSession((s) => s.entitlement);
  const dataVersion = useSession((s) => s.dataVersion);
  const [usage, setUsage] = useState<{ files: number; bytes: number } | null>(null);
  const [quality, setQuality] = useState(prefs.defaultImageQuality);
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      outputsUsage()
        .then(setUsage)
        .catch((e) => recordError(e, 'outputs_usage'));
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when data changes
    }, [dataVersion]),
  );

  const safe = (p: Promise<unknown>, context: string) => void p.catch((e) => recordError(e, context));
  const device = getLocales()[0]?.languageCode ?? null;

  const confirmDeleteAll = () =>
    Alert.alert(t('settings.deleteAllTitle'), t('settings.deleteAllBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          safe(
            deleteAllData().then(() => router.replace('/onboarding')),
            'delete_all',
          ),
      },
    ]);

  const doRestore = () =>
    safe(
      restore(repos()).then((s) => setMessage(s?.isPremium ? t('paywall.restored') : s ? t('paywall.nothingToRestore') : t('paywall.unavailable'))),
      'restore',
    );

  return (
    <Screen testID="settings">
      <Text variant="title" accessibilityRole="header">
        {t('settings.title')}
      </Text>

      <SectionHeader title={t('settings.appearance')} />
      <Card>
        <SegmentedControl<'device' | InterfaceLanguage>
          label={t('settings.language')}
          value={prefs.language ?? 'device'}
          onChange={(v) => safe(changeLanguage(i18n, v === 'device' ? null : v, device), 'change_language')}
          options={[{ value: 'device' as const, label: t('settings.languageDevice') }, ...INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))]}
          testID="language"
        />
        <SegmentedControl<ThemePreference>
          label={t('settings.theme')}
          value={prefs.theme}
          onChange={(v) => safe(updatePreferences({ theme: v }), 'change_theme')}
          options={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t(`settings.themes.${v}`) }))}
          testID="theme"
        />
      </Card>

      <SectionHeader title={t('settings.defaults')} />
      <Card>
        <QualitySlider value={quality} onChange={setQuality} label={t('settings.defaultQuality')} />
        {quality !== prefs.defaultImageQuality ? (
          <Text variant="bodySmall" tone="primary" onPress={() => safe(updatePreferences({ defaultImageQuality: quality }), 'default_quality')} accessibilityRole="button" style={{ fontWeight: '700' }}>
            {t('settings.saveDefault')}
          </Text>
        ) : null}
        <SegmentedControl<ImageFormat>
          label={t('settings.defaultFormat')}
          value={prefs.defaultOutputFormat}
          onChange={(v) => safe(updatePreferences({ defaultOutputFormat: v }), 'default_format')}
          options={[
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ]}
        />
      </Card>

      <SectionHeader title={t('settings.premium')} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow
          icon="diamond-outline"
          title={entitlement.isPremium ? t('paywall.active') : t('premium.cardTitle')}
          subtitle={entitlement.isPremium && entitlement.expiresAt ? t('paywall.activeUntil', { date: fmt.day(new Date(entitlement.expiresAt)) }) : undefined}
          onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })}
        />
        <Divider />
        <ListRow icon="refresh-outline" title={t('paywall.restore')} onPress={doRestore} />
        {entitlement.isPremium ? (
          <>
            <Divider />
            <ListRow icon="card-outline" title={t('paywall.manage')} onPress={() => safe(Linking.openURL(links.manageSubscriptions), 'manage_subs')} />
          </>
        ) : null}
      </Card>
      {message ? (
        <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <SectionHeader title={t('settings.privacy')} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow
          icon="analytics-outline"
          title={t('settings.analytics')}
          subtitle={t('settings.analyticsHint')}
          right={<Switch value={consent} onValueChange={(v) => safe(changeAnalyticsConsent(v), 'analytics_consent')} accessibilityLabel={t('settings.analytics')} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />}
        />
        {adsState().privacyOptionsRequired ? (
          <>
            <Divider />
            <ListRow icon="megaphone-outline" title={t('settings.adPrivacy')} onPress={() => safe(showPrivacyOptions(), 'ad_privacy')} />
          </>
        ) : null}
        <Divider />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacyDetails')} onPress={() => router.push('/settings/privacy')} />
        {links.privacyPolicy ? (
          <>
            <Divider />
            <ListRow icon="open-outline" title={t('privacy.fullPolicy')} onPress={() => safe(Linking.openURL(links.privacyPolicy as string), 'privacy_url')} />
          </>
        ) : null}
      </Card>

      <SectionHeader title={t('settings.storage')} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="folder-outline" title={t('settings.outputs')} subtitle={usage ? t('settings.outputsUsage', { count: usage.files, size: fmt.size(usage.bytes) }) : '…'} />
        <Divider />
        <ListRow
          icon="sparkles-outline"
          title={t('settings.clearTemp')}
          subtitle={t('settings.clearTempHint')}
          onPress={() => safe(clearTemporaryFiles().then(() => setMessage(t('settings.tempCleared'))), 'clear_temp')}
        />
        <Divider />
        <ListRow icon="trash-outline" title={t('settings.deleteAll')} subtitle={t('settings.deleteAllHint')} onPress={confirmDeleteAll} testID="delete-all" />
      </Card>

      <Text variant="caption" tone="subtle" center>
        {t('settings.version', { name: appManifest.name, version: Constants.expoConfig?.version ?? appManifest.version })}
      </Text>
    </Screen>
  );
}
