import type { Activity, LocalDate } from '@/types/models';

/** Pure selection of the next planned activities from today (today's first, then later days). */
export function nextActivities(days: { date: LocalDate; activities: Activity[] }[], today: LocalDate, limit = 3): (Activity & { date: LocalDate })[] {
  return days
    .filter((d) => d.date >= today)
    .flatMap((d) => d.activities.filter((a) => a.status === 'planned').map((a) => ({ ...a, date: d.date })))
    .slice(0, limit);
}
