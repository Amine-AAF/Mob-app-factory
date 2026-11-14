import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import {
  createAchievementsRepository,
  createHabitsRepository,
  createLogsRepository,
  createRemindersRepository,
  createSettingsRepository,
  createTasksRepository,
} from './repositories';

export const DATABASE_NAME = 'habitflow.db';

export interface Repositories {
  db: SqlDatabase;
  habits: ReturnType<typeof createHabitsRepository>;
  logs: ReturnType<typeof createLogsRepository>;
  tasks: ReturnType<typeof createTasksRepository>;
  reminders: ReturnType<typeof createRemindersRepository>;
  achievements: ReturnType<typeof createAchievementsRepository>;
  settings: ReturnType<typeof createSettingsRepository>;
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
    habits: createHabitsRepository(db),
    logs: createLogsRepository(db),
    tasks: createTasksRepository(db),
    reminders: createRemindersRepository(db),
    achievements: createAchievementsRepository(db),
    settings: createSettingsRepository(db),
  };
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

export { loadSnapshot } from './repositories';
export type { HabitInput, LogWrite, TaskInput } from './repositories';
