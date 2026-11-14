import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChipScroller, Field } from '@/components/ui';
import { repos } from '@/database';
import { itemsForDay } from '@/features/planner/plan';
import { useData } from '@/hooks';
import { fmt } from '@/i18n';
import { moveItem } from '@/services/plannerService';
import { syncNotifications } from '@/services/reminders';
import { useSession } from '@/store/session';
import { cleanText } from '@/utils';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Plan a workout or rest day on a date — or, with ?moveKey=…&moveFrom=…, choose the
 * new date of an existing entry (move / reschedule).
 */
export default function Schedule() {
  const { day, moveKey, moveFrom } = useLocalSearchParams<{ day: string; moveKey?: string; moveFrom?: string }>();
  const { t, i18n } = useTranslation();
  const today = useSession((s) => s.today);
  const { data } = useData(async (r) => ({ programs: await r.programs.list(), entries: await r.planner.entries(moveFrom ?? day, moveFrom ?? day), routine: await r.planner.routine(), routineStart: await r.settings.get<string | null>('routine_start', null) }), [day, moveFrom]);
  const [target, setTarget] = useState(day && day >= today ? day : today);
  const [kind, setKind] = useState<'workout' | 'rest'>('workout');
  const [programId, setProgramId] = useState<string | null>(null);
  const [dayId, setDayId] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [timeError, setTimeError] = useState<string | null>(null);
  const dates = Array.from({ length: 21 }, (_, i) => addDays(today, i));
  const program = data?.programs.find((p) => p.id === programId) ?? null;

  const save = async () => {
    const r = repos();
    if (time && !TIME_RE.test(time)) return setTimeError(t('planner.timeInvalid'));
    if (moveKey && moveFrom && data) {
      const item = itemsForDay(moveFrom, data.entries, data.routine, data.routineStart).find((i) => i.key === moveKey);
      if (!item) return router.back();
      if (target === moveFrom) return Alert.alert(t('planner.sameDay'));
      await moveItem(r, item, target);
    } else {
      if (kind === 'workout' && !programId) return Alert.alert(t('planner.pickProgram'));
      await r.planner.add({ day: target, kind, programId: kind === 'workout' ? programId : null, programDayId: kind === 'workout' ? (dayId ?? program?.days[0]?.id ?? null) : null, time: time || null, note: cleanText(note, 200) });
      useSession.getState().bump();
    }
    void syncNotifications(r, i18n.t);
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={moveKey ? t('planner.moveHere') : t('common.save')} onPress={() => void save()} testID="save-schedule" />}>
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('planner.date')}</Text>
        <ChipScroller>
          {dates.map((d) => (
            <Chip key={d} label={d === today ? t('home.today') : fmt.shortDay(fromDayKey(d))} selected={target === d} onPress={() => setTarget(d)} />
          ))}
        </ChipScroller>
        <Text variant="caption" tone="subtle">{fmt.longDay(fromDayKey(target))}</Text>
      </Stack>
      {!moveKey ? (
        <>
          <Row gap={2}>
            <Chip label={t('planner.workout')} icon="barbell-outline" selected={kind === 'workout'} onPress={() => setKind('workout')} />
            <Chip label={t('planner.restDay')} icon="bed-outline" selected={kind === 'rest'} onPress={() => setKind('rest')} />
          </Row>
          {kind === 'workout' ? (
            <Stack gap={2}>
              <Text variant="label" tone="muted">{t('planner.program')}</Text>
              {data?.programs.length ? (
                <Row wrap gap={2}>
                  {data.programs.map((p) => (
                    <Chip key={p.id} label={p.name} selected={programId === p.id} onPress={() => { setProgramId(p.id); setDayId(p.days[0]?.id ?? null); }} />
                  ))}
                </Row>
              ) : (
                <Text tone="subtle">{t('planner.noProgramsBody')}</Text>
              )}
              {program && program.days.length > 1 ? (
                <>
                  <Text variant="label" tone="muted">{t('planner.programDay')}</Text>
                  <Row wrap gap={2}>
                    {program.days.map((d) => <Chip key={d.id} label={d.name} selected={dayId === d.id} onPress={() => setDayId(d.id)} />)}
                  </Row>
                </>
              ) : null}
              <Field label={t('planner.time')} value={time} onChangeText={(s) => { setTime(s); setTimeError(null); }} placeholder="18:30" keyboardType="numbers-and-punctuation" maxLength={5} error={timeError} />
            </Stack>
          ) : null}
          <Field label={t('planner.note')} value={note} onChangeText={setNote} maxLength={200} />
        </>
      ) : null}
    </Screen>
  );
}
