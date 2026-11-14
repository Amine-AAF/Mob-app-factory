import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { recordError, track } from './analytics';

/**
 * Exports (Premium). Files are generated on the device and handed to the Android share
 * sheet; TravelWise uploads nothing. The temporary copy is deleted right after sharing
 * (and any leftover is cleaned at next start-up). No ad is ever shown during an export.
 */
export type ExportResult = 'shared' | 'unavailable' | 'failed';

async function shareAndClean(uri: string, mimeType: string, dialogTitle: string): Promise<ExportResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text' });
    return 'shared';
  } finally {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // cleaned at next start-up (cache folder sweep)
    }
  }
}

export async function exportItineraryPdf(html: string, fileName: string, dialogTitle: string): Promise<ExportResult> {
  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    // Rename into our temp prefix so the start-up sweep can always find leftovers.
    const target = new File(Paths.cache, `travelwise-tmp-${fileName}`);
    if (target.exists) target.delete();
    new File(uri).move(target);
    const res = await shareAndClean(target.uri, 'application/pdf', dialogTitle);
    if (res === 'shared') track('export_completed', { format: 'pdf' });
    return res;
  } catch (e) {
    recordError(e, 'export_pdf');
    return 'failed';
  }
}

export async function exportExpensesCsv(csv: string, fileName: string, dialogTitle: string): Promise<ExportResult> {
  try {
    const file = new File(Paths.cache, `travelwise-tmp-${fileName}`);
    if (file.exists) file.delete();
    file.create();
    file.write(csv);
    const res = await shareAndClean(file.uri, 'text/csv', dialogTitle);
    if (res === 'shared') track('export_completed', { format: 'csv' });
    return res;
  } catch (e) {
    recordError(e, 'export_csv');
    return 'failed';
  }
}
