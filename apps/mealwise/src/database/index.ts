import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createGroceryRepository } from './repositories/groceryRepository';
import { createBudgetRepository, createPantryRepository, createPreferencesRepository } from './repositories/pantryBudgetRepository';
import { createPlanRepository, createTemplateRepository } from './repositories/planRepository';
import { createRecipeRepository } from './repositories/recipeRepository';

export const DATABASE_NAME = 'mealwise.db';

export interface Repositories {
  db: SqlDatabase;
  recipes: ReturnType<typeof createRecipeRepository>;
  plan: ReturnType<typeof createPlanRepository>;
  templates: ReturnType<typeof createTemplateRepository>;
  grocery: ReturnType<typeof createGroceryRepository>;
  pantry: ReturnType<typeof createPantryRepository>;
  budget: ReturnType<typeof createBudgetRepository>;
  preferences: ReturnType<typeof createPreferencesRepository>;
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
    recipes: createRecipeRepository(db),
    plan: createPlanRepository(db),
    templates: createTemplateRepository(db),
    grocery: createGroceryRepository(db),
    pantry: createPantryRepository(db),
    budget: createBudgetRepository(db),
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
