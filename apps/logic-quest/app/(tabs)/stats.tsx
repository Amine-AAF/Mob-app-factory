import { Button, Card, Icon, ProgressBar, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner, Bars, LevelCard, SectionTitle } from '@/components/ui';
import { repos } from '@/database';
import { CATEGORIES, DIFFICULTIES } from '@/engine';
import { useAsync } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';
import { CATEGORY_META } from '@/theme/game';

/** Statistics computed from the recorded history. Advanced breakdowns are a Premium feature. */
export default function Stats() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const today = clock.today();
  const { data: s } = useAsync(() => repos().progress.stats(today), [today]);

  return (
    <Screen testID="stats">
      <Text variant="title" accessibilityRole="header">
        {t('stats.title')}
      </Text>
      <LevelCard totalXp={s?.totalXp ?? 0} streak={s?.currentStreak ?? 0} />
      <Row gap={2}>
        <Stat icon="game-controller" value={fmt.number(s?.gamesCompleted ?? 0)} label={t('stats.games')} />
        <Stat icon="trending-up" value={fmt.percent(s?.successRate ?? 0)} label={t('stats.successRate')} tone="success" />
      </Row>
      <Row gap={2}>
        <Stat icon="star" value={fmt.number(s?.totalXp ?? 0)} label={t('stats.totalXp')} tone="accent" />
        <Stat icon="flame" value={fmt.number(s?.bestStreak ?? 0)} label={t('stats.bestStreak')} tone="warning" />
      </Row>
      <Row gap={2}>
        <Stat icon="checkmark-done" value={fmt.number(s?.solvedTotal ?? 0)} label={t('stats.solved')} />
        <Stat icon="calendar" value={fmt.number(s?.dailyCompleted ?? 0)} label={t('stats.dailies')} tone="accent" />
      </Row>

      <SectionTitle icon="analytics-outline">{t('stats.advanced')}</SectionTitle>
      {isPremium ? (
        <>
          <Card>
            <Text variant="subheading">{t('stats.weekly')}</Text>
            <Bars data={(s?.weekly ?? []).map((w) => ({ label: fmt.weekday(fromDayKey(w.day)), value: w.xp }))} format={(v) => fmt.number(v)} />
          </Card>
          <Card>
            <Text variant="subheading">{t('stats.byCategory')}</Text>
            {CATEGORIES.map((c) => {
              const perf = s?.categoryPerformance[c] ?? { answered: 0, correct: 0 };
              const rate = perf.answered ? perf.correct / perf.answered : 0;
              return (
                <Stack key={c} gap={1} style={{ paddingVertical: 4 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row gap={2}>
                      <Icon name={CATEGORY_META[c].icon} size={16} color={CATEGORY_META[c][theme.scheme]} />
                      <Text variant="bodySmall">{t(`category.${c}.name`)}</Text>
                    </Row>
                    <Text variant="caption" tone="muted">
                      {perf.answered ? t('stats.rateOf', { rate: fmt.percent(rate), count: perf.answered }) : t('stats.notPlayed')}
                    </Text>
                  </Row>
                  <ProgressBar progress={rate} height={6} tone="success" label={t(`category.${c}.name`)} />
                </Stack>
              );
            })}
          </Card>
          <Card>
            <Text variant="subheading">{t('stats.byDifficulty')}</Text>
            <Bars data={DIFFICULTIES.map((d) => ({ label: t(`difficulty.${d}`), value: s?.difficultyDistribution[d] ?? 0 }))} tone="accent" />
          </Card>
        </>
      ) : (
        <Card tone="alt" testID="stats-locked">
          <Row gap={3}>
            <Icon name="lock-closed" size={22} color={theme.colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">{t('stats.lockedTitle')}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('stats.lockedBody')}
              </Text>
            </View>
          </Row>
          <Button label={t('paywall.cta')} icon="diamond" size="md" onPress={() => router.push({ pathname: '/paywall', params: { source: 'stats' } })} />
        </Card>
      )}
      <AdBanner />
    </Screen>
  );
}
