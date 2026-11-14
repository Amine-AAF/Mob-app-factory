import { addDays, diffDays, fromDayKey, startOfWeek, toDayKey, type DayKey } from '@factory/app-core';

export { addDays, diffDays, fromDayKey, startOfWeek, toDayKey, type DayKey };

/** "YYYY-MM" local calendar month. */
export type MonthKey = string;

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

export const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_KEY = /^\d{4}-\d{2}$/;
export const TIME_KEY = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDayKey(key: string): boolean {
  if (!DAY_KEY.test(key)) return false;
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

export function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

export function monthOf(day: DayKey): MonthKey {
  return day.slice(0, 7);
}

export function parseMonth(key: MonthKey): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return { year: y, month: m };
}

export function addMonths(key: MonthKey, n: number): MonthKey {
  const { year, month } = parseMonth(key);
  const idx = year * 12 + (month - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export function monthStart(key: MonthKey): DayKey {
  return `${key}-01`;
}

export function monthEnd(key: MonthKey): DayKey {
  const { year, month } = parseMonth(key);
  return `${key}-${pad(daysInMonth(year, month))}`;
}

/** Number of whole months from a to b (b - a). */
export function diffMonths(a: MonthKey, b: MonthKey): number {
  const pa = parseMonth(a);
  const pb = parseMonth(b);
  return pb.year * 12 + pb.month - (pa.year * 12 + pa.month);
}

/**
 * Day `anchorDay` of the month `n` months after `start`, clamped to the month length.
 * Anchoring on the ORIGINAL day avoids drift: Jan 31 -> Feb 28 -> Mar 31 (not Mar 28).
 */
export function addMonthsAnchored(start: DayKey, n: number, anchorDay?: number): DayKey {
  const day = anchorDay ?? Number(start.slice(8, 10));
  const target = addMonths(monthOf(start), n);
  const { year, month } = parseMonth(target);
  return `${target}-${pad(Math.min(day, daysInMonth(year, month)))}`;
}

export type PeriodKind = 'week' | 'month' | 'year';

export interface DateRange {
  start: DayKey;
  end: DayKey;
}

export function periodRange(kind: PeriodKind, anchor: DayKey): DateRange {
  if (kind === 'week') {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 6) };
  }
  if (kind === 'month') {
    const m = monthOf(anchor);
    return { start: monthStart(m), end: monthEnd(m) };
  }
  const y = anchor.slice(0, 4);
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

/** Same-length period immediately before the given one. */
export function previousPeriod(kind: PeriodKind, anchor: DayKey): DateRange {
  const { start } = periodRange(kind, anchor);
  if (kind === 'week') return periodRange('week', addDays(start, -7));
  if (kind === 'month') return periodRange('month', monthStart(addMonths(monthOf(start), -1)));
  return periodRange('year', `${Number(start.slice(0, 4)) - 1}-01-01`);
}

export function shiftPeriod(kind: PeriodKind, anchor: DayKey, step: number): DayKey {
  if (kind === 'week') return addDays(anchor, 7 * step);
  if (kind === 'month') return monthStart(addMonths(monthOf(anchor), step));
  return `${Number(anchor.slice(0, 4)) + step}-01-01`;
}

export function daysBetweenInclusive(range: DateRange): DayKey[] {
  const n = diffDays(range.start, range.end);
  return Array.from({ length: n + 1 }, (_, i) => addDays(range.start, i));
}

export function monthsBetweenInclusive(from: MonthKey, to: MonthKey): MonthKey[] {
  const n = diffMonths(from, to);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => addMonths(from, i));
}
