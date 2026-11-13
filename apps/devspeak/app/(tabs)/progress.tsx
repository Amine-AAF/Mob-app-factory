import { addDays, fromDayKey, levelFromXp, startOfWeek } from '@factory/app-core';
import { Button, Card, CodeLabel, Icon, ProgressBar, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { modules } from '@/content';
import { repos } from '@/database';
import { ACHIEVEMENTS } from '@/features/progress/achievements';
import { monthGrid, WEEKLY_ACTIVE_DAYS_GOAL } from '@/features/progress/calendar';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

export default function Progress() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { data } = useAsync(async () => {
    const now = clock.now();
    const [stats, achievements, lessons] = await Promise.all([repos().progress.getStats(now), repos().progress.achievements(), repos().content.listLessons()]);
    return { stats, achievements, lessons };
  }, []);

  const today = clock.today();
  const grid = useMemo(() => monthGrid(today), [today]);
  if (!data) return <ActivityIndicator style={{ marginTop: 80 }} color={theme.colors.primary} />;

  const { stats } = data;
  const level = levelFromXp(stats.totalXp);
  const active = new Set(stats.activeDays);
  const weekStart = startOfWeek(today);
  const weekActive = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter((d) => active.has(d)).length;
  const unlocked = new Set(data.achievements.map((a) => a.id));
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => fmt.weekday(fromDayKey(addDays(weekStart, i))));

  return (
    <Screen>
      <Stack gap={1}>
        <CodeLabel>progress</CodeLabel>
        <Text variant="title" accessibilityRole="header">
          {t('progress.title')}
        </Text>
      </Stack>

      <Card tone="primary">
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="heading">{t('home.level', { level: level.level })}</Text>
          <Text variant="subheading" tone="primary">
            {fmt.number(stats.totalXp)} XP
          </Text>
        </Row>
        <ProgressBar progress={level.progress} height={10} label={t('progress.toNextLevel', { count: level.xpForNext - level.xpIntoLevel, level: level.level + 1 })} />
        <Text variant="caption" tone="muted">
          {t('progress.toNextLevel', { count: level.xpForNext - level.xpIntoLevel, level: level.level + 1 })}
        </Text>
      </Card>

      <Row gap={3}>
        <Stat icon="flame" tone="warning" value={t('progress.days', { count: stats.currentStreak })} label={t('progress.currentStreak')} />
        <Stat icon="trophy-outline" tone="accent" value={t('progress.days', { count: stats.longestStreak })} label={t('progress.longestStreak')} />
      </Row>
      <Row gap={3}>
        <Stat icon="checkmark-done-outline" tone="success" value={fmt.number(stats.lessonsCompleted)} label={t('home.lessonsDone')} />
        <Stat icon="albums-outline" tone="primary" value={fmt.number(stats.wordsLearned)} label={t('home.wordsLearned')} />
      </Row>

      <Card>
        <Text variant="subheading">{t('progress.weeklyGoal')}</Text>
        <Text variant="bodySmall" tone="muted">
          {weekActive >= WEEKLY_ACTIVE_DAYS_GOAL ? t('progress.weeklyGoalReached') : t('progress.weeklyGoalValue', { done: weekActive, goal: WEEKLY_ACTIVE_DAYS_GOAL })}
        </Text>
        <ProgressBar progress={weekActive / WEEKLY_ACTIVE_DAYS_GOAL} tone="success" label={t('progress.weeklyGoal')} />
      </Card>

      <Card>
        <Text variant="subheading">{t('progress.calendar')}</Text>
        <Text variant="caption" tone="muted">
          {fmt.date(fromDayKey(today), { month: 'long', year: 'numeric' })}
        </Text>
        <Row style={{ justifyContent: 'space-between' }}>
          {weekdayLabels.map((w, i) => (
            <Text key={i} variant="caption" tone="subtle" center style={{ width: `${100 / 7}%` }}>
              {w}
            </Text>
          ))}
        </Row>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {grid.map((day, i) => {
            const on = day ? active.has(day) : false;
            const isToday = day === today;
            return (
              <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }} accessible={!!day} accessibilityLabel={day ? `${day}${on ? ' ✓' : ''}` : undefined}>
                {day ? (
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? theme.colors.accent : theme.colors.surfaceAlt,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: theme.colors.primary,
                    }}
                  >
                    <Text variant="caption" style={{ color: on ? (theme.scheme === 'dark' ? '#06140F' : '#FFFFFF') : theme.colors.textMuted, fontWeight: '700' }}>
                      {fromDayKey(day).getDate()}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title={t('progress.advancedStats')} />
      {isPremium ? (
        <Card>
          {modules.map((m) => {
            const total = data.lessons.filter((l) => l.moduleId === m.id).length;
            const done = stats.lessonsByModule[m.id];
            return (
              <Stack key={m.id} gap={1} style={{ paddingVertical: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                    {t(`modules.${m.id}`)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {done}/{total}
                  </Text>
                </Row>
                <ProgressBar progress={total ? done / total : 0} />
              </Stack>
            );
          })}
          <Row style={{ justifyContent: 'space-between', paddingTop: 8 }}>
            <Text variant="bodySmall">{t('progress.accuracy')}</Text>
            <Text variant="bodySmall" style={{ fontWeight: '700' }}>
              {stats.averageQuizScore == null ? '—' : `${stats.averageQuizScore}%`}
            </Text>
          </Row>
          {(
            [
              ['progress.cardsDue', stats.cardsDueToday],
              ['progress.challenges', stats.challengesCompleted],
              ['progress.speaking', stats.speakingDone],
              ['progress.favorites', stats.favorites],
            ] as const
          ).map(([k, v]) => (
            <Row key={k} style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall">{t(k)}</Text>
              <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                {fmt.number(v)}
              </Text>
            </Row>
          ))}
        </Card>
      ) : (
        <Card tone="alt">
          <Text variant="bodySmall">{t('progress.advancedStatsLocked')}</Text>
          <Button label={t('paywall.subscribe')} variant="secondary" size="md" icon="diamond-outline" onPress={() => router.push({ pathname: '/paywall', params: { source: 'progress' } })} />
        </Card>
      )}

      <SectionHeader title={t('progress.achievements')} />
      <Text variant="caption" tone="muted">
        {t('progress.unlocked', { done: unlocked.size, total: ACHIEVEMENTS.length })}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id);
          const p = a.progress(stats);
          return (
            <Card key={a.id} style={{ width: '47.8%', opacity: on ? 1 : 0.85 }} tone={on ? 'accent' : 'default'} accessibilityLabel={`${t(`achievements.${a.id}`)}: ${t(`achievements.${a.id}_desc`)}`}>
              <Icon name={a.icon} size={24} color={on ? theme.colors.accent : theme.colors.textSubtle} />
              <Text variant="subheading">{t(`achievements.${a.id}`)}</Text>
              <Text variant="caption" tone="muted">
                {t(`achievements.${a.id}_desc`)}
              </Text>
              {!on ? <ProgressBar progress={p} height={5} /> : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
