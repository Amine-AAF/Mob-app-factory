import { Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner, HabitIcon, StreakBadge } from '@/components/ui';
import { FREE_LIMITS } from '@/constants';
import { loadSnapshot, repos } from '@/database';
import { describeFrequencyKey, scheduleOn } from '@/features/habits/schedule';
import { habitStats } from '@/features/statistics/stats';
import { indexLogs } from '@/features/tracking/progress';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

export default function HabitsScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const premium = useIsPremium();
  const [showArchived, setShowArchived] = useState(false);

  const { data } = useAsync(async () => {
    const snapshot = await loadSnapshot(repos().db);
    const idx = indexLogs(snapshot.logs);
    return snapshot.habits.map((h) => ({ habit: h, stats: habitStats(h, idx, today) }));
  }, [today]);

  const active = (data ?? []).filter((d) => !d.habit.archivedOn || d.habit.archivedOn > today);
  const archived = (data ?? []).filter((d) => d.habit.archivedOn && d.habit.archivedOn <= today);
  const atLimit = !premium && active.length >= FREE_LIMITS.activeHabits;

  const create = (path: '/habit/edit' | '/templates') => (atLimit ? router.push({ pathname: '/paywall', params: { source: 'habit_limit' } }) : router.push(path));

  return (
    <Screen testID="habits-screen">
      <Text variant="title">{t('habits.title')}</Text>
      <Row gap={3}>
        <View style={{ flex: 1 }}>
          <Button label={t('habits.new')} icon="add" size="md" onPress={() => create('/habit/edit')} testID="new-habit" />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('habits.templates')} icon="albums-outline" variant="secondary" size="md" onPress={() => create('/templates')} />
        </View>
      </Row>
      {!premium ? (
        <Text variant="caption" tone={atLimit ? 'warning' : 'subtle'}>
          {atLimit ? t('habits.limitReached', { max: FREE_LIMITS.activeHabits }) : t('habits.freeCount', { count: active.length, max: FREE_LIMITS.activeHabits })}
        </Text>
      ) : null}

      {data && active.length === 0 ? <EmptyState icon="sparkles-outline" title={t('habits.emptyTitle')} message={t('habits.emptyBody')} /> : null}

      <Stack gap={3}>
        {active.map(({ habit, stats }) => {
          const s = scheduleOn(habit, today < habit.startDate ? habit.startDate : today) ?? habit.schedules.at(-1);
          const freq = s ? describeFrequencyKey(s.frequency) : null;
          return (
            <Card key={habit.id} onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })} accessibilityLabel={habit.name} testID={`habit-row-${habit.id}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <HabitIcon icon={habit.icon} color={habit.color} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="subheading" numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {[freq ? t(freq.key, freq.params) : null, t(`categories.${habit.category}`), habit.startDate > today ? t('habits.startsOn', { date: habit.startDate }) : null].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <StreakBadge count={stats.streak.current} unit={stats.streak.unit} compact />
                  <Text variant="caption" tone="muted">
                    {stats.completionRate === null ? '—' : fmt.percent(stats.completionRate)}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </Stack>

      {archived.length ? (
        <Stack gap={3}>
          <SectionHeader title={t('habits.archived', { count: archived.length })} action={showArchived ? t('common.hide') : t('common.show')} onAction={() => setShowArchived((v) => !v)} />
          {showArchived
            ? archived.map(({ habit }) => (
                <Card key={habit.id} tone="alt" onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.7 }}>
                    <HabitIcon icon={habit.icon} color={habit.color} size={32} />
                    <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                      {habit.name}
                    </Text>
                  </View>
                </Card>
              ))
            : null}
        </Stack>
      ) : null}
      <AdBanner />
    </Screen>
  );
}
