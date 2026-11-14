// Copied from apps/filepilot (reference implementation) — candidate for a shared package, see factory/tracking/imagecraft.md.
import { detectFormat, type ImageFormat } from './formats';

/**
 * Reads image dimensions, alpha channel and EXIF orientation from the first bytes
 * of a file, without decoding pixels. This lets ImageCraft validate an image and
 * plan memory-bounded processing before anything is loaded into memory.
 */
export interface ImageHeaderInfo {
  format: ImageFormat;
  /** Stored pixel dimensions. */
  width: number;
  height: number;
  /** Dimensions as displayed, after applying the EXIF orientation. */
  displayWidth: number;
  displayHeight: number;
  /** EXIF orientation 1..8 (1 = upright). */
  orientation: number;
  hasAlpha: boolean;
}

/** Enough to reach the JPEG frame header behind a full APP1 (EXIF) segment and thumbnails. */
export const HEADER_BYTES = 256 * 1024;

const u16be = (b: Uint8Array, o: number) => ((b[o] ?? 0) << 8) | (b[o + 1] ?? 0);
const u16le = (b: Uint8Array, o: number) => (b[o] ?? 0) | ((b[o + 1] ?? 0) << 8);
const u32be = (b: Uint8Array, o: number) => (((b[o] ?? 0) << 24) >>> 0) + (((b[o + 1] ?? 0) << 16) | ((b[o + 2] ?? 0) << 8) | (b[o + 3] ?? 0));
const u32le = (b: Uint8Array, o: number) => ((b[o] ?? 0) | ((b[o + 1] ?? 0) << 8) | ((b[o + 2] ?? 0) << 16)) + (((b[o + 3] ?? 0) << 24) >>> 0);
const u24le = (b: Uint8Array, o: number) => (b[o] ?? 0) | ((b[o + 1] ?? 0) << 8) | ((b[o + 2] ?? 0) << 16);
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

function withOrientation(info: Omit<ImageHeaderInfo, 'displayWidth' | 'displayHeight'>): ImageHeaderInfo {
  const swapped = info.orientation >= 5 && info.orientation <= 8;
  return { ...info, displayWidth: swapped ? info.height : info.width, displayHeight: swapped ? info.width : info.height };
}

function parsePng(b: Uint8Array): ImageHeaderInfo | null {
  if (b.length < 33 || ascii(b, 12, 4) !== 'IHDR') return null;
  const width = u32be(b, 16);
  const height = u32be(b, 20);
  const colorType = b[25] ?? 0;
  let hasAlpha = colorType === 4 || colorType === 6;
  // A tRNS chunk before IDAT also means transparency (palette or single-color key).
  let offset = 8;
  while (!hasAlpha && offset + 8 <= b.length) {
    const length = u32be(b, offset);
    const type = ascii(b, offset + 4, 4);
    if (type === 'tRNS') hasAlpha = true;
    if (type === 'IDAT' || type === 'IEND') break;
    offset += 12 + length;
  }
  return withOrientation({ format: 'png', width, height, orientation: 1, hasAlpha });
}

/** Reads the EXIF orientation tag (0x0112) from a TIFF block. */
function readExifOrientation(b: Uint8Array, tiff: number): number {
  const order = ascii(b, tiff, 2);
  if (order !== 'II' && order !== 'MM') return 1;
  const le = order === 'II';
  const r16 = (o: number) => (le ? u16le(b, o) : u16be(b, o));
  const r32 = (o: number) => (le ? u32le(b, o) : u32be(b, o));
  if (r16(tiff + 2) !== 42) return 1;
  const ifd = tiff + r32(tiff + 4);
  if (ifd + 2 > b.length) return 1;
  const entries = r16(ifd);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > b.length) break;
    if (r16(entry) === 0x0112) {
      const value = r16(entry + 8);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

function parseJpeg(b: Uint8Array): ImageHeaderInfo | null {
  let offset = 2;
  let orientation = 1;
  while (offset + 4 <= b.length) {
    if (b[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = b[offset + 1] ?? 0;
    if (marker === 0xff) {
      offset++; // fill byte
      continue;
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      offset += 2;
      continue;
    }
    const length = u16be(b, offset + 2);
    if (length < 2) return null;
    if (marker === 0xe1 && ascii(b, offset + 4, 4) === 'Exif') {
      orientation = readExifOrientation(b, offset + 10);
    }
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (offset + 9 > b.length) return null;
      const height = u16be(b, offset + 5);
      const width = u16be(b, offset + 7);
      if (!width || !height) return null;
      return withOrientation({ format: 'jpeg', width, height, orientation, hasAlpha: false });
    }
    if (marker === 0xda) return null; // start of scan without a frame header: malformed
    offset += 2 + length;
  }
  return null;
}

function parseWebp(b: Uint8Array): ImageHeaderInfo | null {
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8 ') {
    // Lossy bitstream: frame tag (3 bytes) + start code 9d 01 2a + 14-bit dimensions.
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return withOrientation({ format: 'webp', width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff, orientation: 1, hasAlpha: false });
  }
  if (chunk === 'VP8L') {
    if (b[20] !== 0x2f) return null;
    const bits = u32le(b, 21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >>> 14) & 0x3fff) + 1;
    const hasAlpha = ((bits >>> 28) & 1) === 1;
    return withOrientation({ format: 'webp', width, height, orientation: 1, hasAlpha });
  }
  if (chunk === 'VP8X') {
    const flags = b[20] ?? 0;
    return withOrientation({ format: 'webp', width: u24le(b, 24) + 1, height: u24le(b, 27) + 1, orientation: 1, hasAlpha: (flags & 0x10) !== 0 });
  }
  return null;
}

/** Returns null for unsupported formats or malformed headers. */
export function readImageHeader(bytes: Uint8Array): ImageHeaderInfo | null {
  const format = detectFormat(bytes);
  try {
    if (format === 'png') return parsePng(bytes);
    if (format === 'jpeg') return parseJpeg(bytes);
    if (format === 'webp') return parseWebp(bytes);
  } catch {
    return null;
  }
  return null;
}
