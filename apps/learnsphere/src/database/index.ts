import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createAgendaRepository } from './repositories/agenda';
import { createFlashcardsRepository } from './repositories/flashcards';
import { createGoalsRepository } from './repositories/goals';
import { createNotesRepository } from './repositories/notes';
import { createPlannerRepository } from './repositories/planner';
import { createQuizRepository } from './repositories/quiz';
import { createSettingsRepository } from './repositories/settings';
import { createSubjectsRepository } from './repositories/subjects';
import { createTemplatesRepository } from './repositories/templates';
import { seedContentIfNeeded } from './seed';

export const DATABASE_NAME = 'learnsphere.db';

export function createRepositories(db: SqlDatabase) {
  return {
    db,
    subjects: createSubjectsRepository(db),
    notes: createNotesRepository(db),
    flashcards: createFlashcardsRepository(db),
    quiz: createQuizRepository(db),
    planner: createPlannerRepository(db),
    agenda: createAgendaRepository(db),
    goals: createGoalsRepository(db),
    settings: createSettingsRepository(db),
    templates: createTemplatesRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

/**
 * expo-sqlite cannot nest `withTransactionAsync` (a second BEGIN fails). Repositories compose
 * (e.g. applying a template creates a recurring series inside a larger transaction), so inner
 * calls join the outer transaction instead of opening a new one.
 */
export function withNestedTransactions(db: SqlDatabase): SqlDatabase {
  let depth = 0;
  return {
    execAsync: (source) => db.execAsync(source),
    runAsync: (source, params) => db.runAsync(source, params),
    getAllAsync: (source, params) => db.getAllAsync(source, params),
    getFirstAsync: (source, params) => db.getFirstAsync(source, params),
    async withTransactionAsync(task) {
      if (depth > 0) return task();
      depth++;
      try {
        await db.withTransactionAsync(task);
      } finally {
        depth--;
      }
    },
  };
}

/** Migrates, seeds and wires repositories. Works with expo-sqlite and with the sql.js test adapter. */
export async function initDatabase(raw: SqlDatabase, opts: { wal?: boolean } = {}): Promise<Repositories> {
  const db = withNestedTransactions(raw);
  if (opts.wal !== false) await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  await seedContentIfNeeded(db);
  return createRepositories(db);
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
