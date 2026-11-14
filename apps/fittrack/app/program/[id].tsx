import { Badge, Button, Card, Chip, EmptyState, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ChipScroller, Field, Stepper } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { displayToKg, displayToMeters, kgToDisplay, metersToDisplay, roundDisplay, weightStep } from '@/features/units';
import { useData, useExercises, useFormat } from '@/hooks';
import { startFromProgramDay, WorkoutError } from '@/services/workoutService';
import { useIsPremium, useSession } from '@/store/session';
import type { ProgramExercise } from '@/types';
import { cleanText } from '@/utils';

/** Workout Builder: days, exercises, order and targets (sets, reps, load, duration, rest, notes). */
export default function ProgramBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const ex = useExercises();
  const f = useFormat();
  const { data: program } = useData((r) => r.programs.get(id), [id]);
  const [dayIndex, setDayIndex] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const bump = () => useSession.getState().bump();

  if (program === undefined) return null;
  if (!program) return <EmptyState icon="alert-circle" title={t('common.notFound')} />;
  const day = program.days[Math.min(dayIndex, program.days.length - 1)];
  const r = repos();

  const start = async () => {
    if (!day) return;
    try {
      await startFromProgramDay(r, program.id, day.id);
      router.push('/workout/active');
    } catch (e) {
      if (e instanceof WorkoutError && e.code === 'empty') Alert.alert(t('workout.emptyTitle'), t('workout.emptyBody'));
      else if (e instanceof WorkoutError && e.code === 'already_active') Alert.alert(t('workout.alreadyActiveTitle'), t('workout.alreadyActiveBody'), [{ text: t('common.ok'), onPress: () => router.push('/workout/active') }]);
    }
  };

  const duplicate = async () => {
    if (!premium && (await r.programs.countOwn()) >= FREE_LIMITS.ownPrograms) return router.push({ pathname: '/paywall', params: { source: 'program_limit' } });
    const nid = await r.programs.duplicate(program.id, t('builder.copyName', { name: program.name }));
    bump();
    if (nid) router.replace({ pathname: '/program/[id]', params: { id: nid } });
  };

  const menu = () =>
    Alert.alert(program.name, undefined, [
      { text: t('builder.editDetails'), onPress: () => router.push({ pathname: '/program/new', params: { id: program.id } }) },
      { text: t('builder.duplicate'), onPress: () => void duplicate() },
      { text: program.archivedAt ? t('builder.unarchive') : t('builder.archive'), onPress: async () => { await r.programs.archive(program.id, !program.archivedAt); bump(); } },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('builder.deleteTitle'), t('builder.deleteBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: async () => { await r.programs.remove(program.id); bump(); router.back(); } },
          ]),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  const patch = async (pe: ProgramExercise, p: Partial<ProgramExercise>) => {
    await r.programs.updateExercise(pe.id, p);
    bump();
  };

  return (
    <Screen edges={[]} footer={day && day.exercises.length ? <Button label={t('builder.startDay', { name: day.name })} icon="play" onPress={() => void start()} testID="start-day" /> : undefined}>
      <RouterStack.Screen options={{ title: program.name, headerRight: () => <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} /> }} />
      {program.description ? <Text tone="muted">{program.description}</Text> : null}
      <Row wrap gap={2}>
        <Badge label={t(`programTypes.${program.type}`)} tone="neutral" />
        <Badge label={t(`goals.${program.goal}`)} tone="primary" />
        <Badge label={t(`levels.${program.level}`)} tone="neutral" />
      </Row>
      <ChipScroller>
        {program.days.map((d, i) => (
          <Chip key={d.id} label={d.name} selected={i === dayIndex} onPress={() => setDayIndex(i)} testID={`day-${i}`} />
        ))}
        <Chip
          label={t('builder.addDay')}
          icon="add"
          selected={false}
          onPress={async () => {
            await r.programs.addDay(program.id, t('builder.dayName', { n: program.days.length + 1 }));
            bump();
            setDayIndex(program.days.length);
          }}
          testID="add-day"
        />
      </ChipScroller>

      {day ? (
        <>
          {renaming === day.id ? (
            <RenameDay
              initial={day.name}
              onDone={async (name) => {
                if (name) await r.programs.updateDay(day.id, { name });
                setRenaming(null);
                bump();
              }}
            />
          ) : (
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="heading">{day.name}</Text>
              <Row gap={0}>
                <IconButton icon="create-outline" label={t('builder.renameDay')} onPress={() => setRenaming(day.id)} />
                {program.days.length > 1 ? (
                  <IconButton
                    icon="trash-outline"
                    tone="danger"
                    label={t('builder.deleteDay')}
                    onPress={() =>
                      Alert.alert(t('builder.deleteDay'), t('builder.deleteDayBody', { name: day.name }), [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.delete'), style: 'destructive', onPress: async () => { await r.programs.removeDay(day.id); setDayIndex(0); bump(); } },
                      ])
                    }
                  />
                ) : null}
              </Row>
            </Row>
          )}

          {day.exercises.length === 0 ? <EmptyState icon="barbell-outline" title={t('builder.emptyDayTitle')} message={t('builder.emptyDayBody')} /> : null}

          {day.exercises.map((pe, i) => {
            const e = ex.get(pe.exerciseId);
            const isOpen = open === pe.id;
            const tracking = e?.tracking ?? 'weight_reps';
            const summary =
              tracking === 'time'
                ? `${pe.sets} × ${f.duration(pe.durationSec)}`
                : tracking === 'distance_time'
                  ? `${pe.sets} × ${f.duration(pe.durationSec)}${pe.distanceM ? ` · ${f.distance(pe.distanceM)}` : ''}`
                  : `${pe.sets} × ${pe.repsMin === pe.repsMax || pe.repsMax === null ? (pe.repsMin ?? '—') : `${pe.repsMin}–${pe.repsMax}`}${pe.weightKg ? ` · ${f.weight(pe.weightKg)}` : ''}`;
            return (
              <Card key={pe.id} testID={`pe-${i}`}>
                <Row gap={2}>
                  <Badge label={String(i + 1)} tone="primary" />
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading" numberOfLines={1} onPress={() => setOpen(isOpen ? null : pe.id)}>
                      {e?.name ?? pe.exerciseId}
                    </Text>
                    <Text variant="caption" tone="muted">{`${summary} · ${t('builder.restShort', { time: f.duration(pe.restSec) })}`}</Text>
                  </View>
                  <IconButton icon="chevron-up" label={t('builder.moveUp')} onPress={async () => { await r.programs.moveExercise(pe.id, -1); bump(); }} />
                  <IconButton icon="chevron-down" label={t('builder.moveDown')} onPress={async () => { await r.programs.moveExercise(pe.id, 1); bump(); }} />
                  <IconButton icon={isOpen ? 'close' : 'options-outline'} label={t('builder.editTargets')} onPress={() => setOpen(isOpen ? null : pe.id)} />
                </Row>
                {isOpen ? (
                  <Stack gap={3} style={{ marginTop: 6 }}>
                    <Row gap={3}>
                      <Stepper label={t('builder.sets')} value={pe.sets} min={1} max={20} onChange={(v) => void patch(pe, { sets: v ?? 1 })} />
                      <Stepper label={t('builder.rest')} value={pe.restSec} min={0} max={600} step={15} unit={t('units.sec')} onChange={(v) => void patch(pe, { restSec: v ?? 0 })} />
                    </Row>
                    {tracking === 'weight_reps' || tracking === 'reps' ? (
                      <Row gap={3}>
                        <Stepper label={t('builder.repsMin')} value={pe.repsMin} min={1} max={100} onChange={(v) => void patch(pe, { repsMin: v })} />
                        <Stepper label={t('builder.repsMax')} value={pe.repsMax} min={1} max={100} onChange={(v) => void patch(pe, { repsMax: v })} />
                      </Row>
                    ) : null}
                    {tracking === 'weight_reps' ? (
                      <Stepper
                        label={t('builder.weight')}
                        value={pe.weightKg === null ? null : roundDisplay(kgToDisplay(pe.weightKg, f.units.weight), 2)}
                        step={weightStep(f.units.weight)}
                        decimals={2}
                        max={1000}
                        unit={t(`units.${f.units.weight}`)}
                        onChange={(v) => void patch(pe, { weightKg: v === null ? null : displayToKg(v, f.units.weight) })}
                      />
                    ) : null}
                    {tracking === 'time' || tracking === 'distance_time' ? (
                      <Stepper label={t('builder.duration')} value={pe.durationSec} min={5} max={4 * 3600} step={tracking === 'time' ? 5 : 60} unit={t('units.sec')} onChange={(v) => void patch(pe, { durationSec: v })} />
                    ) : null}
                    {tracking === 'distance_time' ? (
                      <Stepper
                        label={t('builder.distance')}
                        value={pe.distanceM === null ? null : roundDisplay(metersToDisplay(pe.distanceM, f.units.distance), 2)}
                        step={0.5}
                        decimals={2}
                        unit={t(`units.${f.units.distance}`)}
                        onChange={(v) => void patch(pe, { distanceM: v === null ? null : displayToMeters(v, f.units.distance) })}
                      />
                    ) : null}
                    <NotesField initial={pe.notes ?? ''} onSave={(n) => void patch(pe, { notes: cleanText(n, 300) })} />
                    <Row>
                      <Button label={t('builder.viewExercise')} variant="ghost" size="md" onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: pe.exerciseId } })} />
                      <Button label={t('common.remove')} variant="danger" size="md" onPress={async () => { await r.programs.removeExercise(pe.id); setOpen(null); bump(); }} />
                    </Row>
                  </Stack>
                ) : null}
              </Card>
            );
          })}
          <Button label={t('builder.addExercise')} variant="secondary" icon="add" onPress={() => router.push({ pathname: '/exercise/pick', params: { mode: 'day', dayId: day.id } })} testID="add-exercise" />
        </>
      ) : null}
      {program.notes ? (
        <Card tone="alt">
          <Text variant="label" tone="muted">{t('builder.notes')}</Text>
          <Text variant="bodySmall">{program.notes}</Text>
        </Card>
      ) : null}
      <Text variant="caption" tone="subtle" style={{ color: theme.colors.textSubtle }}>
        {t('builder.reorderHint')}
      </Text>
    </Screen>
  );
}

function RenameDay({ initial, onDone }: { initial: string; onDone: (name: string | null) => void }) {
  const { t } = useTranslation();
  const [v, setV] = useState(initial);
  return (
    <Stack gap={2}>
      <Field label={t('builder.dayNameLabel')} value={v} onChangeText={setV} maxLength={40} />
      <Row>
        <Button label={t('common.save')} size="md" onPress={() => onDone(cleanText(v, 40))} />
        <Button label={t('common.cancel')} size="md" variant="ghost" onPress={() => onDone(null)} />
      </Row>
    </Stack>
  );
}

function NotesField({ initial, onSave }: { initial: string; onSave: (n: string) => void }) {
  const { t } = useTranslation();
  const [v, setV] = useState(initial);
  return (
    <Stack gap={2}>
      <Field label={t('builder.exerciseNotes')} value={v} onChangeText={setV} multiline maxLength={300} />
      {v !== initial ? <Button label={t('builder.saveNotes')} size="md" variant="secondary" onPress={() => onSave(v)} /> : null}
    </Stack>
  );
}
