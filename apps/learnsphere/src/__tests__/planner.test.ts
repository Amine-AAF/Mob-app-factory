import { buildSuggestions, completionRate, expandRecurrence, findFreeSlot, isoWeekday, MAX_OCCURRENCES, missedSessions, monthGrid, overlaps, shiftView, viewRange, weekDays, type PlannedSession, type SuggestionInput } from '@/features/planner/planner';

const s = (over: Partial<PlannedSession>): PlannedSession => ({ id: Math.random().toString(36), subjectId: null, day: '2026-11-13', startMinute: 600, durationMin: 60, status: 'planned', ...over });

describe('recurring sessions', () => {
  it('expands weekly rules on chosen weekdays (Monday = 1)', () => {
    // 2026-11-16 is a Monday.
    expect(isoWeekday('2026-11-16')).toBe(1);
    expect(isoWeekday('2026-11-22')).toBe(7);
    const days = expandRecurrence({ frequency: 'weekly', weekdays: [1, 3], interval: 1, startDay: '2026-11-16', untilDay: '2026-11-29' });
    expect(days).toEqual(['2026-11-16', '2026-11-18', '2026-11-23', '2026-11-25']);
  });

  it('supports every-other-week, daily rules, empty ranges and a hard cap', () => {
    expect(expandRecurrence({ frequency: 'weekly', weekdays: [1], interval: 2, startDay: '2026-11-16', untilDay: '2026-12-14' })).toEqual(['2026-11-16', '2026-11-30', '2026-12-14']);
    expect(expandRecurrence({ frequency: 'daily', weekdays: [], interval: 3, startDay: '2026-11-01', untilDay: '2026-11-10' })).toEqual(['2026-11-01', '2026-11-04', '2026-11-07', '2026-11-10']);
    expect(expandRecurrence({ frequency: 'weekly', weekdays: [], interval: 1, startDay: '2026-11-01', untilDay: '2026-12-01' })).toEqual([]);
    expect(expandRecurrence({ frequency: 'daily', weekdays: [], interval: 1, startDay: '2026-12-01', untilDay: '2026-11-01' })).toEqual([]);
    expect(expandRecurrence({ frequency: 'daily', weekdays: [], interval: 1, startDay: '2026-01-01', untilDay: '2030-01-01' })).toHaveLength(MAX_OCCURRENCES);
  });

  it('crosses daylight saving time without skipping or duplicating days', () => {
    // Europe switches clocks on 2026-10-25.
    const days = expandRecurrence({ frequency: 'daily', weekdays: [], interval: 1, startDay: '2026-10-23', untilDay: '2026-10-27' });
    expect(days).toEqual(['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27']);
  });
});

describe('calendar views', () => {
  it('builds Monday-first weeks and 6-week month grids', () => {
    expect(weekDays('2026-11-13')[0]).toBe('2026-11-09');
    expect(weekDays('2026-11-13')).toHaveLength(7);
    const grid = monthGrid('2026-11-13');
    expect(grid).toHaveLength(42);
    expect(grid[0]?.day).toBe('2026-10-26');
    expect(grid.filter((g) => g.inMonth)).toHaveLength(30);
  });

  it('navigates and computes ranges per view', () => {
    expect(shiftView('2026-11-13', 'day', 1)).toBe('2026-11-14');
    expect(shiftView('2026-11-13', 'week', -1)).toBe('2026-11-06');
    expect(shiftView('2026-01-31', 'month', 1)).toBe('2026-02-01');
    expect(viewRange('2026-11-13', 'week')).toEqual({ from: '2026-11-09', to: '2026-11-15' });
  });
});

describe('session calculations', () => {
  const now = new Date(2026, 10, 13, 14, 0);
  it('detects missed sessions and computes the completion rate', () => {
    const sessions = [s({ day: '2026-11-12', status: 'planned' }), s({ day: '2026-11-13', startMinute: 9 * 60 }), s({ day: '2026-11-13', startMinute: 16 * 60 }), s({ day: '2026-11-11', status: 'done' }), s({ day: '2026-11-10', status: 'skipped' })];
    expect(missedSessions(sessions, now)).toHaveLength(2);
    expect(completionRate(sessions, now)).toBeCloseTo(1 / 4);
    expect(completionRate([], now)).toBeNull();
  });

  it('detects overlaps and finds free slots', () => {
    const existing = [s({ id: 'a', startMinute: 600, durationMin: 60 }), s({ id: 'b', startMinute: 720, durationMin: 30 })];
    expect(overlaps({ day: '2026-11-13', startMinute: 630, durationMin: 30 }, existing).map((x) => x.id)).toEqual(['a']);
    expect(overlaps({ day: '2026-11-13', startMinute: 660, durationMin: 60 }, existing)).toHaveLength(0);
    expect(overlaps({ id: 'a', day: '2026-11-13', startMinute: 600, durationMin: 60 }, existing)).toHaveLength(0);
    expect(findFreeSlot(existing, '2026-11-13', 60, 600)).toBe(660);
    expect(findFreeSlot(existing, '2026-11-13', 90, 600)).toBe(750);
    expect(findFreeSlot([], '2026-11-13', 60, 23 * 60)).toBeNull();
  });
});

describe('local study suggestions (rule-based, not AI)', () => {
  const base: SuggestionInput = { today: '2026-11-13', availableMinutes: 90, plannedTodayMinutes: 0, exams: [], deadlines: [], missed: [], goals: [], dueCards: 0, subjects: [] };

  it('suggests nothing when there is no available time', () => {
    expect(buildSuggestions({ ...base, plannedTodayMinutes: 85, exams: [{ subjectId: 'm', title: 'Math', day: '2026-11-15', priority: 'high' }] })).toEqual([]);
  });

  it('prioritises a close exam and fits suggestions within the available time', () => {
    const out = buildSuggestions({
      ...base,
      exams: [
        { subjectId: 'far', title: 'History', day: '2026-12-01', priority: 'low' },
        { subjectId: 'math', title: 'Math', day: '2026-11-14', priority: 'high' },
      ],
      dueCards: 30,
      missed: [{ subjectId: 'bio', durationMin: 45, title: 'Biology' }],
    });
    expect(out[0]).toMatchObject({ subjectId: 'math', reason: 'exam_soon', daysLeft: 1 });
    expect(out.reduce((sum, x) => sum + x.minutes, 0)).toBeLessThanOrEqual(90);
    expect(out.every((x) => x.minutes % 5 === 0 && x.minutes >= 5)).toBe(true);
    expect(out.map((x) => x.reason)).toContain('missed_session');
  });

  it('ignores past or far exams and done deadlines, and balances neglected subjects', () => {
    const out = buildSuggestions({
      ...base,
      exams: [{ subjectId: 'x', title: 'Past', day: '2026-11-01', priority: 'high' }],
      deadlines: [{ subjectId: 'y', title: 'Essay', day: '2026-11-14', priority: 'medium', done: true }],
      subjects: [
        { id: 'recent', lastStudiedDay: '2026-11-12' },
        { id: 'old', lastStudiedDay: '2026-11-01' },
      ],
    });
    expect(out).toEqual([expect.objectContaining({ subjectId: 'old', reason: 'balance' })]);
  });

  it('sizes goal suggestions from the remaining target and days left', () => {
    const out = buildSuggestions({ ...base, goals: [{ subjectId: null, target: 300, progress: 180, daysLeftInPeriod: 3 }] });
    expect(out[0]).toMatchObject({ reason: 'goal_behind', minutes: 40 });
  });
});
