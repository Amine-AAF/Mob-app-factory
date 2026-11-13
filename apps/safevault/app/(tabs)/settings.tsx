import { Badge, Card, Divider, ListRow, Screen, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { fmt } from '@/i18n';
import { useApp } from '@/store/app';
import { lockVault } from '@/store/vault';

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const entitlement = useApp((s) => s.entitlement);
  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('settings.title')}
      </Text>
      <Card onPress={() => router.push('/paywall')} tone={entitlement.isPremium ? 'accent' : 'primary'}>
        <Text variant="subheading">{entitlement.isPremium ? t('premium.active') : t('premium.title')}</Text>
        <Text variant="bodySmall" tone="muted">
          {entitlement.isPremium
            ? entitlement.expiresAt
              ? t('premium.renews', { date: fmt.date(new Date(entitlement.expiresAt).getTime()) })
              : t('premium.lifetime')
            : t('premium.pitch')}
        </Text>
        {!entitlement.isPremium ? <Badge label={t('premium.badge')} tone="accent" icon="sparkles" /> : null}
      </Card>
      <Card>
        <ListRow icon="shield-checkmark" title={t('settings.security.title')} subtitle={t('settings.security.subtitle')} onPress={() => router.push('/settings/security')} />
        <Divider />
        <ListRow icon="cloud-download" title={t('backup.title')} subtitle={t('backup.subtitle')} onPress={() => router.push('/settings/backup')} />
        <Divider />
        <ListRow icon="color-palette" title={t('settings.appearance.title')} subtitle={t('settings.appearance.subtitle')} onPress={() => router.push('/settings/appearance')} />
        <Divider />
        <ListRow icon="information-circle" title={t('about.title')} subtitle={t('about.subtitle')} onPress={() => router.push('/settings/about')} />
      </Card>
      <Card>
        <ListRow icon="lock-closed" title={t('vault.lockNow')} onPress={lockVault} />
      </Card>
    </Screen>
  );
}
