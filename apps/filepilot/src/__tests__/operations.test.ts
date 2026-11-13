import { createTestDatabase } from '@factory/testing';
import { PDFDocument } from 'pdf-lib';

import { initDatabase, type Repositories } from '@/database';
import { createMemoryFileStore } from '@/services/files/fileStore';
import { createWorkspace } from '@/services/files/workspace';
import { inspectImage } from '@/services/image/imageEngine';
import type { PdfPageRenderer } from '@/services/pdf/pdfRenderer';
import { createCancelToken, createOperationId, recoverInterruptedOperations, runOperation, type RunnerDeps } from '@/services/operations/runner';
import { compressSpec, convertSpec, extractSpec, imageToPdfSpec, mergeSpec, pdfToImagesSpec, splitSpec, type PdfSource, type ToolEnv } from '@/services/operations/tools';

import { makeJpeg, makePdf, makePng } from './helpers/fixtures';
import { createNodeCodec, decode, encodePng } from './helpers/nodeCodec';

/** Fake renderer: writes a real PNG per page so the orchestration (progress, naming, cleanup) is tested. */
function fakeRenderer(fs: ReturnType<typeof createMemoryFileStore>, available = true): PdfPageRenderer & { rendered: number[] } {
  const rendered: number[] = [];
  return {
    available,
    rendered,
    pageCount: async () => 3,
    async renderPage(o) {
      rendered.push(o.pageIndex);
      await fs.writeBytes(o.outputUri, encodePng({ width: 10, height: 14, data: new Uint8Array(10 * 14 * 4).fill(255) }));
      return { width: 10, height: 14 };
    },
  };
}

async function setup(options: { quotaBytes?: number } = {}) {
  const fs = createMemoryFileStore(options);
  const workspace = createWorkspace(fs);
  const db = await createTestDatabase();
  const repos: Repositories = await initDatabase(db);
  let n = 0;
  const deps: RunnerDeps = { workspace, operations: repos.operations, now: () => new Date('2026-11-13T10:00:00.000Z'), newId: () => `op_test_${++n}` };
  const env: ToolEnv = { fs, codec: createNodeCodec(fs), renderer: fakeRenderer(fs) };
  const pick = async (name: string, bytes: Uint8Array) => {
    const uri = `mem://cache/DocumentPicker/${name}`;
    await fs.writeBytes(uri, bytes);
    return uri;
  };
  const pickImage = async (name: string, bytes: Uint8Array) => inspectImage(fs, await pick(name, bytes), name);
  const pickPdf = async (name: string, pages: number): Promise<PdfSource> => {
    const bytes = await makePdf(pages, name);
    return { uri: await pick(name, bytes), name, size: bytes.length, pageCount: pages };
  };
  const workFiles = () => [...fs.files.keys()].filter((k) => k.includes('/filepilot-work/'));
  return { fs, workspace, repos, deps, env, pick, pickImage, pickPdf, workFiles, db };
}

describe('operation runner guarantees', () => {
  it('commits outputs, records history and cleans temp files', async () => {
    const s = await setup();
    const img = await s.pickImage('Holiday.jpg', makeJpeg(200, 150, 0.98));
    const out = await runOperation(s.deps, compressSpec(s.env, [img], { format: 'jpeg', quality: 0.5 }));
    expect(out.status).toBe('completed');
    if (out.status !== 'completed') return;
    expect(out.outputs[0]?.fileName).toBe('Holiday-compressed.jpg');
    expect(out.outputs[0]?.uri.startsWith('mem://documents/outputs/')).toBe(true);
    expect(out.outputSize).toBeLessThan(out.originalSize);
    expect(s.workFiles()).toEqual([]);

    const row = await s.repos.operations.get(out.id);
    expect(row).toMatchObject({ status: 'completed', operationType: 'image_compress', originalFileName: 'Holiday.jpg', outputFileName: 'Holiday-compressed.jpg', outputCount: 1 });
    expect(row?.outputs[0]?.mimeType).toBe('image/jpeg');
  });

  it('never modifies the original file', async () => {
    const s = await setup();
    const bytes = makeJpeg(120, 90, 0.98);
    const img = await s.pickImage('a.jpg', bytes);
    await runOperation(s.deps, compressSpec(s.env, [img], { format: 'jpeg', quality: 0.3 }));
    expect(await s.fs.readBytes(img.uri)).toEqual(bytes);
  });

  it('never overwrites an existing output', async () => {
    const s = await setup();
    const img = await s.pickImage('a.png', makePng(20, 20));
    const first = await runOperation(s.deps, convertSpec(s.env, img, { format: 'jpeg', quality: 0.9 }));
    const second = await runOperation(s.deps, convertSpec(s.env, img, { format: 'jpeg', quality: 0.5 }));
    if (first.status !== 'completed' || second.status !== 'completed') throw new Error('expected success');
    expect(first.outputs[0]?.fileName).toBe('a.jpg');
    expect(second.outputs[0]?.fileName).toBe('a (2).jpg');
    expect(await s.fs.exists(first.outputs[0]?.uri ?? '')).toBe(true);
  });

  it('reports storage errors clearly and leaves no partial output', async () => {
    const s = await setup({ quotaBytes: 40_000 });
    const img = await s.pickImage('big.jpg', makeJpeg(160, 120, 0.98));
    const out = await runOperation(s.deps, convertSpec(s.env, img, { format: 'png', quality: 1 }));
    expect(out).toMatchObject({ status: 'failed', code: 'storage_full' });
    expect(await s.fs.list('mem://documents/outputs')).toEqual([]);
    expect(s.workFiles()).toEqual([]);
    expect((await s.repos.operations.get(out.id))?.status).toBe('failed');
  });

  it('handles user cancellation', async () => {
    const s = await setup();
    const img = await s.pickImage('a.jpg', makeJpeg(50, 50));
    const token = createCancelToken();
    token.cancel();
    const out = await runOperation(s.deps, compressSpec(s.env, [img], { format: 'jpeg', quality: 0.5 }), token);
    expect(out.status).toBe('cancelled');
    expect((await s.repos.operations.get(out.id))?.status).toBe('cancelled');
    expect(s.workFiles()).toEqual([]);
  });

  it('reports an input deleted before processing as a missing file', async () => {
    const s = await setup();
    const pdf = await s.pickPdf('gone.pdf', 2);
    await s.fs.delete(pdf.uri);
    const out = await runOperation(s.deps, extractSpec(s.env, pdf, [0]));
    expect(out).toMatchObject({ status: 'failed', code: 'file_missing' });
  });

  it('recovers interrupted operations at start-up and sweeps temp files', async () => {
    const s = await setup();
    // Simulate a crash mid-operation: a running row and leftover temp files.
    await s.repos.operations.start({ id: 'op_crashed1', operationType: 'pdf_merge', originalFileName: 'x.pdf', originalSize: 10, inputCount: 2, createdAt: '2026-11-13T09:00:00.000Z' });
    await s.fs.writeBytes('mem://cache/filepilot-work/op_crashed1/merged.pdf', new Uint8Array([1, 2, 3]));
    await s.fs.writeBytes('mem://cache/ImageManipulator/tmp.jpg', new Uint8Array([1]));
    await s.fs.writeBytes('mem://cache/DocumentPicker/old-copy.pdf', new Uint8Array([1]));
    const result = await recoverInterruptedOperations(s.deps);
    expect(result.interrupted).toBe(1);
    expect((await s.repos.operations.get('op_crashed1'))?.status).toBe('interrupted');
    expect([...s.fs.files.keys()].filter((k) => k.startsWith('mem://cache/'))).toEqual([]);
  });

  it('refuses to delete files outside the app cache', async () => {
    const s = await setup();
    await s.fs.writeBytes('mem://documents/outputs/keep.pdf', new Uint8Array([1]));
    await s.workspace.discardTemporary('mem://documents/outputs/keep.pdf');
    expect(await s.fs.exists('mem://documents/outputs/keep.pdf')).toBe(true);
  });

  it('generates unique, safe operation ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createOperationId()));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]{6,64}$/);
  });
});

describe('tool pipelines end-to-end', () => {
  it('batch-compresses several images with real progress', async () => {
    const s = await setup();
    const imgs = [await s.pickImage('a.jpg', makeJpeg(100, 80, 0.98, 1)), await s.pickImage('b.jpg', makeJpeg(90, 60, 0.98, 2))];
    const progress: number[] = [];
    const out = await runOperation(s.deps, { ...compressSpec(s.env, imgs, { format: 'jpeg', quality: 0.5 }), onProgress: (d, t) => progress.push(d / t) });
    if (out.status !== 'completed') throw new Error(out.status);
    expect(out.outputs.map((o) => o.fileName)).toEqual(['a-compressed.jpg', 'b-compressed.jpg']);
    expect(progress[progress.length - 1]).toBe(1);
    expect([...progress].sort((a, b) => a - b)).toEqual(progress); // monotonic
  });

  it('merges PDFs into one valid document', async () => {
    const s = await setup();
    const out = await runOperation(s.deps, mergeSpec(s.env, [await s.pickPdf('one.pdf', 2), await s.pickPdf('two.pdf', 1)]));
    if (out.status !== 'completed') throw new Error(out.status);
    const doc = await PDFDocument.load(await s.fs.readBytes(out.outputs[0]?.uri ?? ''));
    expect(doc.getPageCount()).toBe(3);
    expect(out.outputs[0]?.fileName).toBe('one-merged.pdf');
  });

  it('splits a PDF into named parts', async () => {
    const s = await setup();
    const out = await runOperation(s.deps, splitSpec(s.env, await s.pickPdf('report.pdf', 12), [[0, 1, 2], [9], [10, 11]]));
    if (out.status !== 'completed') throw new Error(out.status);
    expect(out.outputs.map((o) => o.fileName)).toEqual(['report-p01-03.pdf', 'report-p10.pdf', 'report-p11-12.pdf']);
    for (const o of out.outputs) expect((await PDFDocument.load(await s.fs.readBytes(o.uri))).getPageCount()).toBeGreaterThan(0);
  });

  it('extracts pages into a new PDF', async () => {
    const s = await setup();
    const out = await runOperation(s.deps, extractSpec(s.env, await s.pickPdf('r.pdf', 5), [4, 0]));
    if (out.status !== 'completed') throw new Error(out.status);
    const doc = await PDFDocument.load(await s.fs.readBytes(out.outputs[0]?.uri ?? ''));
    expect(doc.getPages().map((p) => p.getWidth())).toEqual([504, 500]);
  });

  it('builds a PDF from images (transparent PNG embedded as PNG, photos as JPEG)', async () => {
    const s = await setup();
    const imgs = [await s.pickImage('scan.jpg', makeJpeg(300, 400)), await s.pickImage('logo.png', makePng(50, 50, true))];
    const out = await runOperation(s.deps, imageToPdfSpec(s.env, imgs, { size: 'a4', orientation: 'auto', margin: 'small', quality: 'standard' }));
    if (out.status !== 'completed') throw new Error(out.status);
    const bytes = await s.fs.readBytes(out.outputs[0]?.uri ?? '');
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
    const text = new TextDecoder('latin1').decode(bytes);
    expect(text).toContain('/DCTDecode'); // JPEG stream
    expect(text).toContain('/SMask'); // PNG alpha preserved
    expect(s.workFiles()).toEqual([]);
  });

  it('renders PDF pages to images page by page', async () => {
    const s = await setup();
    const pdf = await s.pickPdf('deck.pdf', 3);
    const out = await runOperation(s.deps, pdfToImagesSpec(s.env, pdf, [0, 2], { format: 'png', quality: 1, resolution: 'standard' }));
    if (out.status !== 'completed') throw new Error(out.status);
    expect(out.outputs.map((o) => o.fileName)).toEqual(['deck-page-1.png', 'deck-page-3.png']);
    expect(decode(await s.fs.readBytes(out.outputs[0]?.uri ?? ''))).toMatchObject({ width: 10, height: 14 });
  });

  it('says PDF -> image is unavailable without the native renderer (no fake output)', async () => {
    const s = await setup();
    const env = { ...s.env, renderer: fakeRenderer(s.fs, false) };
    const out = await runOperation(s.deps, pdfToImagesSpec(env, await s.pickPdf('d.pdf', 1), [0], { format: 'jpeg', quality: 0.8, resolution: 'screen' }));
    expect(out).toMatchObject({ status: 'failed', code: 'native_unavailable' });
  });
});

describe('history persistence', () => {
  it('persists across database re-open and supports clearing', async () => {
    const s = await setup();
    const img = await s.pickImage('a.jpg', makeJpeg(40, 40));
    await runOperation(s.deps, compressSpec(s.env, [img], { format: 'jpeg', quality: 0.5 }));
    // Re-open: run migrations again on the same database, data must be intact.
    const again = await initDatabase(s.db);
    expect(await again.operations.count()).toBe(1);
    expect((await again.operations.list({ limit: 10 }))[0]?.status).toBe('completed');
    await again.operations.clear();
    expect(await again.operations.count()).toBe(0);
  });

  it('prunes old history and computes saved bytes', async () => {
    const s = await setup();
    for (let i = 0; i < 5; i++) {
      await s.repos.operations.start({ id: `op_prune_${i}`, operationType: 'image_compress', originalFileName: 'a.jpg', originalSize: 1000, inputCount: 1, createdAt: `2026-11-1${i}T10:00:00.000Z` });
      await s.repos.operations.complete(`op_prune_${i}`, [{ fileName: 'a.jpg', uri: `mem://documents/outputs/${i}.jpg`, size: 400, mimeType: 'image/jpeg' }], '2026-11-13T10:00:00.000Z');
    }
    expect(await s.repos.operations.bytesSaved()).toBe(3000);
    expect(await s.repos.operations.prune(2)).toBe(3);
    expect((await s.repos.operations.list({ limit: 10 })).map((o) => o.id)).toEqual(['op_prune_4', 'op_prune_3']);
  });

  it('validates rows before writing', async () => {
    const s = await setup();
    await expect(s.repos.operations.start({ id: 'x', operationType: 'image_compress', originalFileName: 'a', originalSize: 1, inputCount: 1, createdAt: 'now' })).rejects.toThrow();
  });

  it('stores preferences and settings with validation', async () => {
    const s = await setup();
    expect(await s.repos.preferences.get()).toEqual({ language: null, theme: 'system', defaultImageQuality: 80, defaultOutputFormat: 'jpeg' });
    await s.repos.preferences.update({ theme: 'dark', defaultImageQuality: 65, language: 'fr' });
    expect(await s.repos.preferences.get()).toMatchObject({ theme: 'dark', defaultImageQuality: 65, language: 'fr' });
    await expect(s.repos.preferences.update({ defaultImageQuality: 500 })).rejects.toThrow();
    await s.repos.settings.set('onboardingCompleted', true);
    expect(await s.repos.settings.get('onboardingCompleted')).toBe(true);
    expect((await s.repos.settings.all()).sessionCount).toBe(0);
  });

  it('never stores file contents in the database', async () => {
    const s = await setup();
    const img = await s.pickImage('a.jpg', makeJpeg(60, 60));
    await runOperation(s.deps, compressSpec(s.env, [img], { format: 'jpeg', quality: 0.5 }));
    const tables = await s.db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'", []);
    for (const { name } of tables) {
      const cols = await s.db.getAllAsync<{ type: string }>(`PRAGMA table_info(${name})`, []);
      expect(cols.some((c) => /BLOB/i.test(c.type))).toBe(false);
    }
  });
});
