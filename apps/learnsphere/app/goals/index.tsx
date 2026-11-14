import { addDays } from '@factory/app-core';
import { Button, Icon, ProgressBar, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Panel } from '@/components/ui';
import { ACHIEVEMENTS } from '@/content/achievements';
import { repos } from '@/database';
import { achievementProgress } from '@/features/goals/achievements';
import { goalProgress } from '@/features/goals/goals';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

export default function Goals() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = clock.today();
  const { data } = useAsync(async () => {
    const r = repos();
    const [goals, activity, stats, unlocked, subjects] = await Promise.all([r.goals.list(false), r.goals.activity(addDays(today, -400)), r.goals.achievementStats(), r.goals.unlockedAchievements(), r.subjects.list('all')]);
    return { goals, activity, stats, unlocked, subjects };
  }, []);
  useEffect(() => {
    void repos().goals.markAchievementsSeen();
  }, []);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  const unlocked = new Map(data.unlocked.map((u) => [u.id, u]));
  const challenges = data.goals.filter((g) => g.period === 'challenge');
  const regular = data.goals.filter((g) => g.period !== 'challenge');

  const goalRow = (g: (typeof data.goals)[number]) => {
    const p = goalProgress(g, data.activity, today);
    const subject = g.subjectId ? data.subjects.find((s) => s.id === g.subjectId) : undefined;
    const ended = g.period === 'challenge' && g.endDay != null && g.endDay < today;
    return (
      <Pressable key={g.id} onPress={() => router.push({ pathname: '/goals/edit', params: { id: g.id } })} accessibilityRole="button" accessibilityLabel={g.title || t(`goals.metrics.${g.metric}`)} style={{ opacity: g.active ? 1 : 0.5, gap: 6 }}>
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Text>{g.title || t(`goals.metrics.${g.metric}`)}</Text>
            <Text variant="caption" tone="subtle">
              {t(`goals.periods.${g.period}`)}
              {subject ? ` · ${subject.name}` : ''}
              {g.period === 'challenge' && g.endDay ? ` · ${t('goals.until', { date: fmt.day(g.endDay) })}` : ''}
              {!g.active ? ` · ${t('goals.paused')}` : ''}
            </Text>
          </View>
          <Text variant="bodySmall" tone={p.met ? 'success' : 'muted'}>
            {g.metric === 'minutes' ? `${fmt.duration(p.value)} / ${fmt.duration(g.target)}` : `${p.value} / ${g.target}`}
          </Text>
        </Row>
        <ProgressBar progress={p.ratio} tone={p.met ? 'success' : 'primary'} label={g.title || t(`goals.metrics.${g.metric}`)} />
        {p.met ? (
          <Text variant="caption" tone="success">
            {t(ended ? 'goals.challengeWon' : 'goals.met')}
          </Text>
        ) : ended ? (
          <Text variant="caption" tone="subtle">
            {t('goals.challengeEnded')}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('goals.title') }} />
      <Text variant="bodySmall" tone="muted">
        {t('goals.philosophy')}
      </Text>
      <Panel title={t('goals.myGoals')} icon="flag-outline">
        {regular.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('goals.none')}
          </Text>
        ) : (
          regular.map(goalRow)
        )}
        <Button size="md" variant="secondary" icon="add" label={t('goals.add')} onPress={() => router.push('/goals/edit')} testID="add-goal" />
      </Panel>
      <Panel title={t('goals.challenges')} icon="trophy-outline">
        <Text variant="caption" tone="subtle">
          {t('goals.challengesHelp')}
        </Text>
        {challenges.map(goalRow)}
        <Button size="md" variant="secondary" icon="add" label={t('goals.addChallenge')} onPress={() => router.push({ pathname: '/goals/edit', params: { challenge: '1' } })} />
      </Panel>
      <Panel title={t('achievements.title')} icon="ribbon-outline">
        <Text variant="caption" tone="subtle">
          {t('achievements.count', { unlocked: data.unlocked.length, total: ACHIEVEMENTS.length })}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const u = unlocked.get(a.id);
            const progress = achievementProgress(a, data.stats);
            return (
              <View
                key={a.id}
                accessible
                accessibilityLabel={`${t(`achievements.items.${a.id}.title`)}. ${t(`achievements.items.${a.id}.desc`)}. ${u ? t('achievements.unlockedOn', { date: fmt.dateTime(u.unlockedAt) }) : fmt.percent(progress)}`}
                style={{ width: '30%', flexGrow: 1, alignItems: 'center', gap: 6, padding: 10, borderRadius: theme.radius.md, backgroundColor: u ? theme.colors.accentSoft : theme.colors.surfaceAlt }}
              >
                <Icon name={a.icon as IconName} size={28} color={u ? theme.colors.accent : theme.colors.textSubtle} />
                <Text variant="caption" center numberOfLines={2} style={{ fontWeight: '700' }}>
                  {t(`achievements.items.${a.id}.title`)}
                </Text>
                {!u ? (
                  <Stack style={{ width: '100%' }}>
                    <ProgressBar progress={progress} height={4} label={t(`achievements.items.${a.id}.title`)} />
                  </Stack>
                ) : null}
              </View>
            );
          })}
        </View>
      </Panel>
    </Screen>
  );
}
