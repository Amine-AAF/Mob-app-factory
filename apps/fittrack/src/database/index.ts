import { migrate, type SqlDatabase } from '@factory/storage';

import { LIBRARY, LIBRARY_VERSION } from '@/content/exercises';
import { clock } from '@/services/clock';

import { migrations } from './migrations';
import {
  createBodyRepository,
  createCardioRepository,
  createExercisesRepository,
  createGoalsRepository,
  createPlannerRepository,
  createProgramsRepository,
  createRecordsRepository,
  createSessionsRepository,
  createSettingsRepository,
} from './repositories';

export const DATABASE_NAME = 'fittrack.db';

export interface Repositories {
  db: SqlDatabase;
  exercises: ReturnType<typeof createExercisesRepository>;
  programs: ReturnType<typeof createProgramsRepository>;
  planner: ReturnType<typeof createPlannerRepository>;
  sessions: ReturnType<typeof createSessionsRepository>;
  records: ReturnType<typeof createRecordsRepository>;
  body: ReturnType<typeof createBodyRepository>;
  cardio: ReturnType<typeof createCardioRepository>;
  goals: ReturnType<typeof createGoalsRepository>;
  settings: ReturnType<typeof createSettingsRepository>;
}

/** Migrates, seeds the bundled library and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  const repos = createRepositories(db);
  await repos.exercises.syncLibrary(LIBRARY, LIBRARY_VERSION);
  return repos;
}

export function createRepositories(db: SqlDatabase): Repositories {
  const now = () => clock.now().getTime();
  return {
    db,
    exercises: createExercisesRepository(db, now),
    programs: createProgramsRepository(db, now),
    planner: createPlannerRepository(db, now),
    sessions: createSessionsRepository(db, now),
    records: createRecordsRepository(db),
    body: createBodyRepository(db, now),
    cardio: createCardioRepository(db, now),
    goals: createGoalsRepository(db, now),
    settings: createSettingsRepository(db, now),
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

export { defaultTargets } from './repositories';
export type { CustomExerciseInput, ProgramInput, ScheduleInput, SessionPlanItem, SetInput, TargetInput } from './repositories';
