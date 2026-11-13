import { BackupError, createBackup, parseBackup, type BackupFile, type SqlDatabase, type SqlValue } from '@factory/storage';

import { LIBRARY, LIBRARY_VERSION } from '@/content/exercises';
import { createExercisesRepository } from '@/database/repositories';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

import { clock } from './clock';

export const APP_ID = 'fittrack';

/**
 * Portable JSON export of every user-owned table (format: docs/backup-format.md).
 * Progress photos are files and are NOT inside the JSON (they never leave the device
 * unless the user shares them); their rows are kept so a restore on the same device
 * re-links them, and missing files are simply hidden.
 */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup), fileName: `fittrack-backup-${stamp}.json`, backup };
}

/** Summary shown before a destructive restore. */
export function describeBackup(raw: string): { sessions: number; programs: number; measurements: number; cardio: number; createdAt: string } {
  const b = parseBackup(raw, APP_ID);
  return {
    sessions: (b.tables.workout_sessions ?? []).filter((s) => s.status === 'completed').length,
    programs: b.tables.workout_programs?.length ?? 0,
    measurements: b.tables.body_measurements?.length ?? 0,
    cardio: b.tables.cardio_activities?.length ?? 0,
    createdAt: b.createdAt,
  };
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Replaces local data with a backup in ONE transaction: foreign keys are deferred to
 * the commit, tables are emptied children-first and refilled parents-first. Any error
 * rolls everything back, so a bad file can never leave the database half-restored.
 * (The shared `restoreBackup` deletes parents first, which foreign keys forbid here —
 * candidate improvement for @factory/storage, see factory/tracking/fittrack.md.)
 */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  if (backup.schemaVersion > SCHEMA_VERSION) throw new BackupError('newer_schema');
  let restoredRows = 0;
  await db.withTransactionAsync(async () => {
    await db.execAsync('PRAGMA defer_foreign_keys = ON');
    for (const table of [...USER_TABLES].reverse()) await db.runAsync(`DELETE FROM ${table}`, []);
    for (const table of USER_TABLES) {
      const columns = new Set((await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`, [])).map((c) => c.name));
      for (const row of backup.tables[table] ?? []) {
        const keys = Object.keys(row).filter((k) => columns.has(k) && IDENT.test(k));
        if (!keys.length) continue;
        await db.runAsync(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, keys.map((k) => (row[k] ?? null) as SqlValue));
        restoredRows++;
      }
    }
  });
  // Library rows may come from an older app version: re-sync them (also restores reference tables).
  await db.runAsync("DELETE FROM user_settings WHERE key = 'library_version'", []);
  await createExercisesRepository(db, () => clock.now().getTime()).syncLibrary(LIBRARY, LIBRARY_VERSION);
  return { restoredRows };
}

/** Erases every user-owned row and re-seeds the bundled library. Photo files are deleted by the caller. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of [...USER_TABLES].reverse()) await db.runAsync(`DELETE FROM ${table}`, []);
    await db.runAsync('DELETE FROM subscription_cache', []);
  });
  await createExercisesRepository(db, () => clock.now().getTime()).syncLibrary(LIBRARY, LIBRARY_VERSION);
}

/* ------------------------------------------------------------------ CSV (Premium) */

const csvCell = (v: SqlValue | undefined) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Quote when needed; neutralize spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(rows: Record<string, SqlValue>[], columns: string[]): string {
  return [columns.join(','), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(','))].join('\n');
}

/** Workout sets, cardio and body measurements as CSV files (metric units, ISO dates). */
export async function exportCsv(db: SqlDatabase, exerciseName: (id: string) => string): Promise<{ fileName: string; content: string }[]> {
  const sets = await db.getAllAsync<Record<string, SqlValue>>(
    `SELECT ws.day AS date, ws.name AS workout, se.exercise_id AS exercise_id, es.set_index + 1 AS set_number, es.reps AS reps,
            es.weight_kg AS weight_kg, es.duration_sec AS duration_sec, es.distance_m AS distance_m
     FROM exercise_sets es JOIN session_exercises se ON se.id = es.session_exercise_id JOIN workout_sessions ws ON ws.id = se.session_id
     WHERE ws.status = 'completed' ORDER BY ws.started_at, se.position, es.set_index`,
    [],
  );
  for (const s of sets) s.exercise = exerciseName(String(s.exercise_id));
  const cardio = await db.getAllAsync<Record<string, SqlValue>>('SELECT day AS date, type, duration_sec, distance_m, calories, calories_source, note FROM cardio_activities ORDER BY day', []);
  const body = await db.getAllAsync<Record<string, SqlValue>>('SELECT day AS date, kind, custom_name, value, note FROM body_measurements ORDER BY day', []);
  return [
    { fileName: 'fittrack-workouts.csv', content: toCsv(sets, ['date', 'workout', 'exercise', 'set_number', 'reps', 'weight_kg', 'duration_sec', 'distance_m']) },
    { fileName: 'fittrack-cardio.csv', content: toCsv(cardio, ['date', 'type', 'duration_sec', 'distance_m', 'calories', 'calories_source', 'note']) },
    { fileName: 'fittrack-body.csv', content: toCsv(body, ['date', 'kind', 'custom_name', 'value', 'note']) },
  ];
}
