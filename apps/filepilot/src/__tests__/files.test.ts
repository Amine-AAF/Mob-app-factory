import { detectFormat, extensionOf, isImageFormat, mimeTypeOf } from '@/services/files/formats';
import { readImageHeader } from '@/services/files/imageHeader';
import { baseNameOf, outputFileName, pageLabel, uniqueFileName } from '@/services/files/naming';
import { formatFileSize, savedRatio } from '@/utils/format';

import { GIF_BYTES, makeJpeg, makePdf, makePng, withExifOrientation } from './helpers/fixtures';

describe('MIME type detection (content, not name)', () => {
  it('detects real JPEG, PNG and PDF bytes', async () => {
    expect(detectFormat(makeJpeg(8, 8))).toBe('jpeg');
    expect(detectFormat(makePng(8, 8))).toBe('png');
    expect(detectFormat(await makePdf(1))).toBe('pdf');
  });

  it('detects WebP, GIF, HEIC and TIFF signatures', () => {
    const riff = new Uint8Array([...'RIFF'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [...'WEBPVP8 '].map((c) => c.charCodeAt(0))));
    expect(detectFormat(riff)).toBe('webp');
    expect(detectFormat(GIF_BYTES)).toBe('gif');
    const heic = new Uint8Array([0, 0, 0, 24, ...[...'ftypheic'].map((c) => c.charCodeAt(0))]);
    expect(detectFormat(heic)).toBe('heic');
    expect(detectFormat(new Uint8Array([0x49, 0x49, 0x2a, 0x00, 1, 2]))).toBe('tiff');
  });

  it('finds a PDF header preceded by junk bytes (allowed by the spec)', () => {
    const bytes = new Uint8Array([0x0a, 0x0a, ...[...'%PDF-1.7\n'].map((c) => c.charCodeAt(0))]);
    expect(detectFormat(bytes)).toBe('pdf');
  });

  it('returns unknown for text, empty and truncated data', () => {
    expect(detectFormat(new TextEncoder().encode('hello world, not a file'))).toBe('unknown');
    expect(detectFormat(new Uint8Array())).toBe('unknown');
    expect(detectFormat(new Uint8Array([0xff, 0xd8]))).toBe('unknown');
  });

  it('maps formats to MIME types and extensions', () => {
    expect(mimeTypeOf('jpeg')).toBe('image/jpeg');
    expect(mimeTypeOf('webp')).toBe('image/webp');
    expect(mimeTypeOf('pdf')).toBe('application/pdf');
    expect(mimeTypeOf('unknown')).toBe('application/octet-stream');
    expect(extensionOf('jpeg')).toBe('jpg');
    expect(isImageFormat('png')).toBe(true);
    expect(isImageFormat('gif')).toBe(false);
  });
});

describe('image header parsing (no pixel decoding)', () => {
  it('reads JPEG dimensions', () => {
    expect(readImageHeader(makeJpeg(123, 45))).toMatchObject({ format: 'jpeg', width: 123, height: 45, orientation: 1, hasAlpha: false });
  });

  it('reads the EXIF orientation and swaps displayed dimensions for 90° rotations', () => {
    const rotated = readImageHeader(withExifOrientation(makeJpeg(400, 300), 6));
    expect(rotated).toMatchObject({ width: 400, height: 300, orientation: 6, displayWidth: 300, displayHeight: 400 });
    const bigEndian = readImageHeader(withExifOrientation(makeJpeg(40, 30), 8, false));
    expect(bigEndian).toMatchObject({ orientation: 8, displayWidth: 30, displayHeight: 40 });
    expect(readImageHeader(withExifOrientation(makeJpeg(40, 30), 3))).toMatchObject({ orientation: 3, displayWidth: 40, displayHeight: 30 });
  });

  it('detects PNG transparency', () => {
    expect(readImageHeader(makePng(10, 20, true))).toMatchObject({ format: 'png', width: 10, height: 20, hasAlpha: true });
  });

  it('parses the three WebP bitstream variants', () => {
    const riff = (chunk: string, body: number[]) => new Uint8Array([...'RIFF'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [...`WEBP${chunk}`].map((c) => c.charCodeAt(0)), [0, 0, 0, 0], body));
    // VP8X: flags (alpha), 3 reserved, width-1 (24 bit LE), height-1 (24 bit LE)
    expect(readImageHeader(riff('VP8X', [0x10, 0, 0, 0, 0x1f, 0x03, 0x00, 0xdf, 0x01, 0x00]))).toMatchObject({ width: 800, height: 480, hasAlpha: true });
    // VP8L: signature 0x2f + 14-bit width-1, 14-bit height-1, alpha bit
    const w = 99;
    const h = 49;
    const bits = w | (h << 14) | (1 << 28);
    expect(readImageHeader(riff('VP8L', [0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff]))).toMatchObject({ width: 100, height: 50, hasAlpha: true });
    // VP8 (lossy): 3-byte frame tag, start code, 16-bit LE dimensions
    expect(readImageHeader(riff('VP8 ', [0, 0, 0, 0x9d, 0x01, 0x2a, 0x40, 0x01, 0xf0, 0x00]))).toMatchObject({ width: 320, height: 240, hasAlpha: false });
  });

  it('returns null for corrupted or unsupported data', () => {
    const truncated = makeJpeg(50, 50).subarray(0, 20);
    expect(readImageHeader(truncated)).toBeNull();
    expect(readImageHeader(GIF_BYTES)).toBeNull();
  });
});

describe('output naming', () => {
  it('strips extensions and unsafe characters', () => {
    expect(baseNameOf('Holiday: photo?.JPG')).toBe('Holiday photo');
    expect(baseNameOf('../../etc/passwd')).toBe('passwd');
    expect(baseNameOf('.hidden')).toBe('hidden');
    expect(baseNameOf('')).toBe('file');
    expect(baseNameOf('a'.repeat(200) + '.png')).toHaveLength(60);
  });

  it('builds descriptive output names', () => {
    expect(outputFileName('scan.png', 'compressed', 'jpg')).toBe('scan-compressed.jpg');
    expect(outputFileName('report.pdf', '', '.pdf')).toBe('report.pdf');
  });

  it('never reuses an existing name (case-insensitive)', () => {
    expect(uniqueFileName('a.jpg', [])).toBe('a.jpg');
    expect(uniqueFileName('a.jpg', ['A.JPG'])).toBe('a (2).jpg');
    expect(uniqueFileName('a.jpg', ['a.jpg', 'a (2).jpg'])).toBe('a (3).jpg');
  });

  it('zero-pads page labels so outputs sort naturally', () => {
    expect(pageLabel(7, 120)).toBe('007');
    expect(pageLabel(3, 9)).toBe('3');
  });
});

describe('file size formatting', () => {
  it('uses SI units like the Android Files app', () => {
    expect(formatFileSize(0, 'en')).toBe('0 byte');
    expect(formatFileSize(1500, 'en')).toBe('1.5 kB');
    expect(formatFileSize(2_345_678, 'en')).toBe('2.35 MB');
    expect(formatFileSize(1_000_000_000, 'en')).toBe('1 GB');
  });

  it('localizes decimal separators', () => {
    expect(formatFileSize(2_345_678, 'fr')).toMatch(/^2,35\s?Mo$/);
    expect(formatFileSize(2_345_678, 'es')).toMatch(/^2,35\s?MB$/);
  });

  it('computes the saved ratio, negative when the output is larger', () => {
    expect(savedRatio(1000, 250)).toBe(0.75);
    expect(savedRatio(1000, 1200)).toBeCloseTo(-0.2);
    expect(savedRatio(0, 10)).toBeNull();
  });
});
