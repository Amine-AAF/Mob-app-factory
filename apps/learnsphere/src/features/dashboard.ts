import { addDays, diffDays, lastNDays, startOfWeek, type DayKey } from '@factory/app-core';

import type { Repositories } from '@/database';

import { sortAgenda } from './agenda/agenda';
import { goalProgress } from './goals/goals';
import { buildSuggestions, missedSessions } from './planner/planner';
import { learningStreak, minutesPerDay, totalMinutes } from './stats/stats';

/** Everything the Home screen shows, loaded in one go from local data. */
export async function loadDashboard(repos: Repositories, now: Date, today: DayKey, dailyMinutes: number) {
  const weekStart = startOfWeek(today);
  const since = addDays(today, -60);
  const [sessionsToday, sessionsRecent, agenda, goals, activity, log, activeDays, dueCards, subjects, courses, lastStudied] = await Promise.all([
    repos.planner.sessionsBetween(today, today),
    repos.planner.sessionsBetween(addDays(today, -7), today),
    repos.agenda.list({ from: addDays(today, -1) }),
    repos.goals.list(true),
    repos.goals.activity(addDays(today, -40)),
    repos.planner.logSince(since),
    repos.goals.activeDays(addDays(today, -400)),
    repos.flashcards.dueCount(),
    repos.subjects.list('active'),
    repos.subjects.coursesInProgress(4),
    repos.planner.lastStudyDayBySubject(),
  ]);

  const todayMinutes = totalMinutes(log, today, today);
  const goalItems = goals.map((g) => goalProgress(g, activity, today));
  const upcoming = sortAgenda(agenda, today).filter((a) => !a.done && a.day >= today).slice(0, 4);
  const missed = missedSessions(sessionsRecent, now);
  const plannedToday = sessionsToday.filter((s) => s.status !== 'skipped').reduce((s, x) => s + x.durationMin, 0);

  const suggestions = buildSuggestions({
    today,
    availableMinutes: dailyMinutes,
    plannedTodayMinutes: Math.max(plannedToday, todayMinutes),
    exams: agenda.filter((a) => a.table === 'exams').map((a) => ({ subjectId: a.subjectId, title: a.title, day: a.day, priority: a.priority })),
    deadlines: agenda.filter((a) => a.table === 'deadlines').map((a) => ({ subjectId: a.subjectId, title: a.title, day: a.day, priority: a.priority, done: a.done })),
    missed: missed.map((m) => ({ subjectId: m.subjectId, durationMin: m.durationMin, title: m.title })),
    goals: goalItems
      .filter((g) => g.goal.metric === 'minutes' && g.goal.period !== 'daily')
      .map((g) => ({ subjectId: g.goal.subjectId, target: g.goal.target, progress: g.value, daysLeftInPeriod: g.daysLeft })),
    dueCards,
    subjects: subjects.map((s) => ({ id: s.id, lastStudiedDay: lastStudied[s.id] ?? null })),
  });

  const week = minutesPerDay(log, addDays(weekStart, 6), 7);
  return {
    today,
    todayMinutes,
    dailyMinutes,
    sessionsToday,
    missedCount: missed.length,
    upcoming: upcoming.map((u) => ({ ...u, daysLeft: diffDays(today, u.day) })),
    goals: goalItems,
    suggestions,
    dueCards,
    streak: learningStreak(activeDays, today),
    week,
    weekMinutes: totalMinutes(log, weekStart, today),
    last7: minutesPerDay(log, today, 7),
    activeThisWeek: lastNDays(today, 7).filter((d) => activeDays.includes(d)).length,
    subjects,
    courses,
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
