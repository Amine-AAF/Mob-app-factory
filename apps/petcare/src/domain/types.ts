/**
 * PetCare domain types. Pure data: no SDK imports.
 *
 * Date conventions (see docs/ARCHITECTURE.md § Dates):
 * - `DayKey` ('YYYY-MM-DD') is a calendar day in the user's local time zone. Used for
 *   birthdays, vaccinations, treatments, weights, expenses… It never shifts when the
 *   phone changes time zone.
 * - `Instant` is a full ISO-8601 UTC timestamp ('2026-05-01T08:30:00.000Z'), used when
 *   a precise moment matters (appointments, activities, document import time).
 * - Weights are stored in kilograms, amounts in the currency's main unit (REAL, 2 decimals).
 */
export type DayKey = string;
export type Instant = string;
export type Id = string;

export const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile', 'other'] as const;
export type Species = (typeof SPECIES)[number];

export const SEXES = ['male', 'female', 'unknown'] as const;
export type Sex = (typeof SEXES)[number];

export interface Pet {
  id: Id;
  name: string;
  species: Species;
  breed: string | null;
  sex: Sex | null;
  birthDate: DayKey | null;
  /** True when birthDate is an estimate derived from an approximate age. */
  birthEstimated: boolean;
  weightKg: number | null;
  color: string | null;
  identification: string | null;
  adoptionDate: DayKey | null;
  notes: string | null;
  /** File name inside the app's private photos directory (never an absolute path). */
  photo: string | null;
  walkGoalMinutes: number | null;
  archived: boolean;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface HealthRecord {
  id: Id;
  petId: Id;
  date: DayKey;
  reason: string;
  vetName: string | null;
  clinic: string | null;
  /** Diagnosis as written by the user / vet. The app never produces one. */
  diagnosis: string | null;
  exams: string | null;
  results: string | null;
  notes: string | null;
  cost: number | null;
  currency: string | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface Vaccination {
  id: Id;
  petId: Id;
  name: string;
  administeredDate: DayKey | null;
  /** Set or confirmed by the vet. PetCare never imposes a vaccination schedule. */
  nextDueDate: DayKey | null;
  vetName: string | null;
  notes: string | null;
  reminderDaysBefore: number;
  createdAt: Instant;
  updatedAt: Instant;
}

export type VaccinationStatus = 'done' | 'upcoming' | 'overdue';

export const TREATMENT_FREQUENCIES = ['once_daily', 'twice_daily', 'three_times_daily', 'every_other_day', 'weekly', 'monthly', 'as_needed', 'once'] as const;
export type TreatmentFrequency = (typeof TREATMENT_FREQUENCIES)[number];

export interface Treatment {
  id: Id;
  petId: Id;
  name: string;
  /** Instructions exactly as given by the vet. The app never suggests or changes a dosage. */
  instructions: string | null;
  startDate: DayKey;
  endDate: DayKey | null;
  frequency: TreatmentFrequency;
  /** Local reminder times, 'HH:MM'. */
  reminderTimes: string[];
  remindersEnabled: boolean;
  prescriber: string | null;
  notes: string | null;
  stoppedAt: DayKey | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export type TreatmentStatus = 'scheduled' | 'active' | 'ending_soon' | 'completed' | 'stopped';

export interface TreatmentLog {
  id: Id;
  treatmentId: Id;
  givenAt: Instant;
  note: string | null;
}

export interface WeightRecord {
  id: Id;
  petId: Id;
  date: DayKey;
  weightKg: number;
  heightCm: number | null;
  notes: string | null;
  createdAt: Instant;
}

export const FOOD_TYPES = ['dry', 'wet', 'raw', 'homemade', 'treats', 'seeds', 'pellets', 'hay', 'live', 'other'] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

export interface FeedingSchedule {
  id: Id;
  petId: Id;
  foodType: FoodType;
  brand: string | null;
  product: string | null;
  /** Free text quantity typed by the user ("80 g", "1/2 cup"). Never computed by the app. */
  quantity: string | null;
  mealTimes: string[];
  remindersEnabled: boolean;
  active: boolean;
  notes: string | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface FeedingLog {
  id: Id;
  petId: Id;
  scheduleId: Id | null;
  fedAt: Instant;
  notes: string | null;
}

export const STOCK_UNITS = ['kg', 'g', 'lb', 'can', 'pouch', 'bag', 'unit'] as const;
export type StockUnit = (typeof STOCK_UNITS)[number];

export interface FoodItem {
  id: Id;
  petId: Id | null;
  name: string;
  brand: string | null;
  quantity: number;
  unit: StockUnit;
  lowThreshold: number | null;
  /** Typed by the user, used to estimate days left. */
  dailyUsage: number | null;
  restockAlert: boolean;
  notes: string | null;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface FoodPurchase {
  id: Id;
  foodId: Id;
  date: DayKey;
  quantity: number;
  cost: number | null;
  currency: string | null;
  expenseId: Id | null;
}

export const APPOINTMENT_TYPES = ['vet', 'grooming', 'training', 'boarding', 'other'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Appointment {
  id: Id;
  petId: Id;
  type: AppointmentType;
  startsAt: Instant;
  title: string | null;
  address: string | null;
  provider: string | null;
  phone: string | null;
  notes: string | null;
  estimatedCost: number | null;
  currency: string | null;
  status: AppointmentStatus;
  remindMinutesBefore: number;
  createdAt: Instant;
  updatedAt: Instant;
}

export const DOCUMENT_CATEGORIES = ['vaccination_card', 'prescription', 'invoice', 'lab_result', 'certificate', 'identification', 'insurance', 'other'] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface PetDocument {
  id: Id;
  petId: Id;
  category: DocumentCategory;
  title: string;
  /** File name inside the private documents directory. The file itself is never in SQLite. */
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  healthRecordId: Id | null;
  vaccinationId: Id | null;
  notes: string | null;
  createdAt: Instant;
}

export const ACTIVITY_TYPES = ['walk', 'play', 'grooming', 'brushing', 'cleaning', 'training', 'other'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Activity {
  id: Id;
  petId: Id;
  type: ActivityType;
  date: Instant;
  durationMinutes: number | null;
  /** Typed by the user. PetCare never records GPS. */
  distanceKm: number | null;
  notes: string | null;
  createdAt: Instant;
}

export const EXPENSE_CATEGORIES = ['food', 'vet', 'medication', 'vaccination', 'grooming', 'accessories', 'insurance', 'boarding', 'other'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: Id;
  petId: Id | null;
  date: DayKey;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  notes: string | null;
  receiptDocumentId: Id | null;
  createdAt: Instant;
}

export interface Checklist {
  id: Id;
  petId: Id | null;
  templateId: string | null;
  title: string;
  createdAt: Instant;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: Id;
  checklistId: Id;
  position: number;
  label: string;
  done: boolean;
}

export const NOTIFICATION_CATEGORIES = ['vaccinations', 'treatments', 'appointments', 'meals', 'walks', 'grooming', 'restock', 'weighIn'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface NotificationSetting {
  category: NotificationCategory;
  enabled: boolean;
  /** Daily time used by date-only reminders (vaccinations, restock, walks, grooming…). */
  hour: number;
  minute: number;
  /** Category-specific: weekday for grooming (1 = Monday … 7 = Sunday). */
  weekday: number | null;
}
