import { computeFocus, FOCUS_PRESETS, formatCountdown, msToMinutes, pauseRun, resumeRun, sanitizeConfig, skipPhase, startRun, timeline, upcomingBoundaries } from '@/features/focus/pomodoro';

const MIN = 60_000;
const T0 = 1_700_000_000_000;

describe('Pomodoro computed from timestamps', () => {
  const run = startRun(FOCUS_PRESETS['25_5'], 'subject', T0);

  it('builds the 25/5 timeline with a long break after the last cycle', () => {
    const segments = timeline(FOCUS_PRESETS['25_5']);
    expect(segments.map((s) => s.phase)).toEqual(['focus', 'short_break', 'focus', 'short_break', 'focus', 'short_break', 'focus', 'long_break']);
    expect(segments.at(-1)?.end).toBe((4 * 25 + 3 * 5 + 15) * MIN);
  });

  it('derives phase and remaining time at any instant', () => {
    expect(computeFocus(run, T0)).toMatchObject({ phase: 'focus', cycle: 1, phaseRemainingMs: 25 * MIN, focusedMs: 0 });
    expect(computeFocus(run, T0 + 26 * MIN)).toMatchObject({ phase: 'short_break', cycle: 1, phaseRemainingMs: 4 * MIN, focusedMs: 25 * MIN, completedCycles: 1 });
    expect(computeFocus(run, T0 + 31 * MIN)).toMatchObject({ phase: 'focus', cycle: 2 });
  });

  it('is correct after a long time in the background (no live JS timer needed)', () => {
    // The phone was locked for 2 hours: everything finished.
    const s = computeFocus(run, T0 + 120 * MIN);
    expect(s.phase).toBe('long_break');
    const done = computeFocus(run, T0 + 200 * MIN);
    expect(done).toMatchObject({ phase: 'finished', completedCycles: 4, focusedMs: 100 * MIN, phaseEndsAt: null });
  });

  it('excludes paused time, including a pause spanning the background', () => {
    const paused = pauseRun(run, T0 + 10 * MIN);
    // While paused, time stands still even if a lot of wall time passes.
    expect(computeFocus(paused, T0 + 60 * MIN)).toMatchObject({ phase: 'focus', phaseRemainingMs: 15 * MIN, paused: true, phaseEndsAt: null });
    const resumed = resumeRun(paused, T0 + 60 * MIN);
    expect(resumed.pausedTotalMs).toBe(50 * MIN);
    expect(computeFocus(resumed, T0 + 70 * MIN)).toMatchObject({ phase: 'focus', phaseRemainingMs: 5 * MIN, focusedMs: 20 * MIN });
    expect(pauseRun(paused, T0 + 99 * MIN)).toBe(paused);
    expect(resumeRun(run, T0)).toBe(run);
  });

  it('skips to the next phase without counting skipped focus time', () => {
    const skipped = skipPhase(run, T0 + 5 * MIN);
    const s = computeFocus(skipped, T0 + 5 * MIN);
    expect(s).toMatchObject({ phase: 'short_break', focusedMs: 5 * MIN });
    const skippedBreak = skipPhase(skipped, T0 + 5 * MIN);
    expect(computeFocus(skippedBreak, T0 + 5 * MIN)).toMatchObject({ phase: 'focus', cycle: 2, focusedMs: 5 * MIN });
  });

  it('lists upcoming phase boundaries for notifications', () => {
    const b = upcomingBoundaries(run, T0 + 26 * MIN);
    expect(b[0]).toEqual({ at: T0 + 30 * MIN, next: 'focus' });
    expect(b.at(-1)?.next).toBe('finished');
    expect(upcomingBoundaries(pauseRun(run, T0), T0)).toEqual([]);
  });

  it('supports 50/10 and sanitises custom settings', () => {
    expect(timeline(FOCUS_PRESETS['50_10'])).toHaveLength(4);
    expect(sanitizeConfig({ preset: 'custom', focusMin: 1, shortBreakMin: 99, longBreakMin: 5, cycles: 0 })).toEqual({ preset: 'custom', focusMin: 5, shortBreakMin: 30, longBreakMin: 5, cycles: 1 });
  });

  it('formats the countdown', () => {
    expect(formatCountdown(25 * MIN)).toBe('25:00');
    expect(formatCountdown(61_500)).toBe('01:02');
    expect(formatCountdown(90 * MIN)).toBe('1:30:00');
    expect(formatCountdown(-5)).toBe('00:00');
    expect(msToMinutes(59_999)).toBe(0);
  });
});
