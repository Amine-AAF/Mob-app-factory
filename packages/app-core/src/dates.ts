/**
 * Date helpers based on *local calendar days* ("YYYY-MM-DD").
 * Streaks and daily goals must follow the user's local day, not UTC.
 */

export type DayKey = string;

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));

export function toDayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Invalid day key: ${key}`);
  return new Date(y, m - 1, d);
}

export function addDays(key: DayKey, days: number): DayKey {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

/** Whole calendar days from a to b (b - a). DST-safe because it rounds. */
export function diffDays(a: DayKey, b: DayKey): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** The last `count` day keys ending at `end` (inclusive), oldest first. */
export function lastNDays(end: DayKey, count: number): DayKey[] {
  return Array.from({ length: count }, (_, i) => addDays(end, i - (count - 1)));
}

/** Monday-based start of the week containing `key`. */
export function startOfWeek(key: DayKey): DayKey {
  const day = fromDayKey(key).getDay(); // 0 = Sunday
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(key, offset);
}

/** Deterministic day index since an epoch, used to rotate daily content. */
export function dayIndex(key: DayKey, epoch: DayKey = '2026-01-01'): number {
  return diffDays(epoch, key);
}
