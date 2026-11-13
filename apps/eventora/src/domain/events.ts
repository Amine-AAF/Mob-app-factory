import { daysBetween, eventEndUtc, eventStartUtc, isValidTimeZone, todayIn, validateWhen } from './time';
import type { EventRecord, EventStatus } from './types';

/** Event lifecycle helpers. */

/** Active = still being prepared or happening (counts towards the free plan limit). */
export function isActive(status: EventStatus): boolean {
  return status !== 'completed' && status !== 'cancelled';
}

export function countActive(events: readonly Pick<EventRecord, 'status'>[]): number {
  return events.filter((e) => isActive(e.status)).length;
}

export type EventPhase = 'upcoming' | 'today' | 'ongoing' | 'past';

export function eventPhase(e: EventRecord, now: Date): EventPhase {
  const start = eventStartUtc(e).getTime();
  const end = eventEndUtc(e).getTime();
  const t = now.getTime();
  if (t >= start && t < end) return 'ongoing';
  if (t >= end) return 'past';
  return todayIn(e.timezone, now) === e.startDate ? 'today' : 'upcoming';
}

/** Days until the event (in the event's own calendar); negative once started. */
export function daysUntil(e: Pick<EventRecord, 'startDate' | 'timezone'>, now: Date): number {
  return daysBetween(todayIn(e.timezone, now), e.startDate);
}

/** Status the app suggests when time passes (the user always has the final say). */
export function suggestedStatus(e: EventRecord, now: Date): EventStatus | null {
  if (!isActive(e.status)) return null;
  const phase = eventPhase(e, now);
  if (phase === 'ongoing' && e.status !== 'in_progress') return 'in_progress';
  if (phase === 'past') return 'completed';
  return null;
}

export function validateEvent(e: Pick<EventRecord, 'name' | 'startDate' | 'startTime' | 'endDate' | 'endTime' | 'timezone' | 'expectedGuests' | 'budgetMinor' | 'currency'>): string[] {
  const errors: string[] = [];
  if (!e.name.trim()) errors.push('name');
  if (e.name.length > 120) errors.push('nameTooLong');
  errors.push(...validateWhen(e));
  if (!Number.isInteger(e.expectedGuests) || e.expectedGuests < 0 || e.expectedGuests > 100_000) errors.push('expectedGuests');
  if (!Number.isSafeInteger(e.budgetMinor) || e.budgetMinor < 0) errors.push('budget');
  if (!/^[A-Z]{3}$/.test(e.currency)) errors.push('currency');
  if (!isValidTimeZone(e.timezone) && !errors.includes('timezone')) errors.push('timezone');
  return errors;
}

/** Upcoming first (soonest), then past (most recent first). */
export function sortEvents<T extends EventRecord>(events: readonly T[], now: Date): T[] {
  const t = now.getTime();
  return [...events].sort((a, b) => {
    const ea = eventEndUtc(a).getTime() < t || !isActive(a.status);
    const eb = eventEndUtc(b).getTime() < t || !isActive(b.status);
    if (ea !== eb) return ea ? 1 : -1;
    return ea ? b.startUtc.localeCompare(a.startUtc) : a.startUtc.localeCompare(b.startUtc);
  });
}

/** Name for a duplicated event: "Name (copy)", "Name (copy 2)"… */
export function copyName(name: string, existing: readonly string[], copyWord: string): string {
  const base = `${name} (${copyWord})`;
  if (!existing.includes(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${name} (${copyWord} ${i})`;
    if (!existing.includes(candidate)) return candidate;
  }
  return base;
}
