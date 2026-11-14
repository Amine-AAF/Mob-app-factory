import { addDays, diffDays, fromDayKey, toDayKey } from '@factory/app-core';

import type { DayKey } from './types';

export { addDays, diffDays, fromDayKey, toDayKey };

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Strict 'YYYY-MM-DD' validation, rejecting impossible dates such as 2026-02-30. */
export function isValidDayKey(value: string | null | undefined): value is DayKey {
  if (!value) return false;
  const m = DAY_KEY.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

export function isValidTime(value: string | null | undefined): value is string {
  return !!value && TIME.test(value);
}

export function parseTime(value: string): { hour: number; minute: number } {
  const m = TIME.exec(value);
  if (!m) throw new Error(`Invalid time: ${value}`);
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Local date-time for a day key + 'HH:MM' (follows the device's current time zone and DST). */
export function atLocalTime(day: DayKey, time: string): Date {
  const { hour, minute } = parseTime(time);
  const d = fromDayKey(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Splits an instant into the local day key and 'HH:MM'. */
export function splitInstant(iso: string): { day: DayKey; time: string } {
  const d = new Date(iso);
  return { day: toDayKey(d), time: formatTime(d.getHours(), d.getMinutes()) };
}

/** Combines a local day + time typed by the user into a UTC ISO instant. */
export function toInstant(day: DayKey, time: string): string {
  return atLocalTime(day, time).toISOString();
}

export interface Age {
  years: number;
  months: number;
}

/** Calendar age (years + months) from a birth day key. Null for a future birth date. */
export function ageFrom(birth: DayKey, today: DayKey): Age | null {
  if (diffDays(birth, today) < 0) return null;
  const b = fromDayKey(birth);
  const t = fromDayKey(today);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) months -= 1;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** Estimated birth date from an approximate age, anchored on the 1st of the month. */
export function estimateBirthDate(years: number, months: number, today: DayKey): DayKey {
  const t = fromDayKey(today);
  const d = new Date(t.getFullYear() - Math.max(0, Math.floor(years)), t.getMonth() - Math.max(0, Math.floor(months)), 1);
  return toDayKey(d);
}

/** 'YYYY-MM' of a day key. */
export function monthKey(day: DayKey): string {
  return day.slice(0, 7);
}

export function startOfMonth(day: DayKey): DayKey {
  return `${monthKey(day)}-01`;
}

/** First day of the month `offset` months away from `day`. */
export function addMonths(day: DayKey, offset: number): DayKey {
  const d = fromDayKey(startOfMonth(day));
  d.setMonth(d.getMonth() + offset);
  return toDayKey(d);
}

export function endOfMonth(day: DayKey): DayKey {
  return addDays(addMonths(day, 1), -1);
}
