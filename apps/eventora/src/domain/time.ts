/**
 * Time-zone aware date handling.
 *
 * An event is planned in *its own* time zone: "Saturday 18:00 in Lisbon" stays
 * 18:00 in Lisbon even when the organiser's phone is set to Paris. We therefore
 * store wall-clock values (date "YYYY-MM-DD", time "HH:mm") plus an IANA zone,
 * and derive the UTC instant only for sorting and for scheduling notifications.
 *
 * Calendar-day arithmetic on "YYYY-MM-DD" strings is done in UTC so that it
 * never depends on the device zone or on DST transitions.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const MINUTES_PER_DAY = 1440;

const pad = (n: number) => String(n).padStart(2, '0');

export function isValidDate(value: string | null | undefined): value is string {
  if (!value) return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function isValidTime(value: string | null | undefined): value is string {
  return !!value && TIME_RE.test(value);
}

/** "HH:mm" → minutes since midnight. */
export function parseHm(value: string): number {
  const m = TIME_RE.exec(value);
  if (!m) throw new Error(`Invalid time: ${value}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Minutes (possibly ≥ 1440) → "HH:mm" on a 24 h clock face. */
export function formatHm(minutes: number): string {
  const m = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Calendar-day helpers on "YYYY-MM-DD" (UTC arithmetic, zone independent). */
function dateToUtcMs(date: string): number {
  if (!isValidDate(date)) throw new Error(`Invalid date: ${date}`);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

function utcMsToDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDaysTo(date: string, days: number): string {
  return utcMsToDate(dateToUtcMs(date) + days * 86_400_000);
}

/** Whole days from a to b (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((dateToUtcMs(b) - dateToUtcMs(a)) / 86_400_000);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  return new Date(dateToUtcMs(date)).getUTCDay();
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** Days of the month grid (Monday first), padded with null for leading blanks. */
export function monthGrid(year: number, month1: number): (string | null)[] {
  const first = `${year}-${pad(month1)}-01`;
  const lead = (weekdayOf(first) + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month1)}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ------------------------------------------------------------ Time zones */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function zoneFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    zoneFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** The device zone, falling back to UTC when Intl can't tell. */
export function deviceTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(tz) ? tz : 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Wall-clock parts of an instant in a zone. */
export function zonedParts(instant: Date, timeZone: string): { date: string; time: string; minutes: number } {
  const parts = Object.fromEntries(zoneFormatter(timeZone).formatToParts(instant).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour) % 24; // some engines print "24" at midnight
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return { date, time: `${pad(hour)}:${parts.minute}`, minutes: hour * 60 + Number(parts.minute) };
}

/** Offset of the zone from UTC at `instant`, in minutes (Paris summer = +120). */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const p = Object.fromEntries(zoneFormatter(timeZone).formatToParts(instant).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second));
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
}

/**
 * Converts a wall-clock date/time in `timeZone` to the UTC instant.
 * Non-existent local times (DST spring-forward gap) resolve to the instant just
 * after the gap; ambiguous times (fall-back) resolve to the first occurrence.
 */
export function zonedToUtc(date: string, time: string | null, timeZone: string): Date {
  const minutes = time ? parseHm(time) : 0;
  const guess = dateToUtcMs(date) + minutes * 60_000;
  const tz = isValidTimeZone(timeZone) ? timeZone : 'UTC';
  // Offsets on both sides of any transition happening that day.
  const before = zoneOffsetMinutes(new Date(guess - 12 * 3_600_000), tz);
  const after = zoneOffsetMinutes(new Date(guess + 12 * 3_600_000), tz);
  const candidates = [...new Set([before, after])].map((off) => guess - off * 60_000);
  const valid = candidates.filter((ts) => {
    const back = zonedParts(new Date(ts), tz);
    return back.date === date && back.minutes === minutes;
  });
  // Ambiguous → earliest valid; non-existent (gap) → shift by the pre-transition offset.
  return new Date(valid.length ? Math.min(...valid) : guess - before * 60_000);
}

/** Today's date in a zone. */
export function todayIn(timeZone: string, now: Date): string {
  return zonedParts(now, isValidTimeZone(timeZone) ? timeZone : 'UTC').date;
}

/** Local calendar date of the device (for tasks, which follow the organiser's day). */
export function localToday(now: Date): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Event span helpers. The end may be on a later date (multi-day events or
 * parties crossing midnight). Without an end time, the end is the end of the
 * end date (or of the start date).
 */
export interface EventWhen {
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}

export function eventStartUtc(e: EventWhen): Date {
  return zonedToUtc(e.startDate, e.startTime, e.timezone);
}

export function eventEndUtc(e: EventWhen): Date {
  const endDate = e.endDate && isValidDate(e.endDate) ? e.endDate : e.startDate;
  if (e.endTime) {
    let end = zonedToUtc(endDate, e.endTime, e.timezone);
    // "20:00 → 02:00" on the same date means the party ends after midnight.
    const start = eventStartUtc(e);
    if (end.getTime() <= start.getTime() && endDate === e.startDate) end = zonedToUtc(addDaysTo(endDate, 1), e.endTime, e.timezone);
    return end;
  }
  return zonedToUtc(addDaysTo(endDate, 1), '00:00', e.timezone);
}

export function crossesMidnight(e: EventWhen): boolean {
  if (!e.startTime || !e.endTime) return !!e.endDate && e.endDate !== e.startDate;
  if (e.endDate && e.endDate !== e.startDate) return true;
  return parseHm(e.endTime) <= parseHm(e.startTime);
}

/** Validation errors for the event form (keys are i18n codes). */
export function validateWhen(e: EventWhen): string[] {
  const errors: string[] = [];
  if (!isValidDate(e.startDate)) errors.push('startDate');
  if (e.startTime && !isValidTime(e.startTime)) errors.push('startTime');
  if (e.endDate && !isValidDate(e.endDate)) errors.push('endDate');
  if (e.endTime && !isValidTime(e.endTime)) errors.push('endTime');
  if (!isValidTimeZone(e.timezone)) errors.push('timezone');
  if (errors.length === 0 && e.endDate && e.endDate < e.startDate) errors.push('endBeforeStart');
  return errors;
}

/** A short list of common zones offered in the picker (the device zone is added first). */
export const COMMON_TIME_ZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Lisbon',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Brussels',
  'Europe/Zurich',
  'Africa/Casablanca',
  'Africa/Algiers',
  'Africa/Tunis',
  'Africa/Dakar',
  'Africa/Abidjan',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Sao_Paulo',
  'America/Montreal',
] as const;
