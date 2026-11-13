import { addDays, startOfWeek } from '@factory/app-core';
import { Button, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { itemProgress } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { BookCover, Empty, Page, Paper, ProgressLine, Ring, Section, Serif } from '@/components/ui';
import { elapsedSec } from '@/features/sessions/timer';
import { useData, useNow, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { evaluateGoals } from '@/services/goalService';
import { useSession } from '@/store/session';
import { formatClock } from '@/utils';

function greetingKey(hour: number) {
  return hour < 5 ? 'home.greetingNight' : hour < 12 ? 'home.greetingMorning' : hour < 18 ? 'home.greetingAfternoon' : 'home.greetingEvening';
}

function Celebration() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const pending = useSession((s) => s.celebrations.length);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (pending) setVisible(true);
  }, [pending]);
  const close = () => {
    useSession.getState().takeCelebrations();
    setVisible(false);
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: 32 }}>
        <Paper style={{ alignItems: 'center', gap: 12, padding: 24 }}>
          <Icon name="trophy" size={48} color={theme.colors.accent} />
          <Serif size={24} center>
            {t('goals.celebrateTitle')}
          </Serif>
          <Text tone="muted" center>
            {t('goals.celebrateBody', { count: pending })}
          </Text>
          <Button label={t('common.wonderful')} onPress={close} testID="celebration-close" />
        </Paper>
      </View>
    </Modal>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const { data } = useData(
    async (r) => {
      const weekStart = startOfWeek(today);
      const [reading, finished, timer, goals, sessions, collections, quotes, total] = await Promise.all([
        r.books.list({ status: 'reading', sort: 'recent', limit: 6 }),
        r.books.list({ status: 'completed', sort: 'recent', limit: 8 }),
        r.reading.timer(),
        evaluateGoals(r, today),
        r.reading.sessions({ from: weekStart, to: addDays(weekStart, 6) }),
        r.organize.collections(),
        r.content.quotes({ limit: 3 }),
        r.books.count(),
      ]);
      const timerBook = timer ? await r.books.get(timer.bookId) : null;
      return { reading, finished, timer, timerBook, goals, weekSeconds: sessions.reduce((a, s) => a + s.durationSec, 0), weekSessions: sessions.length, collections: collections.filter((c) => c.bookCount > 0).slice(0, 6), quotes, total };
    },
    [today],
  );
  const now = useNow(1000, !!data?.timer && !data.timer.pausedAt);

  if (!data) return <Page>{null}</Page>;
  const hero = data.reading[0];
  const yearly = data.goals.find((g) => g.goal.type === 'books_per_year');
  const nextGoal = data.goals.filter((g) => !g.reached && g !== yearly).sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <Page testID="home">
      <Celebration />
      <View style={{ gap: 2 }}>
        <Text variant="label" tone="accent">
          {fmt.longDay(today)}
        </Text>
        <Serif size={30}>{t(greetingKey(now.getHours()))}</Serif>
      </View>

      {data.timer && data.timerBook ? (
        <Paper tone="primary" onPress={() => router.push('/session/timer')} accessibilityLabel={t('home.timerRunning', { title: data.timerBook.title })} testID="home-timer">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name={data.timer.pausedAt ? 'pause' : 'timer'} size={26} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
                {data.timer.pausedAt ? t('session.paused') : t('session.running')}
              </Text>
              <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                {data.timerBook.title}
              </Text>
            </View>
            <Serif size={22}>{formatClock(elapsedSec(data.timer, now))}</Serif>
          </View>
        </Paper>
      ) : null}

      {data.total === 0 ? (
        <Paper>
          <Empty
            icon="library"
            title={t('home.emptyTitle')}
            message={t('home.emptyBody')}
            action={<Button label={t('library.addBook')} icon="add" onPress={() => router.push('/book/edit')} testID="home-add" />}
          />
        </Paper>
      ) : hero ? (
        <Paper onPress={() => router.push(`/book/${hero.id}`)} accessibilityLabel={t('home.continueA11y', { title: hero.title })} testID="home-hero">
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <BookCover uri={hero.coverThumbUri} title={hero.title} author={hero.authorName} width={92} />
            <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
              <Text variant="label" tone="accent">
                {t('home.currentlyReading')}
              </Text>
              <Serif size={20} numberOfLines={2}>
                {hero.title}
              </Serif>
              {hero.authorName ? (
                <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                  {hero.authorName}
                </Text>
              ) : null}
              <ProgressLine ratio={itemProgress(hero)} label={t('book.progress')} />
              <Text variant="caption" tone="subtle">
                {hero.format === 'audiobook'
                  ? hero.audioProgress != null
                    ? fmt.percent(hero.audioProgress)
                    : t('book.progressUnknown')
                  : hero.pageCount
                    ? t('book.pageOf', { page: hero.currentPage, total: hero.pageCount })
                    : t('book.pageOnly', { page: hero.currentPage })}
              </Text>
            </View>
          </View>
          {!data.timer ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <Button label={t('session.start')} icon="play" onPress={() => router.push({ pathname: '/session/timer', params: { bookId: hero.id } })} testID="home-start-session" />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('book.updateProgress')} variant="secondary" onPress={() => router.push({ pathname: '/book/[id]', params: { id: hero.id, focus: 'progress' } })} />
              </View>
            </View>
          ) : null}
        </Paper>
      ) : (
        <Paper onPress={() => router.push('/(tabs)/discover')}>
          <Text style={{ fontWeight: '600' }}>{t('home.nothingInProgress')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('home.nothingInProgressBody')}
          </Text>
        </Paper>
      )}

      {data.reading.length > 1 ? (
        <Section title={t('home.alsoReading')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {data.reading.slice(1).map((b) => (
              <Pressable key={b.id} onPress={() => router.push(`/book/${b.id}`)} accessibilityRole="button" accessibilityLabel={b.title} style={{ width: 84, gap: 6 }}>
                <BookCover uri={b.coverThumbUri} title={b.title} width={84} />
                <ProgressLine ratio={itemProgress(b)} height={3} />
              </Pressable>
            ))}
          </ScrollView>
        </Section>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Paper style={{ flex: 1, alignItems: 'center' }} onPress={() => router.push('/(tabs)/goals')} accessibilityLabel={t('home.yearlyGoal')}>
          <Text variant="label" tone="muted">
            {t('home.yearlyGoal')}
          </Text>
          {yearly ? (
            <Ring ratio={yearly.ratio} size={86} label={t('goals.progressA11y', { value: yearly.value, target: yearly.target })}>
              <Serif size={20}>{`${yearly.value}/${yearly.target}`}</Serif>
            </Ring>
          ) : (
            <View style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
              <Icon name="flag-outline" size={28} color={theme.colors.accent} />
              <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
                {t('home.setGoal')}
              </Text>
            </View>
          )}
        </Paper>
        <Paper style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.push('/calendar')} accessibilityLabel={t('home.thisWeek')}>
          <Text variant="label" tone="muted">
            {t('home.thisWeek')}
          </Text>
          <Serif size={24}>{data.weekSessions ? fmt.duration(data.weekSeconds) : '—'}</Serif>
          <Text variant="caption" tone="subtle" center>
            {data.weekSessions ? t('home.sessions', { count: data.weekSessions }) : t('home.noSessionsYet')}
          </Text>
        </Paper>
      </View>

      {nextGoal ? (
        <Paper onPress={() => router.push('/(tabs)/goals')} accessibilityLabel={t('home.nextGoal')}>
          <Text variant="label" tone="muted">
            {t('home.nextGoal')}
          </Text>
          <Text style={{ fontWeight: '600' }}>{nextGoal.goal.title ?? t(`goals.types.${nextGoal.goal.type}`, { count: nextGoal.target })}</Text>
          <ProgressLine ratio={nextGoal.ratio} tone="accent" label={t('goals.progressA11y', { value: nextGoal.value, target: nextGoal.target })} />
          <Text variant="caption" tone="subtle">
            {t('goals.remaining', { count: nextGoal.remaining })}
          </Text>
        </Paper>
      ) : null}

      {data.finished.length ? (
        <Section title={t('home.recentReads')} action={t('common.seeAll')} onAction={() => router.push({ pathname: '/(tabs)/library', params: { status: 'completed' } })}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {data.finished.map((b) => (
              <Pressable key={b.id} onPress={() => router.push(`/book/${b.id}`)} accessibilityRole="button" accessibilityLabel={b.title} style={{ width: 84 }}>
                <BookCover uri={b.coverThumbUri} title={b.title} width={84} />
              </Pressable>
            ))}
          </ScrollView>
        </Section>
      ) : null}

      {data.collections.length ? (
        <Section title={t('home.collections')} action={t('common.seeAll')} onAction={() => router.push('/collections')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {data.collections.map((c) => (
              <Paper key={c.id} onPress={() => router.push(`/collections/${c.id}`)} accessibilityLabel={c.name} style={{ width: 150 }} tone="alt">
                <Icon name={c.icon as never} size={20} color={theme.colors.primary} />
                <Text style={{ fontWeight: '700' }} numberOfLines={1}>
                  {c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name}
                </Text>
                <Text variant="caption" tone="subtle">
                  {t('collections.bookCount', { count: c.bookCount })}
                </Text>
              </Paper>
            ))}
          </ScrollView>
        </Section>
      ) : null}

      {data.quotes.length ? (
        <Section title={t('home.recentQuotes')} action={t('common.seeAll')} onAction={() => router.push('/quotes')}>
          {data.quotes.map((q) => (
            <Paper key={q.id} onPress={() => router.push({ pathname: '/quotes/edit', params: { id: q.id } })} accessibilityLabel={q.text}>
              <Text style={{ fontFamily: theme.serif, fontStyle: 'italic' }} numberOfLines={4}>
                “{q.text}”
              </Text>
              <Text variant="caption" tone="subtle">
                {[q.authorName, q.bookTitle].filter(Boolean).join(' — ')}
              </Text>
            </Paper>
          ))}
        </Section>
      ) : null}
    </Page>
  );
}
