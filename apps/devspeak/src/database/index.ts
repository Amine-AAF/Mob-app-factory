import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createContentRepository } from './repositories/contentRepository';
import { createPreferencesRepository, createProfileRepository } from './repositories/profileRepository';
import { createProgressRepository } from './repositories/progressRepository';
import { seedContentIfNeeded } from './seed';

export const DATABASE_NAME = 'devspeak.db';

export interface Repositories {
  db: SqlDatabase;
  content: ReturnType<typeof createContentRepository>;
  progress: ReturnType<typeof createProgressRepository>;
  profile: ReturnType<typeof createProfileRepository>;
  preferences: ReturnType<typeof createPreferencesRepository>;
}

/** Migrates, seeds and wires repositories. Pure: works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  await seedContentIfNeeded(db);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return {
    db,
    content: createContentRepository(db),
    progress: createProgressRepository(db),
    profile: createProfileRepository(db),
    preferences: createPreferencesRepository(db),
  };
}

let current: Repositories | null = null;

export function setRepositories(repos: Repositories): void {
  current = repos;
}

/** Repositories singleton, available after the root layout finished booting. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
