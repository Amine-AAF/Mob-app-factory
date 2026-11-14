import { migrate, type SqlDatabase } from '@factory/storage';

import { EVENT_TYPES } from '@/content/eventTypes';

import { migrations } from './migrations';
import { createRepositories, type Clock, type Repositories } from './repositories';

export const DATABASE_NAME = 'eventora.db';

/** Seeds / refreshes bundled event types (idempotent). */
export async function seedEventTypes(db: SqlDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const [i, t] of EVENT_TYPES.entries()) {
      await db.runAsync(
        'INSERT INTO event_types (id, icon, theme, position, builtin) VALUES (?, ?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET icon = excluded.icon, theme = excluded.theme, position = excluded.position',
        [t.id, t.icon, t.theme, i],
      );
    }
  });
}

/** Migrates, seeds and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase, clock: Clock): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  await seedEventTypes(db);
  return createRepositories(db, clock);
}

let current: Repositories | null = null;

export function setRepositories(r: Repositories | null): void {
  current = r;
}

/** Repositories singleton, available once boot finished. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}

export type { Repositories, EventSnapshot } from './repositories';
