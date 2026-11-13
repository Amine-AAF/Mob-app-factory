import { Badge, Button, Card, Icon, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stepper } from '@/components/ui';
import { repos, type SetInput } from '@/database';
import { elapsedMs, progressOf, restRemainingSec, suggestedSet } from '@/features/workout/engine';
import { displayToKg, displayToMeters, formatDuration, kgToDisplay, metersToDisplay, roundDisplay, weightStep } from '@/features/units';
import { useData, useExercises, useFormat, useNow } from '@/hooks';
import { recordError } from '@/services/analytics';
import { cue } from '@/services/cues';
import { adjustRest, discard, editSet, finish, goTo, logSet, pause, reopenExercise, resume, skipExercise, skipRest, startRest, WorkoutError } from '@/services/workoutService';
import { usePreferences } from '@/store/preferences';
import type { SessionExercise } from '@/types';

const KEEP_AWAKE_TAG = 'fittrack-workout';

/**
 * Active workout. Designed for use mid-set: big targets (≥ 56 dp), the essentials
 * always visible, one tap to validate. No ads, ever. All timing comes from stored
 * timestamps (see features/workout/engine.ts): backgrounding, locking the phone,
 * a call or the app being killed do not lose time or data.
 */
export default function ActiveWorkout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const ex = useExercises();
  const f = useFormat();
  const now = useNow(250);
  const { data: session } = useData(async (r) => {
    const s = await r.sessions.active();
    return s ? r.sessions.get(s.id) : null;
  });
  const [values, setValues] = useState<SetInput>({ reps: null, weightKg: null, durationSec: null, distanceM: null });
  const [lastHistory, setLastHistory] = useState<SetInput | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(false);
  const restWasRunning = useRef(false);

  const current: SessionExercise | undefined = session?.exercises[Math.min(session.currentIndex, Math.max(0, session.exercises.length - 1))];
  const exercise = current ? ex.get(current.exerciseId) : undefined;
  const tracking = exercise?.tracking ?? 'weight_reps';
  const restAlerts = { enabled: prefs.restNotification, title: t('workout.restOverTitle'), body: t('workout.restOverBody') };

  // Keep the screen on during the workout (optional).
  useEffect(() => {
    if (!prefs.keepScreenOn) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [prefs.keepScreenOn]);

  // Android back: never leave silently — the workout keeps running in the background.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  // Pre-fill the inputs when the exercise or its set count changes.
  const key = `${current?.id}:${current?.sets.length}`;
  useEffect(() => {
    if (!current) return;
    let alive = true;
    void repos()
      .sessions.lastSet(current.exerciseId, current.sessionId)
      .then((h) => {
        if (!alive) return;
        setLastHistory(h);
        setValues(suggestedSet(current, h));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const rest = session ? restRemainingSec(session, now) : 0;
  useEffect(() => {
    if (rest > 0) restWasRunning.current = true;
    else if (restWasRunning.current) {
      restWasRunning.current = false;
      cue('end');
    }
  }, [rest]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  if (session === undefined) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  if (session === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24, justifyContent: 'center', gap: 16 }}>
        <Text variant="title">{t('workout.noneTitle')}</Text>
        <Button label={t('common.back')} onPress={() => router.replace('/(tabs)')} />
      </SafeAreaView>
    );
  }

  const r = repos();
  const progress = progressOf(session);
  const paused = session.status === 'paused';
  const elapsed = elapsedMs(session, now) / 1000;

  const validate = async () => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await logSet(r, session.id, current.id, values, tracking, { autoRest: prefs.autoStartRest, restAlerts });
      cue('phase', { sound: false });
      if (res.records.length) setToast(t('workout.newRecord', { kind: t(`records.kinds.${res.records[0]!.kind}`) }));
      if (res.workoutFinished) askFinish(true);
    } catch (e) {
      if (e instanceof WorkoutError && e.code === 'invalid_set') Alert.alert(t('workout.invalidSetTitle'), t(`workout.invalidSet.${tracking}`));
      else recordError(e, 'log_set');
    } finally {
      setBusy(false);
    }
  };

  const doFinish = async () => {
    const summary = await finish(r, session.id);
    if (summary) router.replace({ pathname: '/workout/summary', params: { id: summary.sessionId, achievements: summary.achievements.join(',') } });
    else router.replace('/(tabs)');
  };

  const askFinish = (allDone = false) => {
    const sets = session.exercises.reduce((a, e) => a + e.sets.length, 0) + (allDone ? 1 : 0);
    Alert.alert(allDone ? t('workout.allDoneTitle') : t('workout.finishTitle'), sets ? (allDone ? t('workout.allDoneBody') : t('workout.finishBody', { done: progress.doneSets, total: progress.totalSets })) : t('workout.finishEmptyBody'), [
      { text: t('workout.keepGoing'), style: 'cancel' },
      { text: t('workout.finish'), onPress: () => void doFinish() },
    ]);
  };

  const askDiscard = () =>
    Alert.alert(t('workout.discardTitle'), t('workout.discardBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.discard'), style: 'destructive', onPress: async () => { await discard(r, session.id); router.replace('/(tabs)'); } },
    ]);

  const editPastSet = (setId: string, idx: number) =>
    Alert.alert(t('workout.setN', { n: idx + 1 }), undefined, [
      { text: t('workout.useCurrentValues'), onPress: () => void editSet(r, setId, current!.exerciseId, tracking, values).catch(() => Alert.alert(t('workout.invalidSetTitle'), t(`workout.invalidSet.${tracking}`))) },
      { text: t('common.delete'), style: 'destructive', onPress: () => void editSet(r, setId, current!.exerciseId, tracking, null) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  const setTarget =
    current && (tracking === 'weight_reps' || tracking === 'reps')
      ? current.repsMin && current.repsMax && current.repsMin !== current.repsMax
        ? t('workout.targetReps', { min: current.repsMin, max: current.repsMax })
        : current.repsMax || current.repsMin
          ? t('workout.targetRepsFixed', { count: current.repsMax ?? current.repsMin ?? 0 })
          : null
      : current?.durationSec
        ? t('workout.targetDuration', { time: formatDuration(current.durationSec) })
        : null;
  const setNumber = current ? Math.min(current.sets.length + 1, Math.max(current.targetSets, current.sets.length + 1)) : 0;
  const exerciseDone = !!current && current.status !== 'pending';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="active-workout">
      {/* Header: name, elapsed time, pause, finish */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}>
        <Row gap={1}>
          <IconButton icon="chevron-down" label={t('workout.minimize')} onPress={() => router.back()} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading" numberOfLines={1}>
              {session.name}
            </Text>
            <Text variant="caption" tone={paused ? 'warning' : 'muted'} accessibilityLabel={t('workout.elapsedA11y', { time: formatDuration(elapsed) })}>
              {paused ? `${t('workout.paused')} · ${formatDuration(elapsed)}` : formatDuration(elapsed)}
            </Text>
          </View>
          <IconButton icon={paused ? 'play' : 'pause'} label={paused ? t('workout.resume') : t('workout.pause')} onPress={() => void (paused ? resume(r, session.id, restAlerts) : pause(r, session.id))} />
          <Button label={t('workout.finish')} size="md" onPress={() => askFinish()} testID="finish-workout" />
        </Row>
        <ProgressBar progress={progress.ratio} label={t('workout.progressA11y', { done: progress.doneSets, total: progress.totalSets })} />
        <Text variant="caption" tone="subtle">
          {t('workout.progress', { done: progress.doneSets, total: progress.totalSets, exDone: progress.doneExercises, exTotal: progress.totalExercises })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {toast ? (
          <Card tone="accent" accessibilityLabel={toast}>
            <Row gap={2}>
              <Icon name="trophy" size={20} color={theme.colors.accent} />
              <Text variant="subheading" style={{ flex: 1 }} accessibilityLiveRegion="polite">
                {toast}
              </Text>
            </Row>
          </Card>
        ) : null}

        {/* Rest timer */}
        {rest > 0 ? (
          <Card tone="primary" testID="rest-timer">
            <Text variant="label" tone="primary" center>
              {t('workout.rest')}
            </Text>
            <Text style={{ fontSize: 64, lineHeight: 72, fontWeight: '800', textAlign: 'center', color: theme.colors.text }} accessibilityLiveRegion="polite" accessibilityLabel={t('workout.restA11y', { time: formatDuration(rest) })}>
              {formatDuration(rest)}
            </Text>
            <Row gap={2}>
              <View style={{ flex: 1 }}>
                <Button label="−15 s" variant="secondary" onPress={() => void adjustRest(r, session.id, -15, restAlerts)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="+15 s" variant="secondary" onPress={() => void adjustRest(r, session.id, 15, restAlerts)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('workout.skipRest')} onPress={() => void skipRest(r, session.id)} testID="skip-rest" />
              </View>
            </Row>
          </Card>
        ) : null}

        {/* Current exercise */}
        {current && exercise ? (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Badge label={t('workout.exerciseOf', { n: session.currentIndex + 1, total: session.exercises.length })} tone="neutral" />
              <Row gap={0}>
                <IconButton icon="information-circle-outline" label={t('workout.howTo')} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })} />
                <IconButton icon="list" label={t('workout.allExercises')} onPress={() => setShowList((v) => !v)} />
              </Row>
            </Row>
            <Text variant="title" accessibilityRole="header">
              {exercise.name}
            </Text>
            <Text variant="subheading" tone="primary">
              {exerciseDone ? t(`workout.status.${current.status}`) : t('workout.setOf', { n: setNumber, total: Math.max(current.targetSets, setNumber) })}
              {setTarget && !exerciseDone ? ` · ${setTarget}` : ''}
            </Text>
            {lastHistory && (tracking === 'weight_reps' || tracking === 'reps') ? (
              <Text variant="caption" tone="subtle">
                {t('workout.lastTime', { value: tracking === 'weight_reps' ? `${f.weight(lastHistory.weightKg ?? 0)} × ${lastHistory.reps ?? 0}` : String(lastHistory.reps ?? 0) })}
              </Text>
            ) : null}
            {current.notes ? <Text variant="caption" tone="muted">{current.notes}</Text> : null}

            {!exerciseDone ? (
              <Stack gap={3} style={{ marginTop: 8 }}>
                {tracking === 'weight_reps' ? (
                  <Stepper
                    big
                    label={t('workout.weight')}
                    unit={t(`units.${f.units.weight}`)}
                    value={values.weightKg === null ? null : roundDisplay(kgToDisplay(values.weightKg, f.units.weight), 2)}
                    step={weightStep(f.units.weight)}
                    decimals={2}
                    max={1000}
                    onChange={(v) => setValues((s) => ({ ...s, weightKg: v === null ? null : displayToKg(v, f.units.weight) }))}
                    testID="input-weight"
                  />
                ) : null}
                {tracking === 'weight_reps' || tracking === 'reps' ? (
                  <Stepper big label={t('workout.reps')} value={values.reps} min={0} max={1000} onChange={(v) => setValues((s) => ({ ...s, reps: v }))} testID="input-reps" />
                ) : null}
                {tracking === 'time' || tracking === 'distance_time' ? (
                  <Stepper big label={t('workout.durationSec')} unit={formatDuration(values.durationSec ?? 0)} value={values.durationSec} min={0} max={6 * 3600} step={tracking === 'time' ? 5 : 30} onChange={(v) => setValues((s) => ({ ...s, durationSec: v }))} testID="input-duration" />
                ) : null}
                {tracking === 'distance_time' ? (
                  <Stepper
                    big
                    label={t('workout.distance')}
                    unit={t(`units.${f.units.distance}`)}
                    value={values.distanceM === null ? null : roundDisplay(metersToDisplay(values.distanceM, f.units.distance), 2)}
                    step={0.1}
                    decimals={2}
                    onChange={(v) => setValues((s) => ({ ...s, distanceM: v === null ? null : displayToMeters(v, f.units.distance) }))}
                    testID="input-distance"
                  />
                ) : null}
                <Pressable
                  onPress={() => void validate()}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t('workout.validateSetA11y', { n: setNumber })}
                  testID="validate-set"
                  style={({ pressed }) => ({ minHeight: 72, borderRadius: theme.radius.lg, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, opacity: busy ? 0.6 : 1 })}
                >
                  <Icon name="checkmark-circle" size={30} color={theme.colors.onPrimary} />
                  <Text variant="heading" style={{ color: theme.colors.onPrimary }}>
                    {t('workout.validateSet')}
                  </Text>
                </Pressable>
                <Row gap={2}>
                  <View style={{ flex: 1 }}>
                    <Button label={t('workout.startRest')} variant="secondary" size="md" icon="timer-outline" onPress={() => void startRest(r, session.id, current.restSec || prefs.defaultRestSec, restAlerts)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label={t('workout.skipExercise')} variant="ghost" size="md" onPress={() => void skipExercise(r, session.id, current.id)} testID="skip-exercise" />
                  </View>
                </Row>
              </Stack>
            ) : (
              <Button label={t('workout.addSet')} variant="secondary" icon="add" onPress={() => void reopenExercise(r, session.id, current.id, session.currentIndex)} />
            )}

            {current.sets.length ? (
              <Stack gap={1} style={{ marginTop: 8 }}>
                <Text variant="label" tone="muted">
                  {t('workout.doneSets')}
                </Text>
                {current.sets.map((s, i) => (
                  <Pressable key={s.id} onPress={() => editPastSet(s.id, i)} accessibilityRole="button" accessibilityLabel={t('workout.editSetA11y', { n: i + 1 })} style={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 40, alignItems: 'center' }}>
                    <Text variant="bodySmall" tone="muted">
                      {t('workout.setN', { n: i + 1 })}
                    </Text>
                    <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                      {tracking === 'weight_reps'
                        ? `${f.weight(s.weightKg ?? 0)} × ${s.reps ?? 0}`
                        : tracking === 'reps'
                          ? t('units.reps', { count: s.reps ?? 0 })
                          : tracking === 'time'
                            ? formatDuration(s.durationSec ?? 0)
                            : `${f.distance(s.distanceM)} · ${formatDuration(s.durationSec ?? 0)}`}
                    </Text>
                  </Pressable>
                ))}
              </Stack>
            ) : null}
          </Card>
        ) : (
          <Card>
            <Text variant="heading">{t('workout.emptySessionTitle')}</Text>
            <Text tone="muted">{t('workout.emptySessionBody')}</Text>
          </Card>
        )}

        {/* Navigation between exercises */}
        {session.exercises.length > 1 ? (
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button label={t('workout.previous')} variant="secondary" icon="chevron-back" disabled={session.currentIndex === 0} onPress={() => void goTo(r, session.id, session.currentIndex - 1)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('workout.next')} variant="secondary" disabled={session.currentIndex >= session.exercises.length - 1} onPress={() => void goTo(r, session.id, session.currentIndex + 1)} testID="next-exercise" />
            </View>
          </Row>
        ) : null}

        {showList ? (
          <Card>
            {session.exercises.map((e, i) => (
              <Pressable key={e.id} onPress={() => { void goTo(r, session.id, i); setShowList(false); }} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}>
                <Icon
                  name={e.status === 'done' ? 'checkmark-circle' : e.status === 'skipped' ? 'remove-circle-outline' : i === session.currentIndex ? 'radio-button-on' : 'ellipse-outline'}
                  size={20}
                  color={e.status === 'done' ? theme.colors.success : i === session.currentIndex ? theme.colors.primary : theme.colors.textSubtle}
                />
                <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                  {ex.get(e.exerciseId)?.name ?? e.exerciseId}
                </Text>
                <Text variant="caption" tone="muted">{`${e.sets.length}/${e.targetSets}`}</Text>
              </Pressable>
            ))}
          </Card>
        ) : null}

        <Button label={t('workout.addExercise')} variant="ghost" icon="add" onPress={() => router.push({ pathname: '/exercise/pick', params: { mode: 'session', sessionId: session.id } })} />
        <Button label={t('workout.discard')} variant="ghost" onPress={askDiscard} />
        <Text variant="caption" tone="subtle" center>
          {t('workout.safety')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
