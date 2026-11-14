import { resolveLanguage } from '@factory/localization';
import { getLocales } from 'expo-localization';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { CURRENCIES, type Currency } from '@/domain/catalog';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { adsState, onAdsStateChange, showPrivacyOptions } from '@/services/ads';
import { recordError, setAnalyticsConsent } from '@/services/analytics';
import { afterWrite, updateSettings } from '@/services/data';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSettings } from '@/store/session';
import { Button, Card, ChoiceChips, Divider, Icon, ListRow, PALETTES, PALETTE_NAMES, PressableScale, Row, Screen, SectionHeader, Segmented, Stack, SwitchRow, Text, useTheme, type PaletteName } from '@/ui';

type LanguageChoice = InterfaceLanguage | 'device';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const settings = useSettings();
  const isPremium = useIsPremium();
  const [ads, setAds] = useState(adsState());
  useEffect(() => onAdsStateChange(() => setAds(adsState())), []);

  const setLanguage = (choice: LanguageChoice | null) => {
    if (!choice) return;
    const persisted = choice === 'device' ? null : choice;
    prefs.set({ interfaceLanguage: persisted });
    const lng = persisted ?? resolveLanguage(null, getLocales().map((l) => l.languageCode), INTERFACE_LANGUAGES, 'en');
    i18n
      .changeLanguage(lng)
      // Scheduled reminders are re-created so their texts follow the new language.
      .then(() => afterWrite({ notifications: true }))
      .catch((e: unknown) => recordError(e, 'change_language'));
  };

  const save = async (patch: Parameters<typeof updateSettings>[0]) => {
    try {
      await updateSettings(patch);
      afterWrite({ notifications: true });
    } catch (e) {
      recordError(e, 'settings_update');
      Alert.alert(t('common.error'));
    }
  };

  const pickPalette = (name: PaletteName) => {
    if (PALETTES[name].premium && !isPremium) {
      router.push({ pathname: '/paywall', params: { source: 'themes' } });
      return;
    }
    prefs.set({ palette: name });
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.title') }} />

      <SectionHeader title={t('settings.language.title')} />
      <ChoiceChips<LanguageChoice>
        options={[{ value: 'device', label: t('settings.language.device') }, ...INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))]}
        value={prefs.interfaceLanguage ?? 'device'}
        onChange={setLanguage}
      />

      <SectionHeader title={t('settings.theme.title')} />
      <Segmented
        options={[
          { value: 'system', label: t('settings.theme.system'), icon: 'phone-portrait-outline' },
          { value: 'light', label: t('settings.theme.light'), icon: 'sunny-outline' },
          { value: 'dark', label: t('settings.theme.dark'), icon: 'moon-outline' },
        ]}
        value={prefs.theme}
        onChange={(theme) => prefs.set({ theme })}
      />

      <SectionHeader title={t('settings.palette.title')} />
      <Row gap={2} wrap>
        {PALETTE_NAMES.map((name) => (
          <PaletteSwatch key={name} name={name} selected={prefs.palette === name} locked={PALETTES[name].premium && !isPremium} onPress={() => pickPalette(name)} />
        ))}
      </Row>
      {!isPremium ? (
        <Text variant="caption" tone="subtle">
          {t('settings.palette.premiumHint')}
        </Text>
      ) : null}

      <SectionHeader title={t('settings.currency.title')} />
      <ChoiceChips<Currency> options={CURRENCIES.map((c) => ({ value: c, label: c }))} value={settings.currency as Currency} onChange={(c) => c && void save({ currency: c })} />
      <Text variant="caption" tone="subtle">
        {t('settings.currency.hint')}
      </Text>

      <SectionHeader title={t('settings.hemisphere.title')} />
      <Segmented
        options={[
          { value: 'north', label: t('settings.hemisphere.north') },
          { value: 'south', label: t('settings.hemisphere.south') },
        ]}
        value={settings.hemisphere}
        onChange={(hemisphere) => void save({ hemisphere })}
      />
      <Text variant="caption" tone="subtle">
        {t('settings.hemisphere.hint')}
      </Text>

      <SectionHeader title={t('settings.privacy.title')} />
      <Card style={{ paddingVertical: 0, gap: 0 }}>
        <SwitchRow
          title={t('settings.privacy.analytics')}
          subtitle={t('settings.privacy.analyticsHint')}
          value={prefs.analyticsConsent}
          onChange={(v) => {
            prefs.set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
      </Card>
      {ads.privacyOptionsRequired ? <Button variant="secondary" icon="shield-outline" label={t('settings.privacy.adChoices')} onPress={() => void showPrivacyOptions()} /> : null}

      <SectionHeader title={t('settings.more')} />
      <Card style={{ paddingVertical: 0, gap: 0 }}>
        <ListRow icon="notifications-outline" title={t('settings.links.notifications')} onPress={() => router.push('/settings/notifications')} />
        <Divider />
        <ListRow icon="pricetags-outline" title={t('settings.links.taxonomy')} onPress={() => router.push('/settings/taxonomy')} />
        <Divider />
        <ListRow icon="cloud-download-outline" title={t('settings.links.data')} onPress={() => router.push('/settings/data')} />
        <Divider />
        <ListRow icon="shield-checkmark-outline" title={t('settings.links.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Card>
    </Screen>
  );
}

function PaletteSwatch({ name, selected, locked, onPress }: { name: PaletteName; selected: boolean; locked: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const p = PALETTES[name];
  const label = t(`settings.palette.names.${name}`);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={locked ? `${label}, ${t('common.premium.badge')}` : label}
      style={{
        width: 96,
        padding: theme.spacing(2),
        borderRadius: theme.radius.md,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        gap: theme.spacing(1.5),
      }}
    >
      <Row gap={0}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: p.primary, borderWidth: 1, borderColor: theme.colors.border }} />
        <View style={{ width: 26, height: 26, borderRadius: 13, marginLeft: -8, backgroundColor: p.accent, borderWidth: 1, borderColor: theme.colors.border }} />
      </Row>
      <Stack gap={0} style={{ alignItems: 'center' }}>
        <Row gap={1}>
          {locked ? <Icon name="lock-closed" size={11} color={theme.colors.textSubtle} /> : null}
          <Text variant="caption" numberOfLines={1}>
            {label}
          </Text>
        </Row>
      </Stack>
    </PressableScale>
  );
}
