/**
 * PlantCare domain model. Dates that represent a calendar day are stored as local
 * day keys ("YYYY-MM-DD") so that a watering planned for "Tuesday" stays on Tuesday
 * when the user travels across time zones. Timestamps (createdAt) are ISO strings.
 */
import type { DayKey } from '@factory/app-core';

export type { DayKey };

export const PLANT_CATEGORIES = [
  'indoor',
  'outdoor',
  'succulent',
  'cactus',
  'flower',
  'herb',
  'vegetable',
  'tree',
  'tropical',
  'other',
] as const;
export type PlantCategory = (typeof PLANT_CATEGORIES)[number];

export const LOCATION_TYPES = [
  'living_room',
  'balcony',
  'terrace',
  'garden',
  'greenhouse',
  'office',
  'kitchen',
  'bedroom',
  'custom',
] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const TASK_TYPES = [
  'watering',
  'fertilizing',
  'pruning',
  'repotting',
  'leaf_cleaning',
  'pest_check',
  'rotation',
  'seasonal',
  'health_check',
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const PRIORITIES = ['low', 'normal', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Plant {
  id: string;
  nickname: string;
  commonName: string;
  /** Kept verbatim in every language. */
  scientificName: string | null;
  speciesId: string | null;
  category: PlantCategory;
  /** Relative path inside the app's private photo folder (never an absolute URI). */
  photoPath: string | null;
  acquiredOn: DayKey | null;
  plantedOn: DayKey | null;
  locationId: string | null;
  description: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GardenLocation {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  photoPath: string | null;
  createdAt: string;
}

export interface CareTask {
  id: string;
  plantId: string;
  type: TaskType;
  /** Next planned day; null once a one-off task is completed. */
  nextDue: DayKey | null;
  /** Repeat every N days; null = one-off task. */
  intervalDays: number | null;
  priority: Priority;
  notes: string;
  /** Optional indicative amount for watering, in millilitres (displayed in the user's unit). */
  amountMl: number | null;
  remindersEnabled: boolean;
  active: boolean;
  createdAt: string;
}

export type HistoryAction = 'done' | 'skipped' | 'postponed';

export interface CareHistoryEntry {
  id: string;
  taskId: string | null;
  plantId: string;
  type: TaskType;
  action: HistoryAction;
  date: DayKey;
  notes: string;
  createdAt: string;
}

export interface WateringRecord {
  id: string;
  plantId: string;
  date: DayKey;
  amountMl: number | null;
  notes: string;
  createdAt: string;
}

export const PLANT_CONDITIONS = ['thriving', 'good', 'fair', 'poor'] as const;
export type PlantCondition = (typeof PLANT_CONDITIONS)[number];

export interface GrowthRecord {
  id: string;
  plantId: string;
  date: DayKey;
  /** Measured by the user (never estimated from a photo). */
  heightCm: number | null;
  leafCount: number | null;
  condition: PlantCondition;
  photoPath: string | null;
  notes: string;
  createdAt: string;
}

export const JOURNAL_KINDS = ['observation', 'change', 'new_leaf', 'flowering', 'repotting', 'problem', 'treatment', 'comment'] as const;
export type JournalKind = (typeof JOURNAL_KINDS)[number];

export interface JournalEntry {
  id: string;
  plantId: string;
  date: DayKey;
  kind: JournalKind;
  title: string;
  body: string;
  photoPath: string | null;
  createdAt: string;
}

export const HEALTH_CATEGORIES = ['yellow_leaves', 'brown_leaves', 'wilting', 'root_problems', 'pests', 'fungal', 'growth', 'other'] as const;
export type HealthCategory = (typeof HEALTH_CATEGORIES)[number];

export const HEALTH_STATUSES = ['open', 'improving', 'resolved'] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export interface HealthAction {
  date: DayKey;
  text: string;
}

export interface HealthRecord {
  id: string;
  plantId: string;
  category: HealthCategory;
  description: string;
  observedOn: DayKey;
  status: HealthStatus;
  actions: HealthAction[];
  photoPaths: string[];
  notes: string;
  resolvedOn: DayKey | null;
  createdAt: string;
}

export const FERTILIZER_TYPES = ['liquid', 'granular', 'slow_release', 'organic', 'foliar', 'other'] as const;
export type FertilizerType = (typeof FERTILIZER_TYPES)[number];

export interface FertilizerRecord {
  id: string;
  plantId: string;
  fertilizerType: FertilizerType;
  brand: string;
  /** Free text such as "NPK 3-1-2". Optional. */
  composition: string;
  appliedOn: DayKey;
  /** Free text as applied by the user, following the manufacturer's label. */
  quantity: string;
  notes: string;
  createdAt: string;
}

export const SUBSTRATES = ['universal', 'cactus_mix', 'orchid_bark', 'peat_free', 'aroid_mix', 'ericaceous', 'loam', 'semi_hydro', 'other'] as const;
export type Substrate = (typeof SUBSTRATES)[number];

export interface SoilRecord {
  id: string;
  plantId: string;
  substrate: Substrate;
  potSizeCm: number | null;
  repottedOn: DayKey;
  notes: string;
  createdAt: string;
}

export const WISHLIST_STATUSES = ['wishlist', 'purchased', 'cancelled'] as const;
export type WishlistStatus = (typeof WISHLIST_STATUSES)[number];

export interface WishlistItem {
  id: string;
  name: string;
  speciesId: string | null;
  photoPath: string | null;
  description: string;
  estimatedPrice: number | null;
  store: string;
  priority: Priority;
  notes: string;
  status: WishlistStatus;
  createdAt: string;
}

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

export interface SeasonalTask {
  id: string;
  season: Season;
  /** Built-in checklist item key (translated), or null for a user-written item. */
  builtInKey: string | null;
  title: string;
  sort: number;
}

export interface SeasonalCompletion {
  id: string;
  taskId: string;
  /** e.g. "2026-spring" — the season instance the item was ticked for. */
  seasonKey: string;
  completedOn: DayKey;
}

export interface NotificationSetting {
  /** null = global default for the task type. */
  plantId: string | null;
  taskType: TaskType;
  enabled: boolean;
}
