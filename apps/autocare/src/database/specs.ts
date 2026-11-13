import type {
  AdminDeadline,
  Expense,
  FuelRecord,
  Inspection,
  InsurancePolicy,
  MaintenanceRecord,
  MaintenanceSchedule,
  OdometerReading,
  TireRecord,
  Vehicle,
  VehicleDocument,
  VehicleNote,
} from '@/types';

import type { TableSpec } from './table';

/** Column mapping for every user table (see migrations.ts for the SQL). */
export const vehicleSpec: TableSpec<Vehicle> = {
  id: ['id', 'text'], name: ['name', 'text'], make: ['make', 'text'], model: ['model', 'text'], trim: ['trim', 'text'], year: ['year', 'num'],
  vehicleType: ['vehicle_type', 'text'], engine: ['engine', 'text'], fuelType: ['fuel_type', 'text'], transmission: ['transmission', 'text'],
  powerHp: ['power_hp', 'num'], plate: ['plate', 'text'], vin: ['vin', 'text'], purchaseDate: ['purchase_date', 'text'],
  purchaseOdometerKm: ['purchase_odometer_km', 'num'], odometerKm: ['odometer_km', 'num'], purchasePriceMinor: ['purchase_price_minor', 'num'],
  currency: ['currency', 'text'], photoFile: ['photo_file', 'text'], color: ['color', 'text'], notes: ['notes', 'text'], archived: ['archived', 'bool'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const odometerSpec: TableSpec<OdometerReading> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], day: ['day', 'text'], odometerKm: ['odometer_km', 'num'], source: ['source', 'text'],
  refId: ['ref_id', 'text'], createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const scheduleSpec: TableSpec<MaintenanceSchedule> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], type: ['type', 'text'], title: ['title', 'text'], intervalKm: ['interval_km', 'num'],
  intervalMonths: ['interval_months', 'num'], lastDay: ['last_day', 'text'], lastOdometerKm: ['last_odometer_km', 'num'],
  remindDaysBefore: ['remind_days_before', 'num'], remindKmBefore: ['remind_km_before', 'num'], enabled: ['enabled', 'bool'], notes: ['notes', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const maintenanceSpec: TableSpec<MaintenanceRecord> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], type: ['type', 'text'], title: ['title', 'text'], day: ['day', 'text'],
  odometerKm: ['odometer_km', 'num'], description: ['description', 'text'], provider: ['provider', 'text'], costMinor: ['cost_minor', 'num'],
  currency: ['currency', 'text'], parts: ['parts', 'text'], notes: ['notes', 'text'], scheduleId: ['schedule_id', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const fuelSpec: TableSpec<FuelRecord> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], day: ['day', 'text'], odometerKm: ['odometer_km', 'num'], quantity: ['quantity', 'num'],
  quantityUnit: ['quantity_unit', 'text'], unitPrice: ['unit_price', 'num'], totalMinor: ['total_minor', 'num'], currency: ['currency', 'text'],
  fuelType: ['fuel_type', 'text'], station: ['station', 'text'], isFull: ['is_full', 'bool'], missedPrevious: ['missed_previous', 'bool'],
  notes: ['notes', 'text'], createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const expenseSpec: TableSpec<Expense> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], category: ['category', 'text'], day: ['day', 'text'], amountMinor: ['amount_minor', 'num'],
  currency: ['currency', 'text'], vendor: ['vendor', 'text'], odometerKm: ['odometer_km', 'num'], notes: ['notes', 'text'],
  recurrence: ['recurrence', 'text'], recurringParentId: ['recurring_parent_id', 'text'], insuranceId: ['insurance_id', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const insuranceSpec: TableSpec<InsurancePolicy> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], insurer: ['insurer', 'text'], policyNumber: ['policy_number', 'text'],
  startDay: ['start_day', 'text'], endDay: ['end_day', 'text'], premiumMinor: ['premium_minor', 'num'], currency: ['currency', 'text'],
  paymentFrequency: ['payment_frequency', 'text'], coverage: ['coverage', 'text'], contactName: ['contact_name', 'text'],
  contactPhone: ['contact_phone', 'text'], contactEmail: ['contact_email', 'text'], remindDaysBefore: ['remind_days_before', 'num'],
  renewedFromId: ['renewed_from_id', 'text'], notes: ['notes', 'text'], createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const deadlineSpec: TableSpec<AdminDeadline> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], type: ['type', 'text'], title: ['title', 'text'], dueDay: ['due_day', 'text'],
  amountMinor: ['amount_minor', 'num'], currency: ['currency', 'text'], remindDaysBefore: ['remind_days_before', 'json'],
  repeatMonths: ['repeat_months', 'num'], completedAt: ['completed_at', 'text'], notes: ['notes', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const documentSpec: TableSpec<VehicleDocument> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], category: ['category', 'text'], title: ['title', 'text'], fileName: ['file_name', 'text'],
  mimeType: ['mime_type', 'text'], sizeBytes: ['size_bytes', 'num'], expiryDay: ['expiry_day', 'text'], notes: ['notes', 'text'],
  maintenanceId: ['maintenance_id', 'text'], expenseId: ['expense_id', 'text'], insuranceId: ['insurance_id', 'text'], deadlineId: ['deadline_id', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const tireSpec: TableSpec<TireRecord> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], brand: ['brand', 'text'], model: ['model', 'text'], size: ['size', 'text'],
  season: ['season', 'text'], position: ['position', 'text'], installedDay: ['installed_day', 'text'], installedOdometerKm: ['installed_odometer_km', 'num'],
  removedDay: ['removed_day', 'text'], removedOdometerKm: ['removed_odometer_km', 'num'], priceMinor: ['price_minor', 'num'], currency: ['currency', 'text'],
  status: ['status', 'text'], reminderDay: ['reminder_day', 'text'], reminderKm: ['reminder_km', 'num'], notes: ['notes', 'text'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const noteSpec: TableSpec<VehicleNote> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], title: ['title', 'text'], body: ['body', 'text'], pinned: ['pinned', 'bool'],
  createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};

export const inspectionSpec: TableSpec<Inspection> = {
  id: ['id', 'text'], vehicleId: ['vehicle_id', 'text'], templateId: ['template_id', 'text'], day: ['day', 'text'], odometerKm: ['odometer_km', 'num'],
  results: ['results', 'json'], notes: ['notes', 'text'], createdAt: ['created_at', 'text'], updatedAt: ['updated_at', 'text'],
};
