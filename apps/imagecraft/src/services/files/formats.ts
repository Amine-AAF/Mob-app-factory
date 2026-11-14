import { OUTPUT_FORMATS, type OutputFormat } from '@/types/image';

/**
 * File format detection from content ("magic bytes"), never from the file name or
 * extension: a renamed file (a PNG called photo.jpg) or a file without extension is
 * detected as what it really is.
 */
export type DetectedFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'heic' | 'tiff' | 'pdf' | 'unknown';

/** Alias kept for the header parser shared with FilePilot. */
export type ImageFormat = OutputFormat;

export function isImageFormat(f: DetectedFormat | string): f is OutputFormat {
  return (OUTPUT_FORMATS as readonly string[]).includes(f);
}

const MIME: Record<OutputFormat, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const EXTENSION: Record<OutputFormat, string> = { jpeg: 'jpg', png: 'png', webp: 'webp' };

export function mimeTypeOf(format: OutputFormat): string {
  return MIME[format];
}

export function extensionOf(format: OutputFormat): string {
  return EXTENSION[format];
}

/** Whether the format can store an alpha channel. */
export function supportsTransparency(format: OutputFormat): boolean {
  return format !== 'jpeg';
}

/** Whether the format has a quality setting (PNG is always lossless). */
export function hasQuality(format: OutputFormat): boolean {
  return format !== 'png';
}

const ascii = (bytes: Uint8Array, offset: number, length: number): string => {
  let s = '';
  for (let i = offset; i < offset + length && i < bytes.length; i++) s += String.fromCharCode(bytes[i] ?? 0);
  return s;
};

export function detectFormat(bytes: Uint8Array): DetectedFormat {
  if (bytes.length < 4) return 'unknown';
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'jpeg';
  if (b(0) === 0x89 && ascii(bytes, 1, 3) === 'PNG' && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif';
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 14) return 'bmp';
  if (ascii(bytes, 0, 4) === 'II*\0' || ascii(bytes, 0, 4) === 'MM\0*') return 'tiff';
  if (ascii(bytes, 4, 4) === 'ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1|heim|heis|avif)$/.test(ascii(bytes, 8, 4))) return 'heic';
  if (ascii(bytes, 0, Math.min(bytes.length, 1024)).includes('%PDF-')) return 'pdf';
  return 'unknown';
}
