import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createBooksRepository } from './repositories/books';
import { createContentRepository } from './repositories/content';
import { createOrganizeRepository } from './repositories/organize';
import { createReadingRepository } from './repositories/reading';

export const DATABASE_NAME = 'booknest.db';

export interface Repositories {
  db: SqlDatabase;
  books: ReturnType<typeof createBooksRepository>;
  reading: ReturnType<typeof createReadingRepository>;
  content: ReturnType<typeof createContentRepository>;
  organize: ReturnType<typeof createOrganizeRepository>;
}

/** Migrates and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return {
    db,
    books: createBooksRepository(db),
    reading: createReadingRepository(db),
    content: createContentRepository(db),
    organize: createOrganizeRepository(db),
  };
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

export type { LibraryQuery, LibrarySort } from './repositories/books';
export type { NoteInput, QuoteInput, ReviewInput } from './repositories/content';
export type { GoalInput, WishlistInput, WishlistSort } from './repositories/organize';
