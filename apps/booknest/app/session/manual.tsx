import { Button, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DateField } from '@/components/forms';
import { Field, Page, Serif } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData, useToday } from '@/hooks';
import { addManualSession } from '@/services/readingService';
import { isDayKey, parseIntOrNull } from '@/utils';

function toDate(day: string, time: string): Date | null {
  const m = time.trim().match(/^(\d{1,2})[:h.](\d{2})$/);
  if (!isDayKey(day) || !m) return null;
  const [y, mo, d] = day.split('-').map(Number);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return new Date(y!, mo! - 1, d!, h, min);
}

export default function ManualSession() {
  const { t } = useTranslation();
  const today = useToday();
  const run = useAction(t);
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { data } = useData((r) => Promise.all([r.books.get(bookId), r.reading.current(bookId)]), [bookId]);
  const [day, setDay] = useState(today);
  const [start, setStart] = useState('20:00');
  const [end, setEnd] = useState('20:30');
  const [fromPage, setFromPage] = useState<string | null>(null);
  const [toPage, setToPage] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [book, record] = data ?? [null, null];
  const from = fromPage ?? String(record?.currentPage ?? '');

  const save = () => {
    const s = toDate(day, start);
    const e = toDate(day, end);
    if (!s || !e) {
      setError(t('errors.invalidTime'));
      return;
    }
    setError(null);
    // An end time before the start means the session went past midnight.
    const ended = e <= s ? new Date(e.getTime() + 86_400_000) : e;
    void run(() =>
      addManualSession(repos(), bookId, { startedAt: s, endedAt: ended, startPage: parseIntOrNull(from), endPage: parseIntOrNull(toPage), notes }).then(() => router.back()),
    );
  };

  return (
    <Page edges={['bottom']} footer={<Button label={t('session.save')} size="lg" onPress={save} testID="save-manual" />}>
      {book ? <Serif size={20}>{book.title}</Serif> : null}
      <DateField label={t('session.date')} value={day} onChange={setDay} today={today} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label={t('session.startTime')} value={start} onChangeText={setStart} placeholder="20:00" keyboardType="numbers-and-punctuation" error={error} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label={t('session.endTime')} value={end} onChangeText={setEnd} placeholder="20:30" keyboardType="numbers-and-punctuation" />
        </View>
      </View>
      {book?.format !== 'audiobook' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label={t('session.fromPage')} value={from} onChangeText={(v) => setFromPage(v.replace(/\D/g, ''))} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={t('session.toPage')} value={toPage} onChangeText={(v) => setToPage(v.replace(/\D/g, ''))} keyboardType="number-pad" />
          </View>
        </View>
      ) : null}
      <Field label={t('session.notes')} value={notes} onChangeText={setNotes} multiline />
      <Text variant="caption" tone="subtle">
        {t('session.manualHint')}
      </Text>
    </Page>
  );
}
