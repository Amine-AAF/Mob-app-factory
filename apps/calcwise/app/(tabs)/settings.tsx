import { Badge, Button, Card, Chip, Divider, Icon, ListRow, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, Switch, View } from 'react-native';

import { Segmented } from '@/components/fields';
import { links, PALETTE_IDS, PALETTES } from '@/constants/theme';
import { DEFAULT_FAVORITES } from '@/constants/tools';
import { deleteAllUserData, repos } from '@/database';
import { deviceLocale, resolveNumberLocale } from '@/hooks/useFormat';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { recordError, setAnalyticsConsent } from '@/services/analytics';
import { resetLocalEntitlement, restore, subscriptionsConfigured } from '@/services/monetization';
import { usePreferences, type NumberFormatPreference } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';
import { Dec } from '@/utils/decimal';
import { formatDecimal, getSeparators } from '@/utils/numberFormat';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'CHF', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN', 'ARS', 'COP', 'SAR', 'AED', 'XOF', 'TND', 'DZD'];
const NUMBER_FORMATS: NumberFormatPreference[] = ['auto', 'en-US', 'fr-FR', 'de-DE', 'de-CH'];

function ToggleRow({ title, subtitle, value, onChange, testID }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  const theme = useTheme();
  return <ListRow title={title} subtitle={subtitle} right={<Switch value={value} onValueChange={onChange} accessibilityLabel={title} testID={testID} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />} />;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const isPremium = useIsPremium();
  const entitlement = useSession((s) => s.entitlement);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const device = deviceLocale();
  const sample = new Dec('1234567.89');

  const setLanguage = (lng: InterfaceLanguage | null) => {
    prefs.set({ interfaceLanguage: lng });
    const target = lng ?? (INTERFACE_LANGUAGES as readonly string[]).find((l) => device.tag.toLowerCase().startsWith(l)) ?? 'en';
    i18n.changeLanguage(target).catch((e) => recordError(e, 'change_language'));
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      const state = await restore(repos().db);
      setMessage(state?.isPremium ? t('paywall.restored') : state ? t('paywall.nothingToRestore') : t('paywall.unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const deleteEverything = () =>
    Alert.alert(t('settings.deleteTitle'), t('settings.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAllUserData(repos().db);
            await repos().favorites.seed(DEFAULT_FAVORITES);
            resetLocalEntitlement();
            const keepOnboarding = { onboardingCompleted: true, interfaceLanguage: prefs.interfaceLanguage, sessionCount: prefs.sessionCount };
            prefs.reset();
            prefs.set(keepOnboarding);
            setAnalyticsConsent(false);
            useSession.getState().bump();
            setMessage(t('settings.deleted'));
          } catch (e) {
            recordError(e, 'delete_all');
          }
        },
      },
    ]);

  return (
    <Screen testID="settings-screen">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.settings')}
      </Text>

      {/* Premium */}
      <Card tone={isPremium ? 'accent' : 'default'}>
        <Row gap={3}>
          <Icon name="diamond" size={22} color={theme.colors.accent} />
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="subheading">{isPremium ? t('settings.premiumActive') : t('settings.premiumFree')}</Text>
            {isPremium && entitlement.expiresAt ? (
              <Text variant="caption" tone="muted">
                {t('paywall.activeUntil', { date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(entitlement.expiresAt)) })}
              </Text>
            ) : isPremium ? (
              <Text variant="caption" tone="muted">
                {t('settings.premiumLifetime')}
              </Text>
            ) : null}
          </Stack>
        </Row>
        {!isPremium ? <Button label={t('premium.unlockCta')} size="md" onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })} testID="settings-premium" /> : null}
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button label={t('paywall.restore')} variant="secondary" size="md" loading={busy} disabled={!subscriptionsConfigured()} onPress={doRestore} />
          </View>
          {isPremium && entitlement.expiresAt ? (
            <View style={{ flex: 1 }}>
              <Button label={t('paywall.manage')} variant="secondary" size="md" onPress={() => Linking.openURL(links.manageSubscriptions)} />
            </View>
          ) : null}
        </Row>
        {message ? (
          <Text variant="caption" tone="primary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
      </Card>

      {/* Appearance */}
      <SectionHeader title={t('settings.appearance')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('settings.theme')}
        </Text>
        <Segmented
          testID="theme"
          value={prefs.theme}
          onChange={(theme) => prefs.set({ theme })}
          options={[
            { value: 'system', label: t('settings.themes.system') },
            { value: 'light', label: t('settings.themes.light') },
            { value: 'dark', label: t('settings.themes.dark') },
          ]}
        />
        <Text variant="bodySmall" tone="muted">
          {t('settings.palette')}
        </Text>
        <Row gap={3} wrap>
          {PALETTE_IDS.map((id) => {
            const p = PALETTES[id];
            const locked = p.premium && !isPremium;
            const selected = prefs.palette === id;
            return (
              <Pressable
                key={id}
                testID={`palette-${id}`}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: locked }}
                accessibilityLabel={`${t(`settings.palettes.${id}`)}${locked ? `, ${t('premium.badge')}` : ''}`}
                onPress={() => (locked ? router.push({ pathname: '/paywall', params: { source: 'palette' } }) : prefs.set({ palette: id }))}
                style={{ alignItems: 'center', gap: 4 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: selected ? 3 : 1, borderColor: selected ? theme.colors.text : theme.colors.border, overflow: 'hidden', flexDirection: 'row' }}>
                  <View style={{ flex: 1, backgroundColor: p.primary }} />
                  <View style={{ flex: 1, backgroundColor: p.accent }} />
                </View>
                <Row gap={1}>
                  {locked ? <Icon name="lock-closed" size={10} color={theme.colors.textSubtle} /> : null}
                  <Text variant="caption" tone="muted">
                    {t(`settings.palettes.${id}`)}
                  </Text>
                </Row>
              </Pressable>
            );
          })}
        </Row>
      </Card>

      {/* Language & formats */}
      <SectionHeader title={t('settings.languageAndFormats')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('settings.language')}
        </Text>
        <Row gap={2} wrap>
          <Chip label={t('settings.deviceLanguage')} selected={prefs.interfaceLanguage === null} onPress={() => setLanguage(null)} testID="lang-device" />
          {INTERFACE_LANGUAGES.map((lng) => (
            <Chip key={lng} label={LANGUAGE_NAMES[lng]} selected={prefs.interfaceLanguage === lng} onPress={() => setLanguage(lng)} testID={`lang-${lng}`} />
          ))}
        </Row>
        <Divider />
        <Text variant="bodySmall" tone="muted">
          {t('settings.numberFormat')}
        </Text>
        <Stack gap={2}>
          {NUMBER_FORMATS.map((nf) => {
            const tag = nf === 'auto' ? device.tag : nf;
            return (
              <Chip
                key={nf}
                testID={`format-${nf}`}
                label={`${nf === 'auto' ? t('settings.deviceFormat') : t(`settings.formats.${nf}`)} — ${formatDecimal(sample, tag)}`}
                selected={prefs.numberFormat === nf}
                onPress={() => prefs.set({ numberFormat: nf })}
              />
            );
          })}
        </Stack>
        <Divider />
        <Text variant="bodySmall" tone="muted">
          {t('settings.currency')}
        </Text>
        <Row gap={2} wrap>
          <Chip label={t('settings.deviceCurrency', { code: device.currency })} selected={prefs.currency === null} onPress={() => prefs.set({ currency: null })} testID="currency-device" />
          {CURRENCIES.filter((c) => c !== device.currency).map((c) => (
            <Chip key={c} label={c} selected={prefs.currency === c} onPress={() => prefs.set({ currency: c })} testID={`currency-${c}`} />
          ))}
        </Row>
        <Text variant="caption" tone="subtle">
          {t('settings.currencyHint')}
        </Text>
      </Card>

      {/* Calculator */}
      <SectionHeader title={t('settings.calculator')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('settings.angleUnit')}
        </Text>
        <Segmented
          testID="angle"
          value={prefs.angleMode}
          onChange={(angleMode) => prefs.set({ angleMode })}
          options={[
            { value: 'deg', label: t('calc.degrees') },
            { value: 'rad', label: t('calc.radians') },
          ]}
        />
        <ToggleRow title={t('settings.haptics')} value={prefs.haptics} onChange={(haptics) => prefs.set({ haptics })} testID="haptics" />
        <Text variant="bodySmall" tone="muted">
          {t('settings.defaultVat')}
        </Text>
        <Row gap={2} wrap>
          {['0', '5', '5.5', '7', '10', '15', '16', '19', '20', '21'].map((v) => (
            <Chip key={v} label={`${v.replace('.', getSeparators(resolveNumberLocale(prefs.numberFormat)).decimal)} %`} selected={prefs.defaultVat === v} onPress={() => prefs.set({ defaultVat: v })} />
          ))}
        </Row>
        <Text variant="bodySmall" tone="muted">
          {t('settings.defaultTip')}
        </Text>
        <Row gap={2} wrap>
          {['0', '10', '15', '18', '20'].map((v) => (
            <Chip key={v} label={`${v} %`} selected={prefs.defaultTip === v} onPress={() => prefs.set({ defaultTip: v })} />
          ))}
        </Row>
      </Card>

      {/* Privacy */}
      <SectionHeader title={t('settings.privacy')} />
      <Card>
        <ToggleRow
          title={t('settings.analytics')}
          subtitle={t('settings.analyticsHint')}
          value={prefs.analyticsConsent}
          onChange={(v) => {
            prefs.set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
          testID="analytics-consent"
        />
        {adsState().privacyOptionsRequired ? <ListRow icon="shield-checkmark-outline" title={t('settings.adPrivacy')} onPress={() => showPrivacyOptions()} /> : null}
        <ListRow icon="document-text-outline" title={t('settings.privacySummary')} onPress={() => router.push('/privacy')} testID="privacy-summary" />
        {links.privacyPolicy ? <ListRow icon="open-outline" title={t('settings.privacyPolicy')} onPress={() => Linking.openURL(links.privacyPolicy as string)} /> : null}
        {links.terms ? <ListRow icon="open-outline" title={t('settings.terms')} onPress={() => Linking.openURL(links.terms as string)} /> : null}
        <Divider />
        <Button label={t('settings.deleteAll')} variant="danger" size="md" icon="trash-outline" onPress={deleteEverything} testID="delete-all" />
      </Card>

      <Row style={{ justifyContent: 'center' }} gap={2}>
        <Badge label={`CalcWise ${Constants.expoConfig?.version ?? ''}`} tone="neutral" />
        <Text variant="caption" tone="subtle">
          {t('settings.offline')}
        </Text>
      </Row>
    </Screen>
  );
}
