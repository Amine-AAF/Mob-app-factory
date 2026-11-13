import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createAccountsRepository, createCategoriesRepository, createRatesRepository, createSettingsRepository } from './repositories/core';
import { createBudgetsRepository, createGoalsRepository, createRecurringRepository, createSubscriptionsRepository } from './repositories/planning';
import { createTransactionsRepository } from './repositories/transactions';

export const DATABASE_NAME = 'spendwise.db';

export interface Repositories {
  db: SqlDatabase;
  settings: ReturnType<typeof createSettingsRepository>;
  accounts: ReturnType<typeof createAccountsRepository>;
  categories: ReturnType<typeof createCategoriesRepository>;
  transactions: ReturnType<typeof createTransactionsRepository>;
  budgets: ReturnType<typeof createBudgetsRepository>;
  recurring: ReturnType<typeof createRecurringRepository>;
  subscriptions: ReturnType<typeof createSubscriptionsRepository>;
  goals: ReturnType<typeof createGoalsRepository>;
  rates: ReturnType<typeof createRatesRepository>;
}

/** Migrates, seeds built-in categories and wires repositories. Works with expo-sqlite and the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  const repos = createRepositories(db);
  await repos.categories.seedDefaults();
  return repos;
}

export function createRepositories(db: SqlDatabase): Repositories {
  const transactions = createTransactionsRepository(db);
  return {
    db,
    settings: createSettingsRepository(db),
    accounts: createAccountsRepository(db),
    categories: createCategoriesRepository(db),
    transactions,
    budgets: createBudgetsRepository(db),
    recurring: createRecurringRepository(db, transactions),
    subscriptions: createSubscriptionsRepository(db),
    goals: createGoalsRepository(db),
    rates: createRatesRepository(db),
  };
}

let current: Repositories | null = null;

export function setRepositories(repos: Repositories | null): void {
  current = repos;
}

/** Repositories singleton, available once the root layout finished booting. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
