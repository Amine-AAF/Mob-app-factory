import { addDays } from '@factory/app-core';

import { earnedBadges, xpForCompletion } from '@/features/gamification/rewards';
import { isScheduledDay, periodBounds, scheduleOn, validateFrequency } from '@/features/habits/schedule';
import { reorder, sortTasks } from '@/features/planner/tasks';
import { planNotifications } from '@/features/reminders/plan';
import { buildInsights } from '@/features/statistics/insights';
import { overview } from '@/features/statistics/stats';
import { completionRate, occurrences, streakOf } from '@/features/statistics/streaks';
import { TEMPLATES, TEMPLATE_GROUPS } from '@/features/templates/data';
import { habitsForDay, indexLogs, statusFor, summarizeDay } from '@/features/tracking/progress';
import type { PlannerTask, Reminder } from '@/types';

import { CHECK, habit, log, logs, withSchedule } from '@/__fixtures__/habits';

// 2026-11-02 is a Monday.
const MON = '2026-11-02';
const days = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i));
const streak = (h: ReturnType<typeof habit>, l: ReturnType<typeof logs>, today: string) => streakOf(occurrences(h, indexLogs(l).get(h.id), today));

describe('schedules', () => {
  it('daily habits are scheduled every day from their start date only', () => {
    const h = habit('a', '2026-11-04');
    expect(isScheduledDay(h, '2026-11-03')).toBe(false);
    expect(isScheduledDay(h, '2026-11-04')).toBe(true);
    expect(isScheduledDay(h, '2026-12-25')).toBe(true);
  });

  it('weekday habits follow the chosen days', () => {
    const h = habit('a', MON, { type: 'weekdays', days: [1, 3, 5] });
    expect(days(MON, 7).map((d) => isScheduledDay(h, d))).toEqual([true, false, true, false, true, false, false]);
  });

  it('interval habits repeat every N days from the schedule start', () => {
    const h = habit('a', MON, { type: 'interval', everyDays: 3 });
    expect(days(MON, 7).filter((d) => isScheduledDay(h, d))).toEqual([MON, '2026-11-05', '2026-11-08']);
  });

  it('archived habits are inactive from the archive day, but keep their past', () => {
    const h = habit('a', MON, { type: 'daily' }, { archivedOn: '2026-11-05' });
    expect(isScheduledDay(h, '2026-11-04')).toBe(true);
    expect(isScheduledDay(h, '2026-11-05')).toBe(false);
  });

  it('uses the schedule version in force on each day (frequency change is not retroactive)', () => {
    const h = withSchedule(habit('a', MON), { effectiveFrom: '2026-11-09', frequency: { type: 'weekdays', days: [1] }, tracking: CHECK });
    expect(scheduleOn(h, '2026-11-04')?.frequency.type).toBe('daily');
    expect(isScheduledDay(h, '2026-11-04')).toBe(true); // Wednesday, old rules
    expect(isScheduledDay(h, '2026-11-11')).toBe(false); // Wednesday, new rules
    expect(isScheduledDay(h, '2026-11-16')).toBe(true); // Monday, new rules
  });

  it('validates frequencies', () => {
    expect(validateFrequency({ type: 'weekdays', days: [] })).toBe('errors.pickDays');
    expect(validateFrequency({ type: 'timesPerWeek', count: 8 })).toBe('errors.timesPerWeek');
    expect(validateFrequency({ type: 'interval', everyDays: 1 })).toBe('errors.interval');
    expect(validateFrequency({ type: 'timesPerMonth', count: 4 })).toBeNull();
  });

  it('computes Monday-based weeks and calendar months', () => {
    expect(periodBounds('week', '2026-11-08')).toEqual({ start: MON, end: '2026-11-08' });
    expect(periodBounds('month', '2026-02-14')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });
});

describe('tracking status', () => {
  it('check habits are done at 1, quantities when the target is reached', () => {
    expect(statusFor(1, CHECK)).toBe('done');
    expect(statusFor(0, CHECK)).toBeNull();
    expect(statusFor(1.5, { mode: 'quantity', target: 2 })).toBe('partial');
    expect(statusFor(2, { mode: 'quantity', target: 2 })).toBe('done');
  });
});

describe('streaks', () => {
  const today = addDays(MON, 9);

  it('counts consecutive completed days and keeps the best streak', () => {
    const h = habit('a', MON);
    const l = logs('a', [MON, '2026-11-03', '2026-11-04', /* miss 05 */ '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11']);
    expect(streak(h, l, today)).toEqual({ current: 6, best: 6, unit: 'day' });
  });

  it('an unfinished today does not break the streak', () => {
    const h = habit('a', MON);
    expect(streak(h, logs('a', days(MON, 9)), today).current).toBe(9);
  });

  it('a missed past day breaks it', () => {
    const h = habit('a', MON);
    expect(streak(h, logs('a', days(MON, 8)), today).current).toBe(0);
  });

  it('unscheduled days never break a streak', () => {
    const h = habit('a', MON, { type: 'weekdays', days: [1, 3, 5] });
    const l = logs('a', [MON, '2026-11-04', '2026-11-06', '2026-11-09', '2026-11-11']);
    expect(streak(h, l, today)).toMatchObject({ current: 5, best: 5 });
  });

  it('skipped days are neutral', () => {
    const h = habit('a', MON);
    const l = [...logs('a', days(MON, 3)), log('a', '2026-11-05', 'skipped', 0), ...logs('a', days('2026-11-06', 5))];
    expect(streak(h, l, today).current).toBe(8);
  });

  it('counts one completion per day only (duplicates are impossible by key)', () => {
    const h = habit('a', MON);
    const l = [log('a', MON), log('a', MON), log('a', '2026-11-03')];
    expect(streakOf(occurrences(h, indexLogs(l).get('a'), '2026-11-03')).current).toBe(2);
  });

  it('X times per week: streak in weeks, mid-week start is prorated', () => {
    // Created on Saturday: only 2 days left that week, target capped at 2.
    const h = habit('a', '2026-11-07', { type: 'timesPerWeek', count: 3 });
    const l = logs('a', ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-12']);
    const occ = occurrences(h, indexLogs(l).get('a'), '2026-11-13');
    expect(occ.map((o) => [o.start, o.target, o.state])).toEqual([
      ['2026-11-02', 2, 'hit'],
      ['2026-11-09', 3, 'hit'],
    ]);
    expect(streakOf(occ)).toMatchObject({ current: 2, unit: 'week' });
  });

  it('a failed past week breaks a weekly streak, the current week is pending', () => {
    const h = habit('a', MON, { type: 'timesPerWeek', count: 3 });
    const l = logs('a', [MON, '2026-11-03']);
    const occ = occurrences(h, indexLogs(l).get('a'), '2026-11-10');
    expect(occ.map((o) => o.state)).toEqual(['miss', 'pending']);
  });

  it('completion rate ignores pending occurrences', () => {
    const h = habit('a', MON);
    const occ = occurrences(h, indexLogs(logs('a', [MON, '2026-11-04'])).get('a'), '2026-11-05');
    // Mon done, Tue missed, Wed done, Thu (today) pending → 2/3
    expect(completionRate(occ)).toBeCloseTo(2 / 3);
  });

  it('a habit changed after several completions keeps its past statistics', () => {
    const base = habit('a', MON);
    const l = logs('a', days(MON, 5));
    const past = (o: { end: string }) => o.end < '2026-11-06';
    const before = occurrences(base, indexLogs(l).get('a'), '2026-11-06').filter(past);
    const changed = withSchedule(base, { effectiveFrom: '2026-11-06', frequency: { type: 'weekdays', days: [1] }, tracking: CHECK });
    const after = occurrences(changed, indexLogs(l).get('a'), '2026-11-06');
    expect(after.filter(past)).toEqual(before);
    expect(before.every((o) => o.state === 'hit')).toBe(true);
  });

  it('streaks follow local calendar days across a DST change', () => {
    // Europe DST ends 2026-10-25; the day keys stay contiguous regardless of the time zone.
    const h = habit('a', '2026-10-20');
    expect(streak(h, logs('a', days('2026-10-20', 10)), '2026-10-29').current).toBe(10);
  });
});

describe('day summaries', () => {
  it('lists due habits, including flexible ones not yet met this week', () => {
    const a = habit('a', MON);
    const b = habit('b', MON, { type: 'timesPerWeek', count: 2 });
    const c = habit('c', MON, { type: 'weekdays', days: [2] });
    const snap = { habits: [a, b, c], logs: logs('b', [MON, '2026-11-03']) };
    expect(habitsForDay(snap, '2026-11-03').map((d) => d.habit.id)).toEqual(['a', 'b', 'c']);
    // Target met before Wednesday: b is no longer due.
    expect(habitsForDay(snap, '2026-11-04').map((d) => d.habit.id)).toEqual(['a']);
  });

  it('classifies days as complete, partial, missed or pending', () => {
    const a = habit('a', MON);
    const b = habit('b', MON);
    const snap = { habits: [a, b], logs: [log('a', MON), log('b', MON), log('a', '2026-11-03')] };
    const today = '2026-11-05';
    expect(summarizeDay(snap, MON, today).state).toBe('complete');
    expect(summarizeDay(snap, '2026-11-03', today).state).toBe('partial');
    expect(summarizeDay(snap, '2026-11-04', today).state).toBe('missed');
    expect(summarizeDay(snap, today, today).state).toBe('pending');
    expect(summarizeDay(snap, '2026-11-01', today).state).toBe('none');
  });

  it('gives partial credit for quantities', () => {
    const a = { ...habit('a', MON), schedules: [{ habitId: 'a', effectiveFrom: MON, frequency: { type: 'daily' as const }, tracking: { mode: 'quantity' as const, target: 2, unit: 'L' } }] };
    const s = summarizeDay({ habits: [a], logs: [log('a', MON, 'partial', 1, 2)] }, MON, MON);
    expect(s.ratio).toBeCloseTo(0.5);
    expect(s.completed).toBe(0);
  });
});

describe('statistics & insights', () => {
  it('computes rates, ranking and rule-based insights from real data only', () => {
    const today = addDays(MON, 13);
    const read = habit('read', MON, { type: 'daily' }, { name: 'Reading' });
    const gym = habit('gym', MON, { type: 'daily' }, { name: 'Gym', sortOrder: 1 });
    const snap = { habits: [read, gym], logs: [...logs('read', days(MON, 14)), ...logs('gym', [MON, '2026-11-05', '2026-11-12'])] };
    const o = overview(snap, today);
    expect(o.ranking[0]?.habit.id).toBe('read');
    expect(o.totalCompletions).toBe(17);
    expect(o.perHabit.get('read')?.streak.current).toBe(14);
    const insights = buildInsights(o);
    expect(insights.map((i) => i.key)).toEqual(expect.arrayContaining(['insights.rules.weeklyRate', 'insights.rules.mostConsistent', 'insights.rules.needsAttention']));
    expect(insights.find((i) => i.key === 'insights.rules.mostConsistent')?.params.name).toBe('Reading');
  });

  it('produces no insight without data', () => {
    expect(buildInsights(overview({ habits: [], logs: [] }, MON))).toEqual([]);
  });
});

describe('gamification', () => {
  it('grants XP only on the day itself or the next day', () => {
    expect(xpForCompletion(MON, MON)).toBe(10);
    expect(xpForCompletion(MON, '2026-11-03')).toBe(10);
    expect(xpForCompletion(MON, '2026-11-05')).toBe(0);
  });

  it('unlocks badges from real completions', () => {
    const a = habit('a', MON);
    const snap = { habits: [a], logs: logs('a', days(MON, 7)) };
    const ids = earnedBadges({ snapshot: snap, overview: overview(snap, addDays(MON, 6)), tasksCompleted: 0, completionHour: () => 7 });
    expect(ids).toEqual(expect.arrayContaining(['first_habit', 'first_check', 'streak_7', 'early_bird']));
    expect(ids).not.toContain('streak_30');
  });
});

describe('planner', () => {
  const task = (id: string, sortOrder: number, done = false): PlannerTask => ({
    id, title: id, notes: null, priority: 'medium', dueDay: MON, time: null, done, doneAt: null, habitId: null, sortOrder, createdAt: MON, updatedAt: MON,
  });

  it('keeps open tasks first in manual order', () => {
    expect(sortTasks([task('x', 0, true), task('b', 2), task('a', 1)]).map((t) => t.id)).toEqual(['a', 'b', 'x']);
  });

  it('reorders open tasks with dense sort orders', () => {
    const list = [task('a', 0), task('b', 1), task('c', 2)];
    expect(reorder(list, 'c', -1)).toEqual([{ id: 'c', sortOrder: 1 }, { id: 'b', sortOrder: 2 }]);
    expect(reorder(list, 'a', -1)).toEqual([]);
  });
});

describe('reminder planning', () => {
  const r = (extra: Partial<Reminder>): Reminder => ({ id: 'r1', habitId: null, hour: 8, minute: 0, days: [], enabled: true, createdAt: MON, updatedAt: MON, ...extra });

  it('uses one daily trigger for every-day reminders', () => {
    expect(planNotifications([r({})], [], MON)).toEqual([expect.objectContaining({ identifier: 'habitflow-r1-all', weekday: null })]);
  });

  it('intersects habit reminders with the habit scheduled weekdays', () => {
    const h = habit('h', MON, { type: 'weekdays', days: [1, 3] });
    const plan = planNotifications([r({ habitId: 'h', days: [1, 2, 3] })], [h], MON);
    expect(plan.map((p) => p.weekday)).toEqual([1, 3]);
  });

  it('skips disabled reminders and archived habits, and caps the total', () => {
    const h = habit('h', MON, { type: 'daily' }, { archivedOn: MON });
    expect(planNotifications([r({ enabled: false }), r({ id: 'r2', habitId: 'h' })], [h], MON)).toEqual([]);
    const many = Array.from({ length: 30 }, (_, i) => r({ id: `r${i}`, days: [1, 2, 3] }));
    expect(planNotifications(many, [], MON).length).toBeLessThanOrEqual(48);
  });
});

describe('templates', () => {
  it('provides at least 40 templates across every group, with unique ids', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const g of TEMPLATE_GROUPS) expect(TEMPLATES.some((t) => t.group === g)).toBe(true);
    for (const t of TEMPLATES) expect(validateFrequency(t.frequency)).toBeNull();
  });
});
