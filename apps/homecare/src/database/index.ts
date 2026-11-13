import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createAssetsRepository } from './repositories/assets';
import { createDocumentsRepository } from './repositories/documents';
import { createExpensesRepository } from './repositories/expenses';
import { createHomesRepository } from './repositories/homes';
import { createHouseholdRepository } from './repositories/household';
import { createInventoryRepository } from './repositories/inventory';
import { createMaintenanceRepository } from './repositories/maintenance';
import { createRepairsRepository } from './repositories/repairs';
import { createPhotosRepository, createSettingsRepository } from './repositories/settings';

export const DATABASE_NAME = 'homecare.db';

export function createRepositories(db: SqlDatabase, now: () => Date = () => new Date()) {
  return {
    db,
    homes: createHomesRepository(db, now),
    assets: createAssetsRepository(db, now),
    maintenance: createMaintenanceRepository(db, now),
    documents: createDocumentsRepository(db, now),
    expenses: createExpensesRepository(db, now),
    repairs: createRepairsRepository(db, now),
    household: createHouseholdRepository(db, now),
    inventory: createInventoryRepository(db, now),
    settings: createSettingsRepository(db, now),
    photos: createPhotosRepository(db, now),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

/** Opens the schema (migrations) and wires repositories. Works with expo-sqlite and the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase, now?: () => Date): Promise<Repositories> {
  // WAL is not supported by every adapter (sql.js in tests): ignore failures, keep FKs mandatory.
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  } catch {
    // ignore
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db, now);
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
