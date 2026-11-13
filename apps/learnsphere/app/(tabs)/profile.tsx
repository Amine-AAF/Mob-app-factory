import { Badge, Divider, Icon, ListRow, Row, Screen, Stat, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { Panel } from '@/components/ui';
import { repos } from '@/database';
import { learningStreak } from '@/features/stats/stats';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function Profile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const name = usePreferences((s) => s.learnerName);
  const { data } = useAsync(async () => {
    const r = repos();
    const [stats, days, unlocked] = await Promise.all([r.goals.achievementStats(), r.goals.activeDays(), r.goals.unlockedAchievements()]);
    return { stats, streak: learningStreak(days, clock.today()), badges: unlocked.length, newBadges: unlocked.filter((u) => !u.seen).length };
  }, []);

  return (
    <Screen testID="profile-screen">
      <Row gap={3}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="title" tone="primary">
            {(name || 'L').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title">{name || t('home.learner')}</Text>
          {isPremium ? <Badge label={t('premium.active')} tone="accent" icon="sparkles" /> : <Badge label={t('premium.free')} tone="neutral" />}
        </View>
      </Row>
      <Row gap={3}>
        <Stat value={fmt.number(data?.streak.current ?? 0)} label={t('stats.streak')} icon="flame-outline" tone="accent" />
        <Stat value={fmt.duration(data?.stats.totalMinutes ?? 0)} label={t('profile.totalTime')} icon="time-outline" />
        <Stat value={fmt.number(data?.badges ?? 0)} label={t('achievements.title')} icon="ribbon-outline" tone="success" />
      </Row>
      {!isPremium ? (
        <Panel title={t('premium.title')} icon="sparkles-outline" action={t('premium.learnMore')} onAction={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })}>
          <Text variant="bodySmall" tone="muted">
            {t('premium.pitch')}
          </Text>
        </Panel>
      ) : null}
      <Panel title={t('profile.progress')} icon="trending-up-outline">
        <ListRow icon="stats-chart-outline" title={t('stats.title')} onPress={() => router.push('/stats')} />
        <Divider />
        <ListRow icon="ribbon-outline" title={t('goals.title')} subtitle={data?.newBadges ? t('achievements.new', { count: data.newBadges }) : undefined} onPress={() => router.push('/goals')} />
        <Divider />
        <ListRow icon="time-outline" title={t('planner.history')} onPress={() => router.push('/planner/history')} />
      </Panel>
      <Panel title={t('profile.tools')} icon="construct-outline">
        <ListRow icon="timer-outline" title={t('focus.title')} onPress={() => router.push('/focus')} />
        <Divider />
        <ListRow icon="alarm-outline" title={t('agenda.title')} onPress={() => router.push('/agenda')} />
        <Divider />
        <ListRow icon="help-circle-outline" title={t('quiz.title')} onPress={() => router.push('/quiz')} />
        <Divider />
        <ListRow icon="document-text-outline" title={t('notes.title')} onPress={() => router.push('/notes')} />
        <Divider />
        <ListRow icon="copy-outline" title={t('templates.title')} onPress={() => router.push('/templates')} />
      </Panel>
      <Panel title={t('settings.title')} icon="settings-outline">
        <ListRow icon="options-outline" title={t('settings.general')} onPress={() => router.push('/settings')} />
        <Divider />
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} />
        <Divider />
        <ListRow icon="server-outline" title={t('settings.data')} onPress={() => router.push('/settings/data')} />
        <Divider />
        <ListRow icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      </Panel>
      <Row gap={2} style={{ justifyContent: 'center' }}>
        <Icon name="lock-closed-outline" size={14} color={theme.colors.textSubtle} />
        <Text variant="caption" tone="subtle">
          {t('profile.localOnly')}
        </Text>
      </Row>
      <AdBanner />
    </Screen>
  );
}
