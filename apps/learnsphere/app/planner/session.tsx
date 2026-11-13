import { addDays } from '@factory/app-core';
import { Button, Chip, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { DayField, SubjectPicker, TimeField } from '@/components/pickers';
import { Panel, Stepper, TextField, ToggleRow, WeekdayPicker } from '@/components/ui';
import { repos } from '@/database';
import type { StudySession } from '@/database/repositories/planner';
import { expandRecurrence, findFreeSlot, isoWeekday, overlaps, weekDays } from '@/features/planner/planner';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { rescheduleAll } from '@/services/notifications';
import { afterLearningWrite } from '@/services/progress';

export default function SessionEditor() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; day?: string; subjectId?: string; minutes?: string }>();
  const [session, setSession] = useState<StudySession | null>(null);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [day, setDay] = useState<string>(params.day || clock.today());
  const [startMinute, setStartMinute] = useState(18 * 60);
  const [duration, setDuration] = useState(Number(params.minutes) || 45);
  const [recurring, setRecurring] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([isoWeekday(params.day || clock.today())]);
  const [until, setUntil] = useState<string>(addDays(params.day || clock.today(), 27));
  const [actual, setActual] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('active'), []);
  const { data: sameDay = [] } = useAsync(() => repos().planner.sessionsBetween(day, day), [day]);

  useEffect(() => {
    if (params.id) {
      void repos()
        .planner.getSession(params.id)
        .then((s) => {
          if (!s) return;
          setSession(s);
          setTitle(s.title);
          setGoal(s.goal);
          setSubjectId(s.subjectId);
          setDay(s.day);
          setStartMinute(s.startMinute);
          setDuration(s.durationMin);
          setActual(s.actualMinutes ?? s.durationMin);
        });
    } else {
      // Suggest the first free slot of the day.
      void repos()
        .planner.sessionsBetween(day, day)
        .then((existing) => {
          const now = clock.now();
          const from = day === clock.today() ? now.getHours() * 60 + now.getMinutes() + 15 : 18 * 60;
          const slot = findFreeSlot(existing, day, duration, from);
          if (slot != null) setStartMinute(slot);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [params.id]);

  const subjectName = subjects.find((s) => s.id === subjectId)?.name;
  const conflicts = overlaps({ id: session?.id, day, startMinute, durationMin: duration }, sameDay);
  const occurrences = recurring ? expandRecurrence({ frequency: 'weekly', weekdays, interval: 1, startDay: day, untilDay: until }).length : 1;

  const done = async () => {
    await rescheduleAll(repos(), i18n.t);
    await afterLearningWrite(repos());
    router.back();
  };

  const save = async () => {
    const finalTitle = title.trim() || subjectName || '';
    if (!finalTitle) return setError(t('validation.titleOrSubject'));
    if (recurring && weekdays.length === 0) return setError(t('planner.pickDays'));
    const input = { title: finalTitle, goal, subjectId, day, startMinute, durationMin: duration };
    if (session) await repos().planner.updateSession(session.id, input);
    else if (recurring) await repos().planner.createRecurring(input, { frequency: 'weekly', weekdays, interval: 1, startDay: day, untilDay: until });
    else await repos().planner.createSession(input);
    await done();
  };

  const remove = () => {
    if (!session) return;
    const options = [
      { text: t('common.cancel'), style: 'cancel' as const },
      { text: t('planner.deleteOne'), style: 'destructive' as const, onPress: async () => (await repos().planner.removeSession(session.id), await done()) },
    ];
    if (session.seriesId) options.push({ text: t('planner.deleteSeries'), style: 'destructive' as const, onPress: async () => (await repos().planner.removeSession(session.id, true), await done()) });
    Alert.alert(t('planner.deleteTitle'), session.seriesId ? t('planner.deleteSeriesBody') : undefined, options);
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="session-save" />}>
      <RouterStack.Screen options={{ title: session ? t('planner.editSession') : t('planner.newSession'), headerRight: session ? () => <IconButton icon="trash-outline" label={t('common.delete')} onPress={remove} /> : undefined }} />
      {session ? (
        <Panel title={t('planner.status.title')} icon="checkmark-done-outline">
          <Text variant="bodySmall" tone="muted">
            {t(`planner.status.${session.status}`)}
            {session.rescheduledFrom ? ` · ${t('planner.movedFrom', { date: fmt.day(session.rescheduledFrom) })}` : ''}
          </Text>
          {session.status === 'done' ? (
            <Button size="md" variant="secondary" label={t('planner.reopen')} onPress={async () => (await repos().planner.reopenSession(session.id), await done())} />
          ) : (
            <>
              <Stepper label={t('planner.actualMinutes')} value={actual ?? session.durationMin} onChange={setActual} min={5} max={600} step={5} format={fmt.duration} />
              <Button label={t('planner.markDone')} icon="checkmark" onPress={async () => (await repos().planner.completeSession(session.id, actual ?? session.durationMin), await done())} testID="session-done" />
              <Row gap={2}>
                <View style={{ flex: 1 }}>
                  <Button size="md" variant="secondary" label={t('planner.startFocus')} icon="timer-outline" onPress={() => router.push({ pathname: '/focus', params: { subjectId: session.subjectId ?? '', sessionId: session.id } })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button size="md" variant="secondary" label={t('planner.skip')} onPress={async () => (await repos().planner.skipSession(session.id), await done())} />
                </View>
              </Row>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                {t('planner.reschedule')}
              </Text>
              <Row gap={2} wrap>
                {[1, 2, 7].map((n) => (
                  <Chip
                    key={n}
                    label={t('planner.plusDays', { count: n })}
                    selected={false}
                    onPress={async () => {
                      const target = addDays(session.day < clock.today() ? clock.today() : session.day, n);
                      await repos().planner.reschedule(session.id, target, session.startMinute);
                      await done();
                    }}
                  />
                ))}
              </Row>
            </>
          )}
        </Panel>
      ) : null}
      <SubjectPicker label={t('common.subject')} subjects={subjects} value={subjectId} onChange={setSubjectId} />
      <TextField label={t('planner.fields.title')} placeholder={subjectName ?? t('planner.fields.titlePlaceholder')} value={title} onChangeText={(v) => (setTitle(v), setError(null))} maxLength={80} error={error} testID="session-title" />
      <TextField label={t('planner.fields.goal')} placeholder={t('planner.fields.goalPlaceholder')} value={goal} onChangeText={setGoal} maxLength={160} />
      <DayField label={session ? t('planner.fields.day') : t('planner.fields.firstDay')} value={day} onChange={(d) => d && setDay(d)} />
      <TimeField label={t('planner.fields.start')} value={startMinute} onChange={setStartMinute} />
      <Stepper label={t('planner.fields.duration')} value={duration} onChange={setDuration} min={5} max={480} step={5} format={fmt.duration} />
      {conflicts.length ? (
        <Text variant="bodySmall" tone="warning">
          {t('planner.overlap', { title: conflicts[0]?.title ?? '' })}
        </Text>
      ) : null}
      {!session ? (
        <Panel title={t('planner.repeat')} icon="repeat-outline">
          <ToggleRow title={t('planner.recurring')} value={recurring} onChange={setRecurring} />
          {recurring ? (
            <Stack gap={3}>
              <WeekdayPicker value={weekdays} onChange={setWeekdays} labels={weekDays(clock.today()).map((d) => fmt.weekdayShort(d))} />
              <DayField label={t('planner.until')} value={until} onChange={(d) => d && setUntil(d)} />
              <Text variant="caption" tone={occurrences > 0 ? 'subtle' : 'warning'}>
                {t('planner.occurrences', { count: occurrences })}
              </Text>
            </Stack>
          ) : null}
        </Panel>
      ) : null}
      <View style={{ height: 8, backgroundColor: theme.colors.background }} />
    </Screen>
  );
}
