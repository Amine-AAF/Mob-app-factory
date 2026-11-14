import { Button, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { secondsToHm } from '@/components/forms';
import { useBookTheme } from '@/components/theme';
import { BookCover, Field, Page, Paper, Serif } from '@/components/ui';
import { repos } from '@/database';
import { checkDuration, elapsedSec } from '@/features/sessions/timer';
import { useAction, useData, useNow } from '@/hooks';
import { fmt } from '@/i18n';
import { discardSession, finishSession, pauseSession, resumeSession, startTimer } from '@/services/readingService';
import { formatClock, parseDuration, parseHoursMinutes } from '@/utils';

/**
 * Reading timer. Nothing runs in the background: the display recomputes the elapsed
 * time from stored timestamps once per second while visible, and on return from the
 * background. No ads on this screen.
 */
export default function TimerScreen() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const { data, reload } = useData(async (r) => {
    const timer = await r.reading.timer();
    const id = timer?.bookId ?? bookId;
    const [book, record, audio] = id ? await Promise.all([r.books.get(id), r.reading.current(id), r.reading.audio(id)]) : [null, null, null];
    return { timer, book, record, audio };
  }, [bookId]);
  const timer = data?.timer ?? null;
  const now = useNow(1000, !!timer && !timer.pausedAt);
  const [endPage, setEndPage] = useState('');
  const [endPos, setEndPos] = useState('');
  const [notes, setNotes] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [duration, setDuration] = useState('');

  // Refill the end position each time fresh data is loaded (derived during render, no effect needed).
  const record = data?.record;
  const audio = data?.audio;
  const [synced, setSynced] = useState<{ record: object | null | undefined; audio: object | null | undefined }>({ record: undefined, audio: undefined });
  if (record !== synced.record || audio !== synced.audio) {
    setSynced({ record, audio });
    if (record) setEndPage(String(record.currentPage));
    if (audio) setEndPos(secondsToHm(audio.positionSeconds));
  }

  if (!data) return <Page>{null}</Page>;
  const { book } = data;
  if (!book) {
    return (
      <Page edges={['bottom']}>
        <Text tone="muted">{t('session.noBook')}</Text>
      </Page>
    );
  }
  const elapsed = timer ? elapsedSec(timer, now) : 0;
  const isAudio = book.format === 'audiobook';

  const finish = () =>
    run(async () => {
      const overrideSec = duration.trim() ? (parseHoursMinutes(duration) ?? undefined) : undefined;
      const page = !isAudio && endPage !== '' ? Number(endPage) : null;
      const pos = isAudio && endPos ? parseDuration(endPos) : null;
      await finishSession(repos(), { endPage: page, endPositionSec: pos, notes, durationOverrideSec: overrideSec });
      router.back();
    });

  const onFinish = () => {
    const typed = duration.trim() ? parseHoursMinutes(duration) : null;
    if (duration.trim() && (typed == null || typed <= 0)) {
      Alert.alert(t('errors.title'), t('errors.invalidDuration'));
      return;
    }
    const check = checkDuration(typed ?? elapsed);
    if (check === 'too_short') {
      Alert.alert(t('session.tooShortTitle'), t('session.tooShortBody'), [
        { text: t('session.keepGoing'), style: 'cancel' },
        { text: t('session.discard'), style: 'destructive', onPress: () => void run(() => discardSession(repos()).then(() => router.back())) },
        { text: t('session.saveAnyway'), onPress: () => void finish() },
      ]);
    } else if (check === 'too_long') {
      Alert.alert(t('session.tooLongTitle'), t('session.tooLongBody', { time: fmt.duration(elapsed) }), [
        { text: t('session.adjust'), style: 'cancel' },
        { text: t('session.saveAsIs'), onPress: () => void finish() },
      ]);
    } else void finish();
  };

  return (
    <Page edges={['bottom']} testID="timer-screen">
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 8 }}>
        <BookCover uri={book.coverThumbUri} title={book.title} width={96} />
        <Serif size={20} center numberOfLines={2}>
          {book.title}
        </Serif>
      </View>
      <View style={{ alignItems: 'center', paddingVertical: 18 }} accessible accessibilityLabel={t('session.elapsedA11y', { time: fmt.duration(elapsed) })} accessibilityLiveRegion="none">
        <Text style={{ fontFamily: theme.serif, fontSize: 64, lineHeight: 74, color: timer?.pausedAt ? theme.colors.textSubtle : theme.colors.text, fontVariant: ['tabular-nums'] }} testID="elapsed">
          {formatClock(elapsed)}
        </Text>
        <Text variant="label" tone={timer?.pausedAt ? 'warning' : 'accent'}>
          {!timer ? t('session.ready') : timer.pausedAt ? t('session.paused') : t('session.running')}
        </Text>
      </View>

      {!timer ? (
        <Button label={t('session.start')} icon="play" size="lg" onPress={() => void run(() => startTimer(repos(), book.id).then(reload))} testID="timer-start" />
      ) : (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              {timer.pausedAt ? (
                <Button label={t('session.resume')} icon="play" variant="secondary" onPress={() => void run(() => resumeSession(repos()))} testID="timer-resume" />
              ) : (
                <Button label={t('session.pause')} icon="pause" variant="secondary" onPress={() => void run(() => pauseSession(repos()))} testID="timer-pause" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('session.finish')} icon="stop" onPress={() => setFinishing(true)} testID="timer-finish" />
            </View>
          </View>
          <Button
            label={t('session.discard')}
            variant="ghost"
            onPress={() =>
              Alert.alert(t('session.discardTitle'), t('session.discardBody'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('session.discard'), style: 'destructive', onPress: () => void run(() => discardSession(repos()).then(() => router.back())) },
              ])
            }
          />
        </View>
      )}

      {timer && finishing ? (
        <Paper style={{ gap: 12 }}>
          <Serif size={18}>{t('session.wrapUp')}</Serif>
          {isAudio ? (
            <Field label={t('audio.position')} value={endPos} onChangeText={setEndPos} placeholder="1:23:45" keyboardType="numbers-and-punctuation" />
          ) : (
            <Field
              label={book.pageCount ? t('session.endPageOf', { total: book.pageCount }) : t('session.endPage')}
              value={endPage}
              onChangeText={(v) => setEndPage(v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              hint={timer.startPage != null ? t('session.startedAtPage', { page: timer.startPage }) : undefined}
              testID="end-page"
            />
          )}
          <Field label={t('session.adjustDuration')} value={duration} onChangeText={setDuration} placeholder="1:15" keyboardType="numbers-and-punctuation" hint={t('session.adjustDurationHint')} testID="duration-override" />
          <Field label={t('session.notes')} value={notes} onChangeText={setNotes} multiline placeholder={t('session.notesPlaceholder')} />
          <Button label={t('session.save')} size="lg" onPress={onFinish} testID="timer-save" />
        </Paper>
      ) : null}

      <Text variant="caption" tone="subtle" center>
        {t('session.backgroundHint')}
      </Text>
    </Page>
  );
}
