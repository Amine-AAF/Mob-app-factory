import { Badge, Card, Icon, ListRow, Row, Screen, SectionHeader, Text, useTheme, type ThemePreference } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ChoiceChips, SelectField } from '@/components/forms';
import { AdBanner } from '@/components/ui';
import { BRAND_CHOICES } from '@/config/brand';
import { repos } from '@/database';
import { COMMON_CURRENCIES } from '@/domain/money';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { syncNotifications } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const isPremium = useIsPremium();

  return (
    <Screen>
      <Text variant="title">{t('settings.title')}</Text>

      <Card tone={isPremium ? 'primary' : 'accent'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })}>
        <Row gap={3}>
          <Icon name="diamond" size={22} color={theme.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{isPremium ? t('settings.premiumActive') : t('settings.goPremium')}</Text>
            <Text variant="bodySmall" tone="muted">
              {isPremium ? t('settings.premiumThanks') : t('settings.premiumPitch')}
            </Text>
          </View>
          {isPremium ? <Badge label="Premium" tone="success" /> : <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
        </Row>
      </Card>

      <SectionHeader title={t('settings.appearance')} />
      <Card>
        <ChoiceChips
          label={t('settings.language')}
          value={(prefs.interfaceLanguage ?? i18n.language) as (typeof INTERFACE_LANGUAGES)[number]}
          options={INTERFACE_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          onChange={(l) => {
            prefs.set({ interfaceLanguage: l });
            i18n
              .changeLanguage(l)
              .then(() => syncNotifications(repos(), i18n.t))
              .catch(() => undefined);
          }}
        />
        <ChoiceChips<ThemePreference>
          label={t('settings.theme')}
          value={prefs.theme}
          onChange={(v) => prefs.set({ theme: v })}
          options={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t(`settings.themes.${v}`) }))}
        />
        <Text variant="label" tone="muted">
          {t('settings.colors')}
        </Text>
        <Row gap={3} wrap>
          {BRAND_CHOICES.map((c) => {
            const selected = (prefs.accent ?? 'plum') === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => prefs.set({ accent: c.id === 'plum' ? null : c.id })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t(`settings.palette.${c.id}`)}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, borderWidth: selected ? 3 : 0, borderColor: theme.colors.text, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.accent }} />
              </Pressable>
            );
          })}
        </Row>
        <SelectField label={t('settings.defaultCurrency')} value={prefs.defaultCurrency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => prefs.set({ defaultCurrency: c })} searchable icon="cash-outline" />
      </Card>

      <SectionHeader title={t('settings.general')} />
      <Card>
        <ListRow icon="notifications-outline" title={t('settings.notifications')} subtitle={prefs.notificationsEnabled ? t('common.on') : t('common.off')} onPress={() => router.push('/settings/notifications')} />
        <ListRow icon="albums-outline" title={t('templates.title')} onPress={() => router.push('/templates')} />
        <ListRow icon="server-outline" title={t('settings.data')} subtitle={t('settings.dataHint')} onPress={() => router.push('/settings/data')} testID="settings-data" />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Card>

      <Text variant="caption" tone="subtle" center>
        {`Eventora ${Constants.expoConfig?.version ?? ''} · ${t('settings.offline')}`}
      </Text>
      <AdBanner />
    </Screen>
  );
}
