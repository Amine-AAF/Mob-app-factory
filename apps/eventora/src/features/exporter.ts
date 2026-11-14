import type { TFunction } from 'i18next';
import { Alert } from 'react-native';

import { limitAlert } from '@/components/ui';
import { canExport } from '@/config/limits';
import type { EventSnapshot } from '@/database';
import { localToday } from '@/domain/time';
import { fmt } from '@/i18n';
import { buildCsv, type CsvKind } from '@/reports/csv';
import { buildReportHtml, type ReportContext, type ReportKind } from '@/reports/html';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { shareCsv, sharePdf } from '@/services/sharing';

export function reportContext(t: TFunction): ReportContext {
  return {
    t: (k, o) => t(k, o as Record<string, unknown>),
    money: fmt.money,
    day: fmt.day,
    time: fmt.time,
    eventStart: fmt.eventStart,
    percent: fmt.percent,
    generatedOn: fmt.day(localToday(clock.now()), 'long'),
  };
}

/** Kinds whose export can contain other people's personal data. */
const PERSONAL: readonly string[] = ['guests', 'rsvp', 'seating', 'gifts', 'vendors'];

function confirmPrivacy(t: TFunction, includeContacts: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(t('share.privacyTitle'), includeContacts ? t('share.privacyBodyContacts') : t('share.privacyBody'), [
      { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: t('share.continue'), onPress: () => resolve(true) },
    ]);
  });
}

function fileBase(snap: EventSnapshot, kind: string): string {
  const slug = snap.event.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'event';
  return `eventora-${slug}-${kind}`;
}

/**
 * Exports a report as PDF or CSV through the Android share sheet.
 * Premium-gated; warns before sharing personal data.
 */
export async function exportReport(opts: { t: TFunction; snap: EventSnapshot; kind: ReportKind | CsvKind; format: 'pdf' | 'csv'; includeContacts?: boolean; isPremium: boolean }): Promise<void> {
  const { t, snap, kind, format, isPremium } = opts;
  const includeContacts = opts.includeContacts ?? false;
  if (!canExport(isPremium, format)) return limitAlert(t, format === 'pdf' ? 'pdfExport' : 'csvExport', 0, `export_${kind}`);
  if (PERSONAL.includes(kind) && !(await confirmPrivacy(t, includeContacts))) return;
  const ctx = reportContext(t);
  const outcome =
    format === 'pdf'
      ? await sharePdf(buildReportHtml(kind as ReportKind, snap, ctx, { includeContacts }), fileBase(snap, kind), t(`reports.kinds.${kind}`))
      : await shareCsv(buildCsv(kind as CsvKind, snap, ctx, { includeContacts }), fileBase(snap, kind), t(`reports.kinds.${kind}`));
  if (outcome === 'shared') track('report_exported', { report: kind, format });
  else Alert.alert(t('share.failed'));
}
