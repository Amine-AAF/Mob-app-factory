import { countdown, readiness, sortAgenda, tableForKind, type AgendaItem } from '@/features/agenda/agenda';
import { EMPTY_STATS, achievementProgress, newlyUnlocked } from '@/features/goals/achievements';
import { daysAllDailyGoalsMet, goalCompletionRate, goalProgress, periodRange, type ActivityRow, type Goal } from '@/features/goals/goals';
import { averagePerActiveDay, learningStreak, minutesBySubject, minutesPerDay, monthOverMonth, totalMinutes, weeklyTotals, weekOverWeek } from '@/features/stats/stats';
import { ACHIEVEMENTS } from '@/content/achievements';

const TODAY = '2026-11-13'; // Friday
const log = [
  { day: '2026-11-13', minutes: 30, subjectId: 'a' },
  { day: '2026-11-12', minutes: 45, subjectId: 'b' },
  { day: '2026-11-10', minutes: 20, subjectId: 'a' },
  { day: '2026-11-03', minutes: 60, subjectId: 'a' },
  { day: '2026-10-05', minutes: 100, subjectId: null },
];

describe('statistics', () => {
  it('computes minutes per day with zero-filled days', () => {
    const days = minutesPerDay(log, TODAY, 7);
    expect(days).toHaveLength(7);
    expect(days.at(-1)).toEqual({ day: TODAY, minutes: 30 });
    expect(days.find((d) => d.day === '2026-11-11')?.minutes).toBe(0);
  });

  it('computes totals and time by subject', () => {
    expect(totalMinutes(log)).toBe(255);
    expect(totalMinutes(log, '2026-11-09', TODAY)).toBe(95);
    expect(minutesBySubject(log, '2026-11-01')).toEqual([
      { subjectId: 'a', minutes: 110 },
      { subjectId: 'b', minutes: 45 },
    ]);
    expect(averagePerActiveDay(log)).toBe(51);
  });

  it('compares week over week and month over month', () => {
    // This week Mon 9 → Fri 13 = 95; last week Mon 2 → Fri 6 = 60.
    expect(weekOverWeek(log, TODAY)).toEqual({ current: 95, previous: 60, change: (95 - 60) / 60 });
    // November 1–13 = 155; October 1–13 = 100.
    expect(monthOverMonth(log, TODAY).previous).toBe(100);
    expect(weekOverWeek([], TODAY).change).toBeNull();
    expect(weeklyTotals(log, TODAY, 3).map((w) => w.minutes)).toEqual([0, 60, 95]);
  });

  it('computes learning streaks from local days', () => {
    expect(learningStreak(['2026-11-11', '2026-11-12', '2026-11-13'], TODAY)).toEqual({ current: 3, longest: 3 });
    // Not studied yet today: yesterday keeps the streak alive.
    expect(learningStreak(['2026-11-11', '2026-11-12'], TODAY).current).toBe(2);
  });
});

describe('goals and gamification', () => {
  const activity: ActivityRow[] = [
    { day: '2026-11-13', subjectId: 'a', minutes: 30, sessions: 1, chapters: 1, flashcards: 20, quizzes: 0 },
    { day: '2026-11-12', subjectId: 'b', minutes: 45, sessions: 1, chapters: 0, flashcards: 0, quizzes: 1 },
    { day: '2026-11-02', subjectId: 'a', minutes: 60, sessions: 0, chapters: 0, flashcards: 5, quizzes: 0 },
  ];
  const goal = (over: Partial<Goal>): Goal => ({ id: 'g', title: '', period: 'daily', metric: 'minutes', target: 30, subjectId: null, startDay: null, endDay: null, active: true, ...over });

  it('computes period ranges', () => {
    expect(periodRange(goal({ period: 'weekly' }), TODAY)).toEqual({ from: '2026-11-09', to: '2026-11-15' });
    expect(periodRange(goal({ period: 'monthly' }), TODAY)).toEqual({ from: '2026-11-01', to: '2026-11-30' });
    expect(periodRange(goal({ period: 'challenge', startDay: '2026-11-01', endDay: '2026-11-20' }), TODAY)).toEqual({ from: '2026-11-01', to: '2026-11-20' });
  });

  it('computes progress per metric, period and subject', () => {
    expect(goalProgress(goal({}), activity, TODAY)).toMatchObject({ value: 30, met: true, ratio: 1 });
    expect(goalProgress(goal({ period: 'weekly', target: 100 }), activity, TODAY)).toMatchObject({ value: 75, met: false, daysLeft: 3 });
    expect(goalProgress(goal({ period: 'monthly', metric: 'flashcards', target: 50, subjectId: 'a' }), activity, TODAY).value).toBe(25);
    expect(goalProgress(goal({ metric: 'chapters', target: 1 }), activity, TODAY).met).toBe(true);
  });

  it('computes goal completion and days where every daily goal was met', () => {
    const goals = [goal({ id: '1', target: 30 }), goal({ id: '2', metric: 'flashcards', target: 10 })];
    expect(goalCompletionRate(goals.map((g) => goalProgress(g, activity, TODAY)))).toBe(1);
    expect(goalCompletionRate([])).toBeNull();
    expect(daysAllDailyGoalsMet(goals, activity)).toBe(1);
  });

  it('unlocks badges once and reports progress', () => {
    const stats = { ...EMPTY_STATS, subjectsCreated: 1, streak: 7, cardsReviewed: 60 };
    const ids = newlyUnlocked(stats, new Set(['first_subject'])).map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['streak_3', 'streak_7', 'reviewer_50']));
    expect(ids).not.toContain('first_subject');
    expect(ids).not.toContain('streak_30');
    expect(achievementProgress(ACHIEVEMENTS.find((a) => a.id === 'streak_30')!, stats)).toBeCloseTo(7 / 30);
  });
});

describe('exams and deadlines', () => {
  const item = (over: Partial<AgendaItem>): AgendaItem => ({ id: 'x', table: 'exams', kind: 'exam', title: 't', subjectId: null, day: TODAY, minute: null, priority: 'medium', notes: '', done: false, checklistDone: 0, checklistTotal: 0, ...over });

  it('computes countdowns', () => {
    const now = new Date(2026, 10, 13, 10, 0);
    expect(countdown('2026-11-16', 9 * 60, now)).toMatchObject({ days: 3, state: 'soon' });
    expect(countdown(TODAY, null, now)).toMatchObject({ days: 0, hours: 13, minutes: 59, state: 'today' });
    expect(countdown('2026-11-14', 8 * 60, now).state).toBe('tomorrow');
    expect(countdown('2026-11-12', null, now).state).toBe('past');
    expect(countdown('2026-12-31', null, now).state).toBe('later');
  });

  it('sorts upcoming items by date then priority, closed items last', () => {
    const items = [item({ id: 'past', day: '2026-11-01' }), item({ id: 'later-low', day: '2026-11-20', priority: 'low' }), item({ id: 'later-high', day: '2026-11-20', priority: 'high' }), item({ id: 'soon', day: '2026-11-14' }), item({ id: 'done', day: '2026-11-15', table: 'deadlines', kind: 'project', done: true })];
    expect(sortAgenda(items, TODAY).map((i) => i.id)).toEqual(['soon', 'later-high', 'later-low', 'done', 'past']);
  });

  it('maps kinds to tables and computes readiness', () => {
    expect(tableForKind('certification')).toBe('exams');
    expect(tableForKind('assignment')).toBe('deadlines');
    expect(readiness(item({}))).toBeNull();
    expect(readiness(item({ checklistDone: 3, checklistTotal: 4 }))).toBe(0.75);
  });
});
