import { PDFDocument } from 'pdf-lib';

import { ProcessingError } from '@/services/files/errors';
import { layoutImagePage, MAX_PAGE_PT, PAGE_SIZES_PT } from '@/services/pdf/pageLayout';
import { chunkPages, everyPage, formatPageRanges, parsePageRanges } from '@/services/pdf/pageRanges';
import { extractPages, imagesToPdf, inspectPdf, mergePdfs, splitPdf } from '@/services/pdf/pdfEngine';

import { makeEncryptedPdf, makeJpeg, makePdf, makePng } from './helpers/fixtures';

/** Independent structural check of a generated PDF, then a full re-parse. */
async function expectValidPdf(bytes: Uint8Array) {
  const text = new TextDecoder('latin1').decode(bytes);
  expect(text.startsWith('%PDF-')).toBe(true);
  expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  expect(text).toMatch(/startxref\s+\d+/);
  return PDFDocument.load(bytes);
}

const widths = (doc: PDFDocument) => doc.getPages().map((p) => Math.round(p.getWidth()));

describe('page range parsing', () => {
  it('parses single pages, ranges and open ranges (1-based in, 0-based out)', () => {
    expect(parsePageRanges('1-3, 5, 8-', 10)).toEqual({ ok: true, groups: [[0, 1, 2], [4], [7, 8, 9]], pages: [0, 1, 2, 4, 7, 8, 9] });
    expect(parsePageRanges(' 2 ; 2 ', 3)).toEqual({ ok: true, groups: [[1], [1]], pages: [1] });
    expect(parsePageRanges('-2', 5)).toMatchObject({ ok: true, pages: [0, 1] });
    expect(parsePageRanges('3–4', 5)).toMatchObject({ ok: true, pages: [2, 3] });
  });

  it('rejects invalid input with a precise reason', () => {
    expect(parsePageRanges('', 5)).toEqual({ ok: false, error: 'empty' });
    expect(parsePageRanges('abc', 5)).toEqual({ ok: false, error: 'syntax' });
    expect(parsePageRanges('1--3', 5)).toEqual({ ok: false, error: 'syntax' });
    expect(parsePageRanges('0', 5)).toEqual({ ok: false, error: 'out_of_range' });
    expect(parsePageRanges('6', 5)).toEqual({ ok: false, error: 'out_of_range' });
    expect(parsePageRanges('4-2', 5)).toEqual({ ok: false, error: 'reversed' });
  });

  it('formats pages back to a compact label', () => {
    expect(formatPageRanges([0, 1, 2, 4, 9, 8])).toBe('1-3, 5, 9-10');
    expect(everyPage(3)).toEqual([[0], [1], [2]]);
    expect(chunkPages(5, 2)).toEqual([[0, 1], [2, 3], [4]]);
  });
});

describe('image page layout', () => {
  it('fits a landscape image on an auto-rotated A4 page, centred, aspect preserved', () => {
    const l = layoutImagePage({ width: 4000, height: 3000 }, { size: 'a4', orientation: 'auto', margin: 'medium' });
    expect(l.page).toEqual({ width: PAGE_SIZES_PT.a4.height, height: PAGE_SIZES_PT.a4.width });
    expect(l.image.width / l.image.height).toBeCloseTo(4 / 3, 5);
    expect(l.image.x).toBeGreaterThanOrEqual(36 - 1e-6);
    expect(l.image.y).toBeCloseTo((l.page.height - l.image.height) / 2, 5);
  });

  it('honours a forced portrait Letter page', () => {
    const l = layoutImagePage({ width: 4000, height: 3000 }, { size: 'letter', orientation: 'portrait', margin: 'none' });
    expect(l.page).toEqual({ width: 612, height: 792 });
    expect(l.image.width).toBeCloseTo(612, 5);
  });

  it('sizes "fit to image" pages to the image (96 dpi) and caps at the PDF limit', () => {
    const l = layoutImagePage({ width: 960, height: 480 }, { size: 'fit', orientation: 'auto', margin: 'none' });
    expect(l.page).toEqual({ width: 720, height: 360 });
    const huge = layoutImagePage({ width: 40000, height: 1000 }, { size: 'fit', orientation: 'auto', margin: 'small' });
    expect(huge.page.width).toBeLessThanOrEqual(MAX_PAGE_PT);
  });
});

describe('PDF engine (pdf-lib)', () => {
  it('reads page count and sizes', async () => {
    const info = await inspectPdf(await makePdf(3));
    expect(info.pageCount).toBe(3);
    expect(info.pageSizes.map((s) => s.width)).toEqual([500, 501, 502]);
    expect(info.uniformSize).toBe(false);
  });

  it('merges files in the chosen order into a valid PDF', async () => {
    const inputs = [await makePdf(2, 'A'), await makePdf(3, 'B')];
    const progress: number[] = [];
    const { bytes, pageCount } = await mergePdfs(2, async (i) => inputs[1 - i] as Uint8Array, (d) => progress.push(d));
    const doc = await expectValidPdf(bytes);
    expect(pageCount).toBe(5);
    expect(widths(doc)).toEqual([500, 501, 502, 500, 501]); // B first, then A
    expect(progress).toEqual([1, 2, 3]);
  });

  it('does not copy the original title/author into generated files', async () => {
    const { bytes } = await mergePdfs(2, async () => makePdf(1, 'X'));
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(doc.getTitle()).toBeUndefined();
    expect(doc.getAuthor()).toBeUndefined();
    expect(doc.getProducer()).toBe('FilePilot');
  });

  it('extracts selected pages in order', async () => {
    const doc = await expectValidPdf(await extractPages(await makePdf(6), [4, 0, 2]));
    expect(widths(doc)).toEqual([504, 500, 502]);
  });

  it('rejects out-of-range page extraction', async () => {
    await expect(extractPages(await makePdf(2), [5])).rejects.toMatchObject({ code: 'invalid_page_range' });
    await expect(extractPages(await makePdf(2), [])).rejects.toMatchObject({ code: 'invalid_page_range' });
  });

  it('splits into one valid document per group, streamed part by part', async () => {
    const parts: { pages: number; widths: number[] }[] = [];
    const count = await splitPdf(await makePdf(5), [[0, 1], [2], [3, 4]], async (part) => {
      const d = await expectValidPdf(part);
      parts.push({ pages: d.getPageCount(), widths: widths(d) });
    });
    expect(count).toBe(3);
    expect(parts).toEqual([
      { pages: 2, widths: [500, 501] },
      { pages: 1, widths: [502] },
      { pages: 2, widths: [503, 504] },
    ]);
  });

  it('builds a PDF from JPEG and PNG images, one page each', async () => {
    const images = [
      { bytes: makeJpeg(400, 300), width: 400, height: 300 },
      { bytes: makePng(100, 200, true), width: 100, height: 200 },
    ];
    const { bytes, pageCount } = await imagesToPdf(2, async (i) => images[i] as (typeof images)[number], { size: 'a4', orientation: 'auto', margin: 'small' });
    const doc = await expectValidPdf(bytes);
    expect(pageCount).toBe(2);
    expect(doc.getPage(0).getWidth()).toBeCloseTo(PAGE_SIZES_PT.a4.height, 1); // landscape
    expect(doc.getPage(1).getWidth()).toBeCloseTo(PAGE_SIZES_PT.a4.width, 1); // portrait
    // Both images are really embedded as XObjects.
    expect(new TextDecoder('latin1').decode(bytes).match(/\/Subtype\s*\/Image/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('refuses non-PDF input, encrypted PDFs and unsupported image bytes', async () => {
    await expect(inspectPdf(makeJpeg(10, 10))).rejects.toMatchObject({ code: 'pdf_invalid' });
    await expect(inspectPdf(new TextEncoder().encode('%PDF-1.7 broken'))).rejects.toBeInstanceOf(ProcessingError);
    await expect(inspectPdf(await makeEncryptedPdf())).rejects.toMatchObject({ code: 'pdf_encrypted' });
    await expect(imagesToPdf(1, async () => ({ bytes: new Uint8Array([1, 2, 3, 4]), width: 1, height: 1 }), { size: 'a4', orientation: 'auto', margin: 'none' })).rejects.toMatchObject({
      code: 'unsupported_format',
    });
  });

  it('stops between files when cancelled', async () => {
    let calls = 0;
    const cancelAfterFirst = () => calls > 0;
    await expect(
      mergePdfs(3, async () => {
        calls++;
        return makePdf(1);
      }, undefined, cancelAfterFirst),
    ).rejects.toMatchObject({ code: 'cancelled' });
    expect(calls).toBe(1);
  });

  it('handles a large document (300 pages) without failing', async () => {
    const big = await makePdf(300);
    const info = await inspectPdf(big);
    expect(info.pageCount).toBe(300);
    const doc = await expectValidPdf(await extractPages(big, [0, 149, 299]));
    expect(widths(doc)).toEqual([500, 649, 799]);
  }, 60_000);
});
