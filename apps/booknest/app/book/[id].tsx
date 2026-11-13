import { Button, Icon, Text } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { StatusPicker, StatusPill } from '@/components/books';
import { DateField, secondsToHm } from '@/components/forms';
import { useBookTheme } from '@/components/theme';
import { BookCover, Field, IconAction, Page, Paper, Pill, ProgressLine, Section, Serif, StarRating } from '@/components/ui';
import { repos } from '@/database';
import { similarBooks } from '@/features/discover/recommend';
import { audioRatio, audioRemainingSeconds, ProgressError, progressRatio } from '@/features/tracking/progress';
import { useAction, useData, useToday } from '@/hooks';
import { bookLanguageName, fmt } from '@/i18n';
import { deleteBook, setArchived, toggleFavorite } from '@/services/libraryService';
import { restartReading, setStatus, updateAudio, updateDates, updatePage } from '@/services/readingService';
import { parseDuration } from '@/utils';

export default function BookDetail() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const run = useAction(t);
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const { data } = useData(
    async (r) => {
      const [book, record, history, sessions, audio, review, quotes, notes, collectionIds, collections, timer, all] = await Promise.all([
        r.books.get(id),
        r.reading.current(id),
        r.reading.history(id),
        r.reading.sessionsForBook(id),
        r.reading.audio(id),
        r.content.review(id),
        r.content.quotes({ bookId: id, limit: 3 }),
        r.content.notes({ bookId: id }),
        r.organize.collectionsOfBook(id),
        r.organize.collections(),
        r.reading.timer(),
        r.books.list({ sort: 'title' }),
      ]);
      return { book, record, history, sessions, audio, review, quotes, notes, collections: collections.filter((c) => collectionIds.includes(c.id)), timer, similar: similarBooks(id, all, 6) };
    },
    [id],
  );
  const [page, setPage] = useState('');
  const [position, setPosition] = useState('');
  const [total, setTotal] = useState('');
  const [speed, setSpeed] = useState('');
  const [dates, setDates] = useState({ started: '', finished: '' });
  const [editingDates, setEditingDates] = useState(false);

  useEffect(() => {
    if (!data?.record) return;
    setPage(String(data.record.currentPage));
    setDates({ started: data.record.startedOn ?? '', finished: data.record.finishedOn ?? '' });
  }, [data?.record]);
  useEffect(() => {
    if (!data?.audio) return;
    setPosition(secondsToHm(data.audio.positionSeconds));
    setTotal(data.audio.totalSeconds ? secondsToHm(data.audio.totalSeconds) : '');
    setSpeed(data.audio.playbackSpeed?.toString() ?? '');
  }, [data?.audio]);

  if (!data) return <Page>{null}</Page>;
  const { book, record } = data;
  if (!book || !record) {
    return (
      <Page>
        <Text tone="muted">{t('book.notFound')}</Text>
      </Page>
    );
  }
  const isAudio = book.format === 'audiobook';
  const ratio = isAudio ? audioRatio(data.audio?.positionSeconds ?? 0, data.audio?.totalSeconds) : record.status === 'completed' ? 1 : progressRatio(record.currentPage, book.pageCount);
  const timerOnOther = data.timer && data.timer.bookId !== id;

  const savePage = (value: number) => run(() => updatePage(repos(), id, value));
  const saveAudio = () =>
    run(async () => {
      const pos = parseDuration(position);
      const tot = total ? parseDuration(total) : null;
      const spd = speed ? Number(speed.replace(',', '.')) : null;
      if (pos == null || (total && tot == null) || (spd != null && (!Number.isFinite(spd) || spd < 0.5 || spd > 3.5))) throw new ProgressError('invalid_total');
      await updateAudio(repos(), id, { positionSeconds: pos, totalSeconds: tot, playbackSpeed: spd });
    });

  const confirmDelete = () =>
    Alert.alert(t('book.deleteTitle'), t('book.deleteBody', { title: book.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteBook(repos(), id).then(() => router.back())) },
    ]);

  const menu = () =>
    Alert.alert(book.title, undefined, [
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/book/edit', params: { id } }) },
      { text: book.isArchived ? t('book.unarchive') : t('book.archive'), onPress: () => void run(() => setArchived(repos(), id, !book.isArchived)) },
      { text: t('common.delete'), style: 'destructive', onPress: confirmDelete },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Page edges={['bottom']} testID="book-detail">
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconAction icon={book.isFavorite ? 'heart' : 'heart-outline'} tone="primary" label={t(book.isFavorite ? 'book.unfavorite' : 'book.favorite')} onPress={() => void run(() => toggleFavorite(repos(), id, !book.isFavorite))} testID="toggle-favorite" />
              <IconAction icon="ellipsis-vertical" label={t('common.more')} onPress={menu} testID="book-menu" />
            </View>
          ),
        }}
      />
      <View style={{ alignItems: 'center', gap: 10 }}>
        <BookCover uri={book.coverUri ?? book.coverThumbUri} title={book.title} author={book.authorName} width={150} />
        <Serif size={26} center>
          {book.title}
        </Serif>
        {book.subtitle ? (
          <Text tone="muted" center style={{ fontStyle: 'italic' }}>
            {book.subtitle}
          </Text>
        ) : null}
        {book.originalTitle && book.originalTitle !== book.title ? (
          <Text variant="caption" tone="subtle" center>
            {t('book.originalTitleLabel', { title: book.originalTitle })}
          </Text>
        ) : null}
        <Text tone="muted">{book.authorName ?? t('book.unknownAuthor')}</Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatusPill status={record.status} />
          <Pill label={t(`formats.${book.format}`)} icon={isAudio ? 'headset' : 'book-outline'} />
          {book.genreName ? <Pill label={book.genreName} tone="accent" /> : null}
          {book.isArchived ? <Pill label={t('library.archived')} icon="archive" tone="warning" /> : null}
          {record.attempt > 1 ? <Pill label={t('book.rereadN', { count: record.attempt })} icon="repeat" tone="primary" /> : null}
        </View>
      </View>

      <Paper style={{ gap: 12 }}>
        <Text variant="label" tone="muted">
          {t('book.status')}
        </Text>
        <StatusPicker value={record.status} onChange={(s) => void run(() => setStatus(repos(), id, s))} />
      </Paper>

      <Paper style={{ gap: 12 }} testID="progress-card">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="label" tone="muted">
            {t('book.progress')}
          </Text>
          <Serif size={20}>{ratio != null ? fmt.percent(ratio) : '—'}</Serif>
        </View>
        <ProgressLine ratio={ratio} label={t('book.progress')} />
        {isAudio ? (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label={t('audio.position')} value={position} onChangeText={setPosition} placeholder="1:23:45" keyboardType="numbers-and-punctuation" testID="audio-position" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t('audio.total')} value={total} onChangeText={setTotal} placeholder="10:30:00" keyboardType="numbers-and-punctuation" testID="audio-total" />
              </View>
            </View>
            <Field label={t('audio.speed')} value={speed} onChangeText={setSpeed} placeholder="1.0" keyboardType="decimal-pad" hint={t('audio.speedHint')} />
            {data.audio?.totalSeconds ? (
              <Text variant="caption" tone="subtle">
                {t('audio.remaining', { time: fmt.duration(audioRemainingSeconds(data.audio.positionSeconds, data.audio.totalSeconds, data.audio.playbackSpeed) ?? 0) })}
              </Text>
            ) : (
              <Text variant="caption" tone="subtle">
                {t('audio.totalUnknown')}
              </Text>
            )}
            <Button label={t('audio.update')} variant="secondary" onPress={() => void saveAudio()} testID="save-audio" />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label={book.pageCount ? t('book.currentPageOf', { total: book.pageCount }) : t('book.currentPage')}
                  value={page}
                  onChangeText={(v) => setPage(v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  autoFocus={focus === 'progress'}
                  hint={book.pageCount ? undefined : t('book.noPageCount')}
                  testID="page-input"
                />
              </View>
              <Button label={t('common.save')} onPress={() => void savePage(Number(page || 0))} testID="save-page" />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[10, 25, 50].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => void savePage(book.pageCount ? Math.min(book.pageCount, record.currentPage + n) : record.currentPage + n)}
                  accessibilityRole="button"
                  accessibilityLabel={t('book.addPages', { count: n })}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.colors.surfaceAlt }}
                >
                  <Text variant="bodySmall" style={{ fontWeight: '700' }}>{`+${n}`}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="caption" tone="subtle">
            {record.startedOn ? t('book.startedOn', { date: fmt.day(record.startedOn) }) : t('book.notStarted')}
            {record.finishedOn ? ` · ${t('book.finishedOn', { date: fmt.day(record.finishedOn) })}` : ''}
          </Text>
          <Pressable onPress={() => setEditingDates(!editingDates)} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
              {t('book.editDates')}
            </Text>
          </Pressable>
        </View>
        {editingDates ? (
          <View style={{ gap: 10 }}>
            <DateField label={t('book.started')} value={dates.started} onChange={(v) => setDates({ ...dates, started: v })} today={today} />
            {record.status === 'completed' ? <DateField label={t('book.finished')} value={dates.finished} onChange={(v) => setDates({ ...dates, finished: v })} today={today} /> : null}
            <Button
              label={t('common.save')}
              variant="secondary"
              onPress={() => void run(() => updateDates(repos(), id, dates.started || null, dates.finished || null).then(() => setEditingDates(false)))}
            />
          </View>
        ) : null}
      </Paper>

      <View style={{ gap: 8 }}>
        {record.status !== 'completed' ? (
          <Button
            label={data.timer?.bookId === id ? t('session.resumeTimer') : t('session.start')}
            icon="timer"
            onPress={() =>
              timerOnOther ? Alert.alert(t('errors.title'), t('errors.session.timer_running')) : router.push({ pathname: '/session/timer', params: { bookId: id } })
            }
            testID="start-session"
          />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button label={t('session.logManual')} variant="secondary" icon="create-outline" onPress={() => router.push({ pathname: '/session/manual', params: { bookId: id } })} />
          </View>
          <View style={{ flex: 1 }}>
            {record.status === 'completed' || record.status === 'abandoned' ? (
              <Button
                label={t('book.reread')}
                variant="secondary"
                icon="repeat"
                onPress={() =>
                  Alert.alert(t('book.rereadTitle'), t('book.rereadBody'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('book.reread'), onPress: () => void run(() => restartReading(repos(), id)) },
                  ])
                }
                testID="reread"
              />
            ) : (
              <Button label={t('book.markFinished')} variant="secondary" icon="checkmark-done" onPress={() => void run(() => setStatus(repos(), id, 'completed'))} testID="mark-finished" />
            )}
          </View>
        </View>
      </View>

      <Section title={t('review.title')} action={data.review ? t('common.edit') : t('review.write')} onAction={() => router.push({ pathname: '/book/review', params: { id } })}>
        <Paper onPress={() => router.push({ pathname: '/book/review', params: { id } })} accessibilityLabel={t('review.title')}>
          <StarRating value={data.review?.rating ?? null} />
          {data.review?.body ? (
            <Text variant="bodySmall" numberOfLines={4}>
              {data.review.body}
            </Text>
          ) : (
            <Text variant="bodySmall" tone="subtle">
              {t('review.privateHint')}
            </Text>
          )}
        </Paper>
      </Section>

      <Section title={t('collections.title')} action={t('common.manage')} onAction={() => router.push({ pathname: '/book/collections', params: { id } })}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {data.collections.length ? (
            data.collections.map((c) => <Pill key={c.id} label={c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name} icon={c.icon as never} tone="primary" />)
          ) : (
            <Text variant="bodySmall" tone="subtle">
              {t('collections.noneForBook')}
            </Text>
          )}
        </View>
      </Section>

      <Section title={t('quotes.title')} action={t('quotes.add')} onAction={() => router.push({ pathname: '/quotes/edit', params: { bookId: id } })}>
        {data.quotes.length ? (
          data.quotes.map((q) => (
            <Paper key={q.id} onPress={() => router.push({ pathname: '/quotes/edit', params: { id: q.id } })} accessibilityLabel={q.text}>
              <Text style={{ fontFamily: theme.serif, fontStyle: 'italic' }} numberOfLines={3}>
                “{q.text}”
              </Text>
              {q.page != null ? (
                <Text variant="caption" tone="subtle">
                  {t('quotes.pageN', { page: q.page })}
                </Text>
              ) : null}
            </Paper>
          ))
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {t('quotes.noneForBook')}
          </Text>
        )}
      </Section>

      <Section title={t('journal.title')} action={t('journal.add')} onAction={() => router.push({ pathname: '/journal/edit', params: { bookId: id } })}>
        {data.notes.length ? (
          data.notes.slice(0, 3).map((n) => (
            <Paper key={n.id} onPress={() => router.push({ pathname: '/journal/edit', params: { id: n.id } })} accessibilityLabel={n.title ?? t(`journal.kinds.${n.kind}`)}>
              <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
                {t(`journal.kinds.${n.kind}`)} · {fmt.day(n.createdAt.slice(0, 10))}
              </Text>
              {n.title ? <Text style={{ fontWeight: '600' }}>{n.title}</Text> : null}
              <Text variant="bodySmall" numberOfLines={3}>
                {n.body}
              </Text>
            </Paper>
          ))
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {t('journal.noneForBook')}
          </Text>
        )}
      </Section>

      <Section title={t('session.historyTitle')} action={data.sessions.length ? t('common.seeAll') : undefined} onAction={() => router.push({ pathname: '/sessions', params: { bookId: id } })}>
        {data.sessions.length ? (
          data.sessions.slice(0, 4).map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text variant="bodySmall">{`${fmt.day(s.day)} · ${fmt.time(s.startedAt)}`}</Text>
              <Text variant="bodySmall" tone="muted">
                {fmt.duration(s.durationSec)}
                {s.startPage != null && s.endPage != null ? ` · ${t('session.pagesRange', { from: s.startPage, to: s.endPage })}` : ''}
              </Text>
            </View>
          ))
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {t('session.none')}
          </Text>
        )}
      </Section>

      {data.history.length > 1 ? (
        <Section title={t('book.readingHistory')}>
          {data.history.map((h) => (
            <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
              <Icon name="repeat" size={14} color={theme.colors.textSubtle} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t('book.attemptN', { count: h.attempt })} — {t(`status.${h.status}`)}
              </Text>
              <Text variant="caption" tone="subtle">
                {[h.startedOn && fmt.day(h.startedOn), h.finishedOn && fmt.day(h.finishedOn)].filter(Boolean).join(' → ') || '—'}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      {data.similar.length ? (
        <Section title={t('discover.similar')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {data.similar.map((s) => (
              <Pressable key={s.bookId} onPress={() => router.push(`/book/${s.bookId}`)} accessibilityRole="button" accessibilityLabel={s.title} style={{ width: 80 }}>
                <BookCover uri={s.coverThumbUri} title={s.title} width={80} />
              </Pressable>
            ))}
          </ScrollView>
        </Section>
      ) : null}

      <Section title={t('book.details')}>
        <Paper tone="alt" style={{ gap: 6 }}>
          {[
            [t('book.pages'), book.pageCount?.toString()],
            [t('book.isbn'), book.isbn],
            [t('book.publisher'), book.publisher],
            [t('book.year'), book.publishedYear?.toString()],
            [t('book.language'), bookLanguageName(book.language)],
            [t('book.acquiredOn'), book.acquiredOn ? fmt.day(book.acquiredOn) : null],
            [t('book.price'), book.purchasePriceCents != null ? fmt.money(book.purchasePriceCents, book.currency) : null],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="bodySmall" tone="muted">
                  {k}
                </Text>
                <Text variant="bodySmall" style={{ flexShrink: 1, textAlign: 'right' }}>
                  {v}
                </Text>
              </View>
            ))}
          {book.description ? <Text variant="bodySmall">{book.description}</Text> : null}
          {book.notes ? (
            <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
              {book.notes}
            </Text>
          ) : null}
        </Paper>
      </Section>
    </Page>
  );
}

