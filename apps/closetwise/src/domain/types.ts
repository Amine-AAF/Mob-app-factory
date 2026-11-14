import type {
  CareLogKind,
  CareStatus,
  Condition,
  DryingMethod,
  IroningLevel,
  PackingSection,
  SizeSystem,
  Slot,
  TripTemplate,
  WashMethod,
  WishlistStatus,
} from './catalog';

/** Local calendar day, "YYYY-MM-DD" (see @factory/app-core toDayKey). */
export type DayKey = string;

/** A style or occasion: built-in (key, translated) or user-created (name). */
export interface Tag {
  id: string;
  key: string | null;
  name: string | null;
  builtin: boolean;
  archived: boolean;
}

export interface Category {
  id: string;
  key: string;
  sort: number;
}

export interface WardrobeItem {
  id: string;
  name: string;
  categoryId: string;
  subcategory: string | null;
  primaryColor: string | null;
  secondaryColors: string[];
  brandId: string | null;
  brandName: string | null;
  size: string | null;
  sizeSystem: SizeSystem | null;
  seasons: number;
  styleId: string | null;
  occasionIds: string[];
  purchaseDate: DayKey | null;
  purchasePrice: number | null;
  currency: string | null;
  condition: Condition | null;
  notes: string | null;
  photoPath: string | null;
  thumbPath: string | null;
  favorite: boolean;
  archived: boolean;
  careStatus: CareStatus;
  createdAt: string;
  updatedAt: string;
  /** Derived from outfit_usage_history (distinct days worn). */
  wearCount: number;
  lastWornOn: DayKey | null;
}

export type WardrobeItemInput = Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'wearCount' | 'lastWornOn' | 'brandId' | 'brandName'> & {
  brandName: string | null;
};

export interface OutfitItemRef {
  itemId: string;
  slot: Slot;
  position: number;
}

export interface Outfit {
  id: string;
  name: string;
  styleId: string | null;
  occasionId: string | null;
  seasons: number;
  notes: string | null;
  favorite: boolean;
  source: 'manual' | 'suggestion';
  items: OutfitItemRef[];
  createdAt: string;
  updatedAt: string;
  wearCount: number;
  lastWornOn: DayKey | null;
}

export type OutfitInput = Pick<Outfit, 'name' | 'styleId' | 'occasionId' | 'seasons' | 'notes' | 'favorite' | 'source' | 'items'>;

export interface OutfitSchedule {
  id: string;
  date: DayKey;
  outfitId: string | null;
  occasionId: string | null;
  notes: string | null;
  remind: boolean;
  /** Set once "Mark as worn" logged the usage for this plan. */
  wornLogged: boolean;
  createdAt: string;
}

export interface UsageEntry {
  id: string;
  itemId: string;
  outfitId: string | null;
  wornOn: DayKey;
}

export interface ShoppingRecord {
  id: string;
  itemName: string;
  itemId: string | null;
  brand: string | null;
  categoryId: string | null;
  purchasedOn: DayKey;
  price: number;
  currency: string;
  store: string | null;
  size: string | null;
  notes: string | null;
  receiptPath: string | null;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  photoPath: string | null;
  thumbPath: string | null;
  brand: string | null;
  categoryId: string | null;
  estimatedPrice: number | null;
  currency: string | null;
  url: string | null;
  store: string | null;
  /** 1 = high, 2 = medium, 3 = low. */
  priority: 1 | 2 | 3;
  notes: string | null;
  status: WishlistStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  destination: string;
  departureDate: DayKey;
  returnDate: DayKey;
  template: TripTemplate | null;
  notes: string | null;
  /** Reminder N days before departure (null = off). */
  reminderDays: number | null;
  createdAt: string;
}

export interface PackingEntry {
  id: string;
  tripId: string;
  kind: 'item' | 'outfit' | 'custom';
  itemId: string | null;
  outfitId: string | null;
  label: string | null;
  section: PackingSection;
  packed: boolean;
  position: number;
}

export interface CareInstructions {
  itemId: string;
  washMethod: WashMethod | null;
  washTemperature: number | null;
  drying: DryingMethod | null;
  ironing: IroningLevel | null;
  bleach: boolean | null;
  notes: string | null;
  updatedAt: string;
}

export interface CareLogEntry {
  id: string;
  itemId: string;
  kind: CareLogKind;
  recordedOn: DayKey;
  notes: string | null;
}

export const GOAL_KINDS = [
  'wear_forgotten',
  'reduce_impulse',
  'create_outfits',
  'monthly_budget',
  'organize',
  'capsule',
  'challenge_7x7',
  'challenge_no_shopping',
  'challenge_30_looks',
  'challenge_capsule',
] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];

export interface WardrobeGoal {
  id: string;
  kind: GoalKind;
  title: string | null;
  target: number;
  startDate: DayKey;
  endDate: DayKey | null;
  status: 'active' | 'completed' | 'stopped';
  /** Kind-specific payload, e.g. capsule item ids. */
  payload: { itemIds?: string[] };
  createdAt: string;
}

export const NOTIFICATION_KINDS = ['planned_outfit', 'trip_prep', 'budget', 'checklist', 'goals'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationSetting {
  kind: NotificationKind;
  enabled: boolean;
  hour: number;
  minute: number;
  /** Days before the event (trip prep / checklist) or threshold % (budget). */
  param: number;
}
