import { fromDayKey } from '@factory/app-core';
import { Badge, Button, Card, CodeLabel, FadeIn, Icon, IconButton, ProgressBar, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { LessonCard, WeeklyBars } from '@/components/learning';
import { repos } from '@/database';
import { loadDashboard } from '@/features/dashboard/loadDashboard';
import { canAccessLesson } from '@/features/learning/recommendations';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium, useSession } from '@/store/session';

function greetingKey(hour: number): string {
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const profile = useSession((s) => s.profile);
  const isPremium = useIsPremium();
  const { data } = useAsync(() => loadDashboard(repos(), profile, isPremium, clock.now()), [profile, isPremium]);

  const greeting = t(greetingKey(clock.now().getHours()));
  const openLesson = (id: string, premium: boolean) => (canAccessLesson({ premium }, isPremium) ? router.push(`/lesson/${id}`) : router.push({ pathname: '/paywall', params: { source: 'home_lesson' } }));

  return (
    <Screen testID="home-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <CodeLabel>{fmt.date(clock.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</CodeLabel>
          <Text variant="title" accessibilityRole="header">
            {profile?.displayName ? t('home.greetingName', { greeting, name: profile.displayName }) : greeting}
          </Text>
        </Stack>
        <IconButton icon="settings-outline" label={t('home.settings')} onPress={() => router.push('/settings')} />
      </Row>

      {!data ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <FadeIn>
            <Card tone="primary" style={{ gap: 12 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="label" tone="primary">
                  {t('home.dailyGoal')}
                </Text>
                <Badge label={t('home.level', { level: data.level.level })} tone="primary" icon="ribbon-outline" />
              </Row>
              <Text variant="heading">{data.goalProgress >= 1 ? t('home.goalReached') : t('home.dailyGoalProgress', { current: data.stats.todayXp, goal: data.goal })}</Text>
              <ProgressBar progress={data.goalProgress} tone={data.goalProgress >= 1 ? 'success' : 'primary'} height={10} label={t('home.dailyGoal')} />
              <Row gap={2}>
                <Icon name="flame" size={18} color={data.stats.currentStreak > 0 ? theme.colors.warning : theme.colors.textSubtle} />
                <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                  {data.stats.currentStreak > 0 ? t('home.streak', { count: data.stats.currentStreak }) : t('home.noStreak')}
                </Text>
              </Row>
            </Card>
          </FadeIn>

          <Row gap={3}>
            <Stat icon="checkmark-done-outline" value={fmt.number(data.stats.lessonsCompleted)} label={t('home.lessonsDone')} tone="success" />
            <Stat icon="albums-outline" value={fmt.number(data.stats.wordsLearned)} label={t('home.wordsLearned')} tone="accent" />
            <Stat icon="flash-outline" value={fmt.number(data.stats.totalXp)} label="XP" tone="primary" />
          </Row>

          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="subheading">{t('home.overall')}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('home.overallValue', { done: data.stats.lessonsCompleted, total: data.totalLessons })}
              </Text>
            </Row>
            <ProgressBar progress={data.totalLessons ? data.stats.lessonsCompleted / data.totalLessons : 0} tone="accent" label={t('home.overall')} />
          </Card>

          {data.resume ? (
            <Stack gap={2}>
              <SectionHeader title={t('home.continue')} />
              <LessonCard lesson={data.resume} status={data.statuses.get(data.resume.id)} locked={!canAccessLesson(data.resume, isPremium)} onPress={() => openLesson(data.resume!.id, data.resume!.premium)} />
            </Stack>
          ) : null}

          {data.challenge ? (
            <Card tone="accent" onPress={() => router.push('/challenge')} accessibilityLabel={t('home.dailyChallenge')} testID="daily-challenge-card">
              <Row>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={data.challengeDone ? 'checkmark-circle' : 'flash'} size={22} color={theme.colors.accent} />
                </View>
                <Stack gap={1} style={{ flex: 1 }}>
                  <Text variant="subheading">{t('home.dailyChallenge')}</Text>
                  <Text variant="bodySmall" tone="muted" numberOfLines={2}>
                    {data.challengeDone ? t('home.dailyChallengeDone') : data.challenge.objective}
                  </Text>
                  {!data.challengeDone ? (
                    <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
                      {t('home.dailyChallengeCta', { xp: 30 })}
                    </Text>
                  ) : null}
                </Stack>
                <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
              </Row>
            </Card>
          ) : null}

          <Stack gap={2}>
            <SectionHeader title={t('home.recommended')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/learn')} />
            {data.recommended.map((l) => (
              <LessonCard key={l.id} lesson={l} status={data.statuses.get(l.id)} locked={!canAccessLesson(l, isPremium)} onPress={() => openLesson(l.id, l.premium)} />
            ))}
          </Stack>

          <Card>
            <Text variant="subheading">{t('home.weeklyActivity')}</Text>
            <WeeklyBars days={data.week.map((d) => ({ label: fmt.weekday(fromDayKey(d.day)), xp: d.xp, isToday: d.day === data.today }))} />
          </Card>

          {!isPremium ? <Button label={t('practice.unlimited')} variant="secondary" icon="diamond-outline" onPress={() => router.push({ pathname: '/paywall', params: { source: 'home' } })} /> : null}
        </>
      )}
    </Screen>
  );
}
