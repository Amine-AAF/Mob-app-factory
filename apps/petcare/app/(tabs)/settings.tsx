import { Badge, Card, Chip, ListRow, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ToggleRow } from '@/components/fields';
import { repos } from '@/database';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { adsState, showPrivacyOptions } from '@/services/ads';
import { setAnalyticsConsent } from '@/services/analytics';
import { syncNotifications } from '@/services/notifications';
import { CURRENCIES, usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const prefs = usePreferences();
  const isPremium = useIsPremium();

  return (
    <Screen>
      <Text variant="title">{t('tabs.settings')}</Text>

      <Card tone={isPremium ? 'accent' : 'primary'} onPress={() => router.push('/paywall?source=settings')} accessibilityLabel={t('premium.title')}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('premium.title')}</Text>
          <Badge label={t(isPremium ? 'premium.active' : 'premium.free')} tone={isPremium ? 'success' : 'neutral'} />
        </Row>
        <Text variant="bodySmall" tone="muted">
          {t(isPremium ? 'premium.thanks' : 'premium.pitch')}
        </Text>
      </Card>

      <Card>
        <SectionHeader title={t('settings.language')} />
        <Row wrap gap={2}>
          {INTERFACE_LANGUAGES.map((l) => (
            <Chip
              key={l}
              label={LANGUAGE_NAMES[l]}
              selected={i18n.language === l}
              onPress={async () => {
                await i18n.changeLanguage(l);
                prefs.set({ interfaceLanguage: l });
                // Scheduled reminder texts follow the new language.
                syncNotifications(repos(), i18n.t).catch(() => undefined);
              }}
              testID={`lang-${l}`}
            />
          ))}
        </Row>
        <SectionHeader title={t('settings.theme')} />
        <Row wrap gap={2}>
          {(['system', 'light', 'dark'] as const).map((th) => (
            <Chip key={th} label={t(`settings.themes.${th}`)} selected={prefs.theme === th} onPress={() => prefs.set({ theme: th })} />
          ))}
        </Row>
        <SectionHeader title={t('settings.weightUnit')} />
        <Row gap={2}>
          {(['kg', 'lb'] as const).map((u) => (
            <Chip key={u} label={u} selected={prefs.weightUnit === u} onPress={() => prefs.set({ weightUnit: u })} />
          ))}
        </Row>
        <SectionHeader title={t('settings.currency')} />
        <Row wrap gap={2}>
          {[...new Set([prefs.currency, ...CURRENCIES])].map((c) => (
            <Chip key={c} label={c} selected={prefs.currency === c} onPress={() => prefs.set({ currency: c })} />
          ))}
        </Row>
      </Card>

      <Card>
        <ListRow icon="notifications-outline" title={t('settings.notifications')} subtitle={t('settings.notificationsHint')} onPress={() => router.push('/settings/notifications')} testID="open-notifications" />
        <ListRow icon="server-outline" title={t('settings.data')} subtitle={t('settings.dataHint')} onPress={() => router.push('/settings/data')} />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/privacy')} />
        {adsState().privacyOptionsRequired ? <ListRow icon="options-outline" title={t('settings.adChoices')} onPress={showPrivacyOptions} /> : null}
      </Card>

      <Card>
        <ToggleRow
          label={t('settings.analytics')}
          help={t('settings.analyticsHelp')}
          value={prefs.analyticsConsent}
          onChange={(v) => {
            prefs.set({ analyticsConsent: v });
            setAnalyticsConsent(v);
          }}
        />
      </Card>

      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('disclaimer.full')}
        </Text>
      </Card>
      <Text variant="caption" tone="subtle" center>
        PetCare {Constants.expoConfig?.version ?? ''}
      </Text>
    </Screen>
  );
}
