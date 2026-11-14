import { createTestDatabase } from '@factory/testing';

import { initDatabase } from '@/database';
import { createMemoryFileStore } from '@/services/files/fileStore';
import { createWorkspace } from '@/services/files/workspace';
import { initialEditState } from '@/types/image';

const now = '2026-11-13T10:00:00.000Z';

// sql.js (SQLite in WebAssembly) can take several seconds to initialise on a cold CI runner.
jest.setTimeout(60_000);

describe('database (metadata only)', () => {
  it('migrates and stores projects without any image data', async () => {
    const db = await createTestDatabase();
    const repos = await initDatabase(db);
    const edit = { ...initialEditState(), watermark: { kind: 'logo' as const, text: '', logoUri: 'file:///docs/sources/logo.png', anchor: 'center' as const, size: 0.2, opacity: 0.5, color: '#FFF', tiled: false } };
    await repos.projects.save(
      {
        id: 'p1',
        kind: 'edit',
        title: 'a-edited.jpg',
        sourceUri: 'file:///docs/sources/a.jpg',
        sourceName: 'a.jpg',
        editState: edit,
        operations: ['crop', 'filter'],
        outputUri: 'file:///docs/outputs/a-edited.jpg',
        outputName: 'a-edited.jpg',
        outputFormat: 'jpeg',
        outputBytes: 1234,
        outputWidth: 100,
        outputHeight: 80,
        inputBytes: 5000,
        itemCount: 1,
      },
      now,
    );
    const [p] = await repos.projects.list();
    expect(p).toMatchObject({ id: 'p1', kind: 'edit', operations: ['crop', 'filter'], outputFormat: 'jpeg' });
    expect(p?.editState?.watermark?.logoUri).toBe('file:///docs/sources/logo.png');
    expect(await repos.projects.referencedFiles()).toEqual(new Set(['file:///docs/sources/a.jpg', 'file:///docs/outputs/a-edited.jpg', 'file:///docs/sources/logo.png']));
    // No BLOB column anywhere in the schema.
    const columns = await db.getAllAsync<{ type: string }>("SELECT type FROM pragma_table_info('projects')", []);
    expect(columns.every((c) => c.type !== 'BLOB')).toBe(true);
    expect(await repos.projects.remove('p1')).toMatchObject({ id: 'p1' });
    expect(await repos.projects.count()).toBe(0);
  });

  it('stores preferences, tool usage and rewarded unlocks', async () => {
    const repos = await initDatabase(await createTestDatabase());
    expect(await repos.preferences.get()).toMatchObject({ theme: 'system', defaultFormat: 'jpeg', keepProjects: true });
    await repos.preferences.update({ theme: 'dark', language: 'fr', keepProjects: false });
    expect(await repos.preferences.get()).toMatchObject({ theme: 'dark', language: 'fr', keepProjects: false });
    await repos.toolUsage.record('compress', now);
    await repos.toolUsage.record('compress', now);
    await repos.toolUsage.record('resize', now);
    expect((await repos.toolUsage.top(2))[0]).toEqual({ toolId: 'compress', uses: 2 });
    expect(await repos.usage.consumeUnlock('2026-11-13')).toBe(false);
    await repos.usage.addUnlock('2026-11-13');
    expect(await repos.usage.consumeUnlock('2026-11-13')).toBe(true);
    expect(await repos.usage.consumeUnlock('2026-11-13')).toBe(false);
  });
});

describe('workspace (temporary files & originals)', () => {
  it('sweeps leftovers of interrupted jobs at start-up', async () => {
    const fs = createMemoryFileStore();
    const ws = createWorkspace(fs);
    const dir = await ws.createJobDir('job_1');
    await fs.writeBytes(fs.join(dir, 'tmp.jpg'), new Uint8Array([1]));
    await fs.writeBytes(fs.join(fs.join(fs.cacheRoot, 'ImagePicker'), 'x.jpg'), new Uint8Array([1]));
    await fs.writeBytes(fs.join(ws.previewDir(), 'p.jpg'), new Uint8Array([1]));
    expect(await ws.sweepTemporaryFiles()).toBeGreaterThanOrEqual(3);
    expect([...fs.files.keys()]).toEqual([]);
  });

  it('never deletes files outside its own folders and rejects path traversal', async () => {
    const fs = createMemoryFileStore();
    const ws = createWorkspace(fs);
    await fs.writeBytes('mem://elsewhere/photo.jpg', new Uint8Array([1]));
    await ws.deleteOwned('mem://elsewhere/photo.jpg');
    await ws.discardTemporary('mem://elsewhere/photo.jpg');
    await ws.deleteOwned(`${ws.outputsDir()}/../../elsewhere/photo.jpg`);
    expect(await fs.exists('mem://elsewhere/photo.jpg')).toBe(true);
    expect(() => ws.createJobDir('../evil')).rejects.toThrow();
  });

  it('prunes private source copies that no project references', async () => {
    const fs = createMemoryFileStore();
    const ws = createWorkspace(fs);
    const keep = fs.join(ws.sourcesDir(), 'keep.jpg');
    const drop = fs.join(ws.sourcesDir(), 'drop.jpg');
    await fs.writeBytes(keep, new Uint8Array([1]));
    await fs.writeBytes(drop, new Uint8Array([1]));
    expect(await ws.pruneSources(new Set([keep]))).toBe(1);
    expect(await fs.exists(keep)).toBe(true);
    expect(await fs.exists(drop)).toBe(false);
  });
});
