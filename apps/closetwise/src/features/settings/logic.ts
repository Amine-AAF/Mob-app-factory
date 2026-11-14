import type { NotificationKind } from '@/domain/types';

/** Display order of the notification cards. */
export const NOTIFICATION_ORDER: readonly NotificationKind[] = ['planned_outfit', 'trip_prep', 'checklist', 'budget', 'goals'];

/** Choices for each kind's parameter (days before, or budget threshold %). */
export const NOTIFICATION_PARAM_OPTIONS: Partial<Record<NotificationKind, { unit: 'days' | 'percent'; values: readonly number[] }>> = {
  trip_prep: { unit: 'days', values: [1, 2, 3, 7] },
  checklist: { unit: 'days', values: [0, 1, 2, 3] },
  budget: { unit: 'percent', values: [70, 80, 90, 100] },
};

export const TIME_STEP_MINUTES = 15;

/** Moves a time of day by `delta` minutes, wrapping around midnight. */
export function shiftTime(hour: number, minute: number, delta: number): { hour: number; minute: number } {
  const total = (((hour * 60 + minute + delta) % 1440) + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}
