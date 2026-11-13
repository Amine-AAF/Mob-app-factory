/**
 * RFC 4180 CSV. Cells that a spreadsheet could interpret as a formula
 * (=, +, -, @, tab, CR) are prefixed with an apostrophe to prevent CSV injection.
 */
export type CsvCell = string | number | null | undefined;

export function escapeCell(value: CsvCell): string {
  if (value == null) return '';
  let s = typeof value === 'number' ? String(value) : value;
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: readonly string[], rows: readonly CsvCell[][]): string {
  // BOM so Excel opens UTF-8 (accents, currency symbols) correctly.
  return `﻿${[header, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
}
