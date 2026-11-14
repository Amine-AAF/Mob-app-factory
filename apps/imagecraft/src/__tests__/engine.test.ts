import { compressToTarget } from '@/features/compression/compress';
import { runBatch } from '@/features/batch-processing/batchRunner';
import { ProcessingError, toErrorCode } from '@/services/files/errors';
import { detectFormat, supportsTransparency } from '@/services/files/formats';
import { readImageHeader } from '@/services/files/imageHeader';
import { outputFileName, uniqueFileName } from '@/services/files/naming';
import { cancelJob, createJob, estimateOutput, exportResult, importPicked, inspectImage, renderToTemp } from '@/services/image/engine';
import { buildRecipe } from '@/services/image/recipe';
import { assertSupported, cropPixels } from '@/services/image/renderer';
import { initialEditState, type SourceImage } from '@/types/image';

import { createTestEnv, jpegHeader, padded, pngHeader, putPicked, webpHeader } from './helpers/fixtures';

const encode = { format: 'jpeg' as const, quality: 80, flattenBackground: '#FFFFFF' };

describe('format detection & headers (content, never the file name)', () => {
  it('detects formats from magic bytes', () => {
    expect(detectFormat(pngHeader(10, 10))).toBe('png');
    expect(detectFormat(jpegHeader(10, 10))).toBe('jpeg');
    expect(detectFormat(webpHeader(10, 10))).toBe('webp');
    expect(detectFormat(new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]))).toBe('heic');
    expect(detectFormat(new Uint8Array([1, 2, 3]))).toBe('unknown');
  });

  it('reads dimensions, alpha and EXIF orientation without decoding', () => {
    expect(readImageHeader(pngHeader(800, 600, true))).toMatchObject({ width: 800, height: 600, hasAlpha: true });
    expect(readImageHeader(jpegHeader(4000, 3000, 6))).toMatchObject({ orientation: 6, displayWidth: 3000, displayHeight: 4000 });
    expect(readImageHeader(webpHeader(1920, 1080, true))).toMatchObject({ width: 1920, height: 1080, hasAlpha: true });
    expect(supportsTransparency('jpeg')).toBe(false);
    expect(supportsTransparency('webp')).toBe(true);
  });
});

describe('import & validation', () => {
  it('imports a picked copy into private storage, even without a file extension', async () => {
    const { env, fs } = createTestEnv();
    const uri = await putPicked(fs, 'IMG_0001', padded(jpegHeader(4032, 3024, 6), 5000));
    const img = await importPicked(env, { uri, name: null });
    expect(img).toMatchObject({ format: 'jpeg', width: 3024, height: 4032, bytes: 5000 });
    expect(env.workspace.isInside(img.uri, env.workspace.sourcesDir())).toBe(true);
    expect(await fs.exists(uri)).toBe(false); // temp copy moved, not duplicated
  });

  it('rejects unsupported formats and removes the temp copy', async () => {
    const { env, fs } = createTestEnv();
    const uri = await putPicked(fs, 'clip.gif', padded(new TextEncoder().encode('GIF89a'), 100));
    await expect(importPicked(env, { uri, name: 'clip.gif' })).rejects.toMatchObject({ code: 'unsupported_format' });
    expect(await fs.exists(uri)).toBe(false);
  });

  it('rejects corrupted, empty, missing and oversized pictures with typed errors', async () => {
    const { fs } = createTestEnv();
    await fs.writeBytes('mem://documents/sources/a.jpg', padded(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), 64));
    await expect(inspectImage(fs, 'mem://documents/sources/a.jpg', 'a.jpg')).rejects.toMatchObject({ code: 'corrupted_file' });
    await fs.writeBytes('mem://documents/sources/empty.png', new Uint8Array());
    await expect(inspectImage(fs, 'mem://documents/sources/empty.png', 'e')).rejects.toMatchObject({ code: 'corrupted_file' });
    await expect(inspectImage(fs, 'mem://documents/sources/none.png', 'n')).rejects.toMatchObject({ code: 'source_expired' });
    await fs.writeBytes('mem://documents/sources/huge.png', pngHeader(20000, 20000));
    await expect(inspectImage(fs, 'mem://documents/sources/huge.png', 'h')).rejects.toMatchObject({ code: 'image_too_large' });
  });

  it('maps native and system errors to user-facing codes', () => {
    expect(toErrorCode(Object.assign(new Error('x'), { code: 'ERR_OUT_OF_MEMORY' }))).toBe('out_of_memory');
    expect(toErrorCode(Object.assign(new Error('x'), { code: 'ERR_CANCELLED' }))).toBe('cancelled');
    expect(toErrorCode(new Error('ENOSPC: no space left on device'))).toBe('storage_full');
    expect(toErrorCode(new Error('SecurityException: permission denied'))).toBe('permission_denied');
    expect(toErrorCode(new ProcessingError('gallery_unsupported'))).toBe('gallery_unsupported');
  });
});

async function makeSource(env: ReturnType<typeof createTestEnv>['env'], fs: ReturnType<typeof createTestEnv>['fs'], w = 4000, h = 3000): Promise<SourceImage> {
  const uri = await putPicked(fs, `p${Math.random()}.jpg`, padded(jpegHeader(w, h), 3_000_000));
  return importPicked(env, { uri, name: 'holiday.jpg' });
}

describe('render pipeline', () => {
  it('renders into a temp folder, verifies the container and commits under a new name', async () => {
    const { env, fs } = createTestEnv();
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    const job = createJob();
    const temp = await renderToTemp(env, job, recipe, src);
    expect(env.workspace.isInside(temp.uri, fs.cacheRoot)).toBe(true);
    const out = await exportResult(env, job, temp, outputFileName(src.name, 'edited', 'jpg'));
    expect(out.name).toBe('holiday-edited.jpg');
    const again = await exportResult(env, createJob(), await renderToTemp(env, createJob(), recipe, src), outputFileName(src.name, 'edited', 'jpg'));
    expect(again.name).toBe('holiday-edited (2).jpg'); // never overwrites
    expect(await fs.exists(src.uri)).toBe(true); // original untouched
  });

  it('refuses an output whose real format differs from the requested one', async () => {
    const { env, fs } = createTestEnv({ wrongFormat: true });
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    await expect(renderToTemp(env, createJob(), recipe, src)).rejects.toMatchObject({ code: 'write_failed' });
  });

  it('reports out-of-memory and full storage as typed errors and leaves no temp file', async () => {
    const { env, fs } = createTestEnv({ failOn: () => Object.assign(new Error('oom'), { code: 'ERR_OUT_OF_MEMORY' }) });
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    await expect(renderToTemp(env, createJob(), recipe, src)).rejects.toMatchObject({ code: 'out_of_memory' });
    const full = createTestEnv({ quotaBytes: 3_100_000 });
    const s2 = await makeSource(full.env, full.fs);
    const r2 = buildRecipe(s2, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 }).recipe;
    await expect(renderToTemp(full.env, createJob(), r2, s2)).rejects.toMatchObject({ code: 'storage_full' });
  });

  it('cancels a running job', async () => {
    const { env, fs } = createTestEnv({ delayMs: 20 });
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    const job = createJob();
    const p = renderToTemp(env, job, recipe, src);
    cancelJob(env, job);
    await expect(p).rejects.toMatchObject({ code: 'cancelled' });
  });

  it('estimates from a real proxy encode with the native renderer', async () => {
    const { env, fs } = createTestEnv();
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    const e = await estimateOutput(env, recipe, src);
    expect(e.method).toBe('sampled');
    expect(e.low).toBeLessThan(e.bytes);
    expect(e.high).toBeGreaterThan(e.bytes);
    expect(await fs.list(fs.join(fs.cacheRoot, 'imagecraft-work'))).toEqual([]); // proxy cleaned
  });

  it('the fallback renderer refuses features it cannot really apply', () => {
    const caps = { adjustments: false, overlays: false, canvas: false, collage: false, gallery: false };
    const src: SourceImage = { uri: 'u', name: 'n', bytes: 1, format: 'jpeg', width: 100, height: 50, hasAlpha: false };
    const plain = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 1e9 }).recipe;
    expect(() => assertSupported(plain, caps)).not.toThrow();
    const filtered = buildRecipe(src, { ...initialEditState(), filterId: 'mono' }, { outputUri: '', encode, maxOutputPixels: 1e9 }).recipe;
    expect(() => assertSupported(filtered, caps)).toThrow(ProcessingError);
    const turned = { ...plain, geometry: { rotation: 1 as const, flipH: false, flipV: false, crop: { x: 0.5, y: 0, width: 0.5, height: 0.5 } } };
    expect(cropPixels({ width: 100, height: 50 }, turned)).toEqual({ x: 25, y: 0, width: 25, height: 50 });
  });
});

describe('batch processing', () => {
  it('processes sequentially, isolates per-file errors and summarises', async () => {
    const { env, fs, renderer } = createTestEnv();
    const good1 = await putPicked(fs, 'a.jpg', padded(jpegHeader(2000, 1500), 400_000));
    const bad = await putPicked(fs, 'b.jpg', padded(new Uint8Array([0xff, 0xd8, 0xff]), 100));
    const good2 = await putPicked(fs, 'c.png', padded(pngHeader(1000, 1000, true), 200_000));
    const inputs = [good1, bad, good2].map((uri, i) => ({ name: `f${i}`, bytes: 0, load: () => importPicked(env, { uri, name: `f${i}.x` }) }));
    const progress: number[] = [];
    const s = await runBatch(env, createJob(), inputs, { format: 'webp', quality: 70, resize: { mode: 'preset', longEdge: 1000 }, watermark: null, maxOutputPixels: 12e6, suffix: 'small' }, (d) => progress.push(d));
    expect(s.done).toBe(2);
    expect(s.failed).toBe(1);
    expect(s.items[1]).toMatchObject({ status: 'failed', code: 'corrupted_file' });
    expect(renderer.maxConcurrent).toBe(1);
    expect(progress).toEqual([0, 1, 2, 3]);
    const out = s.items[0];
    expect(out?.status === 'done' && out.output.width).toBe(1000);
  });

  it('stops cleanly when cancelled: remaining files are marked as skipped', async () => {
    const { env, fs } = createTestEnv({ delayMs: 5 });
    const uris = await Promise.all([0, 1, 2, 3].map((i) => putPicked(fs, `${i}.jpg`, padded(jpegHeader(800, 600), 1000))));
    const job = createJob();
    const s = await runBatch(
      env,
      job,
      uris.map((uri, i) => ({ name: String(i), bytes: 0, load: () => importPicked(env, { uri, name: `${i}.jpg` }) })),
      { format: 'jpeg', quality: 80, resize: null, watermark: null, maxOutputPixels: 12e6, suffix: '' },
      (done) => {
        if (done === 1) cancelJob(env, job);
      },
    );
    expect(s.done).toBe(1);
    expect(s.cancelled).toBe(3);
    expect(await fs.list(fs.join(fs.cacheRoot, 'imagecraft-work'))).toEqual([]);
  });
});

describe('target-size compression', () => {
  it('finds the highest quality under the target and deletes the other attempts', async () => {
    const { env, fs } = createTestEnv({ bytesFor: (r) => r.encode.quality * 10_000 });
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode: { ...encode, quality: 90 }, maxOutputPixels: 24e6 });
    const job = createJob();
    const r = await compressToTarget(env, job, recipe, src, 500_000);
    expect(r.reached).toBe(true);
    expect(r.result.bytes).toBeLessThanOrEqual(500_000);
    expect(r.quality).toBeGreaterThanOrEqual(45);
    const left = await fs.list(fs.join(fs.join(fs.cacheRoot, 'imagecraft-work'), job.id));
    expect(left).toHaveLength(1);
  });

  it('returns the smallest version when the target is unreachable', async () => {
    const { env, fs } = createTestEnv({ bytesFor: () => 900_000 });
    const src = await makeSource(env, fs);
    const { recipe } = buildRecipe(src, initialEditState(), { outputUri: '', encode, maxOutputPixels: 24e6 });
    const r = await compressToTarget(env, createJob(), recipe, src, 100_000);
    expect(r.reached).toBe(false);
    expect(r.attempts).toBeLessThanOrEqual(7);
  });
});

describe('file naming', () => {
  it('sanitises names and never reuses a taken one', () => {
    expect(outputFileName('my:photo?.jpeg', 'compressed', 'webp')).toBe('my photo-compressed.webp');
    expect(outputFileName('', '', 'png')).toBe('image.png');
    expect(uniqueFileName('a.jpg', ['A.JPG', 'a (2).jpg'])).toBe('a (3).jpg');
  });
});
