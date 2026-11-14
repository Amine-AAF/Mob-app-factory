/**
 * AutoCare domain model.
 *
 * Storage conventions (see docs/data-model.md):
 * - Distances are stored in kilometres, liquid volumes in litres, energy in kWh.
 *   Conversion to the user's units happens only at the UI edge (features/units).
 * - Money is stored as integer minor units ("cents") + an ISO 4217 currency code.
 *   Amounts in different currencies are NEVER summed together (features/money).
 * - Dates are local calendar days "YYYY-MM-DD"; timestamps are ISO strings.
 */
export type DayKey = string;
export type CurrencyCode = string;

export const VEHICLE_TYPES = ['car', 'suv', 'van', 'pickup', 'motorcycle', 'truck', 'other'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const FUEL_TYPES = ['gasoline', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg', 'cng', 'other'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const TRANSMISSIONS = ['manual', 'automatic', 'cvt', 'dual_clutch', 'other'] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  trim: string | null;
  year: number | null;
  vehicleType: VehicleType;
  engine: string | null;
  fuelType: FuelType;
  transmission: Transmission | null;
  powerHp: number | null;
  plate: string | null;
  vin: string | null;
  purchaseDate: DayKey | null;
  purchaseOdometerKm: number | null;
  odometerKm: number;
  purchasePriceMinor: number | null;
  currency: CurrencyCode;
  /** File name inside the app's private photos directory (never an external URI). */
  photoFile: string | null;
  color: string;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OdometerSource = 'manual' | 'fuel' | 'maintenance' | 'expense' | 'purchase';
export interface OdometerReading {
  id: string;
  vehicleId: string;
  day: DayKey;
  odometerKm: number;
  source: OdometerSource;
  refId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const MAINTENANCE_TYPES = [
  'oil_change',
  'oil_filter',
  'air_filter',
  'fuel_filter',
  'cabin_filter',
  'brake_pads',
  'brake_discs',
  'tires',
  'battery',
  'coolant',
  'brake_fluid',
  'air_conditioning',
  'timing_belt',
  'spark_plugs',
  'shock_absorbers',
  'service',
  'repair',
  'other',
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  title: string | null;
  day: DayKey;
  odometerKm: number | null;
  description: string | null;
  provider: string | null;
  costMinor: number | null;
  currency: CurrencyCode;
  parts: string | null;
  notes: string | null;
  scheduleId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A user-defined recurring maintenance item. Intervals are never imposed by the app. */
export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  title: string | null;
  intervalKm: number | null;
  intervalMonths: number | null;
  lastDay: DayKey | null;
  lastOdometerKm: number | null;
  remindDaysBefore: number;
  remindKmBefore: number;
  enabled: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuantityUnit = 'L' | 'kWh';
export interface FuelRecord {
  id: string;
  vehicleId: string;
  day: DayKey;
  /** Null when the odometer was not noted: the fill counts in spend, never in consumption. */
  odometerKm: number | null;
  /** Litres for liquid fuels, kWh for charging. */
  quantity: number;
  quantityUnit: QuantityUnit;
  unitPrice: number | null;
  totalMinor: number;
  currency: CurrencyCode;
  fuelType: FuelType;
  station: string | null;
  isFull: boolean;
  /** The user skipped recording one or more fills before this one: breaks the consumption chain. */
  missedPrevious: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const EXPENSE_CATEGORIES = [
  'fuel',
  'maintenance',
  'repair',
  'insurance',
  'inspection',
  'parking',
  'tolls',
  'washing',
  'tires',
  'accessories',
  'taxes',
  'financing',
  'fines',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const RECURRENCES = ['none', 'monthly', 'quarterly', 'semiannual', 'yearly'] as const;
export type Recurrence = (typeof RECURRENCES)[number];

export interface Expense {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  day: DayKey;
  amountMinor: number;
  currency: CurrencyCode;
  vendor: string | null;
  odometerKm: number | null;
  notes: string | null;
  recurrence: Recurrence;
  /** For generated occurrences of a recurring expense. */
  recurringParentId: string | null;
  insuranceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_FREQUENCIES = ['monthly', 'quarterly', 'semiannual', 'annual', 'single'] as const;
export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  insurer: string;
  policyNumber: string | null;
  startDay: DayKey;
  endDay: DayKey;
  premiumMinor: number | null;
  currency: CurrencyCode;
  paymentFrequency: PaymentFrequency;
  coverage: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  remindDaysBefore: number;
  renewedFromId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DOCUMENT_CATEGORIES = [
  'registration',
  'insurance_certificate',
  'insurance_contract',
  'inspection',
  'invoice',
  'service_book',
  'purchase',
  'warranty',
  'photo',
  'other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface VehicleDocument {
  id: string;
  vehicleId: string | null;
  category: DocumentCategory;
  title: string;
  /** File name inside the app's private documents directory. */
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  expiryDay: DayKey | null;
  notes: string | null;
  maintenanceId: string | null;
  expenseId: string | null;
  insuranceId: string | null;
  deadlineId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DEADLINE_TYPES = ['inspection', 'insurance', 'annual_tax', 'registration', 'emissions', 'warranty', 'financing', 'parking_permit', 'other'] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export interface AdminDeadline {
  id: string;
  vehicleId: string;
  type: DeadlineType;
  title: string | null;
  dueDay: DayKey;
  amountMinor: number | null;
  currency: CurrencyCode;
  /** Lead times in days, e.g. [30, 7, 1]. Configurable per deadline. */
  remindDaysBefore: number[];
  /** Repeats every N months once completed (user-defined, depends on the country). Null = one-off. */
  repeatMonths: number | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const TIRE_SEASONS = ['summer', 'winter', 'all_season'] as const;
export type TireSeason = (typeof TIRE_SEASONS)[number];
export const TIRE_POSITIONS = ['all', 'front', 'rear', 'front_left', 'front_right', 'rear_left', 'rear_right', 'spare'] as const;
export type TirePosition = (typeof TIRE_POSITIONS)[number];
export const TIRE_STATUSES = ['mounted', 'stored', 'retired'] as const;
export type TireStatus = (typeof TIRE_STATUSES)[number];

export interface TireRecord {
  id: string;
  vehicleId: string;
  brand: string;
  model: string | null;
  size: string | null;
  season: TireSeason;
  position: TirePosition;
  installedDay: DayKey;
  installedOdometerKm: number | null;
  removedDay: DayKey | null;
  removedOdometerKm: number | null;
  priceMinor: number | null;
  currency: CurrencyCode;
  status: TireStatus;
  /** Optional user reminders (e.g. seasonal swap date, check after N km). */
  reminderDay: DayKey | null;
  reminderKm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleNote {
  id: string;
  vehicleId: string;
  title: string;
  body: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const NOTIFICATION_CATEGORIES = ['maintenance', 'insurance', 'deadlines', 'tires', 'documents', 'odometer'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface NotificationSetting {
  category: NotificationCategory;
  enabled: boolean;
  hour: number;
  minute: number;
}

export type InspectionResult = 'ok' | 'attention' | 'na';
export interface Inspection {
  id: string;
  vehicleId: string;
  templateId: string;
  day: DayKey;
  odometerKm: number | null;
  results: Record<string, InspectionResult>;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  /** Null = all vehicles. */
  vehicleId: string | null;
  monthlyMinor: number;
  currency: CurrencyCode;
}

/** Units are independent of the interface language. */
export type DistanceUnit = 'km' | 'mi';
export type VolumeUnit = 'L' | 'gal_us' | 'gal_uk';
export type ConsumptionFormat = 'l_per_100km' | 'km_per_l' | 'mpg_us' | 'mpg_uk';
export type EnergyConsumptionFormat = 'kwh_per_100km' | 'kwh_per_100mi' | 'km_per_kwh' | 'mi_per_kwh';
export interface UnitPreferences {
  distance: DistanceUnit;
  volume: VolumeUnit;
  consumption: ConsumptionFormat;
  energyConsumption: EnergyConsumptionFormat;
}
