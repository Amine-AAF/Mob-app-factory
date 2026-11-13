import { addDays as addDayKeys, diffDays as diffDayKeys } from '@factory/app-core';

import type { LocalDate, LocalTime } from '@/types/models';

/**
 * Trip date & time helpers. Every function works on calendar strings, never on
 * device-local Date objects, so results do not depend on the phone's time zone
 * (a trip from 30 Dec to 2 Jan is 4 days wherever the phone is).
 */
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidDate(value: string | null | undefined): value is LocalDate {
  const m = value ? DATE_RE.exec(value) : null;
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function isValidTime(value: string | null | undefined): value is LocalTime {
  return !!value && TIME_RE.test(value);
}

/** Normalises "9:5", "09:05", "9h05", "905" → "09:05"; returns null when not a valid time. */
export function normalizeTime(input: string): LocalTime | null {
  const raw = input.trim();
  let h: number;
  let m: number;
  const sep = /^(\d{1,2})[:h.](\d{1,2})$/.exec(raw);
  if (sep) {
    h = Number(sep[1]);
    m = Number(sep[2]);
  } else if (/^\d{3,4}$/.test(raw)) {
    h = Number(raw.slice(0, raw.length - 2));
    m = Number(raw.slice(-2));
  } else if (/^\d{1,2}$/.test(raw)) {
    h = Number(raw);
    m = 0;
  } else return null;
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return addDayKeys(date, days);
}

/** b - a in calendar days. */
export function diffDays(a: LocalDate, b: LocalDate): number {
  return diffDayKeys(a, b);
}

/** Inclusive list of dates from start to end. Empty when invalid or reversed. */
export function dateRange(start: LocalDate, end: LocalDate, max = 366): LocalDate[] {
  if (!isValidDate(start) || !isValidDate(end) || end < start) return [];
  const days = Math.min(diffDays(start, end), max - 1);
  return Array.from({ length: days + 1 }, (_, i) => addDays(start, i));
}

/** Number of calendar days of a trip (inclusive). 30 Jul → 6 Aug = 8 days. */
export function tripDayCount(start: LocalDate | null, end: LocalDate | null): number | null {
  if (!isValidDate(start) || !isValidDate(end) || end < start) return null;
  return diffDays(start, end) + 1;
}

/** Number of nights. 30 Jul → 6 Aug = 7 nights. */
export function tripNights(start: LocalDate | null, end: LocalDate | null): number | null {
  const days = tripDayCount(start, end);
  return days === null ? null : days - 1;
}

/** Days from today until departure (0 = departs today, negative = already started). */
export function daysUntil(today: LocalDate, start: LocalDate | null): number | null {
  return isValidDate(start) ? diffDays(today, start) : null;
}

/** 1-based day number of `date` within the trip, or null when outside. */
export function dayNumber(start: LocalDate | null, end: LocalDate | null, date: LocalDate): number | null {
  if (!isValidDate(start) || !isValidDate(end) || date < start || date > end) return null;
  return diffDays(start, date) + 1;
}

export function timeToMinutes(time: LocalTime): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
}

export function minutesToTime(total: number): LocalTime {
  const m = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Duration between two wall-clock times of the same local day. An end before the
 * start is read as "after midnight" (22:00 → 01:00 = 180 min).
 */
export function durationBetween(start: LocalTime, end: LocalTime): number {
  const d = timeToMinutes(end) - timeToMinutes(start);
  return d >= 0 ? d : d + 1440;
}

/**
 * Timeline ordering: by date, then wall-clock time, then manual position. Untimed
 * items come after timed ones of the same day. Pure string comparison: no time-zone
 * conversion is ever applied to a planned time.
 */
export function compareTimeline(
  a: { date?: LocalDate | null; startTime?: LocalTime | null; position?: number },
  b: { date?: LocalDate | null; startTime?: LocalTime | null; position?: number },
): number {
  const da = a.date ?? '9999-12-31';
  const db = b.date ?? '9999-12-31';
  if (da !== db) return da < db ? -1 : 1;
  const ta = a.startTime ?? '99:99';
  const tb = b.startTime ?? '99:99';
  if (ta !== tb) return ta < tb ? -1 : 1;
  return (a.position ?? 0) - (b.position ?? 0);
}

/** Validates an IANA time zone name with the platform's Intl data. */
export function isValidTimeZone(tz: string | null | undefined): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** A Date at noon UTC for a calendar date. Format it with `timeZone: 'UTC'` to display the same day everywhere. */
export function dateForDisplay(date: LocalDate): Date {
  return new Date(`${date}T12:00:00.000Z`);
}
