import { compare, dailySeries, validMeasurement } from '@/features/body/body';
import { cardioRecords, estimateCaloriesMet, paceSecPer, speedKmh, validateCardio } from '@/features/cardio/cardio';
import { challengeProgress, CHALLENGES, goalProgress, newlyUnlocked } from '@/features/goals/goals';
import { filterExercises, libraryExercises } from '@/features/library/library';
import { estimateOneRepMax, setVolume } from '@/features/performance/oneRepMax';
import { currentBests, detectRecords, progression } from '@/features/performance/records';
import { canMove, itemsForDay, monthGrid, nextPlanned, weekdayOf } from '@/features/planner/plan';
import { planNotifications, toExpoWeekday } from '@/features/reminders/plan';
import { activeDays, averagePerWeek, categoryDistribution, monthly, topExercises, weekStreak, weeklyFrequency } from '@/features/stats/stats';
import { endsAt, pauseRun, resumeRun, segments, startRun, TIMER_PRESETS, timerState, totalDurationSec } from '@/features/timers/engine';
import {
  cmToDisplay,
  displayToCm,
  displayToKg,
  displayToMeters,
  formatDuration,
  kgToDisplay,
  metersToDisplay,
  parseDuration,
} from '@/features/units';
import { adjustRestPatch, elapsedMs, finalDurationSec, isStale, nextPendingIndex, pausePatch, progressOf, restRemainingSec, resumePatch, suggestedSet } from '@/features/workout/engine';
import type { CardioActivity, ExerciseSet, NotificationSetting, PerformanceRecord, RoutineSlot, ScheduleEntry, SessionExercise, WorkoutSession } from '@/types';
import { normalizeSearch, parseDecimal, parseInteger } from '@/utils';

const T0 = new Date('2026-11-02T10:00:00').getTime(); // a Monday

/* ------------------------------------------------------------------ units */

describe('units', () => {
  it('converts weight both ways exactly (1 lb = 0.45359237 kg)', () => {
    expect(kgToDisplay(100, 'lb')).toBeCloseTo(220.462, 3);
    expect(displayToKg(225, 'lb')).toBeCloseTo(102.058, 3);
    expect(displayToKg(kgToDisplay(87.5, 'lb'), 'lb')).toBeCloseTo(87.5, 9);
    expect(kgToDisplay(60, 'kg')).toBe(60);
  });

  it('converts distances and lengths', () => {
    expect(metersToDisplay(1609.344, 'mi')).toBeCloseTo(1, 9);
    expect(displayToMeters(5, 'km')).toBe(5000);
    expect(cmToDisplay(2.54, 'in')).toBeCloseTo(1, 9);
    expect(displayToCm(10, 'in')).toBeCloseTo(25.4, 9);
  });

  it('formats and parses durations, rejecting invalid input', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3723)).toBe('1:02:03');
    expect(formatDuration(-5)).toBe('0:00');
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(parseDuration('30')).toBe(1800);
    expect(parseDuration('12,5')).toBe(750);
    expect(parseDuration('25:30')).toBe(1530);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('1:75')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });

  it('parses user numbers safely', () => {
    expect(parseDecimal('72,5')).toBe(72.5);
    expect(parseDecimal('-3')).toBeNull();
    expect(parseDecimal('')).toBeNull();
    expect(parseInteger('12')).toBe(12);
    expect(parseInteger('1.5')).toBeNull();
    expect(normalizeSearch('Développé Couché')).toBe('developpe couche');
  });
});

/* ------------------------------------------------------------------ performance */

const set = (p: Partial<ExerciseSet>): ExerciseSet => ({ id: p.id ?? 's', sessionExerciseId: 'se', setIndex: 0, reps: null, weightKg: null, durationSec: null, distanceM: null, completedAt: T0, ...p });

describe('1RM estimate (documented Epley formula)', () => {
  it('matches the formula and only for 1–10 reps', () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(116.667, 3);
    expect(estimateOneRepMax(100, 10, 'brzycki')).toBeCloseTo(133.333, 3);
    expect(estimateOneRepMax(100, 1)).toBe(100);
    expect(estimateOneRepMax(100, 11)).toBeNull();
    expect(estimateOneRepMax(0, 5)).toBeNull();
    expect(estimateOneRepMax(null, 5)).toBeNull();
    expect(estimateOneRepMax(80, 2.5)).toBeNull();
  });

  it('volume is load × reps, 0 for bodyweight or missing data', () => {
    expect(setVolume(50, 10)).toBe(500);
    expect(setVolume(null, 10)).toBe(0);
  });
});

describe('personal records', () => {
  const rec = (kind: PerformanceRecord['kind'], value: number): PerformanceRecord => ({ id: kind, exerciseId: 'x', sessionId: null, setId: null, kind, value, day: '2026-11-01', achievedAt: T0 });

  it('first set is a baseline (previous = null), improvements carry the old value', () => {
    const first = detectRecords('weight_reps', set({ weightKg: 60, reps: 8 }), new Map());
    expect(first.map((r) => r.kind).sort()).toEqual(['est_1rm', 'max_reps', 'max_volume', 'max_weight']);
    expect(first.every((r) => r.previous === null)).toBe(true);
    const bests = currentBests([rec('max_weight', 60), rec('max_reps', 8), rec('max_volume', 480), rec('est_1rm', 76)]);
    const better = detectRecords('weight_reps', set({ weightKg: 62.5, reps: 6 }), bests);
    expect(better.find((r) => r.kind === 'max_weight')).toMatchObject({ value: 62.5, previous: 60 });
    expect(better.some((r) => r.kind === 'max_reps')).toBe(false);
  });

  it('pace records: lower is better and only from 400 m', () => {
    const bests = currentBests([rec('best_pace', 330)]);
    expect(detectRecords('distance_time', set({ distanceM: 5000, durationSec: 1500 }), bests).find((r) => r.kind === 'best_pace')?.value).toBe(300);
    expect(detectRecords('distance_time', set({ distanceM: 300, durationSec: 60 }), new Map()).some((r) => r.kind === 'best_pace')).toBe(false);
  });

  it('bodyweight / time exercises only track what is measured', () => {
    expect(detectRecords('reps', set({ reps: 20 }), new Map()).map((r) => r.kind)).toEqual(['max_reps']);
    expect(detectRecords('time', set({ durationSec: 60 }), new Map()).map((r) => r.kind)).toEqual(['max_duration']);
    expect(detectRecords('time', set({ durationSec: 0 }), new Map())).toEqual([]);
  });

  it('progression has one point per session, oldest first, with gaps kept as null', () => {
    const pts = progression([
      { sessionId: 'b', day: '2026-11-05', startedAt: T0 + 3e8, reps: 5, weightKg: 70, durationSec: null, distanceM: null },
      { sessionId: 'a', day: '2026-11-02', startedAt: T0, reps: 8, weightKg: 60, durationSec: null, distanceM: null },
      { sessionId: 'a', day: '2026-11-02', startedAt: T0, reps: 6, weightKg: 65, durationSec: null, distanceM: null },
    ]);
    expect(pts.map((p) => p.sessionId)).toEqual(['a', 'b']);
    expect(pts[0]).toMatchObject({ maxWeight: 65, maxReps: 8, volume: 870, sets: 2, maxDuration: null });
  });
});

/* ------------------------------------------------------------------ active workout */

const session = (p: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id: 's1', name: 'W', programId: null, programDayId: null, scheduleId: null, status: 'active', day: '2026-11-02', startedAt: T0, endedAt: null,
  pausedAt: null, pausedTotalMs: 0, currentIndex: 0, restStartedAt: null, restEndsAt: null, durationSec: null, notes: null, ...p,
});
const sx = (id: string, target: number, done: number, status: SessionExercise['status'] = 'pending'): SessionExercise => ({
  id, sessionId: 's1', exerciseId: id, position: 0, status, targetSets: target, repsMin: 8, repsMax: 12, weightKg: 40, durationSec: null, distanceM: null, restSec: 90, notes: null,
  sets: Array.from({ length: done }, (_, i) => set({ id: `${id}${i}`, setIndex: i, reps: 10, weightKg: 40 })),
});

describe('active workout engine (timestamp based)', () => {
  it('elapsed time excludes pauses and survives a backgrounded / killed app', () => {
    let s = session();
    expect(elapsedMs(s, T0 + 60_000)).toBe(60_000);
    s = { ...s, ...pausePatch(s, T0 + 60_000)! };
    // App killed while paused for 10 minutes: the clock stays frozen.
    expect(elapsedMs(s, T0 + 660_000)).toBe(60_000);
    s = { ...s, ...resumePatch(s, T0 + 660_000)! };
    expect(s.pausedTotalMs).toBe(600_000);
    // Backgrounded for 5 minutes while active: time keeps counting from timestamps.
    expect(elapsedMs(s, T0 + 960_000)).toBe(360_000);
    expect(finalDurationSec(s, T0 + 960_000)).toBe(360);
  });

  it('a clock moved backwards never yields negative time', () => {
    expect(elapsedMs(session(), T0 - 3_600_000)).toBe(0);
    expect(restRemainingSec(session({ restEndsAt: T0 + 90_000 }), T0 + 200_000)).toBe(0);
  });

  it('rest timer is computed from its end instant, frozen while paused and shifted on resume', () => {
    let s = session({ restStartedAt: T0, restEndsAt: T0 + 90_000 });
    expect(restRemainingSec(s, T0 + 30_000)).toBe(60);
    s = { ...s, ...pausePatch(s, T0 + 30_000)! };
    expect(restRemainingSec(s, T0 + 300_000)).toBe(60);
    s = { ...s, ...resumePatch(s, T0 + 300_000)! };
    expect(restRemainingSec(s, T0 + 310_000)).toBe(50);
    expect(adjustRestPatch(s, -600, T0 + 310_000)!.restEndsAt).toBe(T0 + 310_000);
  });

  it('pause / resume are no-ops in the wrong state', () => {
    expect(resumePatch(session(), T0)).toBeNull();
    expect(pausePatch(session({ status: 'paused', pausedAt: T0 }), T0)).toBeNull();
  });

  it('progress and next exercise skip finished / skipped exercises', () => {
    const exs = [sx('a', 3, 3, 'done'), sx('b', 3, 1), sx('c', 2, 0, 'skipped'), sx('d', 2, 0)];
    expect(nextPendingIndex(exs, 1)).toBe(3);
    expect(nextPendingIndex(exs, 3)).toBe(1);
    expect(nextPendingIndex([sx('a', 1, 1, 'done')], 0)).toBe(-1);
    const p = progressOf({ exercises: exs });
    expect(p).toMatchObject({ doneSets: 3 + 1 + 2, totalSets: 10, doneExercises: 2, totalExercises: 4 });
  });

  it('pre-fills from the previous set, then targets, then history', () => {
    expect(suggestedSet(sx('a', 3, 1))).toMatchObject({ reps: 10, weightKg: 40 });
    expect(suggestedSet(sx('a', 3, 0))).toMatchObject({ reps: 12, weightKg: 40 });
    expect(suggestedSet({ ...sx('a', 3, 0), weightKg: null }, { reps: 5, weightKg: 80, durationSec: null, distanceM: null })).toMatchObject({ weightKg: 80 });
  });

  it('flags sessions left open for more than 12 h', () => {
    expect(isStale(session(), T0 + 13 * 3_600_000)).toBe(true);
    expect(isStale(session(), T0 + 3_600_000)).toBe(false);
  });
});

/* ------------------------------------------------------------------ timers */

describe('timers', () => {
  it('Tabata: 10 s prep + 8 × (20 work / 10 rest) without the last rest', () => {
    const c = TIMER_PRESETS.tabata;
    expect(segments(c)).toHaveLength(1 + 8 + 7);
    expect(totalDurationSec(c)).toBe(10 + 8 * 20 + 7 * 10);
    const run = startRun(T0);
    expect(timerState(c, run, T0 + 5_000)).toMatchObject({ phase: 'prep', remainingSec: 5 });
    expect(timerState(c, run, T0 + 12_000)).toMatchObject({ phase: 'work', round: 1, remainingSec: 18 });
    expect(timerState(c, run, T0 + 31_000)).toMatchObject({ phase: 'rest', round: 1, remainingSec: 9 });
    expect(timerState(c, run, T0 + 41_000)).toMatchObject({ phase: 'work', round: 2 });
    expect(timerState(c, run, T0 + 10_000_000)).toMatchObject({ phase: 'done', remainingSec: 0 });
  });

  it('EMOM rounds restart every interval', () => {
    const c = { ...TIMER_PRESETS.emom, prepSec: 0, rounds: 3, workSec: 60 };
    expect(timerState(c, startRun(T0), T0 + 125_000)).toMatchObject({ phase: 'work', round: 3, remainingSec: 55 });
  });

  it('keeps time across pause and background (no drift)', () => {
    const c = { ...TIMER_PRESETS.countdown, workSec: 120 };
    let run = startRun(T0);
    run = pauseRun(run, T0 + 30_000);
    expect(timerState(c, run, T0 + 600_000).remainingSec).toBe(90);
    expect(endsAt(c, run)).toBeNull();
    run = resumeRun(run, T0 + 600_000);
    expect(timerState(c, run, T0 + 640_000).remainingSec).toBe(50);
    expect(endsAt(c, run)).toBe(T0 + 570_000 + 120_000);
  });

  it('stopwatch counts up and sanitizes absurd settings', () => {
    expect(timerState(TIMER_PRESETS.stopwatch, startRun(T0), T0 + 75_400)).toMatchObject({ phase: 'running', elapsedSec: 75 });
    const bad = timerState({ ...TIMER_PRESETS.interval, workSec: -5, rounds: 0, restSec: Number.NaN }, null, T0);
    expect(bad.rounds).toBe(1);
  });
});

/* ------------------------------------------------------------------ planner */

const entry = (p: Partial<ScheduleEntry>): ScheduleEntry => ({ id: 'e', day: '2026-11-02', kind: 'workout', status: 'planned', programId: 'p', programDayId: 'd', fromRoutine: false, movedTo: null, time: null, sessionId: null, note: null, ...p });
const routine: RoutineSlot[] = [
  { weekday: 0, kind: 'workout', programId: 'p', programDayId: 'A', time: '18:00' },
  { weekday: 2, kind: 'workout', programId: 'p', programDayId: 'B', time: null },
  { weekday: 6, kind: 'rest', programId: null, programDayId: null, time: null },
];

describe('planner', () => {
  it('maps days to ISO weekdays and builds Monday-first grids', () => {
    expect(weekdayOf('2026-11-02')).toBe(0); // Monday
    expect(weekdayOf('2026-11-08')).toBe(6); // Sunday
    const g = monthGrid('2026-11-15');
    expect(g).toHaveLength(6);
    expect(g[0]![0]).toBe('2026-10-26');
    expect(g.flat()).toContain('2026-11-30');
  });

  it('shows routine occurrences virtually and lets explicit entries override them', () => {
    expect(itemsForDay('2026-11-02', [], routine, null)).toEqual([expect.objectContaining({ virtual: true, programDayId: 'A', time: '18:00' })]);
    const moved = entry({ id: 'm', status: 'moved', fromRoutine: true, movedTo: '2026-11-03' });
    expect(itemsForDay('2026-11-02', [moved], routine, null).map((i) => i.status)).toEqual(['moved']);
    expect(itemsForDay('2026-11-08', [], routine, null)[0]).toMatchObject({ kind: 'rest' });
    // Routine applies only from its start day: history is not rewritten.
    expect(itemsForDay('2026-11-02', [], routine, '2026-11-04')).toEqual([]);
  });

  it('finds the next planned workout and validates moves', () => {
    expect(nextPlanned('2026-11-03', [], routine, null)).toMatchObject({ day: '2026-11-04', programDayId: 'B' });
    expect(nextPlanned('2026-11-03', [entry({ id: 'x', day: '2026-11-03', fromRoutine: false })], routine, null)?.day).toBe('2026-11-03');
    expect(canMove('2026-11-02', '2026-11-03', '2026-11-02')).toBe(true);
    expect(canMove('2026-11-02', '2026-11-01', '2026-11-02')).toBe(false);
    expect(canMove('2026-11-02', '2026-11-02', '2026-11-02')).toBe(false);
  });

  it('handles the DST change week (Europe: 2026-10-25) without skipping a day', () => {
    const g = monthGrid('2026-10-10').flat();
    for (let i = 1; i < g.length; i++) expect(new Date(`${g[i]}T12:00:00`).getTime() - new Date(`${g[i - 1]}T12:00:00`).getTime()).toBeGreaterThan(0);
    expect(new Set(g).size).toBe(42);
  });
});

/* ------------------------------------------------------------------ cardio */

const cardio = (p: Partial<CardioActivity>): CardioActivity => ({ id: 'c', day: '2026-11-02', type: 'running', durationSec: 1800, distanceM: 5000, calories: null, caloriesSource: null, note: null, createdAt: T0, ...p });

describe('cardio', () => {
  it('computes speed and pace only when a distance exists', () => {
    expect(speedKmh(10_000, 3600)).toBe(10);
    expect(paceSecPer(5000, 1500)).toBe(300);
    expect(paceSecPer(1609.344, 480, 1609.344)).toBe(480);
    expect(speedKmh(null, 1800)).toBeNull();
    expect(paceSecPer(0, 1800)).toBeNull();
  });

  it('estimates calories only with a body weight, from documented MET values', () => {
    expect(estimateCaloriesMet('walking', 3600, 70)).toBe(245);
    expect(estimateCaloriesMet('running', 1800, null)).toBeNull();
  });

  it('validates input and catches unit mix-ups', () => {
    expect(validateCardio({ durationSec: null, distanceM: null, calories: null })).toBe('duration');
    expect(validateCardio({ durationSec: 600, distanceM: 50_000, calories: null })).toBe('speed');
    expect(validateCardio({ durationSec: 1800, distanceM: 5000, calories: 300 })).toBeNull();
  });

  it('records: longest, fastest (≥ 1 km only)', () => {
    const r = cardioRecords([cardio({ id: 'a' }), cardio({ id: 'b', distanceM: 10_000, durationSec: 3300 }), cardio({ id: 'c', distanceM: 500, durationSec: 60 })]);
    expect(r.longestDistance?.id).toBe('b');
    expect(r.fastestPace?.id).toBe('b');
  });
});

/* ------------------------------------------------------------------ statistics & goals */

const done = (day: string, min = 45) => ({ id: day, day, durationSec: min * 60, startedAt: new Date(`${day}T10:00:00`).getTime(), name: 'W' });

describe('statistics', () => {
  const sessions = [done('2026-11-02'), done('2026-11-04'), done('2026-11-06'), done('2026-10-27'), done('2026-10-29'), done('2026-09-10')];

  it('weekly frequency, averages and streaks only use logged data', () => {
    const w = weeklyFrequency(sessions, '2026-11-06', 3);
    expect(w.map((x) => x.sessions)).toEqual([0, 2, 3]);
    expect(averagePerWeek([], '2026-11-06')).toBeNull();
    const days = activeDays(sessions);
    expect(weekStreak(days, '2026-11-06', 2)).toEqual({ current: 2, best: 2 });
    // The current week in progress never breaks the streak.
    expect(weekStreak(days, '2026-11-09', 2).current).toBe(2);
    // A past week below target does break it.
    expect(weekStreak(days, '2026-11-16', 2).current).toBe(0);
  });

  it('monthly evolution keeps empty months empty', () => {
    const m = monthly(sessions, [], '2026-11-06', 3);
    expect(m.map((x) => [x.month, x.sessions])).toEqual([['2026-09', 1], ['2026-10', 2], ['2026-11', 3]]);
  });

  it('top exercises and muscle-group distribution', () => {
    const facts = [
      { sessionId: 'a', day: 'd', exerciseId: 'squat', category: 'legs' as const },
      { sessionId: 'a', day: 'd', exerciseId: 'squat', category: 'legs' as const },
      { sessionId: 'b', day: 'd', exerciseId: 'squat', category: 'legs' as const },
      { sessionId: 'b', day: 'd', exerciseId: 'bench', category: 'chest' as const },
    ];
    expect(topExercises(facts)[0]).toEqual({ exerciseId: 'squat', sessions: 2, sets: 3 });
    const dist = categoryDistribution(facts);
    expect(dist[0]).toMatchObject({ category: 'legs', ratio: 0.75 });
    expect(categoryDistribution([])).toEqual([]);
  });
});

describe('goals & challenges', () => {
  const ctx = { today: '2026-11-06', sessions: [done('2026-11-02'), done('2026-11-04')], cardio: [cardio({ day: '2026-11-03' })], bestReps: () => 12, bestWeight: () => 80, weeklyTarget: 3 };

  it('weekly goals count the current Monday-first week', () => {
    const g = { id: 'g', kind: 'weekly_sessions' as const, target: 3, exerciseId: null, startDay: '2026-11-01', endDay: null, active: true, achievedAt: null };
    expect(goalProgress(g, ctx)).toMatchObject({ current: 2, reached: false });
    expect(goalProgress({ ...g, kind: 'weekly_minutes', target: 100 }, ctx)).toMatchObject({ current: 120, reached: true });
    expect(goalProgress({ ...g, kind: 'weekly_cardio_km', target: 10 }, ctx).current).toBe(5);
    expect(goalProgress({ ...g, kind: 'exercise_weight', target: 100, exerciseId: 'x' }, ctx).ratio).toBe(0.8);
  });

  it('the 7-day challenge always leaves rest days (4 sessions in 7 days)', () => {
    const def = CHALLENGES.find((c) => c.id === 'seven_day')!;
    expect(def.target).toBeLessThan(def.windowDays!);
    const run = { id: 'r', challengeId: 'seven_day', startedDay: '2026-11-02', status: 'active' as const, completedAt: null };
    expect(challengeProgress(run, def, { ...ctx, recordDays: [] })).toMatchObject({ current: 3, daysLeft: 3, status: 'active' });
    expect(challengeProgress(run, def, { ...ctx, today: '2026-11-12', recordDays: [] }).status).toBe('expired');
  });

  it('badges unlock once', () => {
    const c = { sessions: 10, cardio: 0, records: 1, bestWeekStreak: 0, programsCreated: 0, measurements: 0, totalMinutes: 0, challengesCompleted: 0 };
    expect(newlyUnlocked(c, new Set())).toEqual(['first_workout', 'ten_workouts', 'first_record']);
    expect(newlyUnlocked(c, new Set(['first_workout', 'ten_workouts', 'first_record']))).toEqual([]);
  });
});

/* ------------------------------------------------------------------ body */

describe('body measurements', () => {
  it('validates plausible ranges and handles missing data', () => {
    expect(validMeasurement('weight', 72)).toBe(true);
    expect(validMeasurement('weight', 720)).toBe(false);
    expect(validMeasurement('waist', null)).toBe(false);
  });

  it('compares two dates with the latest value of each day', () => {
    const s = dailySeries([
      { id: '1', day: '2026-10-01', kind: 'weight', customName: null, value: 80, note: null },
      { id: '2', day: '2026-10-01', kind: 'weight', customName: null, value: 79.5, note: null },
      { id: '3', day: '2026-11-01', kind: 'weight', customName: null, value: 78, note: null },
    ]);
    expect(s).toEqual([{ day: '2026-10-01', value: 79.5 }, { day: '2026-11-01', value: 78 }]);
    expect(compare(s, '2026-10-15', '2026-11-02')?.delta).toBeCloseTo(-1.5);
    expect(compare(s, '2026-09-01', '2026-11-02')).toBeNull();
  });
});

/* ------------------------------------------------------------------ notifications */

describe('notification planning', () => {
  const settings = (patch: Partial<Record<NotificationSetting['kind'], Partial<NotificationSetting>>>): NotificationSetting[] =>
    (['workout_reminder', 'weekly_goal', 'challenge', 'routine', 'progress_summary'] as const).map((kind) => ({ kind, enabled: false, hour: 18, minute: 0, weekdays: [], ...patch[kind] }));
  const planned = itemsForDay('2026-11-04', [], routine, null);

  it('plans nothing when everything is off (default)', () => {
    expect(planNotifications({ settings: settings({}), planned, today: '2026-11-02', now: new Date(T0), hasActiveChallenge: true, hasWeeklyGoal: true })).toEqual([]);
  });

  it('reminds on planned workout days at the planned time, never in the past', () => {
    const plan = planNotifications({ settings: settings({ workout_reminder: { enabled: true } }), planned: [...itemsForDay('2026-11-02', [], routine, null), ...planned], today: '2026-11-02', now: new Date('2026-11-02T19:00:00'), hasActiveChallenge: false, hasWeeklyGoal: false });
    expect(plan.map((p) => p.identifier)).toEqual(['fittrack-workout-2026-11-04']);
    expect(plan[0]!.trigger).toMatchObject({ type: 'date' });
    expect((plan[0]!.trigger as { at: Date }).at.getHours()).toBe(18);
    expect(plan[0]!.bodyKey).toBe('notifications.workout.body');
  });

  it('weekly goal / challenge reminders need an active goal or challenge', () => {
    const s = settings({ weekly_goal: { enabled: true, weekdays: [4] }, challenge: { enabled: true } });
    expect(planNotifications({ settings: s, planned: [], today: '2026-11-02', now: new Date(T0), hasActiveChallenge: false, hasWeeklyGoal: false })).toEqual([]);
    const both = planNotifications({ settings: s, planned: [], today: '2026-11-02', now: new Date(T0), hasActiveChallenge: true, hasWeeklyGoal: true });
    expect(both.filter((p) => p.kind === 'challenge').length).toBeGreaterThan(0);
    expect(both.find((p) => p.kind === 'weekly_goal')?.trigger).toEqual({ type: 'weekly', weekday: 4, hour: 18, minute: 0 });
  });

  it('maps ISO weekdays to Expo weekdays (1 = Sunday)', () => {
    expect(toExpoWeekday(0)).toBe(2);
    expect(toExpoWeekday(6)).toBe(1);
  });
});

/* ------------------------------------------------------------------ library */

describe('library search & filters', () => {
  const list = libraryExercises('fr');
  it('search ignores accents and case, and also matches English names', () => {
    const fr = filterExercises(list, { query: 'developpe' });
    expect(fr.length).toBeGreaterThan(0);
    expect(filterExercises(list, { query: 'bench press' }).some((e) => e.id === 'barbell-bench-press')).toBe(true);
  });

  it('equipment filter returns what can be done with only that equipment', () => {
    const db = filterExercises(list, { equipment: ['dumbbells'] });
    expect(db.length).toBeGreaterThan(10);
    expect(db.every((e) => e.equipment.every((q) => q === 'dumbbells' || q === 'bodyweight'))).toBe(true);
    expect(filterExercises(list, { categories: ['legs'], muscles: ['quads'] }).every((e) => e.category === 'legs')).toBe(true);
  });
});
