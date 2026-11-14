/**
 * RFC 4180 CSV reading/writing (quotes, escaped quotes, CRLF/LF, UTF-8 BOM).
 * Writing neutralises spreadsheet formula injection in text cells.
 */

export function parseCsv(text: string, delimiter = ','): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"' && field === '') {
      quoted = true;
      i++;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += ch === '\r' && src[i + 1] === '\n' ? 2 : 1;
    } else {
      field += ch;
      i++;
    }
  }
  if (quoted) throw new CsvError('unterminated_quote');
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0]?.trim() === ''));
}

export class CsvError extends Error {
  constructor(public readonly code: 'unterminated_quote' | 'empty' | 'missing_columns' | 'too_many_rows') {
    super(`CSV error: ${code}`);
    this.name = 'CsvError';
  }
}

/** Detects ';' (common in FR/ES spreadsheet exports) vs ',' from the header line. */
export function detectDelimiter(text: string): ',' | ';' {
  const first = text.split(/\r?\n/, 1)[0] ?? '';
  return (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ';' : ',';
}

const FORMULA_START = /^[=+\-@\t\r]/;

export function escapeCell(value: string | number | null | undefined, { text = true } = {}): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (text && FORMULA_START.test(s)) s = `'${s}`;
  return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: readonly string[], rows: readonly (readonly (string | number | null)[])[], numericColumns: ReadonlySet<number> = new Set()): string {
  const lines = [header.map((h) => escapeCell(h)).join(',')];
  for (const r of rows) lines.push(r.map((v, i) => escapeCell(v, { text: !numericColumns.has(i) })).join(','));
  return `${lines.join('\r\n')}\r\n`;
}
