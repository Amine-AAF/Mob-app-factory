import type { SqlDatabase } from '@factory/storage';

import { isCurrencyCode } from '@/constants/currencies';
import { BOOKING_STATUSES, BOOKING_TYPES, type BookingStatus, type BookingType } from '@/constants/domain';
import type { Booking, Id, LocalDate, LocalTime } from '@/types/models';
import { clock } from '@/utils/clock';
import { compareTimeline, isValidDate, isValidTime, isValidTimeZone } from '@/utils/dates';
import { createId } from '@/utils/ids';

import { normalizeUrl } from './itinerary';

export type BookingValidationCode =
  | 'provider_or_reference_required'
  | 'invalid_type'
  | 'invalid_status'
  | 'invalid_date'
  | 'invalid_time'
  | 'end_before_start'
  | 'invalid_price'
  | 'invalid_currency'
  | 'invalid_time_zone'
  | 'invalid_url'
  | 'too_long'
  | 'not_found';

export class BookingValidationError extends Error {
  constructor(
    public readonly code: BookingValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid booking: ${code}${field ? ` (${field})` : ''}`);
    this.name = 'BookingValidationError';
  }
}

interface BookingRow {
  id: string;
  trip_id: string;
  type: string;
  provider: string;
  reference: string;
  date: string | null;
  time: string | null;
  end_date: string | null;
  end_time: string | null;
  time_zone: string | null;
  address: string;
  departure_info: string;
  arrival_info: string;
  price_minor: number | null;
  currency: string | null;
  status: string;
  notes: string;
  url: string | null;
  attachment_document_id: string | null;
  created_at: string;
  updated_at: string;
}

const toBooking = (r: BookingRow): Booking => ({
  id: r.id,
  tripId: r.trip_id,
  type: r.type as BookingType,
  provider: r.provider,
  reference: r.reference,
  date: r.date,
  time: r.time,
  endDate: r.end_date,
  endTime: r.end_time,
  timeZone: r.time_zone,
  address: r.address,
  departureInfo: r.departure_info,
  arrivalInfo: r.arrival_info,
  priceMinor: r.price_minor,
  currency: r.currency,
  status: r.status as BookingStatus,
  notes: r.notes,
  url: r.url,
  attachmentDocumentId: r.attachment_document_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface BookingInput {
  type: BookingType;
  provider?: string;
  /** Typed by the user, stored as is. The app never generates or checks references. */
  reference?: string;
  date?: LocalDate | null;
  time?: LocalTime | null;
  endDate?: LocalDate | null;
  endTime?: LocalTime | null;
  timeZone?: string | null;
  address?: string;
  departureInfo?: string;
  arrivalInfo?: string;
  priceMinor?: number | null;
  currency?: string | null;
  status?: BookingStatus;
  notes?: string;
  url?: string | null;
  attachmentDocumentId?: Id | null;
}

const MAX_TEXT = 500;

export function normalizeBookingInput(input: BookingInput) {
  if (!BOOKING_TYPES.includes(input.type)) throw new BookingValidationError('invalid_type', 'type');
  const status = input.status ?? 'confirmed';
  if (!BOOKING_STATUSES.includes(status)) throw new BookingValidationError('invalid_status', 'status');
  const provider = input.provider?.trim() ?? '';
  const reference = input.reference?.trim() ?? '';
  // Incomplete bookings are allowed (only a date, only a name…), but not an empty card.
  if (!provider && !reference && !input.departureInfo?.trim() && !input.arrivalInfo?.trim()) throw new BookingValidationError('provider_or_reference_required', 'provider');
  for (const [field, v] of Object.entries({ provider, reference, address: input.address ?? '', departureInfo: input.departureInfo ?? '', arrivalInfo: input.arrivalInfo ?? '' })) {
    if (v.length > MAX_TEXT) throw new BookingValidationError('too_long', field);
  }
  const date = input.date?.trim() || null;
  const endDate = input.endDate?.trim() || null;
  const time = input.time?.trim() || null;
  const endTime = input.endTime?.trim() || null;
  if (date && !isValidDate(date)) throw new BookingValidationError('invalid_date', 'date');
  if (endDate && !isValidDate(endDate)) throw new BookingValidationError('invalid_date', 'endDate');
  if (time && !isValidTime(time)) throw new BookingValidationError('invalid_time', 'time');
  if (endTime && !isValidTime(endTime)) throw new BookingValidationError('invalid_time', 'endTime');
  // Arrival may be "earlier" in wall-clock terms when crossing time zones, so only dates are compared.
  if (date && endDate && endDate < date) throw new BookingValidationError('end_before_start', 'endDate');
  const tz = input.timeZone?.trim() || null;
  if (tz && !isValidTimeZone(tz)) throw new BookingValidationError('invalid_time_zone', 'timeZone');
  const price = input.priceMinor ?? null;
  if (price !== null && (!Number.isInteger(price) || price < 0)) throw new BookingValidationError('invalid_price', 'price');
  const currency = input.currency?.trim() || null;
  if (currency && !isCurrencyCode(currency)) throw new BookingValidationError('invalid_currency', 'currency');
  let url: string | null;
  try {
    url = normalizeUrl(input.url);
  } catch {
    throw new BookingValidationError('invalid_url', 'url');
  }
  return {
    type: input.type,
    provider,
    reference,
    date,
    time,
    endDate,
    endTime,
    timeZone: tz,
    address: input.address?.trim() ?? '',
    departureInfo: input.departureInfo?.trim() ?? '',
    arrivalInfo: input.arrivalInfo?.trim() ?? '',
    priceMinor: price,
    currency,
    status,
    notes: input.notes?.trim() ?? '',
    url,
    attachmentDocumentId: input.attachmentDocumentId ?? null,
  };
}

/** Chronological order by local date/time; undated bookings last, then by creation. */
export function sortBookings<T extends Pick<Booking, 'date' | 'time' | 'createdAt'>>(list: T[]): T[] {
  return [...list].sort((a, b) => compareTimeline({ date: a.date, startTime: a.time }, { date: b.date, startTime: b.time }) || a.createdAt.localeCompare(b.createdAt));
}

/** Fields worth completing on a booking (shown as "incomplete" hints, never invented). */
export function missingBookingFields(b: Pick<Booking, 'date' | 'time' | 'reference' | 'provider'>): ('date' | 'time' | 'reference' | 'provider')[] {
  const out: ('date' | 'time' | 'reference' | 'provider')[] = [];
  if (!b.provider) out.push('provider');
  if (!b.reference) out.push('reference');
  if (!b.date) out.push('date');
  if (!b.time) out.push('time');
  return out;
}

export function createBookingRepository(db: SqlDatabase) {
  const repo = {
    async list(tripId: Id): Promise<Booking[]> {
      const rows = await db.getAllAsync<BookingRow>('SELECT * FROM bookings WHERE trip_id = ?', [tripId]);
      return sortBookings(rows.map(toBooking));
    },

    async get(id: Id): Promise<Booking | null> {
      const row = await db.getFirstAsync<BookingRow>('SELECT * FROM bookings WHERE id = ?', [id]);
      return row ? toBooking(row) : null;
    },

    async create(tripId: Id, input: BookingInput): Promise<Booking> {
      const b = normalizeBookingInput(input);
      const id = createId();
      const now = clock.instant();
      await db.runAsync(
        `INSERT INTO bookings (id, trip_id, type, provider, reference, date, time, end_date, end_time, time_zone, address, departure_info, arrival_info,
           price_minor, currency, status, notes, url, attachment_document_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, tripId, b.type, b.provider, b.reference, b.date, b.time, b.endDate, b.endTime, b.timeZone, b.address, b.departureInfo, b.arrivalInfo, b.priceMinor, b.currency,
          b.status, b.notes, b.url, b.attachmentDocumentId, now, now],
      );
      return (await repo.get(id))!;
    },

    async update(id: Id, input: BookingInput): Promise<Booking> {
      if (!(await repo.get(id))) throw new BookingValidationError('not_found');
      const b = normalizeBookingInput(input);
      await db.runAsync(
        `UPDATE bookings SET type = ?, provider = ?, reference = ?, date = ?, time = ?, end_date = ?, end_time = ?, time_zone = ?, address = ?,
           departure_info = ?, arrival_info = ?, price_minor = ?, currency = ?, status = ?, notes = ?, url = ?, attachment_document_id = ?, updated_at = ? WHERE id = ?`,
        [b.type, b.provider, b.reference, b.date, b.time, b.endDate, b.endTime, b.timeZone, b.address, b.departureInfo, b.arrivalInfo, b.priceMinor, b.currency, b.status,
          b.notes, b.url, b.attachmentDocumentId, clock.instant(), id],
      );
      return (await repo.get(id))!;
    },

    async remove(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM bookings WHERE id = ?', [id]);
    },

    /** Next non-cancelled bookings from `today` (inclusive), for dashboards. */
    async upcoming(tripId: Id, today: LocalDate, limit = 3): Promise<Booking[]> {
      const rows = await db.getAllAsync<BookingRow>(`SELECT * FROM bookings WHERE trip_id = ? AND status <> 'cancelled' AND date >= ?`, [tripId, today]);
      return sortBookings(rows.map(toBooking)).slice(0, limit);
    },
  };
  return repo;
}

export type BookingRepository = ReturnType<typeof createBookingRepository>;
