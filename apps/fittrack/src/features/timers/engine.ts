/**
 * Workout timers (rest, interval, Tabata, EMOM, stopwatch, countdown) as pure
 * functions of wall-clock instants: state = { startedAt, pausedAt, pausedTotalMs }.
 * The current phase is *computed* from "now", so a timer survives backgrounding,
 * screen lock and app restarts (the state is persisted), with no drift.
 */
export type TimerKind = 'rest' | 'interval' | 'tabata' | 'emom' | 'stopwatch' | 'countdown';

/** Timers that need Premium (rest, stopwatch and countdown are free). */
export const PREMIUM_TIMERS: readonly TimerKind[] = ['interval', 'tabata', 'emom'];

export interface TimerConfig {
  kind: TimerKind;
  /** Work seconds (interval / tabata), interval length (emom), total (countdown / rest). */
  workSec: number;
  restSec: number;
  rounds: number;
  /** Optional preparation countdown before round 1. */
  prepSec: number;
  sound: boolean;
  vibration: boolean;
}

export const TIMER_PRESETS: Record<TimerKind, TimerConfig> = {
  rest: { kind: 'rest', workSec: 90, restSec: 0, rounds: 1, prepSec: 0, sound: true, vibration: true },
  interval: { kind: 'interval', workSec: 40, restSec: 20, rounds: 8, prepSec: 10, sound: true, vibration: true },
  // Classic Tabata protocol: 8 rounds of 20 s work / 10 s rest.
  tabata: { kind: 'tabata', workSec: 20, restSec: 10, rounds: 8, prepSec: 10, sound: true, vibration: true },
  // Every Minute On the Minute: a new round starts every `workSec` seconds.
  emom: { kind: 'emom', workSec: 60, restSec: 0, rounds: 10, prepSec: 10, sound: true, vibration: true },
  stopwatch: { kind: 'stopwatch', workSec: 0, restSec: 0, rounds: 1, prepSec: 0, sound: false, vibration: false },
  countdown: { kind: 'countdown', workSec: 300, restSec: 0, rounds: 1, prepSec: 0, sound: true, vibration: true },
};

export const TIMER_LIMITS = { maxSec: 3 * 3600, maxRounds: 99 } as const;

export interface TimerRun {
  startedAt: number;
  pausedAt: number | null;
  pausedTotalMs: number;
}

export type Phase = 'prep' | 'work' | 'rest' | 'done' | 'running';

export interface TimerState {
  phase: Phase;
  /** 1-based round, 0 during prep. */
  round: number;
  rounds: number;
  /** Seconds left in the current phase (stopwatch: 0). */
  remainingSec: number;
  /** Seconds elapsed since start (active time). */
  elapsedSec: number;
  /** Seconds the whole timer lasts (stopwatch: Infinity). */
  totalSec: number;
  /** Sequential id of the phase, to detect transitions (sound/vibration cues). */
  phaseIndex: number;
}

export function sanitize(config: TimerConfig): TimerConfig {
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)));
  return {
    ...config,
    workSec: clamp(config.workSec, config.kind === 'stopwatch' ? 0 : 1, TIMER_LIMITS.maxSec),
    restSec: clamp(config.restSec, 0, TIMER_LIMITS.maxSec),
    rounds: clamp(config.rounds, 1, TIMER_LIMITS.maxRounds),
    prepSec: clamp(config.prepSec, 0, 60),
  };
}

/** The ordered list of phases a timer goes through. */
export function segments(config: TimerConfig): { phase: Exclude<Phase, 'done' | 'running'>; round: number; sec: number }[] {
  const c = sanitize(config);
  const out: { phase: Exclude<Phase, 'done' | 'running'>; round: number; sec: number }[] = [];
  if (c.prepSec > 0 && (c.kind === 'interval' || c.kind === 'tabata' || c.kind === 'emom')) out.push({ phase: 'prep', round: 0, sec: c.prepSec });
  switch (c.kind) {
    case 'rest':
    case 'countdown':
      out.push({ phase: 'work', round: 1, sec: c.workSec });
      break;
    case 'emom':
      for (let r = 1; r <= c.rounds; r++) out.push({ phase: 'work', round: r, sec: c.workSec });
      break;
    case 'interval':
    case 'tabata':
      for (let r = 1; r <= c.rounds; r++) {
        out.push({ phase: 'work', round: r, sec: c.workSec });
        // No rest after the last round: the timer ends on the final effort.
        if (c.restSec > 0 && r < c.rounds) out.push({ phase: 'rest', round: r, sec: c.restSec });
      }
      break;
    case 'stopwatch':
      break;
  }
  return out;
}

export function totalDurationSec(config: TimerConfig): number {
  if (config.kind === 'stopwatch') return Infinity;
  return segments(config).reduce((a, s) => a + s.sec, 0);
}

export function activeMs(run: TimerRun, now: number): number {
  return Math.max(0, (run.pausedAt ?? now) - run.startedAt - run.pausedTotalMs);
}

export function timerState(config: TimerConfig, run: TimerRun | null, now: number): TimerState {
  const c = sanitize(config);
  const segs = segments(c);
  const total = totalDurationSec(c);
  const elapsed = run ? activeMs(run, now) / 1000 : 0;
  const base = { rounds: c.rounds, totalSec: total, elapsedSec: Math.floor(elapsed) };
  if (c.kind === 'stopwatch') return { ...base, phase: run ? 'running' : 'prep', round: 1, remainingSec: 0, phaseIndex: 0 };
  if (!run) {
    const first = segs[0];
    return { ...base, phase: first?.phase ?? 'done', round: first?.round ?? 0, remainingSec: first?.sec ?? 0, phaseIndex: -1 };
  }
  let t = elapsed;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]!;
    if (t < s.sec) return { ...base, phase: s.phase, round: s.round, remainingSec: Math.ceil(s.sec - t), phaseIndex: i };
    t -= s.sec;
  }
  return { ...base, elapsedSec: Math.floor(Math.min(elapsed, total)), phase: 'done', round: c.rounds, remainingSec: 0, phaseIndex: segs.length };
}

export const startRun = (now: number): TimerRun => ({ startedAt: now, pausedAt: null, pausedTotalMs: 0 });
export const pauseRun = (run: TimerRun, now: number): TimerRun => (run.pausedAt ? run : { ...run, pausedAt: now });
export const resumeRun = (run: TimerRun, now: number): TimerRun =>
  run.pausedAt ? { ...run, pausedAt: null, pausedTotalMs: run.pausedTotalMs + Math.max(0, now - run.pausedAt) } : run;

/** Instant (epoch ms) the timer ends, if running — used to schedule an end notification. */
export function endsAt(config: TimerConfig, run: TimerRun): number | null {
  if (run.pausedAt || config.kind === 'stopwatch') return null;
  return run.startedAt + run.pausedTotalMs + totalDurationSec(config) * 1000;
}
