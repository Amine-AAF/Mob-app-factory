/**
 * Deterministic test files generated in memory: photos-like JPEGs, PNGs with/without
 * alpha, multi-page PDFs. Generated (not committed binaries) so sizes/pages are explicit.
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { encodeJpeg, encodePng, type Raster } from './nodeCodec';

/** Smooth gradients + seeded noise: compresses like a real photo (not trivially). */
export function photoRaster(width: number, height: number, seed = 1, alpha = false): Raster {
  const data = new Uint8Array(width * height * 4);
  let s = seed >>> 0 || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = rand() * 40 - 20;
      data[i] = Math.max(0, Math.min(255, (x / width) * 255 + n));
      data[i + 1] = Math.max(0, Math.min(255, (y / height) * 255 + n));
      data[i + 2] = Math.max(0, Math.min(255, 128 + 100 * Math.sin((x + y) / 9) + n));
      // Left half transparent when alpha is requested.
      data[i + 3] = alpha && x < width / 2 ? 0 : 255;
    }
  }
  return { width, height, data };
}

export const makeJpeg = (w: number, h: number, quality = 0.95, seed = 1) => encodeJpeg(photoRaster(w, h, seed), quality);
export const makePng = (w: number, h: number, alpha = false, seed = 1) => encodePng(photoRaster(w, h, seed, alpha));

/** Inserts an EXIF APP1 segment with the given orientation right after the JPEG SOI marker. */
export function withExifOrientation(jpegBytes: Uint8Array, orientation: number, littleEndian = true): Uint8Array {
  const tiff: number[] = littleEndian
    ? [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    : [0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  const payload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff]; // "Exif\0\0" + TIFF
  const length = payload.length + 2;
  const app1 = [0xff, 0xe1, (length >> 8) & 0xff, length & 0xff, ...payload];
  const out = new Uint8Array(jpegBytes.length + app1.length);
  out.set(jpegBytes.subarray(0, 2), 0);
  out.set(app1, 2);
  out.set(jpegBytes.subarray(2), 2 + app1.length);
  return out;
}

/** A PDF whose page i is labelled "Page i+1" and has a recognisable width (500 + i). */
export async function makePdf(pages: number, label = 'Doc'): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Secret title ${label}`);
  doc.setAuthor('Jane Private');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([500 + i, 700]);
    page.drawText(`${label} page ${i + 1}`, { x: 50, y: 600, size: 24, font, color: rgb(0, 0, 0) });
  }
  return doc.save();
}

/** A syntactically valid PDF whose trailer declares encryption (pdf-lib refuses to load it). */
export async function makeEncryptedPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([300, 300]);
  const ctx = doc.context;
  ctx.trailerInfo.Encrypt = ctx.obj({ Filter: 'Standard', V: 2, R: 3 });
  return doc.save({ useObjectStreams: false });
}

export const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x3b]);
