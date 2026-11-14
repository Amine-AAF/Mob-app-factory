import type { DayKey } from './dates';
import type { Frequency, IntervalUnit } from './recurrence';

/* Enumerations — values are stored in SQLite and used as i18n keys. Never rename a shipped value. */

export const HOME_TYPES = ['apartment', 'house', 'villa', 'studio', 'other'] as const;
export type HomeType = (typeof HOME_TYPES)[number];

export const ROOM_KINDS = ['living', 'kitchen', 'bedroom', 'bathroom', 'garage', 'garden', 'office', 'other'] as const;
export type RoomKind = (typeof ROOM_KINDS)[number];

export const ASSET_CATEGORIES = [
  'refrigerator', 'washer', 'dishwasher', 'oven', 'air_conditioner', 'heating', 'boiler', 'water_heater',
  'tv', 'electronics', 'furniture', 'garden', 'plumbing', 'electrical', 'safety', 'vehicle', 'other',
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const ASSET_STATUSES = ['active', 'in_repair', 'replaced', 'out_of_service'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const MAINTENANCE_CATEGORIES = ['hvac', 'plumbing', 'electrical', 'appliances', 'safety', 'exterior', 'garden', 'cleaning', 'interior', 'other'] as const;
export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

export const DOCUMENT_TYPES = ['invoice', 'warranty', 'contract', 'manual', 'certificate', 'insurance', 'property', 'maintenance', 'other'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const EXPENSE_CATEGORIES = ['electricity', 'water', 'gas', 'internet', 'maintenance', 'repairs', 'cleaning', 'furniture', 'appliances', 'insurance', 'other'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ['card', 'cash', 'transfer', 'direct_debit', 'check', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'semiannual', 'annual'] as const;
export type ExpenseFrequency = (typeof EXPENSE_FREQUENCIES)[number];

export const REPAIR_STATUSES = ['reported', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const HOUSEHOLD_CATEGORIES = ['cleaning', 'laundry', 'trash', 'groceries', 'plants', 'tidying', 'stock', 'preparation', 'other'] as const;
export type HouseholdCategory = (typeof HOUSEHOLD_CATEGORIES)[number];

export const HOUSEHOLD_RECURRENCES = ['once', 'daily', 'weekly', 'monthly', 'custom'] as const;
export type HouseholdRecurrence = (typeof HOUSEHOLD_RECURRENCES)[number];

export const INVENTORY_CATEGORIES = ['electronics', 'furniture', 'kitchen', 'decoration', 'tools', 'sports', 'garden', 'other'] as const;
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const NOTIFICATION_CATEGORIES = ['maintenance', 'warranty', 'document', 'recurring_expense', 'repair', 'household'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const MEMBER_COLORS = ['#0F766E', '#B45309', '#7C3AED', '#BE185D', '#1D4ED8', '#15803D'] as const;

/* Entities (camelCase mirror of the SQLite rows) */

export interface Home {
  id: string;
  name: string;
  type: HomeType;
  areaM2: number | null;
  roomsCount: number | null;
  address: string | null;
  moveInDate: DayKey | null;
  description: string | null;
  currency: string;
  monthlyBudgetMinor: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  homeId: string;
  name: string;
  kind: RoomKind;
  position: number;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  homeId: string;
  roomId: string | null;
  name: string;
  category: AssetCategory;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: DayKey | null;
  purchasePriceMinor: number | null;
  currency: string | null;
  vendor: string | null;
  warrantyEnd: DayKey | null;
  status: AssetStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetEvent {
  id: string;
  assetId: string;
  kind: 'created' | 'status' | 'updated';
  detail: string | null;
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  homeId: string;
  assetId: string | null;
  roomId: string | null;
  templateId: string | null;
  title: string;
  description: string | null;
  category: MaintenanceCategory;
  frequency: Frequency;
  intervalValue: number | null;
  intervalUnit: IntervalUnit | null;
  lastDone: DayKey | null;
  nextDue: DayKey | null;
  estimatedMinutes: number | null;
  priority: Priority;
  estimatedCostMinor: number | null;
  currency: string | null;
  notes: string | null;
  reminderEnabled: boolean;
  reminderDaysBefore: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceHistoryEntry {
  id: string;
  taskId: string;
  homeId: string;
  assetId: string | null;
  action: 'completed' | 'postponed' | 'skipped';
  doneOn: DayKey;
  previousDue: DayKey | null;
  newDue: DayKey | null;
  costMinor: number | null;
  currency: string | null;
  durationMinutes: number | null;
  notes: string | null;
  createdAt: string;
  /** Joined for display. */
  taskTitle?: string;
}

export interface HomeDocument {
  id: string;
  homeId: string;
  assetId: string | null;
  roomId: string | null;
  title: string;
  type: DocumentType;
  filePath: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  issueDate: DayKey | null;
  expiryDate: DayKey | null;
  reminderDaysBefore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  homeId: string;
  category: ExpenseCategory;
  title: string | null;
  amountMinor: number;
  currency: string;
  spentOn: DayKey;
  paymentMethod: PaymentMethod | null;
  assetId: string | null;
  roomId: string | null;
  documentId: string | null;
  recurringId: string | null;
  occurrenceDate: DayKey | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  homeId: string;
  title: string;
  category: ExpenseCategory;
  amountMinor: number;
  currency: string;
  frequency: ExpenseFrequency;
  startDate: DayKey;
  nextDate: DayKey;
  endDate: DayKey | null;
  paymentMethod: PaymentMethod | null;
  autoRecord: boolean;
  reminderEnabled: boolean;
  active: boolean;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Repair {
  id: string;
  homeId: string;
  assetId: string | null;
  title: string;
  problem: string | null;
  status: RepairStatus;
  reportedOn: DayKey;
  scheduledOn: DayKey | null;
  completedOn: DayKey | null;
  provider: string | null;
  providerContact: string | null;
  costMinor: number | null;
  currency: string | null;
  underWarranty: boolean;
  outcome: string | null;
  documentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  homeId: string;
  name: string;
  color: string;
  createdAt?: string;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  label: string;
  done: boolean;
  position: number;
}

export interface HouseholdTask {
  id: string;
  homeId: string;
  roomId: string | null;
  assigneeId: string | null;
  title: string;
  description: string | null;
  category: HouseholdCategory;
  priority: Priority;
  dueDate: DayKey | null;
  recurrence: HouseholdRecurrence;
  intervalValue: number | null;
  intervalUnit: IntervalUnit | null;
  completedAt: string | null;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  checklist?: ChecklistItem[];
}

export interface InventoryItem {
  id: string;
  homeId: string;
  roomId: string | null;
  name: string;
  category: InventoryCategory;
  quantity: number;
  estimatedValueMinor: number | null;
  currency: string | null;
  purchaseDate: DayKey | null;
  documentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PhotoOwner = 'home' | 'room' | 'asset' | 'repair' | 'inventory';

export interface Photo {
  id: string;
  ownerType: PhotoOwner;
  ownerId: string;
  kind: 'photo' | 'before' | 'after';
  filePath: string;
  createdAt: string;
}

export interface NotificationSetting {
  category: NotificationCategory;
  enabled: boolean;
  daysBefore: number;
  hour: number;
  minute: number;
}
