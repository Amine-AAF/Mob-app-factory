import { EncryptedPDFError, PDFDocument } from 'pdf-lib';

import { ProcessingError } from '../files/errors';
import { detectFormat } from '../files/formats';
import { layoutImagePage, type PageMargin, type PageOrientation, type PageSize } from './pageLayout';

/**
 * PDF operations with pdf-lib (pure JavaScript, MIT, runs on Hermes, no network).
 * Inputs and outputs are bytes; the caller owns file I/O. Merge, split and extraction
 * copy page objects as-is: content is not re-rendered, so text stays selectable and
 * quality is unchanged.
 *
 * Generated documents carry neutral metadata only (no original title/author copied).
 */
const PRODUCER = 'FilePilot';

export interface PdfInfo {
  pageCount: number;
  /** Size of the first pages in points (bounded list, for display). */
  pageSizes: { width: number; height: number }[];
  /** True when every listed page has the same size. */
  uniformSize: boolean;
}

export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  if (detectFormat(bytes.subarray(0, 1024)) !== 'pdf') throw new ProcessingError('pdf_invalid');
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (e instanceof EncryptedPDFError || /encrypt/i.test(String(e))) throw new ProcessingError('pdf_encrypted');
    throw new ProcessingError('pdf_invalid', e instanceof Error ? e.name : undefined);
  }
  // pdf-lib parses leniently: a damaged file can 'load' and fail later. Validate the page tree now.
  let pageCount = 0;
  try {
    pageCount = doc.getPageCount();
    doc.getPages();
  } catch {
    throw new ProcessingError('pdf_invalid', 'page tree');
  }
  if (pageCount === 0) throw new ProcessingError('pdf_invalid', 'no pages');
  return doc;
}

export async function inspectPdf(bytes: Uint8Array, maxSizes = 50): Promise<PdfInfo> {
  const doc = await loadPdf(bytes);
  const pages = doc.getPages();
  if (pages.length === 0) throw new ProcessingError('pdf_invalid', 'no pages');
  const pageSizes = pages.slice(0, maxSizes).map((p) => {
    const { width, height } = p.getSize();
    return { width: Math.round(width * 100) / 100, height: Math.round(height * 100) / 100 };
  });
  const first = pageSizes[0];
  return {
    pageCount: pages.length,
    pageSizes,
    uniformSize: pageSizes.every((s) => first && Math.abs(s.width - first.width) < 1 && Math.abs(s.height - first.height) < 1),
  };
}

function stamp(doc: PDFDocument) {
  doc.setProducer(PRODUCER);
  doc.setCreator(PRODUCER);
  const now = new Date();
  doc.setCreationDate(now);
  doc.setModificationDate(now);
}

async function save(doc: PDFDocument): Promise<Uint8Array> {
  stamp(doc);
  return doc.save({ useObjectStreams: true });
}

type Progress = (done: number, total: number) => void;
type Cancelled = () => boolean;

const check = (isCancelled?: Cancelled) => {
  if (isCancelled?.()) throw new ProcessingError('cancelled');
};

/**
 * Merges documents in order. `readInput` is called one file at a time so only the
 * output document and one input are in memory simultaneously.
 */
export async function mergePdfs(count: number, readInput: (index: number) => Promise<Uint8Array>, onProgress?: Progress, isCancelled?: Cancelled): Promise<{ bytes: Uint8Array; pageCount: number }> {
  if (count < 2) throw new ProcessingError('too_many_files', 'need at least 2');
  const out = await PDFDocument.create({ updateMetadata: false });
  for (let i = 0; i < count; i++) {
    check(isCancelled);
    const src = await loadPdf(await readInput(i));
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    onProgress?.(i + 1, count + 1);
  }
  check(isCancelled);
  const bytes = await save(out);
  onProgress?.(count + 1, count + 1);
  return { bytes, pageCount: out.getPageCount() };
}

/** New document with the given 0-based pages, in the given order. */
export async function extractPages(source: PDFDocument | Uint8Array, pages: readonly number[]): Promise<Uint8Array> {
  const src = source instanceof Uint8Array ? await loadPdf(source) : source;
  const total = src.getPageCount();
  if (!pages.length || pages.some((p) => !Number.isInteger(p) || p < 0 || p >= total)) throw new ProcessingError('invalid_page_range');
  const out = await PDFDocument.create({ updateMetadata: false });
  const copied = await out.copyPages(src, [...pages]);
  copied.forEach((p) => out.addPage(p));
  return save(out);
}

/**
 * Splits into one document per group. Each part is handed to `emit` as soon as it is
 * produced (and can be written to disk), instead of holding every part in memory.
 */
export async function splitPdf(
  bytes: Uint8Array,
  groups: readonly (readonly number[])[],
  emit: (part: Uint8Array, index: number, pages: readonly number[]) => Promise<void>,
  onProgress?: Progress,
  isCancelled?: Cancelled,
): Promise<number> {
  if (!groups.length) throw new ProcessingError('invalid_page_range');
  const src = await loadPdf(bytes);
  for (let i = 0; i < groups.length; i++) {
    check(isCancelled);
    const group = groups[i] as readonly number[];
    await emit(await extractPages(src, group), i, group);
    onProgress?.(i + 1, groups.length);
  }
  return groups.length;
}

export interface PdfImageInput {
  /** JPEG or PNG bytes (other formats must be converted first). */
  bytes: Uint8Array;
  width: number;
  height: number;
}

export interface ImagesToPdfOptions {
  size: PageSize;
  orientation: PageOrientation;
  margin: PageMargin;
}

/** One image per page, scaled to fit ("contain") and centred. Images are read one at a time. */
export async function imagesToPdf(
  count: number,
  readImage: (index: number) => Promise<PdfImageInput>,
  options: ImagesToPdfOptions,
  onProgress?: Progress,
  isCancelled?: Cancelled,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  if (count < 1) throw new ProcessingError('too_many_files', 'need at least 1');
  const doc = await PDFDocument.create({ updateMetadata: false });
  for (let i = 0; i < count; i++) {
    check(isCancelled);
    const img = await readImage(i);
    const format = detectFormat(img.bytes.subarray(0, 16));
    const embedded = format === 'jpeg' ? await doc.embedJpg(img.bytes) : format === 'png' ? await doc.embedPng(img.bytes) : null;
    if (!embedded) throw new ProcessingError('unsupported_format', format);
    const layout = layoutImagePage({ width: img.width, height: img.height }, options);
    const page = doc.addPage([layout.page.width, layout.page.height]);
    page.drawImage(embedded, layout.image);
    onProgress?.(i + 1, count + 1);
  }
  check(isCancelled);
  const bytes = await save(doc);
  onProgress?.(count + 1, count + 1);
  return { bytes, pageCount: doc.getPageCount() };
}
