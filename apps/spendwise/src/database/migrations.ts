import type { Migration } from '@factory/storage';

/**
 * SQLite schema.
 *
 * Rules:
 * - Never edit a shipped migration: add a new one.
 * - Amounts are INTEGER minor units; every money column has a companion currency.
 * - Accounts and categories with history are archived, never hard-deleted (see repositories).
 * - Foreign keys use the default NO ACTION so that a full restore can run with
 *   `PRAGMA defer_foreign_keys` inside one transaction.
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

        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          currency TEXT NOT NULL,
          initial_balance INTEGER NOT NULL DEFAULT 0,
          color TEXT NOT NULL DEFAULT '#0F766E',
          icon TEXT NOT NULL DEFAULT 'wallet-outline',
          archived INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('expense', 'income')),
          system_key TEXT,
          name TEXT,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_system ON categories(system_key) WHERE system_key IS NOT NULL;

        CREATE TABLE IF NOT EXISTS recurring_rules (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
          amount INTEGER NOT NULL CHECK (amount > 0),
          currency TEXT NOT NULL,
          account_id TEXT NOT NULL REFERENCES accounts(id),
          to_account_id TEXT REFERENCES accounts(id),
          category_id TEXT REFERENCES categories(id),
          description TEXT NOT NULL DEFAULT '',
          frequency TEXT NOT NULL,
          interval INTEGER NOT NULL DEFAULT 1 CHECK (interval >= 1),
          start_date TEXT NOT NULL,
          end_date TEXT,
          auto_post INTEGER NOT NULL DEFAULT 1,
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer', 'refund', 'adjustment')),
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL,
          account_id TEXT NOT NULL REFERENCES accounts(id),
          to_account_id TEXT REFERENCES accounts(id),
          to_amount INTEGER,
          category_id TEXT REFERENCES categories(id),
          date TEXT NOT NULL,
          time TEXT,
          description TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          payment_method TEXT,
          recurring_rule_id TEXT REFERENCES recurring_rules(id),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK ((type = 'adjustment' AND amount <> 0) OR (type <> 'adjustment' AND amount > 0)),
          CHECK ((type = 'transfer') = (to_account_id IS NOT NULL)),
          CHECK (to_account_id IS NULL OR to_account_id <> account_id)
        );
        CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date DESC, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id, date);
        CREATE INDEX IF NOT EXISTS idx_tx_to_account ON transactions(to_account_id) WHERE to_account_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id, date);
        CREATE INDEX IF NOT EXISTS idx_tx_rule ON transactions(recurring_rule_id) WHERE recurring_rule_id IS NOT NULL;

        -- Idempotency ledger: one row per (rule, due date), whatever happened to it.
        CREATE TABLE IF NOT EXISTS recurring_occurrences (
          rule_id TEXT NOT NULL REFERENCES recurring_rules(id),
          occurrence_date TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('posted', 'skipped')),
          transaction_id TEXT,
          created_at TEXT NOT NULL,
          PRIMARY KEY (rule_id, occurrence_date)
        );

        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY NOT NULL,
          month TEXT NOT NULL UNIQUE,
          currency TEXT NOT NULL,
          total_limit INTEGER CHECK (total_limit IS NULL OR total_limit >= 0),
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS budget_categories (
          budget_id TEXT NOT NULL REFERENCES budgets(id),
          category_id TEXT NOT NULL REFERENCES categories(id),
          limit_amount INTEGER NOT NULL CHECK (limit_amount >= 0),
          PRIMARY KEY (budget_id, category_id)
        );

        -- Remembers which budget alerts were already notified (no repeated notifications).
        CREATE TABLE IF NOT EXISTS budget_alert_log (
          budget_id TEXT NOT NULL REFERENCES budgets(id),
          scope TEXT NOT NULL,
          threshold INTEGER NOT NULL,
          sent_at TEXT NOT NULL,
          PRIMARY KEY (budget_id, scope, threshold)
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,
          price INTEGER NOT NULL CHECK (price > 0),
          currency TEXT NOT NULL,
          frequency TEXT NOT NULL,
          interval INTEGER NOT NULL DEFAULT 1 CHECK (interval >= 1),
          start_date TEXT NOT NULL,
          end_date TEXT,
          category_id TEXT REFERENCES categories(id),
          reminder_days INTEGER,
          active INTEGER NOT NULL DEFAULT 1,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS savings_goals (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          target INTEGER NOT NULL CHECK (target > 0),
          currency TEXT NOT NULL,
          target_date TEXT,
          description TEXT NOT NULL DEFAULT '',
          color TEXT NOT NULL,
          icon TEXT NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS savings_contributions (
          id TEXT PRIMARY KEY NOT NULL,
          goal_id TEXT NOT NULL REFERENCES savings_goals(id),
          amount INTEGER NOT NULL CHECK (amount <> 0),
          date TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_contrib_goal ON savings_contributions(goal_id, date);

        CREATE TABLE IF NOT EXISTS exchange_rates (
          currency TEXT PRIMARY KEY NOT NULL,
          rate TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'manual',
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
 * User-owned tables, in PARENT-FIRST order (insert order for restore; reverse it to delete).
 * `subscription_cache` is deliberately excluded: entitlements come from the store.
 */
export const USER_TABLES = [
  'user_settings',
  'accounts',
  'categories',
  'recurring_rules',
  'transactions',
  'recurring_occurrences',
  'budgets',
  'budget_categories',
  'budget_alert_log',
  'subscriptions',
  'savings_goals',
  'savings_contributions',
  'exchange_rates',
] as const;
