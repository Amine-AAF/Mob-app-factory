/**
 * File format detection from content ("magic bytes"), never from the file name.
 * A renamed file (e.g. a PNG called photo.jpg) is detected as what it really is.
 */
export type DetectedFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'heic' | 'tiff' | 'pdf' | 'unknown';

/** Image formats FilePilot can decode AND encode (verified pipeline). */
export const IMAGE_FORMATS = ['jpeg', 'png', 'webp'] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export function isImageFormat(f: DetectedFormat | string): f is ImageFormat {
  return (IMAGE_FORMATS as readonly string[]).includes(f);
}

const MIME: Record<Exclude<DetectedFormat, 'unknown'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  heic: 'image/heic',
  tiff: 'image/tiff',
  pdf: 'application/pdf',
};

const EXTENSION: Record<Exclude<DetectedFormat, 'unknown'>, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  bmp: 'bmp',
  heic: 'heic',
  tiff: 'tif',
  pdf: 'pdf',
};

export function mimeTypeOf(format: DetectedFormat): string {
  return format === 'unknown' ? 'application/octet-stream' : MIME[format];
}

export function extensionOf(format: DetectedFormat): string {
  return format === 'unknown' ? 'bin' : EXTENSION[format];
}

const ascii = (bytes: Uint8Array, offset: number, length: number): string => {
  let s = '';
  for (let i = offset; i < offset + length && i < bytes.length; i++) s += String.fromCharCode(bytes[i] ?? 0);
  return s;
};

/** Number of leading bytes needed by `detectFormat` (PDF headers may be preceded by junk). */
export const SNIFF_BYTES = 1024;

export function detectFormat(bytes: Uint8Array): DetectedFormat {
  if (bytes.length < 4) return 'unknown';
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'jpeg';
  if (b(0) === 0x89 && ascii(bytes, 1, 3) === 'PNG' && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif';
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 14) return 'bmp';
  if ((ascii(bytes, 0, 4) === 'II*\0') || (ascii(bytes, 0, 4) === 'MM\0*')) return 'tiff';
  if (ascii(bytes, 4, 4) === 'ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1|heim|heis|avif)$/.test(ascii(bytes, 8, 4))) return 'heic';
  // PDF: "%PDF-" must appear within the first 1024 bytes (ISO 32000 tolerance).
  const head = ascii(bytes, 0, Math.min(bytes.length, SNIFF_BYTES));
  if (head.includes('%PDF-')) return 'pdf';
  return 'unknown';
}
