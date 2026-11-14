import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { addDays, startOfWeek, fromDayKey } from '@factory/app-core';
import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Stepper } from '@/components/ui';
import { repos } from '@/database';
import { useData } from '@/hooks';
import { fmt } from '@/i18n';
import { syncNotifications } from '@/services/reminders';
import { saveRoutine } from '@/services/plannerService';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { RoutineSlot, Weekday } from '@/types';

type Choice = { kind: 'none' } | { kind: 'rest' } | { kind: 'workout'; programId: string; programDayId: string | null };

/** Weekly routine: what to do on each weekday + weekly frequency target. Applies from today on. */
export default function Routine() {
  const { t, i18n } = useTranslation();
  const today = useSession((s) => s.today);
  const weeklyTarget = usePreferences((s) => s.weeklyTarget);
  const { data } = useData(async (r) => ({ programs: await r.programs.list(), routine: await r.planner.routine() }));
  // Local edits on top of the saved routine (null = untouched).
  const [edits, setSlots] = useState<Record<number, Choice> | null>(null);
  const monday = startOfWeek(today);
  const saved = useMemo(() => {
    const next: Record<number, Choice> = {};
    for (let w = 0; w < 7; w++) {
      const s = data?.routine.find((x) => x.weekday === w);
      next[w] = !s ? { kind: 'none' } : s.kind === 'rest' ? { kind: 'rest' } : { kind: 'workout', programId: s.programId ?? '', programDayId: s.programDayId };
    }
    return next;
  }, [data]);
  const slots = edits ?? saved;

  const save = async () => {
    const list: RoutineSlot[] = [];
    for (let w = 0; w < 7; w++) {
      const c = slots[w];
      if (!c || c.kind === 'none') continue;
      list.push(c.kind === 'rest' ? { weekday: w as Weekday, kind: 'rest', programId: null, programDayId: null, time: null } : { weekday: w as Weekday, kind: 'workout', programId: c.programId, programDayId: c.programDayId, time: null });
    }
    await saveRoutine(repos(), list);
    void syncNotifications(repos(), i18n.t);
    router.back();
  };

  /** Fills workout days with the program's days in order (A, B, C, A…). */
  const autoFill = (programId: string) => {
    const p = data?.programs.find((x) => x.id === programId);
    if (!p) return;
    let k = 0;
    const next = { ...slots };
    for (let w = 0; w < 7; w++) {
      if (next[w]?.kind === 'workout') {
        next[w] = { kind: 'workout', programId, programDayId: p.days[k % p.days.length]?.id ?? null };
        k++;
      }
    }
    setSlots(next);
  };

  const workoutDays = Object.values(slots).filter((s) => s.kind === 'workout').length;

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-routine" />}>
      <RouterStack.Screen options={{ title: t('routine.title') }} />
      <Text tone="muted">{t('routine.intro')}</Text>
      <Card>
        <Stepper label={t('routine.weeklyTarget')} value={weeklyTarget} min={1} max={7} unit={t('onboarding.perWeek')} onChange={(v) => usePreferences.getState().set({ weeklyTarget: v ?? 3 })} />
        <Text variant="caption" tone="subtle">{t('routine.targetHint')}</Text>
      </Card>
      {Array.from({ length: 7 }, (_, w) => {
        const c = slots[w] ?? { kind: 'none' };
        const program = c.kind === 'workout' ? data?.programs.find((p) => p.id === c.programId) : undefined;
        return (
          <Card key={w}>
            <Text variant="subheading">{fmt.date(fromDayKey(addDays(monday, w)), { weekday: 'long' })}</Text>
            <Row wrap gap={2}>
              <Chip label={t('routine.none')} selected={c.kind === 'none'} onPress={() => setSlots({ ...slots, [w]: { kind: 'none' } })} />
              <Chip label={t('planner.restDay')} icon="bed-outline" selected={c.kind === 'rest'} onPress={() => setSlots({ ...slots, [w]: { kind: 'rest' } })} />
              {data?.programs.map((p) => (
                <Chip key={p.id} label={p.name} icon="barbell-outline" selected={c.kind === 'workout' && c.programId === p.id} onPress={() => setSlots({ ...slots, [w]: { kind: 'workout', programId: p.id, programDayId: p.days[0]?.id ?? null } })} />
              ))}
            </Row>
            {program && program.days.length > 1 && c.kind === 'workout' ? (
              <Row wrap gap={2}>
                {program.days.map((d) => (
                  <Chip key={d.id} label={d.name} selected={c.programDayId === d.id} onPress={() => setSlots({ ...slots, [w]: { ...c, programDayId: d.id } })} />
                ))}
              </Row>
            ) : null}
          </Card>
        );
      })}
      {data?.programs.length && workoutDays > 1 ? (
        <Stack gap={2}>
          <Text variant="caption" tone="subtle">{t('routine.autoFillHint')}</Text>
          <Row wrap gap={2}>
            {data.programs.filter((p) => p.days.length > 1).map((p) => <Chip key={p.id} label={t('routine.autoFill', { name: p.name })} icon="sparkles" selected={false} onPress={() => autoFill(p.id)} />)}
          </Row>
        </Stack>
      ) : null}
      <Text variant="caption" tone="subtle">{t('routine.restNote', { count: workoutDays })}</Text>
    </Screen>
  );
}
