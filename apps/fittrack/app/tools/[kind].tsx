import { Button, Card, Row, Screen, Stack as UIStack, Text, useTheme } from '@factory/design-system';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProgressRing } from '@/components/charts';
import { PremiumGate, Stepper, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { endsAt, pauseRun, PREMIUM_TIMERS, resumeRun, sanitize, startRun, TIMER_PRESETS, timerState, type TimerConfig, type TimerKind, type TimerRun } from '@/features/timers/engine';
import { formatDuration } from '@/features/units';
import { useNow } from '@/hooks';
import { track } from '@/services/analytics';
import { cue } from '@/services/cues';
import { cancelRestAlert, scheduleRestAlert } from '@/services/restAlerts';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const KEEP_AWAKE_TAG = 'fittrack-timer';

/**
 * A timer screen. The run (start instant, pauses) is persisted in SQLite, so the timer
 * survives backgrounding and app restarts; the phase is recomputed from "now".
 * No ads are ever shown here.
 */
export default function TimerScreen() {
  const { kind } = useLocalSearchParams<{ kind: TimerKind }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const defaultRest = usePreferences((s) => s.defaultRestSec);
  const notify = usePreferences((s) => s.restNotification);
  const [config, setConfig] = useState<TimerConfig>(() => ({ ...TIMER_PRESETS[kind ?? 'rest'], ...(kind === 'rest' ? { workSec: defaultRest } : {}) }));
  const [run, setRun] = useState<TimerRun | null>(null);
  const [loaded, setLoaded] = useState(false);
  const now = useNow(200, !!run && !run.pausedAt);
  const lastPhase = useRef(-1);
  const storageKey = `timer:${kind}`;

  useEffect(() => {
    void repos()
      .settings.get<{ config: TimerConfig; run: TimerRun | null } | null>(storageKey, null)
      .then((saved) => {
        if (saved) {
          setConfig(sanitize({ ...saved.config, kind: kind! }));
          setRun(saved.run);
        }
        setLoaded(true);
      });
  }, [storageKey, kind]);

  const persist = (c: TimerConfig, r: TimerRun | null) => void repos().settings.set(storageKey, { config: c, run: r });
  const state = timerState(config, run, now);

  // Phase-change cues (sound / vibration), only while the screen is visible.
  useEffect(() => {
    if (!run) return;
    if (lastPhase.current !== -1 && state.phaseIndex !== lastPhase.current) cue(state.phase === 'done' ? 'end' : 'phase', { sound: config.sound, vibration: config.vibration });
    else if (state.remainingSec <= 3 && state.remainingSec > 0 && state.phase !== 'done' && config.kind !== 'stopwatch' && now % 1000 < 200) cue('tick', { sound: false, vibration: config.vibration });
    lastPhase.current = state.phaseIndex;
  }, [state.phaseIndex, state.phase, state.remainingSec, run, config, now]);

  useEffect(() => {
    if (!run || run.pausedAt || state.phase === 'done') return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [run, state.phase]);

  if (!kind || !TIMER_PRESETS[kind]) return null;
  if (PREMIUM_TIMERS.includes(kind) && !premium) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t(`tools.${kind}.name`) }} />
        <PremiumGate title={t('premium.timersTitle')} message={t('premium.timersBody')} source="timers" />
      </Screen>
    );
  }

  const alert = (r: TimerRun) => {
    const end = endsAt(config, r);
    if (notify && end && config.kind !== 'stopwatch') void scheduleRestAlert(end, t('tools.endTitle'), t('tools.endBody', { name: t(`tools.${kind}.name`) }));
  };
  const start = () => {
    const r = startRun(Date.now());
    lastPhase.current = -1;
    setRun(r);
    persist(config, r);
    alert(r);
    track('timer_used', { kind });
  };
  const toggle = () => {
    if (!run) return start();
    const next = run.pausedAt ? resumeRun(run, Date.now()) : pauseRun(run, Date.now());
    setRun(next);
    persist(config, next);
    if (next.pausedAt) void cancelRestAlert();
    else alert(next);
  };
  const reset = () => {
    setRun(null);
    persist(config, null);
    void cancelRestAlert();
    lastPhase.current = -1;
  };
  const update = (patch: Partial<TimerConfig>) => {
    const c = sanitize({ ...config, ...patch });
    setConfig(c);
    persist(c, run);
  };

  const big = config.kind === 'stopwatch' ? formatDuration(state.elapsedSec) : formatDuration(state.phase === 'done' ? 0 : state.remainingSec);
  const phaseLabel = state.phase === 'done' ? t('tools.done') : config.kind === 'stopwatch' ? t('tools.elapsed') : t(`tools.phase.${state.phase}`);
  const phaseColor = state.phase === 'rest' ? theme.colors.accent : state.phase === 'prep' ? theme.colors.warning : theme.colors.primary;
  const ratio = config.kind === 'stopwatch' ? (state.elapsedSec % 60) / 60 : state.totalSec ? state.elapsedSec / state.totalSec : 0;
  const editable = !run;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t(`tools.${kind}.name`) }} />
      {loaded ? (
        <>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
            <ProgressRing ratio={ratio} size={240} stroke={10} segments={60} color={phaseColor} label={t('tools.a11y', { phase: phaseLabel, time: big })}>
              <Text variant="label" style={{ color: phaseColor }}>
                {phaseLabel}
              </Text>
              <Text style={{ fontSize: 56, lineHeight: 64, fontWeight: '800', color: theme.colors.text }} accessibilityLiveRegion="polite">
                {big}
              </Text>
              {config.rounds > 1 ? <Text variant="subheading" tone="muted">{t('tools.round', { n: Math.max(1, state.round), total: config.rounds })}</Text> : null}
            </ProgressRing>
          </View>
          <Row gap={3}>
            <View style={{ flex: 2 }}>
              <Button label={!run ? t('tools.start') : run.pausedAt ? t('tools.resume') : t('tools.pause')} icon={!run || run.pausedAt ? 'play' : 'pause'} onPress={toggle} disabled={state.phase === 'done' && !!run} testID="timer-toggle" />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('tools.reset')} variant="secondary" onPress={reset} testID="timer-reset" />
            </View>
          </Row>
          {state.phase === 'done' && run ? <Button label={t('tools.again')} variant="ghost" icon="refresh" onPress={start} /> : null}

          <Card>
            <Text variant="subheading">{t('tools.settings')}</Text>
            {!editable ? <Text variant="caption" tone="subtle">{t('tools.resetToEdit')}</Text> : null}
            <UIStack gap={3} style={{ opacity: editable ? 1 : 0.5 }} pointerEvents={editable ? 'auto' : 'none'}>
              {config.kind !== 'stopwatch' ? (
                <Stepper label={config.kind === 'emom' ? t('tools.every') : config.kind === 'interval' || config.kind === 'tabata' ? t('tools.work') : t('tools.duration')} value={config.workSec} min={1} max={10800} step={config.kind === 'countdown' ? 30 : 5} unit={formatDuration(config.workSec)} onChange={(v) => update({ workSec: v ?? 1 })} />
              ) : null}
              {config.kind === 'interval' || config.kind === 'tabata' ? <Stepper label={t('tools.restLabel')} value={config.restSec} min={0} max={3600} step={5} unit={formatDuration(config.restSec)} onChange={(v) => update({ restSec: v ?? 0 })} /> : null}
              {config.kind === 'interval' || config.kind === 'tabata' || config.kind === 'emom' ? (
                <>
                  <Stepper label={t('tools.rounds')} value={config.rounds} min={1} max={99} onChange={(v) => update({ rounds: v ?? 1 })} />
                  <Stepper label={t('tools.prep')} value={config.prepSec} min={0} max={60} step={5} unit={t('units.sec')} onChange={(v) => update({ prepSec: v ?? 0 })} />
                </>
              ) : null}
            </UIStack>
            <ToggleRow title={t('tools.sound')} value={config.sound} onChange={(v) => update({ sound: v })} icon="volume-high-outline" />
            <ToggleRow title={t('tools.vibration')} value={config.vibration} onChange={(v) => update({ vibration: v })} icon="phone-portrait-outline" />
            {config.kind !== 'stopwatch' ? <Text variant="caption" tone="subtle">{t('tools.total', { time: formatDuration(Number.isFinite(state.totalSec) ? state.totalSec : 0) })}</Text> : null}
          </Card>
          <Text variant="caption" tone="subtle" center>
            {t('tools.backgroundNote')}
          </Text>
        </>
      ) : null}
    </Screen>
  );
}
