import { createMemoryFileStore } from '@/services/files/fileStore';
import { compressImage, convertImage, inspectImage, resizeImage, type ImageJobContext } from '@/services/image/imageEngine';
import { fitPixelBudget, fitWithin, heightForWidth, planResize, widthForHeight } from '@/services/image/resizeMath';

import { GIF_BYTES, makeJpeg, makePng } from './helpers/fixtures';
import { createNodeCodec, decode } from './helpers/nodeCodec';

function setup(options: { cancelled?: () => boolean; supportsFlatten?: boolean } = {}) {
  const fs = createMemoryFileStore();
  const codec = createNodeCodec(fs, { supportsFlatten: options.supportsFlatten });
  const workDir = 'mem://cache/filepilot-work/job1';
  const ctx: ImageJobContext = { fs, codec, workDir, isCancelled: options.cancelled ?? (() => false) };
  const put = async (name: string, bytes: Uint8Array) => {
    const uri = `mem://cache/DocumentPicker/${name}`;
    await fs.writeBytes(uri, bytes);
    return inspectImage(fs, uri, name);
  };
  const tempFiles = () => [...fs.files.keys()].filter((k) => k.startsWith(`${workDir}/`));
  return { fs, codec, ctx, put, tempFiles };
}

describe('aspect ratio and resize planning', () => {
  const src = { width: 4000, height: 3000 };

  it('keeps the aspect ratio when one side is given', () => {
    expect(heightForWidth(src, 1000)).toBe(750);
    expect(widthForHeight(src, 600)).toBe(800);
    expect(planResize(src, { mode: 'custom', width: 1000, height: null, lockAspect: true })).toMatchObject({ width: 1000, height: 750, distorted: false });
    expect(planResize(src, { mode: 'custom', width: 1000, height: 999, lockAspect: true })).toMatchObject({ width: 1000, height: 750 });
  });

  it('allows free dimensions when the lock is off and flags distortion', () => {
    expect(planResize(src, { mode: 'custom', width: 1000, height: 1000, lockAspect: false })).toMatchObject({ width: 1000, height: 1000, distorted: true });
  });

  it('resizes by percentage and presets (long edge)', () => {
    expect(planResize(src, { mode: 'percent', percent: 50 })).toMatchObject({ width: 2000, height: 1500 });
    expect(planResize(src, { mode: 'preset', preset: 'medium' })).toMatchObject({ width: 1280, height: 960 });
    expect(planResize({ width: 3000, height: 4000 }, { mode: 'preset', preset: 'small' })).toMatchObject({ width: 480, height: 640 });
  });

  it('never upscales by default, and says so', () => {
    const plan = planResize({ width: 800, height: 600 }, { mode: 'preset', preset: 'large' });
    expect(plan).toMatchObject({ width: 800, height: 600, limitedToOriginal: true, upscaled: false, unchanged: true });
    const custom = planResize({ width: 800, height: 600 }, { mode: 'custom', width: 2000, height: 500, lockAspect: false });
    expect(custom.width).toBeLessThanOrEqual(800);
    expect(custom.height).toBeLessThanOrEqual(600);
    expect(custom.limitedToOriginal).toBe(true);
    expect(planResize({ width: 800, height: 600 }, { mode: 'percent', percent: 300 })).toMatchObject({ width: 800, height: 600 });
  });

  it('upscales only when explicitly allowed, and flags it', () => {
    expect(planResize({ width: 800, height: 600 }, { mode: 'percent', percent: 200 }, true)).toMatchObject({ width: 1600, height: 1200, upscaled: true });
  });

  it('flags large reductions (quality warning)', () => {
    expect(planResize(src, { mode: 'percent', percent: 40 }).largeReduction).toBe(true);
    expect(planResize(src, { mode: 'percent', percent: 60 }).largeReduction).toBe(false);
  });

  it('fits inside boxes and pixel budgets', () => {
    expect(fitWithin(src, { width: 400 })).toEqual({ width: 400, height: 300 });
    expect(fitWithin({ width: 10, height: 10 }, { width: 400 })).toEqual({ width: 10, height: 10 });
    const b = fitPixelBudget({ width: 10000, height: 8000 }, 40_000_000);
    expect(b.width * b.height).toBeLessThanOrEqual(40_000_000);
    expect(b.width / b.height).toBeCloseTo(1.25, 2);
  });
});

describe('image validation', () => {
  it('accepts real images and reads their header', async () => {
    const { put } = setup();
    const img = await put('a.jpg', makeJpeg(64, 32));
    expect(img.header).toMatchObject({ format: 'jpeg', width: 64, height: 32 });
  });

  it('detects a PNG that was renamed .jpg', async () => {
    const { put } = setup();
    expect((await put('fake.jpg', makePng(8, 8))).header.format).toBe('png');
  });

  it('rejects unsupported, empty, corrupted and missing files', async () => {
    const { put, fs } = setup();
    await expect(put('anim.gif', GIF_BYTES)).rejects.toMatchObject({ code: 'unsupported_format' });
    await expect(put('empty.jpg', new Uint8Array())).rejects.toMatchObject({ code: 'corrupted_file' });
    await expect(put('broken.jpg', makeJpeg(20, 20).subarray(0, 30))).rejects.toMatchObject({ code: 'corrupted_file' });
    await expect(inspectImage(fs, 'mem://cache/nope.jpg', 'nope.jpg')).rejects.toMatchObject({ code: 'file_missing' });
  });
});

describe('image compression (real encoder)', () => {
  it('produces a smaller, decodable JPEG with the same dimensions', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('photo.jpg', makeJpeg(320, 240, 0.98));
    const out = await compressImage(ctx, src, { format: 'jpeg', quality: 0.6 });
    expect(out.size).toBeLessThan(src.size);
    expect(out.noGain).toBe(false);
    const decoded = decode(await fs.readBytes(out.uri));
    expect([decoded.width, decoded.height]).toEqual([320, 240]);
  });

  it('lower quality gives smaller files', async () => {
    const { ctx, put } = setup();
    const src = await put('photo.jpg', makeJpeg(200, 200, 0.98));
    const high = await compressImage(ctx, src, { format: 'jpeg', quality: 0.9 });
    const low = await compressImage(ctx, src, { format: 'jpeg', quality: 0.3 });
    expect(low.size).toBeLessThan(high.size);
  });

  it('reaches a target size with the highest quality that fits, keeping only the chosen file', async () => {
    const { ctx, put, tempFiles } = setup();
    const src = await put('photo.jpg', makeJpeg(400, 300, 0.98));
    const target = Math.round(src.size * 0.3);
    const out = await compressImage(ctx, src, { format: 'jpeg', quality: 0.95, targetBytes: target });
    expect(out.reachedTarget).toBe(true);
    expect(out.size).toBeLessThanOrEqual(target);
    expect(out.quality).toBeGreaterThan(0.05);
    expect(tempFiles()).toEqual([out.uri]);
  });

  it('reduces dimensions when quality alone cannot reach the target', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('photo.jpg', makeJpeg(600, 400, 0.98));
    const out = await compressImage(ctx, src, { format: 'jpeg', quality: 0.8, targetBytes: 3000 });
    expect(out.reachedTarget).toBe(true);
    expect(out.downscaled).toBe(true);
    expect(out.size).toBeLessThanOrEqual(3000);
    expect(decode(await fs.readBytes(out.uri)).width).toBeLessThan(600);
  });

  it('reports an unreachable target honestly and returns the smallest result', async () => {
    const { ctx, put, tempFiles } = setup();
    const src = await put('photo.jpg', makeJpeg(300, 300, 0.98));
    const out = await compressImage(ctx, src, { format: 'jpeg', quality: 0.8, targetBytes: 50 });
    expect(out.reachedTarget).toBe(false);
    expect(out.size).toBeGreaterThan(50);
    expect(tempFiles()).toEqual([out.uri]);
  });

  it('flags results that are not smaller than the original', async () => {
    const { ctx, put } = setup();
    const src = await put('tiny.jpg', makeJpeg(16, 16, 0.2));
    const out = await compressImage(ctx, src, { format: 'jpeg', quality: 1 });
    expect(out.noGain).toBe(true);
  });

  it('bounds decoding of very large images (memory protection)', async () => {
    const { ctx, put, codec } = setup();
    const src = await put('wide.png', makePng(8, 8));
    // Pretend the header announced a 60 MP photo: the decode must be bounded.
    const huge = { ...src, header: { ...src.header, width: 10000, height: 6000, displayWidth: 10000, displayHeight: 6000 } };
    await expect(compressImage(ctx, huge, { format: 'png', quality: 1 })).resolves.toBeDefined();
    const bound = codec.calls[0]?.maxDecode;
    expect(bound).toBeDefined();
    expect((bound?.width ?? 0) * (bound?.height ?? 0)).toBeLessThanOrEqual(40_000_000);
  });

  it('stops when cancelled and leaves no partial output', async () => {
    const { put, fs, codec, tempFiles } = setup();
    const src = await put('photo.jpg', makeJpeg(100, 100));
    const ctx: ImageJobContext = { fs, codec, workDir: 'mem://cache/filepilot-work/job1', isCancelled: () => true };
    await expect(compressImage(ctx, src, { format: 'jpeg', quality: 0.5 })).rejects.toMatchObject({ code: 'cancelled' });
    expect(tempFiles()).toEqual([]);
  });
});

describe('image resize and conversion (real encoder)', () => {
  it('resizes to exact dimensions', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('a.png', makePng(400, 200));
    const out = await resizeImage(ctx, src, { size: { width: 100, height: 50 }, format: 'png', quality: 1 });
    const d = decode(await fs.readBytes(out.uri));
    expect([d.width, d.height]).toEqual([100, 50]);
  });

  it('converts PNG to JPEG with real re-encoding (not a rename)', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('a.png', makePng(50, 40));
    const out = await convertImage(ctx, src, { format: 'jpeg', quality: 0.9 });
    const bytes = await fs.readBytes(out.uri);
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xff, 0xd8, 0xff]);
    expect(out.uri.endsWith('.jpg')).toBe(true);
    expect(decode(bytes)).toMatchObject({ width: 50, height: 40 });
  });

  it('converts JPEG to PNG losslessly', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('a.jpg', makeJpeg(30, 20));
    const out = await convertImage(ctx, src, { format: 'png', quality: 1 });
    expect(decode(await fs.readBytes(out.uri))).toMatchObject({ width: 30, height: 20 });
  });

  it('flattens transparency onto white for JPEG output', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('logo.png', makePng(20, 10, true));
    expect(src.header.hasAlpha).toBe(true);
    const out = await convertImage(ctx, src, { format: 'jpeg', quality: 1 });
    const d = decode(await fs.readBytes(out.uri));
    // Pixel (1,5) was fully transparent: it must be (near) white, not black.
    const i = (5 * d.width + 1) * 4;
    expect(d.data[i]).toBeGreaterThan(240);
    expect(d.data[i + 1]).toBeGreaterThan(240);
    expect(d.data[i + 2]).toBeGreaterThan(240);
  });

  it('refuses transparent -> JPEG when the device cannot flatten, instead of producing black pixels', async () => {
    const { ctx, put } = setup({ supportsFlatten: false });
    const src = await put('logo.png', makePng(20, 10, true));
    await expect(convertImage(ctx, src, { format: 'jpeg', quality: 0.9 })).rejects.toMatchObject({ code: 'transparency_unsupported' });
  });

  it('preserves transparency when converting PNG to PNG', async () => {
    const { ctx, put, fs } = setup();
    const src = await put('logo.png', makePng(20, 10, true));
    const out = await convertImage(ctx, src, { format: 'png', quality: 1 });
    const d = decode(await fs.readBytes(out.uri));
    expect(d.data[3]).toBe(0);
  });
});
