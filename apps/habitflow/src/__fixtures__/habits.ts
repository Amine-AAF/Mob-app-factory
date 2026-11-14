import type { DayKey, Frequency, HabitLog, HabitWithSchedules, LogStatus, Schedule, Tracking } from '@/types';

export const CHECK: Tracking = { mode: 'check', target: 1, unit: null };

export function habit(id: string, startDate: DayKey, frequency: Frequency = { type: 'daily' }, extra: Partial<HabitWithSchedules> = {}): HabitWithSchedules {
  return {
    id,
    name: id,
    description: null,
    icon: 'star',
    color: '#5A4FCF',
    category: 'custom',
    startDate,
    durationMin: null,
    notes: null,
    templateId: null,
    sortOrder: 0,
    archivedOn: null,
    createdAt: `${startDate}T08:00:00.000Z`,
    updatedAt: `${startDate}T08:00:00.000Z`,
    schedules: [{ habitId: id, effectiveFrom: startDate, frequency, tracking: CHECK }],
    ...extra,
  };
}

export function withSchedule(h: HabitWithSchedules, s: Omit<Schedule, 'habitId'>): HabitWithSchedules {
  return { ...h, schedules: [...h.schedules, { ...s, habitId: h.id }] };
}

export function log(habitId: string, day: DayKey, status: LogStatus = 'done', value = 1, target = 1): HabitLog {
  return { habitId, day, value, target, status, note: null, completedAt: status === 'done' ? `${day}T09:00:00.000Z` : null, createdAt: `${day}T09:00:00.000Z`, updatedAt: `${day}T09:00:00.000Z` };
}

export function logs(habitId: string, days: DayKey[], status: LogStatus = 'done'): HabitLog[] {
  return days.map((d) => log(habitId, d, status));
}
