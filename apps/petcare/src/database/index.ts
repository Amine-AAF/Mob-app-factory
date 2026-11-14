import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createRepositories, type Repositories } from './repositories';

export const DATABASE_NAME = 'petcare.db';

export type { Repositories };

/** Migrates and wires repositories. Pure: works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

let current: Repositories | null = null;

export function setRepositories(r: Repositories): void {
  current = r;
}

/** Repositories singleton, available once the root layout has booted. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
