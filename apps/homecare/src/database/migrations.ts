import type { Migration } from '@factory/storage';

/**
 * HomeCare schema.
 *
 * Conventions
 * - Primary keys are random TEXT ids (see `newId`) so backups can be restored and,
 *   later, synced without id collisions.
 * - Calendar dates (due dates, purchase dates, expiry dates) are local day keys `YYYY-MM-DD`:
 *   they mean "that day wherever the user is", so a time-zone change never moves a due date.
 *   Timestamps (`created_at`, `updated_at`) are ISO-8601 UTC.
 * - Money is stored as integer minor units (`*_minor`) + an ISO 4217 `currency` column.
 *   Amounts in different currencies are never summed (see domain/money.ts).
 * - Files (documents, photos) are NEVER stored as BLOBs: only metadata and a path relative
 *   to the app's private document directory (see services/files.ts).
 * - Never edit a shipped migration: add a new one with the next version number.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS homes (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,                     -- apartment | house | villa | studio | other
          area_m2 REAL,                           -- canonical metric; displayed in the user's unit
          rooms_count INTEGER,
          address TEXT,
          move_in_date TEXT,                      -- YYYY-MM-DD
          description TEXT,
          currency TEXT NOT NULL,                 -- default currency for new amounts in this home
          monthly_budget_minor INTEGER,           -- in the home currency
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,                     -- living | kitchen | bedroom | bathroom | garage | garden | office | other
          position INTEGER NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_rooms_home ON rooms(home_id, position);

        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          brand TEXT,
          model TEXT,
          serial_number TEXT,
          purchase_date TEXT,
          purchase_price_minor INTEGER,
          currency TEXT,
          vendor TEXT,
          warranty_end TEXT,
          status TEXT NOT NULL DEFAULT 'active',  -- active | in_repair | replaced | out_of_service
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_assets_home ON assets(home_id, category);
        CREATE INDEX IF NOT EXISTS idx_assets_room ON assets(room_id);
        CREATE INDEX IF NOT EXISTS idx_assets_warranty ON assets(home_id, warranty_end);

        -- Timeline of an asset (creation, status changes). Maintenance and repairs have their own tables.
        CREATE TABLE IF NOT EXISTS asset_events (
          id TEXT PRIMARY KEY NOT NULL,
          asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
          kind TEXT NOT NULL,                     -- created | status | updated
          detail TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_asset_events ON asset_events(asset_id, created_at);

        CREATE TABLE IF NOT EXISTS maintenance_tasks (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          template_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          frequency TEXT NOT NULL,                -- once | daily | weekly | monthly | quarterly | semiannual | annual | custom
          interval_value INTEGER,                 -- custom only
          interval_unit TEXT,                     -- custom only: day | week | month | year
          last_done TEXT,
          next_due TEXT,                          -- NULL when a one-off task is completed
          estimated_minutes INTEGER,
          priority TEXT NOT NULL DEFAULT 'medium',-- low | medium | high | urgent
          estimated_cost_minor INTEGER,
          currency TEXT,
          notes TEXT,
          reminder_enabled INTEGER NOT NULL DEFAULT 1,
          reminder_days_before INTEGER,           -- NULL = use the category default
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_mtasks_due ON maintenance_tasks(home_id, active, next_due);
        CREATE INDEX IF NOT EXISTS idx_mtasks_asset ON maintenance_tasks(asset_id);

        CREATE TABLE IF NOT EXISTS maintenance_history (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
          action TEXT NOT NULL,                   -- completed | postponed | skipped
          done_on TEXT NOT NULL,                  -- YYYY-MM-DD
          previous_due TEXT,
          new_due TEXT,
          cost_minor INTEGER,
          currency TEXT,
          duration_minutes INTEGER,
          notes TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_mhistory_task ON maintenance_history(task_id, done_on);
        CREATE INDEX IF NOT EXISTS idx_mhistory_home ON maintenance_history(home_id, done_on);
        CREATE INDEX IF NOT EXISTS idx_mhistory_asset ON maintenance_history(asset_id);

        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL,                     -- invoice | warranty | contract | manual | certificate | insurance | property | maintenance | other
          file_path TEXT,                         -- relative to the app document directory
          file_name TEXT,
          mime_type TEXT,
          size_bytes INTEGER,
          issue_date TEXT,
          expiry_date TEXT,
          reminder_days_before INTEGER,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_docs_home ON documents(home_id, type);
        CREATE INDEX IF NOT EXISTS idx_docs_asset ON documents(asset_id);
        CREATE INDEX IF NOT EXISTS idx_docs_expiry ON documents(home_id, expiry_date);

        CREATE TABLE IF NOT EXISTS recurring_expenses (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          amount_minor INTEGER NOT NULL,
          currency TEXT NOT NULL,
          frequency TEXT NOT NULL,                -- weekly | monthly | quarterly | semiannual | annual
          start_date TEXT NOT NULL,
          next_date TEXT NOT NULL,                -- next occurrence not yet recorded
          end_date TEXT,
          payment_method TEXT,
          auto_record INTEGER NOT NULL DEFAULT 1, -- 1: occurrences are added to expenses when due
          reminder_enabled INTEGER NOT NULL DEFAULT 1,
          active INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_rexp_next ON recurring_expenses(home_id, active, next_date);

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          title TEXT,
          amount_minor INTEGER NOT NULL,
          currency TEXT NOT NULL,
          spent_on TEXT NOT NULL,
          payment_method TEXT,
          asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
          recurring_id TEXT REFERENCES recurring_expenses(id) ON DELETE SET NULL,
          occurrence_date TEXT,                   -- recurring occurrence this row materialises
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_exp_home_date ON expenses(home_id, spent_on);
        CREATE INDEX IF NOT EXISTS idx_exp_asset ON expenses(asset_id);
        -- A recurring occurrence is recorded at most once (idempotent catch-up).
        CREATE UNIQUE INDEX IF NOT EXISTS idx_exp_recurring_once ON expenses(recurring_id, occurrence_date) WHERE recurring_id IS NOT NULL;

        CREATE TABLE IF NOT EXISTS repairs (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          problem TEXT,
          status TEXT NOT NULL,                   -- reported | scheduled | in_progress | completed | cancelled
          reported_on TEXT NOT NULL,
          scheduled_on TEXT,
          completed_on TEXT,
          provider TEXT,
          provider_contact TEXT,
          cost_minor INTEGER,
          currency TEXT,
          under_warranty INTEGER NOT NULL DEFAULT 0,
          outcome TEXT,
          document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_repairs_home ON repairs(home_id, status);
        CREATE INDEX IF NOT EXISTS idx_repairs_asset ON repairs(asset_id);

        CREATE TABLE IF NOT EXISTS household_members (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS household_tasks (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          assignee_id TEXT REFERENCES household_members(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'medium',
          due_date TEXT,
          recurrence TEXT NOT NULL DEFAULT 'once',-- once | daily | weekly | monthly | custom
          interval_value INTEGER,
          interval_unit TEXT,
          completed_at TEXT,                      -- set for completed one-off tasks
          reminder_enabled INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_htasks_due ON household_tasks(home_id, completed_at, due_date);

        CREATE TABLE IF NOT EXISTS household_checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT NOT NULL REFERENCES household_tasks(id) ON DELETE CASCADE,
          label TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_hchecklist ON household_checklist_items(task_id, position);

        CREATE TABLE IF NOT EXISTS household_task_history (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT NOT NULL REFERENCES household_tasks(id) ON DELETE CASCADE,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          member_id TEXT REFERENCES household_members(id) ON DELETE SET NULL,
          completed_on TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_hhistory ON household_task_history(home_id, completed_on);

        CREATE TABLE IF NOT EXISTS inventory_items (
          id TEXT PRIMARY KEY NOT NULL,
          home_id TEXT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          estimated_value_minor INTEGER,          -- per unit
          currency TEXT,
          purchase_date TEXT,
          document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_inventory_home ON inventory_items(home_id, category);

        -- Photos for homes, rooms, assets, repairs (before/after) and inventory items.
        CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY NOT NULL,
          owner_type TEXT NOT NULL,               -- home | room | asset | repair | inventory
          owner_id TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'photo',     -- photo | before | after
          file_path TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_photos_owner ON photos(owner_type, owner_id);

        CREATE TABLE IF NOT EXISTS notification_settings (
          category TEXT PRIMARY KEY NOT NULL,     -- maintenance | warranty | document | recurring_expense | repair | household
          enabled INTEGER NOT NULL,
          days_before INTEGER NOT NULL,
          hour INTEGER NOT NULL,
          minute INTEGER NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

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
 * Tables included in backups and erased by "Delete all my data", in parent → child
 * order so a restore satisfies foreign keys while inserting.
 */
export const USER_TABLES = [
  'homes',
  'rooms',
  'assets',
  'asset_events',
  'documents',
  'maintenance_tasks',
  'maintenance_history',
  'recurring_expenses',
  'expenses',
  'repairs',
  'household_members',
  'household_tasks',
  'household_checklist_items',
  'household_task_history',
  'inventory_items',
  'photos',
  'notification_settings',
  'app_settings',
] as const;
