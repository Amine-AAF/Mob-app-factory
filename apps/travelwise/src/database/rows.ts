import type { Participant, Trip, TripDestination } from '@/types/models';

/** Raw SQLite rows (snake_case) and their mappers to domain objects. */
export interface TripRow {
  id: string;
  name: string;
  primary_destination: string;
  country_code: string | null;
  city: string | null;
  start_date: string | null;
  end_date: string | null;
  time_zone: string | null;
  description: string;
  cover_uri: string | null;
  trip_type: string;
  budget_minor: number | null;
  currency: string;
  status: string;
  is_demo: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export const toTrip = (r: TripRow): Trip => ({
  id: r.id,
  name: r.name,
  primaryDestination: r.primary_destination,
  countryCode: r.country_code,
  city: r.city,
  startDate: r.start_date,
  endDate: r.end_date,
  timeZone: r.time_zone,
  description: r.description,
  coverUri: r.cover_uri,
  tripType: r.trip_type as Trip['tripType'],
  budgetMinor: r.budget_minor,
  currency: r.currency,
  status: r.status as Trip['status'],
  isDemo: r.is_demo === 1,
  archivedAt: r.archived_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface DestinationRow {
  id: string;
  trip_id: string;
  city: string;
  country_code: string | null;
  time_zone: string | null;
  start_date: string | null;
  end_date: string | null;
  position: number;
  notes: string;
}

export const toDestination = (r: DestinationRow): TripDestination => ({
  id: r.id,
  tripId: r.trip_id,
  city: r.city,
  countryCode: r.country_code,
  timeZone: r.time_zone,
  startDate: r.start_date,
  endDate: r.end_date,
  position: r.position,
  notes: r.notes,
});

export interface ParticipantRow {
  id: string;
  trip_id: string;
  name: string;
  is_self: number;
  position: number;
}

export const toParticipant = (r: ParticipantRow): Participant => ({
  id: r.id,
  tripId: r.trip_id,
  name: r.name,
  isSelf: r.is_self === 1,
  position: r.position,
});

export const bool = (v: boolean): number => (v ? 1 : 0);
