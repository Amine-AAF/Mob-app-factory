import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createCareRepository, createGoalRepository, createSettingsRepository } from './repositories/careGoalsSettingsRepository';
import { createOutfitRepository } from './repositories/outfitRepository';
import { createPlannerRepository } from './repositories/plannerRepository';
import { createShoppingRepository, createWishlistRepository } from './repositories/shoppingRepository';
import { createTaxonomyRepository } from './repositories/taxonomyRepository';
import { createTripRepository } from './repositories/tripRepository';
import { createWardrobeRepository } from './repositories/wardrobeRepository';

export const DATABASE_NAME = 'closetwise.db';

/**
 * expo-sqlite cannot nest `withTransactionAsync`. Repositories compose each other
 * (e.g. adding an outfit to a trip also adds its items), so nested calls join the
 * outermost transaction instead of failing.
 */
export function reentrantTransactions(db: SqlDatabase): SqlDatabase {
  let depth = 0;
  return {
    execAsync: (s) => db.execAsync(s),
    runAsync: (s, p) => db.runAsync(s, p),
    getAllAsync: (s, p) => db.getAllAsync(s, p),
    getFirstAsync: (s, p) => db.getFirstAsync(s, p),
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

export function createRepositories(raw: SqlDatabase) {
  const db = reentrantTransactions(raw);
  const taxonomy = createTaxonomyRepository(db);
  const planner = createPlannerRepository(db);
  return {
    db,
    taxonomy,
    wardrobe: createWardrobeRepository(db, taxonomy),
    outfits: createOutfitRepository(db),
    schedules: planner.schedules,
    usage: planner.usage,
    shopping: createShoppingRepository(db),
    wishlist: createWishlistRepository(db),
    trips: createTripRepository(db),
    care: createCareRepository(db),
    goals: createGoalRepository(db),
    settings: createSettingsRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

/** Migrates and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(raw: SqlDatabase): Promise<Repositories> {
  await raw.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(raw, migrations);
  return createRepositories(raw);
}

let current: Repositories | null = null;

export function setRepositories(r: Repositories | null): void {
  current = r;
}

/** Repositories singleton, available once the root layout finished booting. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
