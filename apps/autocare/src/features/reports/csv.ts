/**
 * RFC 4180 CSV with protection against spreadsheet formula injection:
 * a cell starting with = + - @ (or a tab / CR) is prefixed with an apostrophe,
 * so a station name like "=HYPERLINK(...)" is shown as text, never executed.
 * Numbers are written raw (dot decimal) so spreadsheets can compute on them.
 */
export type CsvCell = string | number | boolean | null | undefined;

export function escapeCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  let s = value;
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: readonly string[], rows: readonly (readonly CsvCell[])[]): string {
  // UTF-8 BOM so Excel opens accents (é, ñ) correctly.
  return `﻿${[header, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
}
