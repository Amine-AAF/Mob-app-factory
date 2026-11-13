import * as Print from 'expo-print';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { toCsv, type CsvCell } from '@/domain/csv';
import type { DayKey } from '@/domain/dates';
import { sumByCurrency, toMajor } from '@/domain/money';
import type { Home } from '@/domain/types';
import { fmt } from '@/i18n';

import { track } from './analytics';
import { shareGeneratedFile, shareTextExport, type OpenResult } from './files';

/**
 * CSV and PDF exports (Premium). Generated on the device and handed to the share sheet;
 * nothing is uploaded. PDFs are rendered from local HTML by the system print service.
 */
export type ExportKind = 'inventory' | 'expenses' | 'assets';

const major = (minor: number | null, currency: string | null): CsvCell => (minor == null || !currency ? null : toMajor(minor, currency));

async function rowsFor(kind: ExportKind, r: Repositories, home: Home, t: TFunction, range?: { from: DayKey; to: DayKey }) {
  const rooms = new Map((await r.homes.listRooms(home.id)).map((x) => [x.id, x.name]));
  const room = (id: string | null) => (id ? (rooms.get(id) ?? '') : '');
  if (kind === 'inventory') {
    const items = await r.inventory.list(home.id);
    return {
      header: [t('fields.name'), t('fields.category'), t('fields.quantity'), t('fields.unitValue'), t('fields.currency'), t('fields.room'), t('fields.purchaseDate'), t('fields.notes')],
      rows: items.map((i) => [i.name, t(`inventoryCategories.${i.category}`), i.quantity, major(i.estimatedValueMinor, i.currency), i.currency, room(i.roomId), i.purchaseDate, i.notes] as CsvCell[]),
      totals: sumByCurrency(items.filter((i) => i.estimatedValueMinor != null && i.currency).map((i) => ({ amountMinor: (i.estimatedValueMinor ?? 0) * i.quantity, currency: i.currency as string })), home.currency),
    };
  }
  if (kind === 'expenses') {
    const items = await r.expenses.list(home.id, range ?? {});
    return {
      header: [t('fields.date'), t('fields.category'), t('fields.title'), t('fields.amount'), t('fields.currency'), t('fields.paymentMethod'), t('fields.notes')],
      rows: items.map((e) => [e.spentOn, t(`expenseCategories.${e.category}`), e.title, major(e.amountMinor, e.currency), e.currency, e.paymentMethod ? t(`paymentMethods.${e.paymentMethod}`) : '', e.notes] as CsvCell[]),
      totals: sumByCurrency(items, home.currency),
    };
  }
  const items = await r.assets.list(home.id);
  return {
    header: [t('fields.name'), t('fields.category'), t('fields.brand'), t('fields.model'), t('fields.serialNumber'), t('fields.room'), t('fields.purchaseDate'), t('fields.purchasePrice'), t('fields.currency'), t('fields.warrantyEnd'), t('fields.status')],
    rows: items.map((a) => [a.name, t(`assetCategories.${a.category}`), a.brand, a.model, a.serialNumber, room(a.roomId), a.purchaseDate, major(a.purchasePriceMinor, a.currency), a.currency, a.warrantyEnd, t(`assetStatus.${a.status}`)] as CsvCell[]),
    totals: sumByCurrency(items.filter((a) => a.purchasePriceMinor != null && a.currency).map((a) => ({ amountMinor: a.purchasePriceMinor ?? 0, currency: a.currency as string })), home.currency),
  };
}

const stamp = (d: DayKey) => d;

export async function exportCsv(kind: ExportKind, r: Repositories, home: Home, t: TFunction, today: DayKey, range?: { from: DayKey; to: DayKey }): Promise<OpenResult> {
  const { header, rows } = await rowsFor(kind, r, home, t, range);
  track('export_created', { kind: `${kind}_csv` });
  return shareTextExport(`homecare-${kind}-${stamp(today)}.csv`, toCsv(header, rows), 'text/csv', t('export.shareTitle'));
}

export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function buildReportHtml(title: string, subtitle: string, header: string[], rows: CsvCell[][], totalsLabel: string, totals: string): string {
  const th = header.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:sans-serif;color:#0E1222;margin:24px} h1{color:#0F766E;font-size:22px;margin:0}
    p.sub{color:#4E566E;margin:4px 0 16px} table{border-collapse:collapse;width:100%;font-size:10px}
    th{background:#E6F2F1;text-align:left} th,td{border:1px solid #D5DCE3;padding:4px 6px;vertical-align:top}
    tr:nth-child(even) td{background:#F7F9FA} .tot{margin-top:12px;font-weight:bold}
  </style></head><body><h1>${escapeHtml(title)}</h1><p class="sub">${escapeHtml(subtitle)}</p>
  <table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
  <p class="tot">${escapeHtml(totalsLabel)}: ${escapeHtml(totals)}</p></body></html>`;
}

export async function exportPdf(kind: ExportKind, r: Repositories, home: Home, t: TFunction, today: DayKey, range?: { from: DayKey; to: DayKey }): Promise<OpenResult> {
  const { header, rows, totals } = await rowsFor(kind, r, home, t, range);
  const html = buildReportHtml(
    t(`export.titles.${kind}`, { home: home.name }),
    t('export.generatedOn', { date: fmt.day(today, 'long') }),
    header,
    rows,
    t('export.total'),
    fmt.moneyList(totals),
  );
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  track('export_created', { kind: `${kind}_pdf` });
  return shareGeneratedFile(uri, `homecare-${kind}-${stamp(today)}.pdf`, 'application/pdf', t('export.shareTitle'));
}
