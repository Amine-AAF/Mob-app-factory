import { addDays } from '@factory/app-core';
import { Button, Card, ProgressBar, Row, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { quizPacks } from '@/content';
import { repos } from '@/database';
import { activitySeries, categoryAccuracy, mockImprovement, mockTrend } from '@/features/progress/stats';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

import { BarChart } from './charts';

const DAYS = 14;

/** Advanced statistics (Premium). Free users see what they would unlock, without fake data. */
export function AdvancedStats() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const today = clock.today();

  const { data } = useAsync(async () => {
    if (!isPremium) return null;
    const [rows, itemStats, mocks] = await Promise.all([
      repos().activity.range(addDays(today, -(DAYS - 1)), today),
      repos().review.itemStats(),
      repos().practice.listMocks(100),
    ]);
    const quizzes = quizPacks.flatMap((p) => p.core);
    return { series: activitySeries(rows, today, DAYS), accuracy: categoryAccuracy(itemStats, quizzes), trend: mockTrend(mocks) };
  }, [today, isPremium]);

  if (!isPremium) {
    return (
      <>
        <SectionHeader title={t('stats.title')} />
        <Card tone="accent">
          <Stack gap={2}>
            <Text>{t('stats.lockedBody')}</Text>
            <Button label={t('paywall.cta')} icon="diamond-outline" variant="secondary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'advanced_stats' } })} />
          </Stack>
        </Card>
      </>
    );
  }

  if (!data) return null;
  const total = data.series.reduce((s, p) => s + p.total, 0);
  const activeDays = data.series.filter((p) => p.total > 0).length;
  const improvement = mockImprovement(data.trend);
  const first = data.series[0];
  const last = data.series[data.series.length - 1];

  return (
    <>
      <SectionHeader title={t('stats.title')} />
      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('stats.activityTitle', { count: DAYS })}</Text>
          <BarChart
            values={data.series.map((p) => p.total)}
            labels={first && last ? [fmt.date(new Date(`${first.day}T12:00:00`), { day: 'numeric', month: 'short' }), fmt.date(new Date(`${last.day}T12:00:00`), { day: 'numeric', month: 'short' })] : undefined}
            accessibilityLabel={t('stats.activitySummary', { total, days: activeDays })}
          />
          <Text variant="caption" tone="muted">
            {t('stats.activitySummary', { total, days: activeDays })}
          </Text>
        </Stack>
      </Card>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('stats.accuracyTitle')}</Text>
          {data.accuracy.length ? (
            data.accuracy.map((c) => (
              <Stack key={c.category} gap={1}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="bodySmall">{t(`categories.${c.category}`)}</Text>
                  <Text variant="bodySmall" tone="muted">
                    {Math.round(c.accuracy * 100)}% · {c.correct}/{c.answered}
                  </Text>
                </Row>
                <ProgressBar progress={c.accuracy} tone={c.accuracy < 0.6 ? 'accent' : 'success'} label={t(`categories.${c.category}`)} />
              </Stack>
            ))
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('stats.accuracyEmpty')}
            </Text>
          )}
          {data.accuracy[0] && data.accuracy[0].accuracy < 0.6 ? (
            <Button label={t('stats.practiseWeakest', { category: t(`categories.${data.accuracy[0].category}`) })} variant="ghost" onPress={() => router.push({ pathname: '/quiz', params: { category: data.accuracy[0]!.category } })} />
          ) : null}
        </Stack>
      </Card>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('stats.mockTitle')}</Text>
          {data.trend.length ? (
            <>
              <BarChart values={data.trend.map((p) => p.score)} accessibilityLabel={t('stats.mockSummary', { count: data.trend.length })} height={60} />
              <Text variant="caption" tone="muted">
                {t('stats.mockSummary', { count: data.trend.length })}
                {improvement !== null ? ` · ${t('stats.mockImprovement', { value: improvement > 0 ? `+${improvement}` : String(improvement) })}` : ''}
              </Text>
            </>
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('stats.mockEmpty')}
            </Text>
          )}
        </Stack>
      </Card>
    </>
  );
}
