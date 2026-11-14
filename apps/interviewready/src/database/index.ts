import { migrate, type SqlDatabase } from '@factory/storage';

import { USER_TABLES, migrations } from './migrations';
import { createActivityRepository } from './repositories/activityRepository';
import { createLibraryRepository } from './repositories/libraryRepository';
import { createProfileRepository } from './repositories/profileRepository';
import { createReviewRepository } from './repositories/reviewRepository';

export const DATABASE_NAME = 'interviewready.db';

export interface Repositories {
  db: SqlDatabase;
  profile: ReturnType<typeof createProfileRepository>;
  library: ReturnType<typeof createLibraryRepository>;
  activity: ReturnType<typeof createActivityRepository>;
  review: ReturnType<typeof createReviewRepository>;
}

/** Migrates and wires repositories. Pure: works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return {
    db,
    profile: createProfileRepository(db),
    library: createLibraryRepository(db),
    activity: createActivityRepository(db),
    review: createReviewRepository(db),
  };
}

/** "Delete all my data": erases every user table (children first). Content is bundled and unaffected. */
export async function eraseUserData(db: SqlDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of [...USER_TABLES].reverse()) await db.execAsync(`DELETE FROM ${table}`);
  });
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
