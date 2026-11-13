import { migrate, type SqlDatabase } from '@factory/storage';

import { createContentRepository, seedContentIfNeeded } from './contentRepository';
import { migrations } from './migrations';
import { createPreferencesRepository, createProgressRepository } from './progressRepository';

export const DATABASE_NAME = 'logic-quest.db';

export interface Repositories {
  db: SqlDatabase;
  content: ReturnType<typeof createContentRepository>;
  progress: ReturnType<typeof createProgressRepository>;
  preferences: ReturnType<typeof createPreferencesRepository>;
}

/** Migrates, seeds and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  await seedContentIfNeeded(db);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return { db, content: createContentRepository(db), progress: createProgressRepository(db), preferences: createPreferencesRepository(db) };
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
