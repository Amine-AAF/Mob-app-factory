import { Button, Chip, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, View } from 'react-native';

import { AdBanner } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { Bars, Metric, Page, Paper, ProgressLine, Section } from '@/components/ui';
import { bestPeriods, monthlySeries, overview, personalRecords, shareSummary, weeklyMinutes, yearlyComparison } from '@/features/statistics/stats';
import { useData, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { loadStatsInput } from '@/services/statsService';
import { useIsPremium } from '@/store/session';

export default function Stats() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const premium = useIsPremium();
  const [year, setYear] = useState<number | null>(Number(today.slice(0, 4)));
  const [metric, setMetric] = useState<'books' | 'pages' | 'minutes'>('books');
  const { data: input } = useData((r) => loadStatsInput(r), [today]);
  if (!input) return <Page>{null}</Page>;

  const o = overview(input, year);
  const years = yearlyComparison(input);
  const shownYear = year ?? Number(today.slice(0, 4));
  const months = monthlySeries(input, shownYear);
  const periods = bestPeriods(input);
  const records = personalRecords(input);
  const weeks = weeklyMinutes(input, 12);

  const share = () =>
    Share.share({ message: shareSummary(o, shownYear, { minutes: (s) => fmt.duration(s) }, (k, p) => t(k, p ?? {})) });

  const Locked = ({ title }: { title: string }) => (
    <Paper tone="alt" onPress={() => router.push({ pathname: '/paywall', params: { source: 'advanced_stats' } })} accessibilityLabel={title}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Icon name="lock-closed" size={18} color={theme.colors.accent} />
        <Text style={{ fontWeight: '600', flex: 1 }}>{title}</Text>
        <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
          {t('premium.badge')}
        </Text>
      </View>
    </Paper>
  );

  return (
    <Page edges={['bottom']} testID="stats">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip label={t('stats.allTime')} selected={year == null} onPress={() => setYear(null)} />
        {(years.length ? years.map((y) => y.year) : [Number(today.slice(0, 4))]).map((y) => (
          <Chip key={y} label={String(y)} selected={year === y} onPress={() => setYear(y)} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Metric icon="book" value={fmt.integer(o.booksRead)} label={t('stats.booksRead')} sub={o.booksRead !== o.booksReadDistinct ? t('stats.withRereads', { count: o.booksRead - o.booksReadDistinct }) : undefined} />
        <Metric icon="document-text" value={o.pagesRead != null ? fmt.integer(o.pagesRead) : null} label={t('stats.pagesRead')} sub={o.pagesRead == null ? t('stats.noPageData') : o.finishedWithoutPages ? t('stats.excludedNoPages', { count: o.finishedWithoutPages }) : undefined} />
        <Metric icon="time" value={o.readingSeconds != null ? fmt.duration(o.readingSeconds) : null} label={t('stats.readingTime')} sub={o.readingSeconds == null ? t('stats.noSessions') : t('stats.fromSessions', { count: o.sessionCount })} />
        <Metric icon="calendar" value={o.avgBooksPerMonth != null ? fmt.number(o.avgBooksPerMonth) : null} label={t('stats.perMonth')} />
        <Metric icon="checkmark-done" value={fmt.integer(o.booksRead)} label={t('stats.completed')} />
        <Metric icon="close-circle" value={fmt.integer(o.abandoned)} label={t('stats.abandoned')} />
      </View>
      <Text variant="caption" tone="subtle">
        {t('stats.honesty')}
      </Text>

      <Section title={t('stats.genres')}>
        {o.topGenres.length ? (
          o.topGenres.map((g) => (
            <View key={g.name} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                  {g.name}
                </Text>
                <Text variant="caption" tone="subtle">
                  {t('stats.booksCount', { count: g.count })}
                  {g.avgRating != null ? ` · ★ ${fmt.number(g.avgRating)}` : ''}
                </Text>
              </View>
              <ProgressLine ratio={g.count / (o.topGenres[0]?.count || 1)} tone="accent" />
            </View>
          ))
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {t('stats.noFinished')}
          </Text>
        )}
      </Section>

      <Button label={t('stats.shareButton')} icon="share-social" variant="secondary" onPress={() => void share()} testID="share-stats" />
      <AdBanner screen="stats" />

      {premium ? (
        <>
          <Section title={t('stats.authors')}>
            {o.topAuthors.length ? (
              o.topAuthors.map((a, i) => (
                <View key={a.name} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
                  <Text variant="bodySmall">{`${i + 1}. ${a.name}`}</Text>
                  <Text variant="caption" tone="subtle">
                    {t('stats.booksCount', { count: a.count })}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="bodySmall" tone="subtle">
                {t('stats.noFinished')}
              </Text>
            )}
          </Section>

          <Section title={t('stats.monthly', { year: shownYear })}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['books', 'pages', 'minutes'] as const).map((m) => (
                <Chip key={m} label={t(`stats.metric.${m}`)} selected={metric === m} onPress={() => setMetric(m)} />
              ))}
            </View>
            <Bars values={months.map((m) => m[metric])} labels={months.map((m) => fmt.monthShort(m.month))} highlight={shownYear === Number(today.slice(0, 4)) ? Number(today.slice(5, 7)) - 1 : undefined} accessibilityLabel={t('stats.monthlyA11y')} format={(v) => fmt.integer(v)} />
          </Section>

          {years.length > 1 ? (
            <Section title={t('stats.yearly')}>
              {years.map((y) => (
                <View key={y.year} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                  <Text style={{ fontWeight: '700' }}>{y.year}</Text>
                  <Text variant="bodySmall" tone="muted">
                    {t('stats.yearLine', { books: y.booksRead, pages: fmt.integer(y.pagesRead), time: fmt.duration(y.minutes * 60) })}
                  </Text>
                </View>
              ))}
            </Section>
          ) : null}

          <Section title={t('stats.bestPeriods')}>
            {periods ? (
              <>
                <Bars values={[1, 2, 3, 4, 5, 6, 0].map((d) => Math.round(periods.weekdays[d]! / 60))} labels={[1, 2, 3, 4, 5, 6, 0].map((d) => fmt.weekdayShort(d))} height={80} accessibilityLabel={t('stats.weekdaysA11y')} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(Object.keys(periods.dayparts) as (keyof typeof periods.dayparts)[]).map((k) => (
                    <Text key={k} variant="caption" tone="muted">
                      {t(`stats.dayparts.${k}`)}: {fmt.percent(periods.dayparts[k] / periods.total)}
                    </Text>
                  ))}
                </View>
              </>
            ) : (
              <Text variant="bodySmall" tone="subtle">
                {t('stats.noSessions')}
              </Text>
            )}
          </Section>

          <Section title={t('stats.habits')}>
            <Bars values={weeks.map((w) => w.minutes)} labels={weeks.map((w, i) => (i % 3 === 0 ? fmt.shortDay(w.weekStart) : ''))} height={70} accessibilityLabel={t('stats.habitsA11y')} />
          </Section>

          <Section title={t('stats.records')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Metric icon="flame" value={records.longestStreak != null ? t('stats.days', { count: records.longestStreak }) : null} label={t('stats.longestStreak')} sub={t('stats.currentStreak', { count: records.currentStreak })} />
              <Metric icon="hourglass" value={records.longestSessionSec != null ? fmt.duration(records.longestSessionSec) : null} label={t('stats.longestSession')} />
              <Metric icon="document" value={records.mostPagesInDay ? fmt.integer(records.mostPagesInDay.pages) : null} label={t('stats.mostPagesDay')} sub={records.mostPagesInDay ? fmt.day(records.mostPagesInDay.day) : undefined} />
              <Metric icon="flash" value={records.fastestBook ? t('stats.days', { count: records.fastestBook.days }) : null} label={t('stats.fastestBook')} sub={records.fastestBook?.title} />
              <Metric icon="barbell" value={records.longestBook ? fmt.integer(records.longestBook.pages) : null} label={t('stats.longestBook')} sub={records.longestBook?.title} />
              <Metric icon="trophy" value={records.bestMonth ? String(records.bestMonth.books) : null} label={t('stats.bestMonth')} sub={records.bestMonth ? fmt.month(records.bestMonth.month) : undefined} />
            </View>
          </Section>
        </>
      ) : (
        <Section title={t('stats.advanced')}>
          <Locked title={t('stats.authors')} />
          <Locked title={t('stats.monthly', { year: shownYear })} />
          <Locked title={t('stats.yearly')} />
          <Locked title={t('stats.bestPeriods')} />
          <Locked title={t('stats.records')} />
        </Section>
      )}
    </Page>
  );
}
