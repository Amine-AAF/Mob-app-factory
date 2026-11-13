import type { Migration } from '@factory/storage';

/**
 * Schema v1. Bundled recipes and templates live in the app bundle (typed,
 * translated, validated by tests), so the database only holds user data.
 * Every user table carries timestamps so a future sync can diff them.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_recipes (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          emoji TEXT NOT NULL,
          color TEXT NOT NULL,
          prep_minutes INTEGER NOT NULL DEFAULT 0,
          cook_minutes INTEGER NOT NULL DEFAULT 0,
          servings INTEGER NOT NULL,
          difficulty TEXT NOT NULL,
          categories TEXT NOT NULL,
          tags TEXT NOT NULL,
          ingredients TEXT NOT NULL,
          steps TEXT NOT NULL,
          nutrition TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS favorites (
          recipe_id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recipe_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id TEXT NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('viewed', 'cooked')),
          at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_history_at ON recipe_history(at);

        CREATE TABLE IF NOT EXISTS plan_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day TEXT NOT NULL,
          slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
          recipe_id TEXT,
          custom_title TEXT,
          servings INTEGER NOT NULL CHECK (servings > 0),
          note TEXT,
          position INTEGER NOT NULL DEFAULT 0,
          cooked_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (recipe_id IS NOT NULL OR custom_title IS NOT NULL)
        );
        CREATE INDEX IF NOT EXISTS idx_plan_day ON plan_entries(day, slot, position);

        CREATE TABLE IF NOT EXISTS meal_templates (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          icon TEXT NOT NULL,
          entries TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS grocery_lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          start_day TEXT,
          end_day TEXT,
          completed_at TEXT,
          spent REAL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS grocery_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          list_id INTEGER NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
          key TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity REAL,
          unit TEXT NOT NULL,
          checked INTEGER NOT NULL DEFAULT 0,
          price REAL,
          manual INTEGER NOT NULL DEFAULT 0,
          note TEXT,
          position INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_grocery_items_list ON grocery_items(list_id);

        CREATE TABLE IF NOT EXISTS pantry_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity REAL,
          unit TEXT NOT NULL,
          location TEXT NOT NULL CHECK (location IN ('fridge', 'freezer', 'cupboard')),
          expires_on TEXT,
          consumed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_pantry_key ON pantry_items(key);

        CREATE TABLE IF NOT EXISTS price_book (
          key TEXT PRIMARY KEY NOT NULL,
          price REAL NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day TEXT NOT NULL,
          amount REAL NOT NULL CHECK (amount >= 0),
          note TEXT,
          list_id INTEGER,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expenses_day ON expenses(day);

        CREATE TABLE IF NOT EXISTS subscription_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** Tables holding the user's own data (backup, export, "delete my data"). */
export const USER_TABLES = [
  'user_preferences',
  'user_recipes',
  'favorites',
  'recipe_history',
  'plan_entries',
  'meal_templates',
  'grocery_lists',
  'grocery_items',
  'pantry_items',
  'price_book',
  'expenses',
] as const;
