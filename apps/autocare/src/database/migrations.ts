import type { Migration } from '@factory/storage';

/**
 * Schema history. NEVER edit a shipped migration: add a new one with the next
 * version. `migrate` (from @factory/storage) applies them through `user_version`,
 * each in its own transaction, so an app update keeps existing data.
 *
 * - Every user table carries `updated_at` so a sync engine could be added later.
 * - Children reference `vehicles(id) ON DELETE CASCADE`: deleting a vehicle removes its history.
 * - Attachments (`documents`) only store metadata + a file name inside the app's private
 *   directory; the files themselves never go into SQLite (services/fileStore.ts).
 * - Distances in km, volumes in litres, energy in kWh, money in integer minor units.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE vehicles (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          make TEXT NOT NULL,
          model TEXT NOT NULL,
          trim TEXT,
          year INTEGER,
          vehicle_type TEXT NOT NULL,
          engine TEXT,
          fuel_type TEXT NOT NULL,
          transmission TEXT,
          power_hp REAL,
          plate TEXT,
          vin TEXT,
          purchase_date TEXT,
          purchase_odometer_km REAL,
          odometer_km REAL NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
          purchase_price_minor INTEGER,
          currency TEXT NOT NULL,
          photo_file TEXT,
          color TEXT NOT NULL,
          notes TEXT,
          archived INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE odometer_readings (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          day TEXT NOT NULL,
          odometer_km REAL NOT NULL CHECK (odometer_km >= 0),
          source TEXT NOT NULL,
          -- The fuel / maintenance / expense row this reading came from (kept in sync on edit/delete).
          ref_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_odometer_vehicle_day ON odometer_readings (vehicle_id, day);
        CREATE UNIQUE INDEX idx_odometer_ref ON odometer_readings (ref_id) WHERE ref_id IS NOT NULL;

        CREATE TABLE maintenance_schedules (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT,
          interval_km REAL CHECK (interval_km IS NULL OR interval_km > 0),
          interval_months INTEGER CHECK (interval_months IS NULL OR interval_months > 0),
          last_day TEXT,
          last_odometer_km REAL,
          remind_days_before INTEGER NOT NULL DEFAULT 14,
          remind_km_before REAL NOT NULL DEFAULT 500,
          enabled INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_schedules_vehicle ON maintenance_schedules (vehicle_id);

        CREATE TABLE maintenance_records (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT,
          day TEXT NOT NULL,
          odometer_km REAL,
          description TEXT,
          provider TEXT,
          cost_minor INTEGER,
          currency TEXT NOT NULL,
          parts TEXT,
          notes TEXT,
          schedule_id TEXT REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_maintenance_vehicle_day ON maintenance_records (vehicle_id, day);
        CREATE INDEX idx_maintenance_type ON maintenance_records (type);

        CREATE TABLE fuel_records (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          day TEXT NOT NULL,
          odometer_km REAL,
          quantity REAL NOT NULL CHECK (quantity > 0),
          quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ('L', 'kWh')),
          unit_price REAL,
          total_minor INTEGER NOT NULL CHECK (total_minor >= 0),
          currency TEXT NOT NULL,
          fuel_type TEXT NOT NULL,
          station TEXT,
          is_full INTEGER NOT NULL DEFAULT 1,
          missed_previous INTEGER NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_fuel_vehicle_day ON fuel_records (vehicle_id, day);

        CREATE TABLE insurance_policies (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          insurer TEXT NOT NULL,
          policy_number TEXT,
          start_day TEXT NOT NULL,
          end_day TEXT NOT NULL,
          premium_minor INTEGER,
          currency TEXT NOT NULL,
          payment_frequency TEXT NOT NULL,
          coverage TEXT,
          contact_name TEXT,
          contact_phone TEXT,
          contact_email TEXT,
          remind_days_before INTEGER NOT NULL DEFAULT 30,
          renewed_from_id TEXT REFERENCES insurance_policies(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (end_day >= start_day)
        );
        CREATE INDEX idx_insurance_vehicle_end ON insurance_policies (vehicle_id, end_day);

        CREATE TABLE expenses (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          day TEXT NOT NULL,
          amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
          currency TEXT NOT NULL,
          vendor TEXT,
          odometer_km REAL,
          notes TEXT,
          recurrence TEXT NOT NULL DEFAULT 'none',
          recurring_parent_id TEXT REFERENCES expenses(id) ON DELETE SET NULL,
          insurance_id TEXT REFERENCES insurance_policies(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_expenses_vehicle_day ON expenses (vehicle_id, day);
        CREATE INDEX idx_expenses_category ON expenses (category);
        -- A recurring expense yields at most one occurrence per day (idempotent generation).
        CREATE UNIQUE INDEX idx_expenses_occurrence ON expenses (recurring_parent_id, day) WHERE recurring_parent_id IS NOT NULL;

        CREATE TABLE administrative_reminders (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT,
          due_day TEXT NOT NULL,
          amount_minor INTEGER,
          currency TEXT NOT NULL,
          remind_days_before TEXT NOT NULL DEFAULT '[30,7,1]',
          repeat_months INTEGER CHECK (repeat_months IS NULL OR repeat_months > 0),
          completed_at TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_deadlines_due ON administrative_reminders (due_day);

        CREATE TABLE documents (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          file_name TEXT NOT NULL UNIQUE,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL DEFAULT 0,
          expiry_day TEXT,
          notes TEXT,
          maintenance_id TEXT REFERENCES maintenance_records(id) ON DELETE SET NULL,
          expense_id TEXT REFERENCES expenses(id) ON DELETE SET NULL,
          insurance_id TEXT REFERENCES insurance_policies(id) ON DELETE SET NULL,
          deadline_id TEXT REFERENCES administrative_reminders(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_documents_vehicle ON documents (vehicle_id);
        CREATE INDEX idx_documents_expiry ON documents (expiry_day);

        CREATE TABLE tire_records (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          brand TEXT NOT NULL,
          model TEXT,
          size TEXT,
          season TEXT NOT NULL,
          position TEXT NOT NULL,
          installed_day TEXT NOT NULL,
          installed_odometer_km REAL,
          removed_day TEXT,
          removed_odometer_km REAL,
          price_minor INTEGER,
          currency TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('mounted', 'stored', 'retired')),
          reminder_day TEXT,
          reminder_km REAL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_tires_vehicle ON tire_records (vehicle_id, installed_day);

        CREATE TABLE vehicle_notes (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          body TEXT,
          pinned INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_notes_vehicle ON vehicle_notes (vehicle_id);

        CREATE TABLE inspections (
          id TEXT PRIMARY KEY NOT NULL,
          vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
          template_id TEXT NOT NULL,
          day TEXT NOT NULL,
          odometer_km REAL,
          results TEXT NOT NULL DEFAULT '{}',
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_inspections_vehicle ON inspections (vehicle_id, day);

        CREATE TABLE budgets (
          scope TEXT PRIMARY KEY NOT NULL, -- 'all' or a vehicle id
          monthly_minor INTEGER NOT NULL CHECK (monthly_minor > 0),
          currency TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE notification_settings (
          category TEXT PRIMARY KEY NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          hour INTEGER NOT NULL DEFAULT 9 CHECK (hour BETWEEN 0 AND 23),
          minute INTEGER NOT NULL DEFAULT 0 CHECK (minute BETWEEN 0 AND 59),
          updated_at TEXT NOT NULL
        );

        CREATE TABLE user_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE subscription_cache (
          key TEXT PRIMARY KEY NOT NULL,
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** User-owned tables, parents first (restore order). The subscription cache is never exported. */
export const USER_TABLES = [
  'vehicles',
  'odometer_readings',
  'maintenance_schedules',
  'maintenance_records',
  'fuel_records',
  'insurance_policies',
  'expenses',
  'administrative_reminders',
  'documents',
  'tire_records',
  'vehicle_notes',
  'inspections',
  'budgets',
  'notification_settings',
  'user_settings',
] as const;
