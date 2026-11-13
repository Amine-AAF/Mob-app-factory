/**
 * Minimal, dependency-free PDF 1.4 writer for AutoCare's reports.
 *
 * Why not a library: the factory's Expo SDK set has no print module installed and
 * reports only need text and simple tables. This writer uses the 14 standard PDF
 * fonts (Helvetica / Helvetica-Bold, WinAnsiEncoding), so French and Spanish
 * accents and "€" render; characters outside WinAnsi are replaced by "?".
 * The output is pure ASCII (non-ASCII bytes are octal-escaped), which keeps the
 * xref byte offsets exact. Generated on-device, never uploaded.
 */
export type PdfBlock =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'table'; columns: string[]; rows: string[][]; widths?: number[]; align?: ('left' | 'right')[] }
  | { type: 'spacer'; size?: number };

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** WinAnsi (cp1252) code points for the characters above 0x7F that differ from Latin-1. */
const CP1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89,
  0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95,
  0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

/** Converts text to WinAnsi byte codes; spaces used by Intl (NBSP, narrow NBSP) become regular spaces. */
export function toWinAnsi(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    let cp = ch.codePointAt(0)!;
    if (cp === 0x202f || cp === 0x2009 || cp === 0x2007) cp = 0x20;
    if (cp < 0x80 || (cp >= 0xa0 && cp <= 0xff)) out.push(cp);
    else if (CP1252[cp] !== undefined) out.push(CP1252[cp]!);
    else if (cp === 0x2212) out.push(0x2d); // minus sign
    else out.push(0x3f); // '?'
  }
  return out;
}

/** PDF literal string with escapes; every byte ≥ 0x80 is written as an octal escape. */
export function pdfString(text: string): string {
  let s = '(';
  for (const b of toWinAnsi(text)) {
    if (b === 0x28 || b === 0x29 || b === 0x5c) s += `\\${String.fromCharCode(b)}`;
    else if (b < 0x20 || b >= 0x7f) s += `\\${b.toString(8).padStart(3, '0')}`;
    else s += String.fromCharCode(b);
  }
  return `${s})`;
}

/** Approximate Helvetica advance widths (per 1000 em) — good enough for wrapping and right alignment. */
function charWidth(b: number, bold: boolean): number {
  if (b === 0x20) return 278;
  if (b >= 0x30 && b <= 0x39) return 556;
  const narrow = 'iIjl.,;:\'!|()[]f t'.includes(String.fromCharCode(b));
  const wide = 'mwMW@%'.includes(String.fromCharCode(b));
  const upper = b >= 0x41 && b <= 0x5a;
  const base = narrow ? 260 : wide ? 860 : upper ? 680 : 540;
  return bold ? base * 1.06 : base;
}

export function textWidth(text: string, size: number, bold = false): number {
  return (toWinAnsi(text).reduce((w, b) => w + charWidth(b, bold), 0) * size) / 1000;
}

function wrap(text: string, size: number, maxWidth: number, bold = false): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, bold) <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

function truncate(text: string, size: number, maxWidth: number, bold = false): string {
  if (textWidth(text, size, bold) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && textWidth(`${t}…`, size, bold) > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

export function renderPdf(blocks: readonly PdfBlock[], opts: { footer?: (page: number, pages: number) => string } = {}): string {
  const pages: string[][] = [[]];
  let y = PAGE_H - MARGIN;
  const ops = () => pages[pages.length - 1]!;
  const newPage = () => {
    pages.push([]);
    y = PAGE_H - MARGIN;
  };
  const ensure = (h: number) => {
    if (y - h < MARGIN + 24) newPage();
  };
  const text = (x: number, size: number, value: string, bold = false, gray = false) => {
    ops().push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${gray ? '0.4 0.4 0.4 rg' : '0.1 0.12 0.16 rg'} ${x.toFixed(2)} ${y.toFixed(2)} Td ${pdfString(value)} Tj ET`);
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'title':
        ensure(30);
        y -= 22;
        text(MARGIN, 20, block.text, true);
        y -= 8;
        break;
      case 'subtitle':
        for (const line of wrap(block.text, 10, CONTENT_W)) {
          ensure(14);
          y -= 13;
          text(MARGIN, 10, line, false, true);
        }
        y -= 6;
        break;
      case 'heading':
        ensure(40);
        y -= 22;
        text(MARGIN, 13, block.text, true);
        y -= 4;
        ops().push(`0.85 0.87 0.9 RG 0.8 w ${MARGIN} ${y.toFixed(2)} m ${PAGE_W - MARGIN} ${y.toFixed(2)} l S`);
        y -= 4;
        break;
      case 'text':
        for (const line of wrap(block.text, 10, CONTENT_W)) {
          ensure(14);
          y -= 14;
          text(MARGIN, 10, line);
        }
        break;
      case 'spacer':
        y -= block.size ?? 10;
        break;
      case 'table': {
        const n = block.columns.length;
        const weights = block.widths ?? block.columns.map(() => 1);
        const sum = weights.reduce((a, b) => a + b, 0);
        const widths = weights.map((w) => (w / sum) * CONTENT_W);
        const row = (cells: string[], bold: boolean) => {
          ensure(16);
          y -= 14;
          let x = MARGIN;
          for (let i = 0; i < n; i++) {
            const w = widths[i]!;
            const value = truncate(cells[i] ?? '', 9, w - 6, bold);
            const right = block.align?.[i] === 'right';
            text(right ? x + w - 3 - textWidth(value, 9, bold) : x + 3, 9, value, bold, false);
            x += w;
          }
        };
        row(block.columns, true);
        y -= 3;
        ops().push(`0.75 0.78 0.82 RG 0.6 w ${MARGIN} ${y.toFixed(2)} m ${PAGE_W - MARGIN} ${y.toFixed(2)} l S`);
        for (const r of block.rows) row(r, false);
        y -= 6;
        break;
      }
    }
  }

  // Assemble objects: 1 catalog, 2 pages, 3-4 fonts, then (page, content) pairs.
  const objects: string[] = [];
  const pageIds = pages.map((_, i) => 5 + i * 2);
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  pages.forEach((content, i) => {
    const footer = opts.footer?.(i + 1, pages.length);
    const stream = [...content, ...(footer ? [`BT /F1 8 Tf 0.45 0.45 0.45 rg ${MARGIN} 28 Td ${pdfString(footer)} Tj ET`] : [])].join('\n');
    const pageId = pageIds[i]!;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageId + 1} 0 R >>`;
    objects[pageId + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = out.length;
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) out += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
