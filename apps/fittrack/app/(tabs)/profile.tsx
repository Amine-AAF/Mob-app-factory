import { Card, ListRow, Row, Screen, SectionHeader, Text, useTheme, Icon } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useData } from '@/hooks';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Profile: Premium, goals & challenges, tools, settings, data & privacy. */
export default function Profile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const level = usePreferences((s) => s.level);
  const goal = usePreferences((s) => s.goal);
  const weekly = usePreferences((s) => s.weeklyTarget);
  const { data: badges } = useData((r) => r.goals.achievements());
  return (
    <Screen testID="profile">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.profile')}
      </Text>
      <Card tone="primary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} accessibilityLabel={premium ? t('profile.premiumActive') : t('profile.goPremium')}>
        <Row gap={2}>
          <Icon name="star" size={22} color={theme.colors.primary} />
          <Text variant="subheading" style={{ flex: 1 }}>
            {premium ? t('profile.premiumActive') : t('profile.goPremium')}
          </Text>
        </Row>
        <Text variant="bodySmall" tone="muted">
          {premium ? t('profile.premiumThanks') : t('profile.premiumPitch')}
        </Text>
      </Card>
      <Card>
        <ListRow icon="person-outline" title={t('profile.myProfile')} subtitle={`${t(`levels.${level}`)} · ${t(`goals.${goal}`)} · ${t('profile.perWeek', { count: weekly })}`} onPress={() => router.push('/settings/preferences')} />
        <ListRow icon="flag-outline" title={t('goals.title')} subtitle={t('profile.badges', { count: badges?.size ?? 0 })} onPress={() => router.push('/goals')} />
        <ListRow icon="timer-outline" title={t('tools.title')} onPress={() => router.push('/tools')} />
        <ListRow icon="time-outline" title={t('history.title')} onPress={() => router.push('/history')} />
      </Card>
      <SectionHeader title={t('profile.settings')} />
      <Card>
        <ListRow icon="options-outline" title={t('settings.preferences')} subtitle={t('settings.preferencesSub')} onPress={() => router.push('/settings/preferences')} testID="open-preferences" />
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} />
        <ListRow icon="server-outline" title={t('settings.data')} subtitle={t('settings.dataSub')} onPress={() => router.push('/settings/data')} />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
        <ListRow icon="information-circle-outline" title={t('settings.about')} subtitle={t('settings.aboutSub')} onPress={() => router.push('/settings/about')} />
      </Card>
    </Screen>
  );
}
