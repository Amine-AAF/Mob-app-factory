import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

export const APP_ID = 'petcare';

/** Embedded files are optional: a metadata-only backup stays small and shareable. */
export interface PetCareBackup extends BackupFile {
  files?: { documents: Record<string, string>; photos: Record<string, string> };
}

export interface FileAccess {
  list(kind: 'documents' | 'photos'): string[];
  read(kind: 'documents' | 'photos', name: string): Promise<string>;
  write(kind: 'documents' | 'photos', name: string, base64: string): void;
}

/** Upper bound for embedded files so a backup never exhausts memory. */
export const MAX_EMBEDDED_BYTES = 40 * 1024 * 1024;

export async function exportUserData(
  db: SqlDatabase,
  opts: { now?: Date; files?: FileAccess; referenced?: { documents: string[]; photos: string[] } } = {},
): Promise<{ json: string; fileName: string; backup: PetCareBackup; skippedFiles: number }> {
  const now = opts.now ?? new Date();
  const backup: PetCareBackup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  let skippedFiles = 0;
  if (opts.files && opts.referenced) {
    const files: NonNullable<PetCareBackup['files']> = { documents: {}, photos: {} };
    let total = 0;
    for (const kind of ['photos', 'documents'] as const) {
      const present = new Set(opts.files.list(kind));
      for (const name of opts.referenced[kind]) {
        if (!present.has(name)) {
          skippedFiles++;
          continue;
        }
        const data = await opts.files.read(kind, name);
        total += data.length * 0.75;
        if (total > MAX_EMBEDDED_BYTES) {
          skippedFiles++;
          continue;
        }
        files[kind][name] = data;
      }
    }
    backup.files = files;
  }
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup), fileName: `petcare-backup-${stamp}.json`, backup, skippedFiles };
}

export async function importUserData(db: SqlDatabase, raw: string, files?: FileAccess): Promise<{ restoredRows: number; restoredFiles: number }> {
  const backup = parseBackup(raw, APP_ID) as PetCareBackup;
  const { restoredRows } = await restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
  let restoredFiles = 0;
  if (files && backup.files) {
    for (const kind of ['photos', 'documents'] as const) {
      for (const [name, data] of Object.entries(backup.files[kind] ?? {})) {
        if (!/^[A-Za-z0-9._-]+$/.test(name)) continue;
        files.write(kind, name, data);
        restoredFiles++;
      }
    }
  }
  return { restoredRows, restoredFiles };
}

/** Erases every user-owned row (files are removed by the caller via services/files). */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...[...USER_TABLES].reverse(), 'subscription_cache']);
}
