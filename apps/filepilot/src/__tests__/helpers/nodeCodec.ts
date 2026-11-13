/**
 * Test-only ImageCodec: real JPEG (jpeg-js) and PNG (pngjs) decoding/encoding in Node.
 * It lets the engine tests verify genuine compressed output, not mocks.
 * WebP is not available in Node; WebP encoding is verified on device (see docs/qa.md).
 */
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

import type { FileStore } from '@/services/files/fileStore';
import { detectFormat } from '@/services/files/formats';
import type { ImageCodec, TranscodeOptions } from '@/services/image/imageEngine';

export interface Raster {
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel. */
  data: Uint8Array;
}

export function decode(bytes: Uint8Array): Raster {
  const format = detectFormat(bytes);
  if (format === 'jpeg') {
    const img = jpeg.decode(Buffer.from(bytes), { useTArray: true, formatAsRGBA: true });
    return { width: img.width, height: img.height, data: img.data };
  }
  if (format === 'png') {
    const img = PNG.sync.read(Buffer.from(bytes));
    return { width: img.width, height: img.height, data: new Uint8Array(img.data) };
  }
  throw new Error(`test codec cannot decode ${format}`);
}

export function encodeJpeg(r: Raster, quality: number): Uint8Array {
  return new Uint8Array(jpeg.encode({ width: r.width, height: r.height, data: Buffer.from(r.data) }, Math.round(quality * 100)).data);
}

export function encodePng(r: Raster): Uint8Array {
  const png = new PNG({ width: r.width, height: r.height });
  png.data = Buffer.from(r.data);
  return new Uint8Array(PNG.sync.write(png));
}

/** Bilinear-ish (box) resampling, good enough for size tests. */
export function resample(r: Raster, width: number, height: number): Raster {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = Math.min(r.width - 1, Math.floor((x + 0.5) * (r.width / width)));
      const sy = Math.min(r.height - 1, Math.floor((y + 0.5) * (r.height / height)));
      const si = (sy * r.width + sx) * 4;
      const di = (y * width + x) * 4;
      out[di] = r.data[si] ?? 0;
      out[di + 1] = r.data[si + 1] ?? 0;
      out[di + 2] = r.data[si + 2] ?? 0;
      out[di + 3] = r.data[si + 3] ?? 255;
    }
  }
  return { width, height, data: out };
}

function flatten(r: Raster, hex: string): Raster {
  const bg = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  const out = new Uint8Array(r.data.length);
  for (let i = 0; i < r.data.length; i += 4) {
    const a = (r.data[i + 3] ?? 255) / 255;
    for (let c = 0; c < 3; c++) out[i + c] = Math.round((r.data[i + c] ?? 0) * a + bg[c as 0 | 1 | 2] * (1 - a));
    out[i + 3] = 255;
  }
  return { ...r, data: out };
}

export function createNodeCodec(fs: FileStore, opts: { supportsFlatten?: boolean } = {}): ImageCodec & { calls: TranscodeOptions[] } {
  const calls: TranscodeOptions[] = [];
  return {
    name: 'node-test-codec',
    supportsFlatten: opts.supportsFlatten ?? true,
    calls,
    async transcode(inputUri, options, destUri) {
      calls.push(options);
      let raster = decode(await fs.readBytes(inputUri));
      if (options.maxDecode && (raster.width > options.maxDecode.width || raster.height > options.maxDecode.height)) {
        raster = resample(raster, options.maxDecode.width, options.maxDecode.height);
      }
      if (options.resize) raster = resample(raster, options.resize.width, options.resize.height);
      if (options.flattenBackground && options.format === 'jpeg') raster = flatten(raster, options.flattenBackground);
      let bytes: Uint8Array;
      if (options.format === 'jpeg') bytes = encodeJpeg(raster, options.quality);
      else if (options.format === 'png') bytes = encodePng(raster);
      else throw new Error('webp not available in the Node test codec');
      await fs.writeBytes(destUri, bytes);
      return { width: raster.width, height: raster.height };
    },
  };
}
