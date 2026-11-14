import { migrate, wipeTables, type SqlDatabase } from '@factory/storage';

import { USER_TABLES, migrations } from './migrations';
import { createBookingRepository } from './repositories/bookings';
import { createChecklistRepository } from './repositories/checklists';
import { createCurrencyRepository } from './repositories/currency';
import { createDocumentRepository } from './repositories/documents';
import { createExpenseRepository } from './repositories/expenses';
import { createItineraryRepository } from './repositories/itinerary';
import { createJournalRepository } from './repositories/journal';
import { createPackingRepository } from './repositories/packing';
import { createPlaceRepository } from './repositories/places';
import { createSettingsRepository } from './repositories/settings';
import { createTripRepository } from './repositories/trips';
import { createWeatherRepository } from './repositories/weather';

export const DATABASE_NAME = 'travelwise.db';

export interface Repositories {
  db: SqlDatabase;
  trips: ReturnType<typeof createTripRepository>;
  settings: ReturnType<typeof createSettingsRepository>;
  itinerary: ReturnType<typeof createItineraryRepository>;
  bookings: ReturnType<typeof createBookingRepository>;
  packing: ReturnType<typeof createPackingRepository>;
  expenses: ReturnType<typeof createExpenseRepository>;
  currency: ReturnType<typeof createCurrencyRepository>;
  documents: ReturnType<typeof createDocumentRepository>;
  checklists: ReturnType<typeof createChecklistRepository>;
  places: ReturnType<typeof createPlaceRepository>;
  journal: ReturnType<typeof createJournalRepository>;
  weather: ReturnType<typeof createWeatherRepository>;
}

/** Migrates and wires repositories. Pure: works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  // foreign_keys must be ON for every connection: trip deletion relies on ON DELETE CASCADE.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return {
    db,
    trips: createTripRepository(db),
    settings: createSettingsRepository(db),
    itinerary: createItineraryRepository(db),
    bookings: createBookingRepository(db),
    packing: createPackingRepository(db),
    expenses: createExpenseRepository(db),
    currency: createCurrencyRepository(db),
    documents: createDocumentRepository(db),
    checklists: createChecklistRepository(db),
    places: createPlaceRepository(db),
    journal: createJournalRepository(db),
    weather: createWeatherRepository(db),
  };
}

/** Deletes every row of every user table (used by "Delete all my data"). Files are removed by the caller. */
export async function wipeAllData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, USER_TABLES);
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
