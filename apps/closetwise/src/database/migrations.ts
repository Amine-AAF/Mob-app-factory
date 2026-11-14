import type { Migration, SqlDatabase } from '@factory/storage';

import { CATEGORY_KEYS, COLORS, OCCASION_KEYS, STYLE_KEYS } from '@/domain/catalog';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/domain/notificationPlan';

/**
 * Versioned schema (PRAGMA user_version). Never edit a shipped migration: add a new one.
 *
 * Photos are NOT stored in SQLite: tables only keep paths relative to the app's private
 * photo directory (`photo_path`, `thumb_path`, `receipt_path`). See services/photos.
 * Every user table carries `updated_at`/`created_at` so a sync engine could be added later.
 */
const V1 = `
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  sort INTEGER NOT NULL
);

CREATE TABLE colors (
  key TEXT PRIMARY KEY,
  hex TEXT NOT NULL,
  neutral INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL
);

CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL
);

CREATE TABLE styles (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  name TEXT,
  builtin INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK (key IS NOT NULL OR name IS NOT NULL)
);

CREATE TABLE occasions (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  name TEXT,
  builtin INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK (key IS NOT NULL OR name IS NOT NULL)
);

CREATE TABLE wardrobe_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  subcategory TEXT,
  primary_color TEXT REFERENCES colors(key) ON DELETE SET NULL,
  secondary_colors TEXT NOT NULL DEFAULT '[]',
  brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  size TEXT,
  size_system TEXT,
  seasons INTEGER NOT NULL DEFAULT 0,
  style_id TEXT REFERENCES styles(id) ON DELETE SET NULL,
  purchase_date TEXT,
  purchase_price REAL CHECK (purchase_price IS NULL OR purchase_price >= 0),
  currency TEXT,
  condition TEXT,
  notes TEXT,
  photo_path TEXT,
  thumb_path TEXT,
  favorite INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  care_status TEXT NOT NULL DEFAULT 'clean',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_items_category ON wardrobe_items(category_id, archived);
CREATE INDEX idx_items_archived_created ON wardrobe_items(archived, created_at);
CREATE INDEX idx_items_care ON wardrobe_items(care_status);

CREATE TABLE item_occasions (
  item_id TEXT NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  occasion_id TEXT NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, occasion_id)
);
CREATE INDEX idx_item_occasions_occasion ON item_occasions(occasion_id);

CREATE TABLE outfits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  style_id TEXT REFERENCES styles(id) ON DELETE SET NULL,
  occasion_id TEXT REFERENCES occasions(id) ON DELETE SET NULL,
  seasons INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  favorite INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_outfits_created ON outfits(created_at);

CREATE TABLE outfit_items (
  outfit_id TEXT NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (outfit_id, item_id)
);
CREATE INDEX idx_outfit_items_item ON outfit_items(item_id);

CREATE TABLE outfit_schedules (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  outfit_id TEXT REFERENCES outfits(id) ON DELETE SET NULL,
  occasion_id TEXT REFERENCES occasions(id) ON DELETE SET NULL,
  notes TEXT,
  remind INTEGER NOT NULL DEFAULT 0,
  worn_logged INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_schedules_date ON outfit_schedules(date);

CREATE TABLE outfit_usage_history (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  outfit_id TEXT REFERENCES outfits(id) ON DELETE SET NULL,
  worn_on TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (item_id, worn_on)
);
CREATE INDEX idx_usage_worn_on ON outfit_usage_history(worn_on);
CREATE INDEX idx_usage_outfit ON outfit_usage_history(outfit_id);

CREATE TABLE shopping_records (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_id TEXT REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  brand TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  purchased_on TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL,
  store TEXT,
  size TEXT,
  notes TEXT,
  receipt_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_shopping_date ON shopping_records(purchased_on);

CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_path TEXT,
  thumb_path TEXT,
  brand TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  estimated_price REAL CHECK (estimated_price IS NULL OR estimated_price >= 0),
  currency TEXT,
  url TEXT,
  store TEXT,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'wanted',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_wishlist_status ON wishlist_items(status, priority);

CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  template TEXT,
  notes TEXT,
  reminder_days INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (return_date >= departure_date)
);
CREATE INDEX idx_trips_departure ON trips(departure_date);

CREATE TABLE packing_lists (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('item', 'outfit', 'custom')),
  item_id TEXT REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  outfit_id TEXT REFERENCES outfits(id) ON DELETE CASCADE,
  label TEXT,
  section TEXT NOT NULL DEFAULT 'other',
  packed INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_packing_trip ON packing_lists(trip_id, position);
CREATE UNIQUE INDEX idx_packing_unique_item ON packing_lists(trip_id, item_id) WHERE item_id IS NOT NULL;
CREATE UNIQUE INDEX idx_packing_unique_outfit ON packing_lists(trip_id, outfit_id) WHERE outfit_id IS NOT NULL;

CREATE TABLE clothing_care_records (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  wash_method TEXT,
  wash_temperature INTEGER,
  drying TEXT,
  ironing TEXT,
  bleach INTEGER,
  notes TEXT,
  recorded_on TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_care_item ON clothing_care_records(item_id, recorded_on);
CREATE UNIQUE INDEX idx_care_instructions ON clothing_care_records(item_id) WHERE kind = 'instructions';

CREATE TABLE wardrobe_goals (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT,
  target REAL NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE notification_settings (
  kind TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  param INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE suggestion_feedback (
  signature TEXT PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
  preset TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE subscription_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  state TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

async function seedTaxonomy(db: SqlDatabase, now: string): Promise<void> {
  for (const [i, key] of CATEGORY_KEYS.entries()) {
    await db.runAsync('INSERT OR IGNORE INTO categories (id, key, sort) VALUES (?, ?, ?)', [`cat_${key}`, key, i]);
  }
  for (const [i, c] of COLORS.entries()) {
    await db.runAsync('INSERT OR IGNORE INTO colors (key, hex, neutral, sort) VALUES (?, ?, ?, ?)', [c.key, c.hex, c.neutral ? 1 : 0, i]);
  }
  for (const key of STYLE_KEYS) {
    await db.runAsync('INSERT OR IGNORE INTO styles (id, key, builtin, created_at) VALUES (?, ?, 1, ?)', [`sty_${key}`, key, now]);
  }
  for (const key of OCCASION_KEYS) {
    await db.runAsync('INSERT OR IGNORE INTO occasions (id, key, builtin, created_at) VALUES (?, ?, 1, ?)', [`occ_${key}`, key, now]);
  }
  for (const s of DEFAULT_NOTIFICATION_SETTINGS) {
    await db.runAsync('INSERT OR IGNORE INTO notification_settings (kind, enabled, hour, minute, param) VALUES (?, ?, ?, ?, ?)', [s.kind, s.enabled ? 1 : 0, s.hour, s.minute, s.param]);
  }
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(V1);
      await seedTaxonomy(db, new Date().toISOString());
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** Built-in reference tables, re-created by migrations and never part of a backup. */
export const REFERENCE_TABLES = ['categories', 'colors'] as const;

/**
 * User tables in dependency order (parents first) for backup/restore.
 * Built-in styles/occasions are included so custom ones and their links round-trip.
 */
export const USER_TABLES = [
  'brands',
  'styles',
  'occasions',
  'wardrobe_items',
  'item_occasions',
  'outfits',
  'outfit_items',
  'outfit_schedules',
  'outfit_usage_history',
  'shopping_records',
  'wishlist_items',
  'trips',
  'packing_lists',
  'clothing_care_records',
  'wardrobe_goals',
  'notification_settings',
  'suggestion_feedback',
  'app_settings',
] as const;

export { seedTaxonomy };
