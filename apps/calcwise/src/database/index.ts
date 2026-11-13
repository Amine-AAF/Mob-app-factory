import { migrate, wipeTables, type SqlDatabase } from '@factory/storage';

import { DEFAULT_FAVORITES } from '@/constants/tools';
import { createFavoritesRepository, createHistoryRepository } from '@/services/CalculationHistory';

import { migrations, USER_TABLES } from './migrations';

export const DATABASE_NAME = 'calcwise.db';

export interface Repositories {
  db: SqlDatabase;
  history: ReturnType<typeof createHistoryRepository>;
  favorites: ReturnType<typeof createFavoritesRepository>;
}

/** Migrates and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase, now?: () => Date): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  const repos = createRepositories(db, now);
  await repos.favorites.seed(DEFAULT_FAVORITES);
  return repos;
}

export function createRepositories(db: SqlDatabase, now?: () => Date): Repositories {
  return { db, history: createHistoryRepository(db, now), favorites: createFavoritesRepository(db, now) };
}

/** "Delete all my data": history and favorites. Store purchases are unaffected (restorable). */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, USER_TABLES);
  await db.runAsync('DELETE FROM subscription_cache', []);
}

let current: Repositories | null = null;

export function setRepositories(repos: Repositories): void {
  current = repos;
}

/** Repositories singleton, available once the root layout has booted. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}

export function reposOrNull(): Repositories | null {
  return current;
}
