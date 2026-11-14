import { Badge, Card, Divider, Icon, ListRow, Row, Screen, SectionHeader, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useLeaf } from '@/components/leaf';
import { useData } from '@/hooks/useData';
import { useIsPremium } from '@/store/session';

export default function Profile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const isPremium = useIsPremium();
  const { data } = useData(async (r) => ({ plants: await r.plants.count(), locations: await r.locations.count(), wishlist: (await r.wishlist.list()).filter((w) => w.status === 'wishlist').length }));

  return (
    <Screen testID="profile-screen">
      <Text variant="title" accessibilityRole="header">
        {t('profile.title')}
      </Text>
      <Card tone={isPremium ? 'primary' : 'accent'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} accessibilityLabel={t('premium.title')}>
        <Row gap={3}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={22} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{isPremium ? t('premium.active') : t('premium.title')}</Text>
            <Text variant="bodySmall" tone="muted">
              {isPremium ? t('premium.activeBody') : t('premium.teaser')}
            </Text>
          </View>
          {isPremium ? <Badge label={t('premium.badge')} tone="success" /> : <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
        </Row>
      </Card>

      <SectionHeader title={t('profile.myGarden')} />
      <Card>
        <ListRow icon="grid-outline" title={t('garden.title')} subtitle={t('profile.locationsCount', { count: data?.locations ?? 0 })} onPress={() => router.push('/garden')} />
        <Divider />
        <ListRow icon="heart-outline" title={t('wishlist.title')} subtitle={t('profile.wishlistCount', { count: data?.wishlist ?? 0 })} onPress={() => router.push('/wishlist')} />
        <Divider />
        <ListRow icon="partly-sunny-outline" title={t('seasonal.title')} onPress={() => router.push('/seasonal')} />
        <Divider />
        <ListRow icon="stats-chart-outline" title={t('stats.title')} subtitle={t('profile.plantsCount', { count: data?.plants ?? 0 })} onPress={() => router.push('/stats')} />
        <Divider />
        <ListRow icon="medkit-outline" title={t('healthGuide.title')} onPress={() => router.push('/health-guide')} />
      </Card>

      <SectionHeader title={t('settings.title')} />
      <Card>
        <ListRow icon="options-outline" title={t('settings.preferences')} subtitle={t('settings.preferencesHint')} onPress={() => router.push('/settings/preferences')} />
        <Divider />
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} testID="open-notification-settings" />
        <Divider />
        <ListRow icon="cloud-download-outline" title={t('settings.data')} subtitle={t('settings.dataHint')} onPress={() => router.push('/settings/data')} />
        <Divider />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Card>
      <Text variant="caption" tone="subtle" center>
        {t('profile.footer')}
      </Text>
    </Screen>
  );
}
