import type { Migration } from '@factory/storage';

/**
 * Eventora schema. Never edit a shipped migration: append a new one.
 *
 * - Every event-owned table references `events(id) ON DELETE CASCADE`, so
 *   deleting an event removes all of its data in one statement.
 * - Optional links (guest → group, expense → vendor, gift → guest) use
 *   `ON DELETE SET NULL` so removing a vendor never deletes an expense.
 * - Money: INTEGER minor units + ISO currency. Dates: TEXT "YYYY-MM-DD",
 *   instants: TEXT ISO-8601 UTC.
 * - Images / documents live as files under the app's document directory;
 *   only their URIs are stored here.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS event_types (
          id TEXT PRIMARY KEY NOT NULL,
          icon TEXT NOT NULL,
          theme TEXT NOT NULL,
          position INTEGER NOT NULL,
          builtin INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type_id TEXT NOT NULL REFERENCES event_types(id),
          cover_uri TEXT,
          description TEXT NOT NULL DEFAULT '',
          start_date TEXT NOT NULL,
          start_time TEXT,
          end_date TEXT,
          end_time TEXT,
          timezone TEXT NOT NULL,
          start_utc TEXT NOT NULL,
          venue TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          expected_guests INTEGER NOT NULL DEFAULT 0,
          budget_minor INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'planning',
          theme TEXT NOT NULL,
          template_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_utc);

        CREATE TABLE IF NOT EXISTS guest_groups (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'family',
          notes TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_groups_event ON guest_groups(event_id);

        CREATE TABLE IF NOT EXISTS guests (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          group_id TEXT REFERENCES guest_groups(id) ON DELETE SET NULL,
          first_name TEXT NOT NULL DEFAULT '',
          last_name TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'other',
          plus_ones INTEGER NOT NULL DEFAULT 0 CHECK (plus_ones >= 0),
          children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
          is_child INTEGER NOT NULL DEFAULT 0,
          dietary TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          rsvp_status TEXT NOT NULL DEFAULT 'not_invited',
          rsvp_responded_at TEXT,
          rsvp_note TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_guests_event_status ON guests(event_id, rsvp_status);
        CREATE INDEX IF NOT EXISTS idx_guests_group ON guests(group_id);

        CREATE TABLE IF NOT EXISTS rsvp_records (
          id TEXT PRIMARY KEY NOT NULL,
          guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'manual',
          recorded_at TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_rsvp_guest ON rsvp_records(guest_id, recorded_at);

        CREATE TABLE IF NOT EXISTS invitations (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          design TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          hosts TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL DEFAULT '',
          show_date INTEGER NOT NULL DEFAULT 1,
          show_time INTEGER NOT NULL DEFAULT 1,
          show_venue INTEGER NOT NULL DEFAULT 1,
          rsvp_line TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_invitations_event ON invitations(event_id);

        CREATE TABLE IF NOT EXISTS event_budgets (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          planned_minor INTEGER NOT NULL DEFAULT 0 CHECK (planned_minor >= 0),
          UNIQUE (event_id, category)
        );

        CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'other',
          contact_name TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          website TEXT NOT NULL DEFAULT '',
          quote TEXT NOT NULL DEFAULT '',
          amount_minor INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'to_contact',
          meeting_at TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_vendors_event ON vendors(event_id, status);

        CREATE TABLE IF NOT EXISTS vendor_contracts (
          id TEXT PRIMARY KEY NOT NULL,
          vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          file_uri TEXT,
          signed_date TEXT,
          amount_minor INTEGER NOT NULL DEFAULT 0,
          deposit_minor INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON vendor_contracts(vendor_id);

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
          estimated_minor INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minor >= 0),
          actual_minor INTEGER NOT NULL DEFAULT 0 CHECK (actual_minor >= 0),
          currency TEXT NOT NULL,
          fx_rate REAL,
          due_date TEXT,
          payment_date TEXT,
          payment_status TEXT NOT NULL DEFAULT 'unpaid',
          receipt_uri TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id, category);
        CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_due ON expenses(due_date);

        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          assignee TEXT NOT NULL DEFAULT '',
          due_date TEXT,
          priority TEXT NOT NULL DEFAULT 'medium',
          category TEXT NOT NULL DEFAULT 'other',
          status TEXT NOT NULL DEFAULT 'todo',
          notes TEXT NOT NULL DEFAULT '',
          vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_event_status ON tasks(event_id, status);
        CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

        CREATE TABLE IF NOT EXISTS timeline_items (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          start_min INTEGER NOT NULL CHECK (start_min >= 0),
          end_min INTEGER NOT NULL,
          location TEXT NOT NULL DEFAULT '',
          owner TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          CHECK (end_min >= start_min)
        );
        CREATE INDEX IF NOT EXISTS idx_timeline_event ON timeline_items(event_id, start_min);

        CREATE TABLE IF NOT EXISTS seating_tables (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          shape TEXT NOT NULL DEFAULT 'round',
          seats INTEGER NOT NULL CHECK (seats > 0 AND seats <= 200),
          notes TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_tables_event ON seating_tables(event_id);

        CREATE TABLE IF NOT EXISTS seating_assignments (
          id TEXT PRIMARY KEY NOT NULL,
          table_id TEXT NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
          guest_id TEXT NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_assign_table ON seating_assignments(table_id);

        CREATE TABLE IF NOT EXISTS gifts (
          id TEXT PRIMARY KEY NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
          kind TEXT NOT NULL DEFAULT 'gift',
          contributor TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          amount_minor INTEGER NOT NULL DEFAULT 0 CHECK (amount_minor >= 0),
          currency TEXT NOT NULL,
          received_date TEXT,
          thanked INTEGER NOT NULL DEFAULT 0,
          thanked_at TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_gifts_event ON gifts(event_id);

        CREATE TABLE IF NOT EXISTS event_templates (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          base_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notification_settings (
          kind TEXT PRIMARY KEY NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          lead_days INTEGER NOT NULL DEFAULT 0,
          hour INTEGER NOT NULL DEFAULT 9 CHECK (hour BETWEEN 0 AND 23)
        );

        CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

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

/**
 * User-owned tables, in foreign-key order (parents first) so a restore can
 * insert rows without violating constraints. `event_types` is bundled content.
 */
export const USER_TABLES = [
  'events',
  'guest_groups',
  'guests',
  'rsvp_records',
  'invitations',
  'event_budgets',
  'vendors',
  'vendor_contracts',
  'expenses',
  'tasks',
  'timeline_items',
  'seating_tables',
  'seating_assignments',
  'gifts',
  'event_templates',
  'notification_settings',
  'app_settings',
] as const;

/** Children first, for wiping. */
export const USER_TABLES_DELETE_ORDER = [...USER_TABLES].reverse();
