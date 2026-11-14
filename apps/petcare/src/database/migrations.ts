import type { Migration } from '@factory/storage';

/**
 * Versioned schema (PRAGMA user_version, applied by @factory/storage `migrate`).
 * Never edit a shipped migration: append a new one and bump SCHEMA_VERSION.
 *
 * Files (photos, documents) are NOT stored in SQLite: tables keep only metadata and
 * a file name relative to the app's private directories (see services/files.ts).
 * Every user table carries timestamps so a sync engine could be added later.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT,
          sex TEXT,
          birth_date TEXT,
          birth_estimated INTEGER NOT NULL DEFAULT 0,
          weight_kg REAL,
          color TEXT,
          identification TEXT,
          adoption_date TEXT,
          notes TEXT,
          photo TEXT,
          walk_goal_minutes INTEGER,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_pets_archived ON pets(archived, name);

        CREATE TABLE IF NOT EXISTS health_records (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          reason TEXT NOT NULL,
          vet_name TEXT,
          clinic TEXT,
          diagnosis TEXT,
          exams TEXT,
          results TEXT,
          notes TEXT,
          cost REAL,
          currency TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_health_pet_date ON health_records(pet_id, date DESC);

        CREATE TABLE IF NOT EXISTS vaccinations (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          administered_date TEXT,
          next_due_date TEXT,
          vet_name TEXT,
          notes TEXT,
          reminder_days_before INTEGER NOT NULL DEFAULT 7,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_vacc_pet ON vaccinations(pet_id, administered_date DESC);
        CREATE INDEX IF NOT EXISTS idx_vacc_due ON vaccinations(next_due_date);

        CREATE TABLE IF NOT EXISTS treatments (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          instructions TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT,
          frequency TEXT NOT NULL,
          reminder_times TEXT NOT NULL DEFAULT '[]',
          reminders_enabled INTEGER NOT NULL DEFAULT 1,
          prescriber TEXT,
          notes TEXT,
          stopped_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_treat_pet ON treatments(pet_id, start_date DESC);
        CREATE INDEX IF NOT EXISTS idx_treat_end ON treatments(end_date);

        CREATE TABLE IF NOT EXISTS treatment_logs (
          id TEXT PRIMARY KEY NOT NULL,
          treatment_id TEXT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
          given_at TEXT NOT NULL,
          note TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_treat_logs ON treatment_logs(treatment_id, given_at DESC);

        CREATE TABLE IF NOT EXISTS weight_records (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          weight_kg REAL NOT NULL CHECK (weight_kg > 0),
          height_cm REAL,
          notes TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_weight_pet_date ON weight_records(pet_id, date);

        CREATE TABLE IF NOT EXISTS feeding_schedules (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          food_type TEXT NOT NULL,
          brand TEXT,
          product TEXT,
          quantity TEXT,
          meal_times TEXT NOT NULL DEFAULT '[]',
          reminders_enabled INTEGER NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_feeding_pet ON feeding_schedules(pet_id, active);

        CREATE TABLE IF NOT EXISTS feeding_logs (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          schedule_id TEXT REFERENCES feeding_schedules(id) ON DELETE SET NULL,
          fed_at TEXT NOT NULL,
          notes TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_feeding_logs ON feeding_logs(pet_id, fed_at DESC);

        CREATE TABLE IF NOT EXISTS food_inventory (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT REFERENCES pets(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          brand TEXT,
          quantity REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
          unit TEXT NOT NULL,
          low_threshold REAL,
          daily_usage REAL,
          restock_alert INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS food_purchases (
          id TEXT PRIMARY KEY NOT NULL,
          food_id TEXT NOT NULL REFERENCES food_inventory(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          quantity REAL NOT NULL,
          cost REAL,
          currency TEXT,
          expense_id TEXT REFERENCES expenses(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_food_purchases ON food_purchases(food_id, date DESC);

        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          starts_at TEXT NOT NULL,
          title TEXT,
          address TEXT,
          provider TEXT,
          phone TEXT,
          notes TEXT,
          estimated_cost REAL,
          currency TEXT,
          status TEXT NOT NULL DEFAULT 'scheduled',
          remind_minutes_before INTEGER NOT NULL DEFAULT 60,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_appt_start ON appointments(status, starts_at);
        CREATE INDEX IF NOT EXISTS idx_appt_pet ON appointments(pet_id, starts_at);

        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          file_name TEXT NOT NULL,
          mime_type TEXT,
          size_bytes INTEGER,
          health_record_id TEXT REFERENCES health_records(id) ON DELETE SET NULL,
          vaccination_id TEXT REFERENCES vaccinations(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_docs_pet ON documents(pet_id, category);
        CREATE INDEX IF NOT EXISTS idx_docs_health ON documents(health_record_id);

        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          duration_minutes INTEGER,
          distance_km REAL,
          notes TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_activities_pet ON activities(pet_id, date DESC);

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT REFERENCES pets(id) ON DELETE SET NULL,
          date TEXT NOT NULL,
          amount REAL NOT NULL CHECK (amount >= 0),
          currency TEXT NOT NULL,
          category TEXT NOT NULL,
          notes TEXT,
          receipt_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
        CREATE INDEX IF NOT EXISTS idx_expenses_pet ON expenses(pet_id, date);

        -- Templates: built-in ones live in the bundle (src/content/templates.ts); this table
        -- stores the user's own templates. Checklists are instances the user ticks off.
        CREATE TABLE IF NOT EXISTS care_templates (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          items TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS checklists (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT REFERENCES pets(id) ON DELETE CASCADE,
          template_id TEXT,
          title TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          label TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_checklist_items ON checklist_items(checklist_id, position);

        CREATE TABLE IF NOT EXISTS notification_settings (
          category TEXT PRIMARY KEY NOT NULL,
          enabled INTEGER NOT NULL,
          hour INTEGER NOT NULL,
          minute INTEGER NOT NULL,
          weekday INTEGER
        );

        CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS subscription_cache (id INTEGER PRIMARY KEY CHECK (id = 1), state TEXT NOT NULL, updated_at TEXT NOT NULL);
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/**
 * User-owned tables in dependency order (parents first) so a restore can insert them
 * with foreign keys enabled. Used by backup/restore and "delete all my data".
 */
export const USER_TABLES = [
  'pets',
  'health_records',
  'vaccinations',
  'treatments',
  'treatment_logs',
  'weight_records',
  'feeding_schedules',
  'feeding_logs',
  'documents',
  'expenses',
  'food_inventory',
  'food_purchases',
  'appointments',
  'activities',
  'care_templates',
  'checklists',
  'checklist_items',
  'notification_settings',
  'app_settings',
] as const;
