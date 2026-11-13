import { createTestDatabase } from '@factory/testing';

import { BackupError, createBackup, createKeyValueStore, createMemoryStorage, fromJson, migrate, parseBackup, restoreBackup, wipeTables, type Migration } from '../index';

const migrations: Migration[] = [
  { version: 1, name: 'notes', up: (db) => db.execAsync('CREATE TABLE notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL)') },
  { version: 2, name: 'tag', up: (db) => db.execAsync('ALTER TABLE notes ADD COLUMN tag TEXT') },
];

describe('migrate', () => {
  it('applies pending migrations once', async () => {
    const db = await createTestDatabase();
    expect(await migrate(db, migrations)).toBe(2);
    expect(await migrate(db, migrations)).toBe(2);
    await db.runAsync('INSERT INTO notes (body, tag) VALUES (?, ?)', ['hi', 't']);
    expect(await db.getAllAsync('SELECT * FROM notes', [])).toHaveLength(1);
  });

  it('rolls back a failing migration and keeps the previous version', async () => {
    const db = await createTestDatabase();
    const broken: Migration[] = [migrations[0]!, { version: 2, name: 'broken', up: (d) => d.execAsync('ALTER TABLE missing ADD COLUMN x TEXT') }];
    await expect(migrate(db, broken)).rejects.toThrow();
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(1);
  });

  it('rejects non-contiguous migrations', async () => {
    const db = await createTestDatabase();
    await expect(migrate(db, [{ ...migrations[1]! }])).rejects.toThrow(/contiguous/);
  });
});

describe('backup', () => {
  it('round-trips user tables and ignores unknown columns', async () => {
    const db = await createTestDatabase();
    await migrate(db, migrations);
    await db.runAsync('INSERT INTO notes (id, body, tag) VALUES (1, ?, ?)', ['hello', 'a']);
    const backup = await createBackup(db, { appId: 'demo', tables: ['notes'], now: new Date('2026-01-01') });
    backup.tables.notes![0]!.unknown_column = 'x';
    const raw = JSON.stringify(backup);

    await wipeTables(db, ['notes']);
    expect(await db.getAllAsync('SELECT * FROM notes', [])).toHaveLength(0);

    const { restoredRows } = await restoreBackup(db, parseBackup(raw, 'demo'), { tables: ['notes'], currentSchemaVersion: 2 });
    expect(restoredRows).toBe(1);
    expect(await db.getFirstAsync('SELECT body, tag FROM notes WHERE id = 1', [])).toEqual({ body: 'hello', tag: 'a' });
  });

  it('rejects invalid files, other apps and newer schemas', async () => {
    expect(() => parseBackup('not json', 'demo')).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ format: 'x' }), 'demo')).toThrow(BackupError);
    const other = JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'other', schemaVersion: 1, createdAt: '', tables: {} });
    expect(() => parseBackup(other, 'demo')).toThrow(expect.objectContaining({ code: 'wrong_app' }));
    const db = await createTestDatabase();
    await migrate(db, migrations);
    const newer = parseBackup(JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'demo', schemaVersion: 9, createdAt: '', tables: {} }), 'demo');
    await expect(restoreBackup(db, newer, { tables: ['notes'], currentSchemaVersion: 2 })).rejects.toMatchObject({ code: 'newer_schema' });
  });

  it('refuses unsafe table identifiers', async () => {
    const db = await createTestDatabase();
    await expect(wipeTables(db, ['notes; DROP TABLE x'])).rejects.toThrow(/Unsafe/);
  });
});

describe('key-value store', () => {
  it('namespaces keys, parses JSON and clears only its namespace', async () => {
    const backend = createMemoryStorage();
    const a = createKeyValueStore(backend, 'a');
    const b = createKeyValueStore(backend, 'b');
    await a.set('k', { n: 1 });
    await b.set('k', 2);
    expect(await a.get('k', null)).toEqual({ n: 1 });
    await a.clear();
    expect(await a.get('k', 'fallback')).toBe('fallback');
    expect(await b.get('k', 0)).toBe(2);
  });

  it('falls back on corrupted JSON', () => {
    expect(fromJson('{oops', 7)).toBe(7);
  });
});
