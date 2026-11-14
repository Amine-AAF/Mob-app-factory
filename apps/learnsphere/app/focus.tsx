import { Button, Chip, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, View } from 'react-native';

import { SubjectPicker } from '@/components/pickers';
import { Panel, ProgressRing, ShareBars, Stepper } from '@/components/ui';
import { repos } from '@/database';
import { computeFocus, FOCUS_LIMITS, FOCUS_PRESETS, formatCountdown, msToMinutes, upcomingBoundaries, type FocusConfig, type FocusPresetId } from '@/features/focus/pomodoro';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { cancelFocusAlerts, ensurePermission, scheduleFocusAlerts } from '@/services/notifications';
import { afterLearningWrite } from '@/services/progress';
import { useFocus } from '@/store/focus';
import { usePreferences } from '@/store/preferences';

/**
 * Focus timer. Time is derived from persisted timestamps (store/focus.ts + features/focus/pomodoro.ts):
 * the interval below only refreshes the display; backgrounding or killing the app loses nothing.
 * No ads are shown on this screen.
 */
export default function Focus() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ subjectId?: string; sessionId?: string }>();
  const { run, lastConfig, linkedSessionId, start, pause, resume, skip, clear } = useFocus();
  const prefs = usePreferences();
  const [config, setConfig] = useState<FocusConfig>(lastConfig);
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || run?.subjectId || null);
  const [now, setNow] = useState(() => Date.now());
  const saving = useRef(false);
  const lastPhase = useRef<string | null>(null);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('active'), []);
  const { data: totals } = useAsync(() => repos().planner.focusTotals(), []);

  const snap = run ? computeFocus(run, now) : null;

  // Display refresh + immediate recompute when the app returns to the foreground.
  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const sub = AppState.addEventListener('change', (state) => state === 'active' && setNow(Date.now()));
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [run]);

  useEffect(() => {
    if (!run || run.pausedAt !== null || !prefs.keepScreenAwakeInFocus) return;
    void activateKeepAwakeAsync('focus');
    return () => {
      void deactivateKeepAwake('focus');
    };
  }, [run, prefs.keepScreenAwakeInFocus]);

  // Gentle haptic on phase change while the screen is open.
  useEffect(() => {
    if (!snap) return;
    if (lastPhase.current && lastPhase.current !== snap.phase && prefs.hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    lastPhase.current = snap.phase;
  }, [snap?.phase, snap, prefs.hapticsEnabled]);

  const finish = useCallback(async () => {
    if (!run || saving.current) return;
    saving.current = true;
    const s = computeFocus(run, Date.now());
    const minutes = msToMinutes(s.focusedMs);
    await cancelFocusAlerts();
    if (minutes > 0) {
      await repos().planner.saveFocus({
        subjectId: run.subjectId,
        preset: run.config.preset,
        startedAt: new Date(run.startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        focusMinutes: minutes,
        cycles: s.completedCycles,
        completed: s.phase === 'finished',
      });
      if (linkedSessionId) await repos().planner.completeSession(linkedSessionId, minutes);
      track('focus_completed', { preset: run.config.preset, minutes });
    }
    clear();
    saving.current = false;
    await afterLearningWrite(repos());
  }, [run, linkedSessionId, clear]);

  useEffect(() => {
    if (snap?.phase === 'finished') void finish();
  }, [snap?.phase, finish]);

  const begin = async () => {
    const at = Date.now();
    start(config, subjectId, at, params.sessionId || null);
    setNow(at);
    if ((await ensurePermission(i18n.t)) === 'granted') {
      const r = useFocus.getState().run;
      if (r) await scheduleFocusAlerts(upcomingBoundaries(r, at), i18n.t);
    }
  };

  const togglePause = async () => {
    const at = Date.now();
    if (run?.pausedAt !== null) {
      resume(at);
      const r = useFocus.getState().run;
      if (r) await scheduleFocusAlerts(upcomingBoundaries(r, at), i18n.t);
    } else {
      pause(at);
      await cancelFocusAlerts();
    }
    setNow(at);
  };

  const doSkip = async () => {
    const at = Date.now();
    skip(at);
    setNow(at);
    const r = useFocus.getState().run;
    if (r && r.pausedAt === null) await scheduleFocusAlerts(upcomingBoundaries(r, at), i18n.t);
  };

  const choosePreset = (id: FocusPresetId) => setConfig(id === 'custom' ? { ...config, preset: 'custom' } : FOCUS_PRESETS[id]);

  if (run && snap) {
    const phaseColor = snap.phase === 'focus' ? theme.colors.primary : theme.colors.success;
    const subject = subjects.find((s) => s.id === run.subjectId);
    return (
      <Screen edges={['bottom']} testID="focus-running">
        <Stack gap={4} style={{ alignItems: 'center', paddingTop: 12 }}>
          <Text variant="label" tone="subtle">
            {t(`focus.phases.${snap.phase}`)} · {t('focus.cycleOf', { current: snap.cycle, total: snap.cycles })}
          </Text>
          {subject ? <Text variant="subheading">{subject.name}</Text> : null}
          <ProgressRing size={240} progress={snap.phaseDurationMs ? 1 - snap.phaseRemainingMs / snap.phaseDurationMs : 1} label={formatCountdown(snap.phaseRemainingMs)} sublabel={snap.paused ? t('focus.paused') : t(`focus.phases.${snap.phase}`)} color={phaseColor} />
          <Text tone="muted">{t('focus.focusedSoFar', { value: fmt.duration(msToMinutes(snap.focusedMs)) })}</Text>
        </Stack>
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button label={snap.paused ? t('focus.resume') : t('focus.pause')} icon={snap.paused ? 'play' : 'pause'} onPress={togglePause} testID="focus-pause" />
          </View>
          <View style={{ flex: 1 }}>
            <Button label={t('focus.skip')} variant="secondary" icon="play-skip-forward" onPress={doSkip} />
          </View>
        </Row>
        <Button label={t('focus.stop')} variant="danger" icon="stop" onPress={finish} testID="focus-stop" />
        <Text variant="caption" tone="subtle" center>
          {t('focus.backgroundNote')}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} footer={<Button label={t('focus.start')} icon="play" onPress={begin} testID="focus-start" />}>
      <Panel title={t('focus.mode')} icon="timer-outline">
        <Row gap={2} wrap>
          {(['25_5', '50_10', 'custom'] as const).map((id) => (
            <Chip key={id} label={t(`focus.presets.${id}`)} selected={config.preset === id} onPress={() => choosePreset(id)} />
          ))}
        </Row>
        {config.preset === 'custom' ? (
          <Stack gap={1}>
            <Stepper label={t('focus.focusLength')} value={config.focusMin} onChange={(v) => setConfig({ ...config, focusMin: v })} min={FOCUS_LIMITS.focusMin[0]} max={FOCUS_LIMITS.focusMin[1]} step={5} format={fmt.duration} />
            <Stepper label={t('focus.shortBreak')} value={config.shortBreakMin} onChange={(v) => setConfig({ ...config, shortBreakMin: v })} min={FOCUS_LIMITS.shortBreakMin[0]} max={FOCUS_LIMITS.shortBreakMin[1]} format={fmt.duration} />
            <Stepper label={t('focus.longBreak')} value={config.longBreakMin} onChange={(v) => setConfig({ ...config, longBreakMin: v })} min={FOCUS_LIMITS.longBreakMin[0]} max={FOCUS_LIMITS.longBreakMin[1]} step={5} format={fmt.duration} />
            <Stepper label={t('focus.cycles')} value={config.cycles} onChange={(v) => setConfig({ ...config, cycles: v })} min={FOCUS_LIMITS.cycles[0]} max={FOCUS_LIMITS.cycles[1]} />
          </Stack>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('focus.presetSummary', { focus: config.focusMin, short: config.shortBreakMin, long: config.longBreakMin, cycles: config.cycles })}
          </Text>
        )}
      </Panel>
      <SubjectPicker label={t('focus.whatSubject')} subjects={subjects} value={subjectId} onChange={setSubjectId} />
      <Panel title={t('focus.stats')} icon="stats-chart-outline" action={t('planner.history')} onAction={() => router.push('/planner/history')}>
        <Row gap={3}>
          <Stat value={fmt.number(totals?.sessions ?? 0)} label={t('focus.sessions')} icon="timer-outline" />
          <Stat value={fmt.duration(totals?.minutes ?? 0)} label={t('focus.totalTime')} icon="time-outline" tone="accent" />
        </Row>
        {totals && totals.bySubject.length ? (
          <ShareBars
            format={fmt.duration}
            data={totals.bySubject.slice(0, 6).map((b) => {
              const s = subjects.find((x) => x.id === b.subjectId);
              return { label: s?.name ?? t('common.noSubject'), value: b.minutes, color: s?.color ?? theme.colors.textSubtle };
            })}
          />
        ) : null}
      </Panel>
    </Screen>
  );
}
