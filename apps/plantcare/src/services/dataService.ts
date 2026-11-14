import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';

import { getSpecies } from '@/content/species';
import { backupUserData, restoreUserData, wipeUserData, type Repositories } from '@/database';
import { dueStatus } from '@/domain/schedule';
import type { DayKey } from '@/domain/types';
import { fmt } from '@/i18n';

import { recordError, track } from './analytics';
import { clock } from './clock';
import { deleteAllPhotos } from './photos';

/**
 * Export / import / delete of the user's data. Everything goes through the Android share
 * sheet or the system file picker, i.e. only where the user explicitly sends it.
 * The JSON backup contains records and photo *references*; photo files stay on the device.
 */
export type ShareOutcome = 'shared' | 'no_app' | 'error';

function exportsDir(): Directory {
  const dir = new Directory(Paths.cache, 'exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

async function share(uri: string, mimeType: string, dialogTitle: string): Promise<ShareOutcome> {
  if (!(await Sharing.isAvailableAsync())) return 'no_app';
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  return 'shared';
}

export async function exportBackup(r: Repositories, t: TFunction): Promise<ShareOutcome> {
  try {
    const backup = await backupUserData(r.db, clock.now());
    const file = new File(exportsDir(), `plantcare-backup-${clock.today()}.json`);
    if (file.exists) file.delete();
    file.create();
    file.write(JSON.stringify(backup, null, 2));
    track('export_created', { kind: 'backup_json' });
    return await share(file.uri, 'application/json', t('data.shareTitle'));
  } catch (e) {
    recordError(e, 'backup_export');
    return 'error';
  }
}

export type ImportOutcome = { status: 'ok'; rows: number } | { status: 'cancelled' } | { status: 'invalid'; code: string } | { status: 'error' };

export async function importBackup(r: Repositories): Promise<ImportOutcome> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const raw = await new File(res.assets[0].uri).text();
    const { restoredRows } = await restoreUserData(r.db, raw);
    return { status: 'ok', rows: restoredRows };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code) return { status: 'invalid', code };
    recordError(e, 'backup_import');
    return { status: 'error' };
  }
}

export async function deleteEverything(r: Repositories): Promise<void> {
  await wipeUserData(r.db);
  deleteAllPhotos();
  await r.seasonal.ensureBuiltIns();
}

/* ------------------------------------------------------------------ PDF report (Premium) */

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Builds the care report HTML (pure, unit-tested). Photos are not embedded. */
export async function buildCareReportHtml(r: Repositories, t: TFunction, today: DayKey): Promise<string> {
  const [plants, tasks, locations] = await Promise.all([r.plants.list(), r.tasks.listActive(), r.locations.list()]);
  const locName = new Map(locations.map((l) => [l.id, l.name]));
  const sections: string[] = [];
  for (const p of plants) {
    const sp = getSpecies(p.speciesId);
    const ptasks = tasks.filter((x) => x.plantId === p.id);
    const waterings = await r.watering.forPlant(p.id);
    const rows = ptasks
      .map((x) => {
        const late = dueStatus(x, today) === 'overdue' ? ` (${escapeHtml(t('tasks.overdue'))})` : '';
        const every = x.intervalDays ? t('tasks.everyDays', { count: x.intervalDays }) : t('tasks.oneOff');
        return `<tr><td>${escapeHtml(t(`taskTypes.${x.type}`))}</td><td>${escapeHtml(every)}</td><td>${x.nextDue ? escapeHtml(fmt.day(x.nextDue)) : '—'}${late}</td></tr>`;
      })
      .join('');
    sections.push(`<section><h2>${escapeHtml(p.nickname)}</h2>
      <p class="sub">${[
        p.commonName ? escapeHtml(p.commonName) : null,
        p.scientificName ? `<i>${escapeHtml(p.scientificName)}</i>` : null,
        p.locationId ? escapeHtml(locName.get(p.locationId) ?? '') : null,
      ]
        .filter(Boolean)
        .join(' · ')}</p>
      ${sp ? `<p>${escapeHtml(t('library.light'))}: ${escapeHtml(sp.light.map((l) => t(`light.${l}`)).join(', '))} · ${escapeHtml(t('library.water'))}: ${escapeHtml(t(`water.${sp.water}`))}</p>` : ''}
      <p>${escapeHtml(t('report.lastWatered'))}: ${waterings[0] ? escapeHtml(fmt.day(waterings[0].date)) : '—'} · ${escapeHtml(t('report.waterings', { count: waterings.length }))}</p>
      ${rows ? `<table><thead><tr><th>${escapeHtml(t('report.task'))}</th><th>${escapeHtml(t('report.frequency'))}</th><th>${escapeHtml(t('report.next'))}</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
      ${p.notes ? `<p class="notes">${escapeHtml(p.notes)}</p>` : ''}
    </section>`);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:sans-serif;color:#13261B;margin:24px} h1{color:#2E7D4F;margin:0 0 4px} h2{color:#1F5C3A;margin:18px 0 2px;font-size:17px}
    .sub{color:#4E5E55;margin:0 0 6px;font-size:12px} table{border-collapse:collapse;width:100%;font-size:11px;margin-top:6px}
    th{background:#E6F2E9;text-align:left} th,td{border:1px solid #D2DED6;padding:4px 6px} section{page-break-inside:avoid;border-bottom:1px solid #E3ECE6;padding-bottom:8px}
    .notes{font-style:italic;color:#4E5E55;font-size:11px} footer{margin-top:20px;font-size:10px;color:#6B7B72}
  </style></head><body><h1>${escapeHtml(t('report.title'))}</h1><p class="sub">${escapeHtml(t('report.generatedOn', { date: fmt.day(today, { dateStyle: 'long' }), count: plants.length }))}</p>
  ${sections.join('')}<footer>${escapeHtml(t('report.footer'))}</footer></body></html>`;
}

export async function exportCareReportPdf(r: Repositories, t: TFunction): Promise<ShareOutcome> {
  try {
    const html = await buildCareReportHtml(r, t, clock.today());
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    track('export_created', { kind: 'care_pdf' });
    return await share(uri, 'application/pdf', t('data.shareTitle'));
  } catch (e) {
    recordError(e, 'pdf_export');
    return 'error';
  }
}

/** Purges temporary export files (called at start-up). */
export function purgeExports(): void {
  try {
    const dir = new Directory(Paths.cache, 'exports');
    if (dir.exists) dir.delete();
  } catch {
    // best effort
  }
}
