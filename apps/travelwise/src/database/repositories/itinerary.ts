import type { SqlDatabase } from '@factory/storage';

import { ACTIVITY_CATEGORIES, ACTIVITY_STATUSES, type ActivityCategory, type ActivityStatus } from '@/constants/domain';
import { isCurrencyCode } from '@/constants/currencies';
import { TEMPLATES, l10n, planTemplateDays, type ItineraryTemplateKey } from '@/content/itineraryTemplates';
import type { Activity, Id, ItineraryDay, LocalDate, LocalTime, TripDestination } from '@/types/models';
import { clock } from '@/utils/clock';
import { compareTimeline, dateRange, durationBetween, isValidDate, isValidTime } from '@/utils/dates';
import { createId } from '@/utils/ids';

export type ItineraryValidationCode =
  | 'name_required'
  | 'name_too_long'
  | 'invalid_time'
  | 'invalid_duration'
  | 'invalid_price'
  | 'invalid_currency'
  | 'invalid_category'
  | 'invalid_status'
  | 'invalid_url'
  | 'invalid_date'
  | 'date_taken'
  | 'day_not_found'
  | 'activity_not_found'
  | 'trip_has_no_dates';

export class ItineraryValidationError extends Error {
  constructor(
    public readonly code: ItineraryValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid itinerary data: ${code}${field ? ` (${field})` : ''}`);
    this.name = 'ItineraryValidationError';
  }
}

interface DayRow {
  id: string;
  trip_id: string;
  date: string;
  destination_id: string | null;
  title: string;
  description: string;
  notes: string;
  budget_minor: number | null;
  position: number;
}

interface ActivityRow {
  id: string;
  trip_id: string;
  day_id: string;
  place_id: string | null;
  name: string;
  description: string;
  address: string;
  category: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  price_minor: number | null;
  currency: string | null;
  notes: string;
  url: string | null;
  status: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const toDay = (r: DayRow): ItineraryDay => ({
  id: r.id,
  tripId: r.trip_id,
  date: r.date,
  destinationId: r.destination_id,
  title: r.title,
  description: r.description,
  notes: r.notes,
  budgetMinor: r.budget_minor,
  position: r.position,
});

const toActivity = (r: ActivityRow): Activity => ({
  id: r.id,
  tripId: r.trip_id,
  dayId: r.day_id,
  placeId: r.place_id,
  name: r.name,
  description: r.description,
  address: r.address,
  category: r.category as ActivityCategory,
  startTime: r.start_time,
  endTime: r.end_time,
  durationMinutes: r.duration_minutes,
  priceMinor: r.price_minor,
  currency: r.currency,
  notes: r.notes,
  url: r.url,
  status: r.status as ActivityStatus,
  position: r.position,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface DayWithActivities extends ItineraryDay {
  activities: Activity[];
  /** True when the day's date is outside the trip's current dates (kept, never auto-deleted). */
  outsideTrip: boolean;
}

export interface DayInput {
  title?: string;
  description?: string;
  notes?: string;
  destinationId?: Id | null;
  budgetMinor?: number | null;
}

export interface ActivityInput {
  name: string;
  description?: string;
  address?: string;
  category?: ActivityCategory;
  startTime?: LocalTime | null;
  endTime?: LocalTime | null;
  durationMinutes?: number | null;
  priceMinor?: number | null;
  currency?: string | null;
  notes?: string;
  url?: string | null;
  status?: ActivityStatus;
  placeId?: Id | null;
}

const MAX_NAME = 120;

/** Accepts http(s) links only; anything else is rejected rather than silently "fixed". */
export function normalizeUrl(url: string | null | undefined): string | null {
  const u = url?.trim();
  if (!u) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(withScheme)) throw new ItineraryValidationError('invalid_url', 'url');
  return withScheme;
}

export function normalizeActivityInput(input: ActivityInput) {
  const name = input.name.trim();
  if (!name) throw new ItineraryValidationError('name_required', 'name');
  if (name.length > MAX_NAME) throw new ItineraryValidationError('name_too_long', 'name');
  const startTime = input.startTime?.trim() || null;
  const endTime = input.endTime?.trim() || null;
  if (startTime && !isValidTime(startTime)) throw new ItineraryValidationError('invalid_time', 'startTime');
  if (endTime && !isValidTime(endTime)) throw new ItineraryValidationError('invalid_time', 'endTime');
  let duration = input.durationMinutes ?? null;
  if (startTime && endTime) duration = durationBetween(startTime, endTime);
  if (duration !== null && (!Number.isInteger(duration) || duration < 0 || duration > 24 * 60)) throw new ItineraryValidationError('invalid_duration', 'duration');
  const price = input.priceMinor ?? null;
  if (price !== null && (!Number.isInteger(price) || price < 0)) throw new ItineraryValidationError('invalid_price', 'price');
  const currency = input.currency?.trim() || null;
  if (currency && !isCurrencyCode(currency)) throw new ItineraryValidationError('invalid_currency', 'currency');
  const category = input.category ?? 'other';
  if (!ACTIVITY_CATEGORIES.includes(category)) throw new ItineraryValidationError('invalid_category', 'category');
  const status = input.status ?? 'planned';
  if (!ACTIVITY_STATUSES.includes(status)) throw new ItineraryValidationError('invalid_status', 'status');
  return {
    name,
    description: input.description?.trim() ?? '',
    address: input.address?.trim() ?? '',
    category,
    startTime,
    endTime,
    durationMinutes: duration,
    priceMinor: price,
    currency,
    notes: input.notes?.trim() ?? '',
    url: normalizeUrl(input.url),
    status,
    placeId: input.placeId ?? null,
  };
}

/** Which destination covers a date: the last stop whose range contains it (arrival day belongs to the new city). */
export function destinationForDate(destinations: Pick<TripDestination, 'id' | 'startDate' | 'endDate' | 'position'>[], date: LocalDate): Id | null {
  const covering = destinations
    .filter((d) => d.startDate && d.endDate && d.startDate <= date && date <= d.endDate)
    .sort((a, b) => a.position - b.position);
  if (covering.length) return covering[covering.length - 1]!.id;
  return destinations.length === 1 ? destinations[0]!.id : null;
}

export function createItineraryRepository(db: SqlDatabase) {
  async function nextPosition(dayId: Id): Promise<number> {
    const row = await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM activities WHERE day_id = ?', [dayId]);
    return (row?.p ?? -1) + 1;
  }

  async function renumber(dayId: Id, orderedIds: Id[]) {
    for (const [i, id] of orderedIds.entries()) await db.runAsync('UPDATE activities SET position = ? WHERE id = ? AND day_id = ?', [i, id, dayId]);
  }

  async function getDayRow(id: Id) {
    const row = await db.getFirstAsync<DayRow>('SELECT * FROM itinerary_days WHERE id = ?', [id]);
    if (!row) throw new ItineraryValidationError('day_not_found');
    return row;
  }

  const repo = {
    async listDays(tripId: Id): Promise<DayWithActivities[]> {
      const trip = await db.getFirstAsync<{ start_date: string | null; end_date: string | null }>('SELECT start_date, end_date FROM trips WHERE id = ?', [tripId]);
      const days = await db.getAllAsync<DayRow>('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY date, position', [tripId]);
      const acts = await db.getAllAsync<ActivityRow>('SELECT * FROM activities WHERE trip_id = ? ORDER BY position', [tripId]);
      const byDay = new Map<Id, Activity[]>();
      for (const a of acts.map(toActivity)) byDay.set(a.dayId, [...(byDay.get(a.dayId) ?? []), a]);
      return days.map((d) => {
        const day = toDay(d);
        const activities = (byDay.get(day.id) ?? []).sort((a, b) => compareTimeline({ startTime: a.startTime, position: a.position }, { startTime: b.startTime, position: b.position }));
        const outsideTrip = !!(trip?.start_date && trip.end_date && (day.date < trip.start_date || day.date > trip.end_date));
        return { ...day, activities, outsideTrip };
      });
    },

    async getDay(id: Id): Promise<ItineraryDay | null> {
      const row = await db.getFirstAsync<DayRow>('SELECT * FROM itinerary_days WHERE id = ?', [id]);
      return row ? toDay(row) : null;
    },

    /**
     * Creates one day per trip date that has none yet, linked to the destination covering
     * that date. Existing days (and days now outside the trip dates) are never deleted.
     * Returns the number of days created.
     */
    async syncDaysWithTrip(tripId: Id): Promise<number> {
      const trip = await db.getFirstAsync<{ start_date: string | null; end_date: string | null }>('SELECT start_date, end_date FROM trips WHERE id = ?', [tripId]);
      if (!trip?.start_date || !trip.end_date) throw new ItineraryValidationError('trip_has_no_dates');
      const destinations = await db.getAllAsync<{ id: string; start_date: string | null; end_date: string | null; position: number }>(
        'SELECT id, start_date, end_date, position FROM trip_destinations WHERE trip_id = ?',
        [tripId],
      );
      const dests = destinations.map((d) => ({ id: d.id, startDate: d.start_date, endDate: d.end_date, position: d.position }));
      const existing = new Set((await db.getAllAsync<{ date: string }>('SELECT date FROM itinerary_days WHERE trip_id = ?', [tripId])).map((r) => r.date));
      let created = 0;
      await db.withTransactionAsync(async () => {
        for (const date of dateRange(trip.start_date!, trip.end_date!)) {
          if (existing.has(date)) continue;
          await db.runAsync('INSERT INTO itinerary_days (id, trip_id, date, destination_id, position) VALUES (?, ?, ?, ?, 0)', [createId(), tripId, date, destinationForDate(dests, date)]);
          created++;
        }
      });
      return created;
    },

    /** Adds a single day (e.g. an extra day outside the planned dates). One day per date. */
    async addDay(tripId: Id, date: LocalDate, input: DayInput = {}): Promise<ItineraryDay> {
      if (!isValidDate(date)) throw new ItineraryValidationError('invalid_date', 'date');
      const taken = await db.getFirstAsync<{ id: string }>('SELECT id FROM itinerary_days WHERE trip_id = ? AND date = ?', [tripId, date]);
      if (taken) throw new ItineraryValidationError('date_taken', 'date');
      const id = createId();
      await db.runAsync('INSERT INTO itinerary_days (id, trip_id, date, destination_id, title, description, notes, budget_minor, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)', [
        id,
        tripId,
        date,
        input.destinationId ?? null,
        input.title?.trim() ?? '',
        input.description?.trim() ?? '',
        input.notes?.trim() ?? '',
        input.budgetMinor ?? null,
      ]);
      return (await repo.getDay(id))!;
    },

    async updateDay(id: Id, input: DayInput): Promise<ItineraryDay> {
      const row = await getDayRow(id);
      const budget = input.budgetMinor === undefined ? row.budget_minor : input.budgetMinor;
      if (budget !== null && (!Number.isInteger(budget) || budget < 0)) throw new ItineraryValidationError('invalid_price', 'budget');
      await db.runAsync('UPDATE itinerary_days SET title = ?, description = ?, notes = ?, destination_id = ?, budget_minor = ? WHERE id = ?', [
        input.title?.trim() ?? row.title,
        input.description?.trim() ?? row.description,
        input.notes?.trim() ?? row.notes,
        input.destinationId === undefined ? row.destination_id : input.destinationId,
        budget,
        id,
      ]);
      return (await repo.getDay(id))!;
    },

    /** Deletes a day and its activities (cascade). */
    async deleteDay(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM itinerary_days WHERE id = ?', [id]);
    },

    async getActivity(id: Id): Promise<Activity | null> {
      const row = await db.getFirstAsync<ActivityRow>('SELECT * FROM activities WHERE id = ?', [id]);
      return row ? toActivity(row) : null;
    },

    async addActivity(dayId: Id, input: ActivityInput): Promise<Activity> {
      const day = await getDayRow(dayId);
      const a = normalizeActivityInput(input);
      const id = createId();
      const now = clock.instant();
      await db.runAsync(
        `INSERT INTO activities (id, trip_id, day_id, place_id, name, description, address, category, start_time, end_time, duration_minutes,
           price_minor, currency, notes, url, status, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, day.trip_id, dayId, a.placeId, a.name, a.description, a.address, a.category, a.startTime, a.endTime, a.durationMinutes, a.priceMinor, a.currency, a.notes, a.url, a.status,
          await nextPosition(dayId), now, now],
      );
      return (await repo.getActivity(id))!;
    },

    /** Updates an activity. Its wall-clock times are stored as typed: never converted. */
    async updateActivity(id: Id, input: ActivityInput): Promise<Activity> {
      if (!(await repo.getActivity(id))) throw new ItineraryValidationError('activity_not_found');
      const a = normalizeActivityInput(input);
      await db.runAsync(
        `UPDATE activities SET place_id = ?, name = ?, description = ?, address = ?, category = ?, start_time = ?, end_time = ?, duration_minutes = ?,
           price_minor = ?, currency = ?, notes = ?, url = ?, status = ?, updated_at = ? WHERE id = ?`,
        [a.placeId, a.name, a.description, a.address, a.category, a.startTime, a.endTime, a.durationMinutes, a.priceMinor, a.currency, a.notes, a.url, a.status, clock.instant(), id],
      );
      return (await repo.getActivity(id))!;
    },

    async setActivityStatus(id: Id, status: ActivityStatus): Promise<void> {
      if (!ACTIVITY_STATUSES.includes(status)) throw new ItineraryValidationError('invalid_status', 'status');
      await db.runAsync('UPDATE activities SET status = ?, updated_at = ? WHERE id = ?', [status, clock.instant(), id]);
    },

    async deleteActivity(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
    },

    /** Copies an activity right after the original (same day), status reset to planned. */
    async duplicateActivity(id: Id): Promise<Activity> {
      const src = await repo.getActivity(id);
      if (!src) throw new ItineraryValidationError('activity_not_found');
      let copy: Activity | null = null;
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE activities SET position = position + 1 WHERE day_id = ? AND position > ?', [src.dayId, src.position]);
        const newId = createId();
        const now = clock.instant();
        await db.runAsync(
          `INSERT INTO activities (id, trip_id, day_id, place_id, name, description, address, category, start_time, end_time, duration_minutes,
             price_minor, currency, notes, url, status, position, created_at, updated_at)
           SELECT ?, trip_id, day_id, place_id, name, description, address, category, start_time, end_time, duration_minutes,
             price_minor, currency, notes, url, 'planned', position + 1, ?, ? FROM activities WHERE id = ?`,
          [newId, now, now, id],
        );
        copy = await repo.getActivity(newId);
      });
      return copy!;
    },

    /** Sets the manual order of a day's activities (used for untimed items and ties). */
    async reorderActivities(dayId: Id, orderedIds: Id[]): Promise<void> {
      await getDayRow(dayId);
      await db.withTransactionAsync(() => renumber(dayId, orderedIds));
    },

    /** Moves an activity one step up or down in the displayed order of its day. */
    async shiftActivity(id: Id, direction: -1 | 1): Promise<void> {
      const a = await repo.getActivity(id);
      if (!a) throw new ItineraryValidationError('activity_not_found');
      const days = (await repo.listDays(a.tripId)).find((d) => d.id === a.dayId);
      const ids = days?.activities.map((x) => x.id) ?? [];
      const i = ids.indexOf(id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await repo.reorderActivities(a.dayId, ids);
    },

    /**
     * Moves an activity to another day (possibly in another city) of the same trip.
     * Its local time is kept as is: 10:00 stays 10:00 in the new day's local time.
     */
    async moveActivity(id: Id, toDayId: Id): Promise<Activity> {
      const a = await repo.getActivity(id);
      if (!a) throw new ItineraryValidationError('activity_not_found');
      const target = await getDayRow(toDayId);
      if (target.trip_id !== a.tripId) throw new ItineraryValidationError('day_not_found');
      if (target.id === a.dayId) return a;
      await db.runAsync('UPDATE activities SET day_id = ?, position = ?, updated_at = ? WHERE id = ?', [toDayId, await nextPosition(toDayId), clock.instant(), id]);
      return (await repo.getActivity(id))!;
    },

    /**
     * Applies an editable template outline to the trip's days (created from the trip dates
     * if needed). Activities are appended; a day title is only set when the day has none.
     * Returns the number of activities added.
     */
    async applyTemplate(tripId: Id, key: ItineraryTemplateKey, lang: string): Promise<number> {
      await repo.syncDaysWithTrip(tripId);
      const days = (await repo.listDays(tripId)).filter((d) => !d.outsideTrip);
      const plan = planTemplateDays(TEMPLATES[key], days.length);
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const [i, day] of days.entries()) {
          const tpl = plan[i];
          if (!tpl) continue;
          if (!day.title) await db.runAsync('UPDATE itinerary_days SET title = ? WHERE id = ?', [l10n(tpl.title, lang), day.id]);
          for (const act of tpl.activities) {
            await repo.addActivity(day.id, { name: l10n(act.name, lang), category: act.category, startTime: act.startTime });
            added++;
          }
        }
      });
      return added;
    },

    /** Count of days and activities, to know whether an itinerary exists yet. */
    async counts(tripId: Id): Promise<{ days: number; activities: number }> {
      const d = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM itinerary_days WHERE trip_id = ?', [tripId]);
      const a = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM activities WHERE trip_id = ?', [tripId]);
      return { days: d?.n ?? 0, activities: a?.n ?? 0 };
    },
  };
  return repo;
}

export type ItineraryRepository = ReturnType<typeof createItineraryRepository>;
