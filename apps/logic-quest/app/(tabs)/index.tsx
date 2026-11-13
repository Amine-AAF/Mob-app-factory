import { Badge, Card, Icon, IconButton, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AchievementBadge, AdBanner, LevelCard, Reveal, SectionTitle } from '@/components/ui';
import { CHALLENGES } from '@/content';
import { repos } from '@/database';
import { CATEGORIES, describeChallenge } from '@/engine';
import { useAsync, useContentT } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { dailyFor } from '@/services/dailyService';
import { CATEGORY_META } from '@/theme/game';

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const ct = useContentT();
  const today = clock.today();
  const { data } = useAsync(async () => {
    const r = repos();
    const [stats, daily, last, unlocked] = await Promise.all([r.progress.stats(today), r.progress.getDaily(today), r.progress.lastSession(), r.progress.unlockedAchievements()]);
    return { stats, daily, last, recent: [...unlocked.entries()].sort((a, b) => b[1].localeCompare(a[1])).slice(0, 3) };
  }, [today]);

  const dailyChallenge = dailyFor(today);
  const dailyText = describeChallenge(dailyChallenge.challenge, ct);
  const solved = data?.stats.solvedTotal ?? 0;

  const continueGame = () => {
    const last = data?.last;
    if (!last) return router.push('/mode/sequence');
    router.push({ pathname: '/game', params: { mode: last.mode === 'timed' ? 'standard' : last.mode, category: last.category, difficulty: last.difficulty, timer: String(last.timeLimitS) } });
  };

  return (
    <Screen testID="home">
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={0}>
          <Text variant="label" tone="accent">
            {t('app.name')}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {t('home.greeting')}
          </Text>
        </Stack>
        <IconButton icon="settings-outline" label={t('settings.title')} onPress={() => router.push('/settings')} />
      </Row>

      <Reveal>
        <LevelCard totalXp={data?.stats.totalXp ?? 0} streak={data?.stats.currentStreak ?? 0} onPress={() => router.push('/(tabs)/stats')} />
      </Reveal>

      <Reveal delay={60}>
        <Card onPress={() => router.push('/daily')} accessibilityLabel={`${t('daily.title')}: ${dailyText.title}`} testID="daily-card" style={{ borderColor: theme.colors.accent, borderWidth: 1.5 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={2}>
              <Icon name="calendar" size={20} color={theme.colors.accent} />
              <Text variant="label" tone="accent">
                {t('daily.title')}
              </Text>
            </Row>
            {data?.daily ? (
              <Badge label={data.daily.status === 'completed' ? t('daily.done') : t('daily.missed')} tone={data.daily.status === 'completed' ? 'success' : 'neutral'} icon={data.daily.status === 'completed' ? 'checkmark' : 'close'} />
            ) : (
              <Badge label={t(`difficulty.${dailyChallenge.challenge.difficulty}`)} tone="accent" />
            )}
          </Row>
          <Text variant="heading">{dailyText.title}</Text>
          <Text variant="bodySmall" tone="muted">
            {data?.daily ? t('daily.comeBack') : t('daily.cta', { category: t(`category.${dailyChallenge.challenge.category}.name`) })}
          </Text>
        </Card>
      </Reveal>

      <Card onPress={continueGame} tone="alt" accessibilityLabel={t('home.continue')} testID="continue">
        <Row style={{ justifyContent: 'space-between' }}>
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="subheading">{data?.last ? t('home.continue') : t('home.startFirst')}</Text>
            <Text variant="bodySmall" tone="muted">
              {data?.last ? t('home.continueDesc', { category: data.last.category === 'mixed' ? t('category.mixed.name') : t(`category.${data.last.category}.name`) }) : t('home.startFirstDesc')}
            </Text>
          </Stack>
          <Icon name="play-circle" size={36} color={theme.colors.primary} />
        </Row>
      </Card>

      <SectionTitle icon="apps-outline">{t('home.modes')}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {CATEGORIES.map((c) => (
          <Card key={c} onPress={() => router.push(`/mode/${c}`)} style={{ width: '47%' }} accessibilityLabel={t(`category.${c}.name`)} testID={`mode-${c}`}>
            <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}>
              <Icon name={CATEGORY_META[c].icon} size={22} color={CATEGORY_META[c][theme.scheme]} />
            </View>
            <Text variant="subheading">{t(`category.${c}.name`)}</Text>
            <Text variant="caption" tone="muted">
              {t('home.solvedOf', { solved: data?.stats.solvedByCategory[c] ?? 0, total: CHALLENGES.filter((x) => x.category === c).length })}
            </Text>
          </Card>
        ))}
      </View>

      <SectionTitle icon="pulse-outline">{t('home.progress')}</SectionTitle>
      <Row gap={2}>
        <Stat icon="checkmark-done" value={fmt.number(solved)} label={t('stats.solved')} />
        <Stat icon="trending-up" value={fmt.percent(data?.stats.successRate ?? 0)} label={t('stats.successRate')} tone="success" />
        <Stat icon="flame" value={fmt.number(data?.stats.bestStreak ?? 0)} label={t('stats.bestStreak')} tone="warning" />
      </Row>

      <SectionTitle icon="trophy-outline">{t('home.recentAchievements')}</SectionTitle>
      {data?.recent.length ? (
        <Card onPress={() => router.push('/(tabs)/awards')}>
          {data.recent.map(([id, at]) => (
            <AchievementBadge key={id} id={id} unlockedAt={at} />
          ))}
        </Card>
      ) : (
        <Text variant="bodySmall" tone="muted">
          {t('home.noAchievements')}
        </Text>
      )}

      <AdBanner />
    </Screen>
  );
}
