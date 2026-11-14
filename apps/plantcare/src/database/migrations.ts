import type { Migration } from '@factory/storage';

/**
 * Versioned schema (PRAGMA user_version). Never edit a shipped migration: add a new one.
 *
 * Conventions:
 * - ids are TEXT generated on device; calendar days are TEXT "YYYY-MM-DD" (local day);
 *   timestamps are ISO-8601 TEXT.
 * - Photos are files in the app's private folder; tables only store their relative path.
 * - Deleting a plant cascades to everything that belongs to it.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE plant_categories (
          id TEXT PRIMARY KEY NOT NULL,
          sort INTEGER NOT NULL
        );

        CREATE TABLE plant_species (
          id TEXT PRIMARY KEY NOT NULL,
          scientific_name TEXT NOT NULL,
          family TEXT NOT NULL,
          category_id TEXT NOT NULL REFERENCES plant_categories(id),
          data TEXT NOT NULL,
          core INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX idx_species_category ON plant_species(category_id);

        CREATE TABLE garden_locations (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          photo_path TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE plants (
          id TEXT PRIMARY KEY NOT NULL,
          nickname TEXT NOT NULL,
          common_name TEXT NOT NULL DEFAULT '',
          scientific_name TEXT,
          species_id TEXT REFERENCES plant_species(id) ON DELETE SET NULL,
          category_id TEXT NOT NULL REFERENCES plant_categories(id),
          photo_path TEXT,
          acquired_on TEXT,
          planted_on TEXT,
          location_id TEXT REFERENCES garden_locations(id) ON DELETE SET NULL,
          description TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          favorite INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_plants_location ON plants(location_id);
        CREATE INDEX idx_plants_category ON plants(category_id);
        CREATE INDEX idx_plants_species ON plants(species_id);

        CREATE TABLE care_tasks (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          next_due TEXT,
          interval_days INTEGER CHECK (interval_days IS NULL OR (interval_days BETWEEN 1 AND 365)),
          priority TEXT NOT NULL DEFAULT 'normal',
          notes TEXT NOT NULL DEFAULT '',
          amount_ml INTEGER,
          reminders_enabled INTEGER NOT NULL DEFAULT 1,
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_tasks_plant ON care_tasks(plant_id);
        CREATE INDEX idx_tasks_due ON care_tasks(active, next_due);

        CREATE TABLE care_history (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT REFERENCES care_tasks(id) ON DELETE SET NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          action TEXT NOT NULL,
          date TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_history_plant_date ON care_history(plant_id, date);
        CREATE INDEX idx_history_date ON care_history(date);

        CREATE TABLE watering_records (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          amount_ml INTEGER,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_watering_plant_date ON watering_records(plant_id, date);
        CREATE INDEX idx_watering_date ON watering_records(date);

        CREATE TABLE growth_records (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          height_cm REAL CHECK (height_cm IS NULL OR height_cm >= 0),
          leaf_count INTEGER CHECK (leaf_count IS NULL OR leaf_count >= 0),
          condition TEXT NOT NULL DEFAULT 'good',
          photo_path TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_growth_plant_date ON growth_records(plant_id, date);

        CREATE TABLE plant_journal_entries (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          photo_path TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_journal_plant_date ON plant_journal_entries(plant_id, date);

        CREATE TABLE plant_health_records (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          observed_on TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          actions TEXT NOT NULL DEFAULT '[]',
          photo_paths TEXT NOT NULL DEFAULT '[]',
          notes TEXT NOT NULL DEFAULT '',
          resolved_on TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_health_plant ON plant_health_records(plant_id, status);

        CREATE TABLE fertilizer_records (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          fertilizer_type TEXT NOT NULL,
          brand TEXT NOT NULL DEFAULT '',
          composition TEXT NOT NULL DEFAULT '',
          applied_on TEXT NOT NULL,
          quantity TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_fertilizer_plant_date ON fertilizer_records(plant_id, applied_on);

        CREATE TABLE soil_records (
          id TEXT PRIMARY KEY NOT NULL,
          plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
          substrate TEXT NOT NULL,
          pot_size_cm REAL CHECK (pot_size_cm IS NULL OR pot_size_cm > 0),
          repotted_on TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_soil_plant_date ON soil_records(plant_id, repotted_on);

        CREATE TABLE plant_wishlist (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          species_id TEXT REFERENCES plant_species(id) ON DELETE SET NULL,
          photo_path TEXT,
          description TEXT NOT NULL DEFAULT '',
          estimated_price REAL CHECK (estimated_price IS NULL OR estimated_price >= 0),
          store TEXT NOT NULL DEFAULT '',
          priority TEXT NOT NULL DEFAULT 'normal',
          notes TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'wishlist',
          created_at TEXT NOT NULL
        );
        CREATE INDEX idx_wishlist_status ON plant_wishlist(status);

        CREATE TABLE seasonal_tasks (
          id TEXT PRIMARY KEY NOT NULL,
          season TEXT NOT NULL,
          built_in_key TEXT,
          title TEXT NOT NULL DEFAULT '',
          sort INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX idx_seasonal_season ON seasonal_tasks(season, sort);

        CREATE TABLE seasonal_completions (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT NOT NULL REFERENCES seasonal_tasks(id) ON DELETE CASCADE,
          season_key TEXT NOT NULL,
          completed_on TEXT NOT NULL,
          UNIQUE (task_id, season_key)
        );

        CREATE TABLE notification_settings (
          plant_id TEXT REFERENCES plants(id) ON DELETE CASCADE,
          task_type TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1
        );
        CREATE UNIQUE INDEX idx_notif_scope ON notification_settings(COALESCE(plant_id, ''), task_type);

        CREATE TABLE app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE subscription_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** User-owned tables, in dependency order (parents first) for backup/restore. */
export const USER_TABLES = [
  'garden_locations',
  'plants',
  'care_tasks',
  'care_history',
  'watering_records',
  'growth_records',
  'plant_journal_entries',
  'plant_health_records',
  'fertilizer_records',
  'soil_records',
  'plant_wishlist',
  'seasonal_tasks',
  'seasonal_completions',
  'notification_settings',
] as const;
