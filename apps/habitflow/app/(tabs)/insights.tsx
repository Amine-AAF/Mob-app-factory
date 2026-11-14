import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, EmptyState, Icon, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarChart, StatisticsCard } from '@/components/charts';
import { AdBanner, HabitIcon, PremiumTag } from '@/components/ui';
import { FREE_LIMITS, REWARDED_INSIGHTS_HOURS } from '@/constants';
import { loadSnapshot, repos } from '@/database';
import { buildInsights } from '@/features/statistics/insights';
import { overview } from '@/features/statistics/stats';
import { useAsync, useRewardedAd, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { rewardedAvailable } from '@/services/ads';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const pct = (r: number | null) => (r === null ? '—' : fmt.percent(r));

export default function InsightsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = useToday();
  const premium = useIsPremium();
  const unlockedUntil = usePreferences((s) => s.insightsUnlockedUntil);
  const advanced = premium || unlockedUntil > clock.now().getTime();
  const rewarded = useRewardedAd(!advanced && rewardedAvailable(premium));

  const { data } = useAsync(async () => {
    const snapshot = await loadSnapshot(repos().db);
    return { o: overview(snapshot, today), hasHabits: snapshot.habits.length > 0 };
  }, [today]);

  if (data && !data.hasHabits) {
    return (
      <Screen>
        <Text variant="title">{t('insights.title')}</Text>
        <EmptyState icon="stats-chart-outline" title={t('insights.emptyTitle')} message={t('insights.emptyBody')} />
      </Screen>
    );
  }
  const o = data?.o;
  const insights = o ? buildInsights(o) : [];
  const weeks = o ? (advanced ? o.weeks : o.weeks.slice(-FREE_LIMITS.insightsWeeks)) : [];
  const delta = o && o.thisWeek !== null && o.lastWeek !== null ? Math.round((o.thisWeek - o.lastWeek) * 100) : null;

  return (
    <Screen testID="insights-screen">
      <Text variant="title">{t('insights.title')}</Text>
      {o ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <StatisticsCard icon="today-outline" label={t('insights.daily')} value={pct(o.dailyRate)} />
            <StatisticsCard icon="calendar-outline" label={t('insights.weekly')} value={pct(o.weeklyRate)} tone="accent" />
            <StatisticsCard icon="calendar-number-outline" label={t('insights.monthly')} value={pct(o.monthlyRate)} tone="success" />
            <StatisticsCard icon="checkmark-done-outline" label={t('insights.total')} value={fmt.number(o.totalCompletions)} tone="warning" />
          </View>

          {o.bestCurrentStreak ? (
            <Card tone="alt">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="flame" size={28} color={theme.colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{t(`streak.${o.bestCurrentStreak.streak.unit}`, { count: o.bestCurrentStreak.streak.current })}</Text>
                  <Text variant="caption" tone="muted">
                    {t('insights.bestStreak', { name: o.bestCurrentStreak.habit.name })}
                  </Text>
                </View>
              </View>
            </Card>
          ) : null}

          <Card>
            <Text variant="subheading">{t('insights.last7')}</Text>
            <BarChart
              summary={t('insights.last7')}
              data={o.last7.map((d) => ({ label: fmt.weekdayNarrow(fromDayKey(d.day)), value: d.expected ? d.ratio : null, highlight: d.day === today }))}
            />
          </Card>

          {insights.length ? (
            <Stack gap={2}>
              <SectionHeader title={t('insights.observations')} />
              {insights.map((i) => (
                <Card key={i.key} tone={i.tone === 'positive' ? 'primary' : 'default'}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Icon name={i.tone === 'positive' ? 'trending-up' : i.tone === 'encourage' ? 'compass-outline' : 'information-circle-outline'} size={20} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={{ flex: 1 }}>
                      {t(i.key, i.params)}
                    </Text>
                  </View>
                </Card>
              ))}
            </Stack>
          ) : null}

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="subheading">{t('insights.weeks', { count: weeks.length })}</Text>
              {delta !== null ? (
                <Text variant="caption" tone={delta >= 0 ? 'success' : 'warning'}>
                  {t('insights.vsLastWeek', { delta: `${delta >= 0 ? '+' : ''}${delta}` })}
                </Text>
              ) : null}
            </View>
            <BarChart summary={t('insights.weeks', { count: weeks.length })} data={weeks.map((w, i) => ({ label: fmt.shortDay(fromDayKey(w.start)).replace(/\s.*/, ''), value: w.rate, highlight: i === weeks.length - 1 }))} />
          </Card>

          <Stack gap={2}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="heading">{t('insights.byHabit')}</Text>
              {!advanced ? <PremiumTag /> : null}
            </View>
            {advanced ? (
              o.ranking.length ? (
                o.ranking.map((r, idx) => (
                  <Card key={r.habit.id} onPress={() => router.push({ pathname: '/habit/[id]', params: { id: r.habit.id } })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text variant="caption" tone="subtle" style={{ width: 18 }}>{`${idx + 1}`}</Text>
                      <HabitIcon icon={r.habit.icon} color={r.habit.color} size={30} />
                      <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                        {r.habit.name}
                      </Text>
                      <Text variant="subheading" tone={r.rate >= 0.7 ? 'success' : r.rate < 0.4 ? 'warning' : 'default'}>
                        {fmt.percent(r.rate)}
                      </Text>
                    </View>
                    <Text variant="caption" tone="muted">
                      {t('insights.habitLine', { best: r.stats.streak.best, total: r.stats.totalCompleted, month: pct(r.stats.monthlyRate) })}
                    </Text>
                  </Card>
                ))
              ) : (
                <Text variant="bodySmall" tone="muted">
                  {t('insights.notEnoughData')}
                </Text>
              )
            ) : (
              <Card tone="alt">
                <Text variant="bodySmall" tone="muted">
                  {t('insights.lockedBody')}
                </Text>
                <Button label={t('insights.unlockPremium')} icon="diamond-outline" size="md" onPress={() => router.push({ pathname: '/paywall', params: { source: 'insights' } })} />
                {rewarded.ready ? (
                  <Button
                    label={t('insights.watchAd', { hours: REWARDED_INSIGHTS_HOURS })}
                    icon="play-circle-outline"
                    variant="ghost"
                    size="md"
                    onPress={() => void rewarded.show(() => usePreferences.getState().set({ insightsUnlockedUntil: clock.now().getTime() + REWARDED_INSIGHTS_HOURS * 3_600_000 }))}
                  />
                ) : null}
              </Card>
            )}
          </Stack>
          <Text variant="caption" tone="subtle">
            {t('insights.disclaimer', { from: fmt.shortDay(fromDayKey(addDays(today, -29))) })}
          </Text>
        </>
      ) : null}
      <AdBanner />
    </Screen>
  );
}
