/**
 * Closed vocabularies used by the data model. Stored as these exact strings in SQLite;
 * labels are translated through i18n (`enums.<group>.<value>`), never stored.
 */
export const TRIP_TYPES = ['solo', 'couple', 'family', 'friends', 'business', 'adventure', 'road_trip', 'weekend', 'multi_city'] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const TRIP_STATUSES = ['planning', 'upcoming', 'ongoing', 'completed', 'archived'] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const ACTIVITY_CATEGORIES = [
  'sightseeing',
  'restaurant',
  'shopping',
  'museum',
  'beach',
  'nature',
  'transport',
  'accommodation',
  'entertainment',
  'other',
] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const ACTIVITY_STATUSES = ['planned', 'completed', 'skipped'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const BOOKING_TYPES = ['flight', 'hotel', 'train', 'bus', 'car_rental', 'restaurant', 'activity', 'ferry', 'other'] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

/** User-declared status: TravelWise never verifies a booking with a provider. */
export const BOOKING_STATUSES = ['confirmed', 'pending', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const DOCUMENT_TYPES = ['passport', 'visa', 'flight_ticket', 'hotel_confirmation', 'insurance', 'train_ticket', 'car_rental', 'other'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const BUDGET_CATEGORIES = ['transport', 'accommodation', 'food', 'activities', 'shopping', 'misc'] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const SPLIT_MODES = ['none', 'equal', 'custom'] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

export const PACKING_CATEGORIES = ['documents', 'clothing', 'toiletries', 'electronics', 'medication', 'accessories', 'essentials', 'custom'] as const;
export type PackingCategory = (typeof PACKING_CATEGORIES)[number];

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PLACE_CATEGORIES = ['restaurant', 'hotel', 'attraction', 'museum', 'beach', 'poi', 'personal', 'other'] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const WEATHER_CONDITIONS = ['sunny', 'hot', 'mild', 'cold', 'snow', 'rain', 'wind', 'humid'] as const;
export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

/** Rate provenance. Only 'manual' exists in the MVP; other values are reserved for a future provider. */
export const RATE_SOURCES = ['manual'] as const;
export type RateSource = (typeof RATE_SOURCES)[number] | (string & {});
