import type { Migration } from '@factory/storage';

/**
 * TravelWise schema. Never edit a shipped migration: append a new one.
 *
 * Conventions
 * - Ids: TEXT (random UUID v4), generated in the app.
 * - Calendar dates: TEXT "YYYY-MM-DD" (local to the destination, never shifted).
 * - Wall-clock times: TEXT "HH:mm" (local to the destination, never converted).
 * - Instants: TEXT ISO-8601 UTC.
 * - Money: INTEGER minor units + TEXT ISO 4217 currency.
 * - Booleans: INTEGER 0/1.
 * - Files (PDF, images): only their app-private URI + metadata are stored, never the bytes.
 * - Deleting a trip cascades to everything that belongs to it (foreign keys ON).
 *   File clean-up is done by the repository, which collects URIs before deleting rows.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS trips (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          primary_destination TEXT NOT NULL DEFAULT '',
          country_code TEXT,
          city TEXT,
          start_date TEXT,
          end_date TEXT,
          time_zone TEXT,
          description TEXT NOT NULL DEFAULT '',
          cover_uri TEXT,
          trip_type TEXT NOT NULL DEFAULT 'solo',
          budget_minor INTEGER,
          currency TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'planning',
          is_demo INTEGER NOT NULL DEFAULT 0,
          archived_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
        );
        CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

        CREATE TABLE IF NOT EXISTS trip_destinations (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          city TEXT NOT NULL,
          country_code TEXT,
          time_zone TEXT,
          start_date TEXT,
          end_date TEXT,
          position INTEGER NOT NULL,
          notes TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_destinations_trip ON trip_destinations(trip_id, position);

        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          is_self INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_participants_trip ON participants(trip_id, position);

        CREATE TABLE IF NOT EXISTS itinerary_days (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          destination_id TEXT REFERENCES trip_destinations(id) ON DELETE SET NULL,
          title TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          budget_minor INTEGER,
          position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_days_trip ON itinerary_days(trip_id, date, position);

        CREATE TABLE IF NOT EXISTS places (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
          day_id TEXT REFERENCES itinerary_days(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          address TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          country_code TEXT,
          category TEXT NOT NULL DEFAULT 'other',
          notes TEXT NOT NULL DEFAULT '',
          url TEXT,
          latitude REAL,
          longitude REAL,
          photo_uri TEXT,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
        );
        CREATE INDEX IF NOT EXISTS idx_places_trip ON places(trip_id);
        CREATE INDEX IF NOT EXISTS idx_places_favorite ON places(is_favorite);

        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          day_id TEXT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
          place_id TEXT REFERENCES places(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'other',
          start_time TEXT,
          end_time TEXT,
          duration_minutes INTEGER,
          price_minor INTEGER,
          currency TEXT,
          notes TEXT NOT NULL DEFAULT '',
          url TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_activities_day ON activities(day_id, position);
        CREATE INDEX IF NOT EXISTS idx_activities_trip ON activities(trip_id);

        CREATE TABLE IF NOT EXISTS travel_documents (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'other',
          file_uri TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          expires_on TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_documents_trip ON travel_documents(trip_id);

        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          type TEXT NOT NULL DEFAULT 'other',
          provider TEXT NOT NULL DEFAULT '',
          reference TEXT NOT NULL DEFAULT '',
          date TEXT,
          time TEXT,
          end_date TEXT,
          end_time TEXT,
          time_zone TEXT,
          address TEXT NOT NULL DEFAULT '',
          departure_info TEXT NOT NULL DEFAULT '',
          arrival_info TEXT NOT NULL DEFAULT '',
          price_minor INTEGER,
          currency TEXT,
          status TEXT NOT NULL DEFAULT 'confirmed',
          notes TEXT NOT NULL DEFAULT '',
          url TEXT,
          attachment_document_id TEXT REFERENCES travel_documents(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_bookings_trip_date ON bookings(trip_id, date, time);

        CREATE TABLE IF NOT EXISTS budgets (
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          planned_minor INTEGER NOT NULL CHECK (planned_minor >= 0),
          PRIMARY KEY (trip_id, category)
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
          currency TEXT NOT NULL,
          trip_amount_minor INTEGER NOT NULL,
          rate_to_trip REAL NOT NULL DEFAULT 1,
          category TEXT NOT NULL DEFAULT 'misc',
          date TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          payment_method TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          paid_by_participant_id TEXT REFERENCES participants(id) ON DELETE SET NULL,
          split_mode TEXT NOT NULL DEFAULT 'none',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expenses_trip_date ON expenses(trip_id, date);
        CREATE INDEX IF NOT EXISTS idx_expenses_trip_category ON expenses(trip_id, category);

        CREATE TABLE IF NOT EXISTS expense_participants (
          expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
          participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
          share_minor INTEGER NOT NULL CHECK (share_minor >= 0),
          PRIMARY KEY (expense_id, participant_id)
        );
        CREATE INDEX IF NOT EXISTS idx_expense_participants_participant ON expense_participants(participant_id);

        CREATE TABLE IF NOT EXISTS packing_lists (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          is_template INTEGER NOT NULL DEFAULT 0,
          template_key TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_packing_lists_trip ON packing_lists(trip_id);

        CREATE TABLE IF NOT EXISTS packing_items (
          id TEXT PRIMARY KEY NOT NULL,
          list_id TEXT NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'custom',
          quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
          notes TEXT NOT NULL DEFAULT '',
          priority TEXT NOT NULL DEFAULT 'medium',
          packed INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_packing_items_list ON packing_items(list_id, position);

        CREATE TABLE IF NOT EXISTS checklists (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_checklists_trip ON checklists(trip_id);

        CREATE TABLE IF NOT EXISTS checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          due_date TEXT,
          priority TEXT NOT NULL DEFAULT 'medium',
          status TEXT NOT NULL DEFAULT 'todo',
          reminder_at TEXT,
          notification_id TEXT,
          position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_checklist_items_list ON checklist_items(checklist_id, position);
        CREATE INDEX IF NOT EXISTS idx_checklist_items_reminder ON checklist_items(reminder_at);

        CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          city TEXT NOT NULL DEFAULT '',
          title TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          photo_uris TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_journal_trip_date ON journal_entries(trip_id, date);

        CREATE TABLE IF NOT EXISTS currency_rates (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
          base TEXT NOT NULL,
          quote TEXT NOT NULL,
          rate REAL NOT NULL CHECK (rate > 0),
          rate_date TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'manual',
          captured_at TEXT NOT NULL,
          CHECK (base <> quote)
        );
        CREATE INDEX IF NOT EXISTS idx_rates_pair ON currency_rates(base, quote, captured_at);
        CREATE INDEX IF NOT EXISTS idx_rates_trip ON currency_rates(trip_id);

        CREATE TABLE IF NOT EXISTS currency_conversions (
          id TEXT PRIMARY KEY NOT NULL,
          base TEXT NOT NULL,
          quote TEXT NOT NULL,
          amount_minor INTEGER NOT NULL,
          result_minor INTEGER NOT NULL,
          rate REAL NOT NULL,
          rate_date TEXT NOT NULL,
          source TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_conversions_created ON currency_conversions(created_at);

        CREATE TABLE IF NOT EXISTS weather_notes (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          destination_id TEXT REFERENCES trip_destinations(id) ON DELETE CASCADE,
          conditions TEXT NOT NULL DEFAULT '[]',
          min_temp_c REAL,
          max_temp_c REAL,
          notes TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_weather_trip ON weather_notes(trip_id);
      `);
    },
  },
  {
    version: 2,
    name: 'subscription_cache',
    async up(db) {
      // Last entitlement confirmed by the store, honoured offline for a limited time
      // (@factory/monetization resolveEntitlement). Contains no payment data.
      await db.execAsync(`
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

/** Every user table, children first (safe order for wipes). */
export const USER_TABLES = [
  'weather_notes',
  'currency_conversions',
  'currency_rates',
  'journal_entries',
  'checklist_items',
  'checklists',
  'packing_items',
  'packing_lists',
  'expense_participants',
  'expenses',
  'budgets',
  'bookings',
  'activities',
  'places',
  'travel_documents',
  'itinerary_days',
  'participants',
  'trip_destinations',
  'trips',
  'user_settings',
  'subscription_cache',
] as const;
