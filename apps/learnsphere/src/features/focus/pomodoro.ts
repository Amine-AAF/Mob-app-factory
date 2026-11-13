/**
 * Focus timer as a pure function of timestamps.
 *
 * The app never relies on a JavaScript interval to measure time: the running state stores
 * when it started, the total paused time and any skipped time. `computeFocus(run, now)`
 * derives the current phase and remaining time, so the result is correct after the app was
 * in the background, the screen was off, or the process was killed and restored from storage.
 * A UI interval only re-renders; it is never the source of truth.
 *
 * Timeline of a run with N cycles:
 *   focus, short break, focus, short break, …, focus, long break → finished
 */
export type FocusPhase = 'focus' | 'short_break' | 'long_break' | 'finished';
export type FocusPresetId = '25_5' | '50_10' | 'custom';

export interface FocusConfig {
  preset: FocusPresetId;
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  cycles: number;
}

export const FOCUS_PRESETS: Record<Exclude<FocusPresetId, 'custom'>, FocusConfig> = {
  '25_5': { preset: '25_5', focusMin: 25, shortBreakMin: 5, longBreakMin: 15, cycles: 4 },
  '50_10': { preset: '50_10', focusMin: 50, shortBreakMin: 10, longBreakMin: 20, cycles: 2 },
};

export const FOCUS_LIMITS = { focusMin: [5, 180], shortBreakMin: [1, 30], longBreakMin: [1, 60], cycles: [1, 12] } as const;

export function sanitizeConfig(config: FocusConfig): FocusConfig {
  const clamp = (v: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, Math.round(Number.isFinite(v) ? v : min)));
  return {
    preset: config.preset,
    focusMin: clamp(config.focusMin, FOCUS_LIMITS.focusMin),
    shortBreakMin: clamp(config.shortBreakMin, FOCUS_LIMITS.shortBreakMin),
    longBreakMin: clamp(config.longBreakMin, FOCUS_LIMITS.longBreakMin),
    cycles: clamp(config.cycles, FOCUS_LIMITS.cycles),
  };
}

export interface FocusRun {
  config: FocusConfig;
  subjectId: string | null;
  /** Epoch ms. */
  startedAt: number;
  /** Epoch ms when paused, null while running. */
  pausedAt: number | null;
  pausedTotalMs: number;
  /** Time jumped over with "skip" (moves the timeline forward). */
  skippedMs: number;
  /** Part of `skippedMs` that was focus time (not counted as studied). */
  skippedFocusMs: number;
}

interface Segment {
  phase: Exclude<FocusPhase, 'finished'>;
  cycle: number;
  start: number;
  end: number;
}

export function timeline(config: FocusConfig): Segment[] {
  const c = sanitizeConfig(config);
  const segments: Segment[] = [];
  let t = 0;
  for (let i = 1; i <= c.cycles; i++) {
    segments.push({ phase: 'focus', cycle: i, start: t, end: (t += c.focusMin * 60_000) });
    const last = i === c.cycles;
    const len = (last ? c.longBreakMin : c.shortBreakMin) * 60_000;
    segments.push({ phase: last ? 'long_break' : 'short_break', cycle: i, start: t, end: (t += len) });
  }
  return segments;
}

export function startRun(config: FocusConfig, subjectId: string | null, now: number): FocusRun {
  return { config: sanitizeConfig(config), subjectId, startedAt: now, pausedAt: null, pausedTotalMs: 0, skippedMs: 0, skippedFocusMs: 0 };
}

/** Position on the timeline in ms. */
export function elapsedMs(run: FocusRun, now: number): number {
  const effectiveNow = run.pausedAt ?? now;
  return Math.max(0, effectiveNow - run.startedAt - run.pausedTotalMs + run.skippedMs);
}

export interface FocusSnapshot {
  phase: FocusPhase;
  /** 1-based focus block number. */
  cycle: number;
  cycles: number;
  phaseRemainingMs: number;
  phaseDurationMs: number;
  /** Epoch ms of the end of the current phase if running (for notifications). */
  phaseEndsAt: number | null;
  /** Actual focused time (excludes breaks, pauses and skipped focus). */
  focusedMs: number;
  completedCycles: number;
  paused: boolean;
}

export function computeFocus(run: FocusRun, now: number): FocusSnapshot {
  const segments = timeline(run.config);
  const elapsed = elapsedMs(run, now);
  const total = segments[segments.length - 1]?.end ?? 0;
  const focusedRaw = segments.filter((s) => s.phase === 'focus').reduce((sum, s) => sum + Math.max(0, Math.min(elapsed, s.end) - s.start), 0);
  const focusedMs = Math.max(0, focusedRaw - run.skippedFocusMs);
  const completedCycles = segments.filter((s) => s.phase === 'focus' && elapsed >= s.end).length;
  const paused = run.pausedAt !== null;

  if (elapsed >= total) {
    return { phase: 'finished', cycle: run.config.cycles, cycles: run.config.cycles, phaseRemainingMs: 0, phaseDurationMs: 0, phaseEndsAt: null, focusedMs, completedCycles, paused };
  }
  const current = segments.find((s) => elapsed >= s.start && elapsed < s.end) as Segment;
  const remaining = current.end - elapsed;
  return {
    phase: current.phase,
    cycle: current.cycle,
    cycles: run.config.cycles,
    phaseRemainingMs: remaining,
    phaseDurationMs: current.end - current.start,
    phaseEndsAt: paused ? null : now + remaining,
    focusedMs,
    completedCycles,
    paused,
  };
}

export function pauseRun(run: FocusRun, now: number): FocusRun {
  return run.pausedAt !== null ? run : { ...run, pausedAt: now };
}

export function resumeRun(run: FocusRun, now: number): FocusRun {
  if (run.pausedAt === null) return run;
  return { ...run, pausedAt: null, pausedTotalMs: run.pausedTotalMs + Math.max(0, now - run.pausedAt) };
}

/** Jumps to the start of the next phase. Skipped focus time is not counted as studied. */
export function skipPhase(run: FocusRun, now: number): FocusRun {
  const snap = computeFocus(run, now);
  if (snap.phase === 'finished') return run;
  return {
    ...run,
    skippedMs: run.skippedMs + snap.phaseRemainingMs,
    skippedFocusMs: run.skippedFocusMs + (snap.phase === 'focus' ? snap.phaseRemainingMs : 0),
  };
}

/** Upcoming phase boundaries from now (used to schedule local notifications while running). */
export function upcomingBoundaries(run: FocusRun, now: number): { at: number; next: FocusPhase }[] {
  if (run.pausedAt !== null) return [];
  const elapsed = elapsedMs(run, now);
  const segments = timeline(run.config);
  return segments
    .map((s, i) => ({ end: s.end, next: (segments[i + 1]?.phase ?? 'finished') as FocusPhase }))
    .filter((b) => b.end > elapsed)
    .map((b) => ({ at: now + (b.end - elapsed), next: b.next }));
}

export const msToMinutes = (ms: number) => Math.floor(ms / 60_000);

/** "mm:ss" (or "h:mm:ss") for the countdown display. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
