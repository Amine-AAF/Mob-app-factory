import type {
  ActivityCategory,
  ActivityStatus,
  BookingStatus,
  BookingType,
  BudgetCategory,
  DocumentType,
  PackingCategory,
  PlaceCategory,
  Priority,
  RateSource,
  SplitMode,
  TaskStatus,
  TripStatus,
  TripType,
  WeatherCondition,
} from '@/constants/domain';

/**
 * Date & time conventions (see docs/data-model.md):
 * - `LocalDate`  "YYYY-MM-DD": a calendar day at the destination. No time zone, never shifted.
 * - `LocalTime`  "HH:mm": a wall-clock time at the destination. Never converted when the
 *   user's phone changes time zone (09:00 in Lisbon stays 09:00).
 * - `Instant`    ISO-8601 UTC string ("2026-07-30T08:00:00.000Z"): a moment in time
 *   (created_at, reminders, rate capture time).
 * - `TimeZoneId` IANA name ("Europe/Lisbon"), optional, informative.
 * - Money: integer minor units + ISO currency code.
 */
export type LocalDate = string;
export type LocalTime = string;
export type Instant = string;
export type TimeZoneId = string;
export type Id = string;

export interface Trip {
  id: Id;
  name: string;
  primaryDestination: string;
  countryCode: string | null;
  city: string | null;
  startDate: LocalDate | null;
  endDate: LocalDate | null;
  timeZone: TimeZoneId | null;
  description: string;
  coverUri: string | null;
  tripType: TripType;
  budgetMinor: number | null;
  currency: string;
  /** Status chosen by the user; see `effectiveStatus` for the date-derived status shown in the UI. */
  status: TripStatus;
  /** Demo trips are clearly labelled and never mixed with real data in statistics. */
  isDemo: boolean;
  archivedAt: Instant | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface TripDestination {
  id: Id;
  tripId: Id;
  city: string;
  countryCode: string | null;
  timeZone: TimeZoneId | null;
  startDate: LocalDate | null;
  endDate: LocalDate | null;
  position: number;
  notes: string;
}

export interface Participant {
  id: Id;
  tripId: Id;
  name: string;
  isSelf: boolean;
  position: number;
}

export interface ItineraryDay {
  id: Id;
  tripId: Id;
  date: LocalDate;
  destinationId: Id | null;
  title: string;
  description: string;
  notes: string;
  budgetMinor: number | null;
  position: number;
}

export interface Activity {
  id: Id;
  tripId: Id;
  dayId: Id;
  placeId: Id | null;
  name: string;
  description: string;
  address: string;
  category: ActivityCategory;
  /** Null = no fixed time ("sometime during the day"). */
  startTime: LocalTime | null;
  endTime: LocalTime | null;
  durationMinutes: number | null;
  priceMinor: number | null;
  currency: string | null;
  notes: string;
  url: string | null;
  status: ActivityStatus;
  position: number;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface Booking {
  id: Id;
  tripId: Id;
  type: BookingType;
  provider: string;
  /** Typed by the user. Never generated or verified by the app. */
  reference: string;
  date: LocalDate | null;
  time: LocalTime | null;
  endDate: LocalDate | null;
  endTime: LocalTime | null;
  timeZone: TimeZoneId | null;
  address: string;
  departureInfo: string;
  arrivalInfo: string;
  priceMinor: number | null;
  currency: string | null;
  status: BookingStatus;
  notes: string;
  url: string | null;
  attachmentDocumentId: Id | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface Place {
  id: Id;
  tripId: Id | null;
  dayId: Id | null;
  name: string;
  address: string;
  city: string;
  countryCode: string | null;
  category: PlaceCategory;
  notes: string;
  url: string | null;
  /** Only ever set from user input; never guessed. */
  latitude: number | null;
  longitude: number | null;
  photoUri: string | null;
  isFavorite: boolean;
  createdAt: Instant;
}

export interface TravelDocument {
  id: Id;
  tripId: Id | null;
  title: string;
  type: DocumentType;
  /** App-private file reference (file:// in the app sandbox). The file itself is never in SQLite. */
  fileUri: string;
  mimeType: string;
  sizeBytes: number;
  expiresOn: LocalDate | null;
  notes: string;
  createdAt: Instant;
}

export interface BudgetLine {
  tripId: Id;
  category: BudgetCategory;
  plannedMinor: number;
}

export interface Expense {
  id: Id;
  tripId: Id;
  amountMinor: number;
  currency: string;
  /** Amount converted into the trip currency with a user-provided rate (equals amountMinor when same currency). */
  tripAmountMinor: number;
  rateToTrip: number;
  category: BudgetCategory;
  date: LocalDate;
  description: string;
  city: string;
  paymentMethod: string;
  notes: string;
  paidByParticipantId: Id | null;
  splitMode: SplitMode;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface ExpenseShare {
  expenseId: Id;
  participantId: Id;
  /** Share in the expense's own currency, minor units. Shares sum to the expense amount. */
  shareMinor: number;
}

export interface PackingList {
  id: Id;
  tripId: Id | null;
  name: string;
  isTemplate: boolean;
  templateKey: string | null;
  createdAt: Instant;
}

export interface PackingItem {
  id: Id;
  listId: Id;
  name: string;
  category: PackingCategory;
  quantity: number;
  notes: string;
  priority: Priority;
  packed: boolean;
  position: number;
}

export interface Checklist {
  id: Id;
  tripId: Id;
  name: string;
  createdAt: Instant;
}

export interface ChecklistItem {
  id: Id;
  checklistId: Id;
  title: string;
  notes: string;
  dueDate: LocalDate | null;
  priority: Priority;
  status: TaskStatus;
  reminderAt: Instant | null;
  notificationId: string | null;
  position: number;
}

export interface JournalEntry {
  id: Id;
  tripId: Id;
  date: LocalDate;
  city: string;
  title: string;
  body: string;
  notes: string;
  photoUris: string[];
  createdAt: Instant;
  updatedAt: Instant;
}

export interface CurrencyRate {
  id: Id;
  tripId: Id | null;
  base: string;
  quote: string;
  /** 1 base = rate quote. */
  rate: number;
  rateDate: LocalDate;
  source: RateSource;
  capturedAt: Instant;
}

export interface CurrencyConversion {
  id: Id;
  base: string;
  quote: string;
  amountMinor: number;
  resultMinor: number;
  rate: number;
  rateDate: LocalDate;
  source: RateSource;
  createdAt: Instant;
}

export interface WeatherNote {
  id: Id;
  tripId: Id;
  destinationId: Id | null;
  conditions: WeatherCondition[];
  minTempC: number | null;
  maxTempC: number | null;
  notes: string;
  updatedAt: Instant;
}
