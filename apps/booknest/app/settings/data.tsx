import { Button, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Page, Paper, Section } from '@/components/ui';
import { repos } from '@/database';
import { useAction, usePremiumGate } from '@/hooks';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { cleanOrphanCovers, readCoversBase64, writeCoversBase64 } from '@/services/covers';
import { fileExists, pickTextFile, sharePdf, shareTextFile } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { cancelAllReminders } from '@/services/reminders';
import { deleteAllUserData, describeBackup, exportBackup, exportLibraryCsv, libraryHtml, loadExportBooks, restoreFromBackup } from '@/services/transferService';
import { usePreferences } from '@/store/preferences';

export default function DataSettings() {
  const { t } = useTranslation();
  const run = useAction(t);
  const gate = usePremiumGate();
  const [busy, setBusy] = useState<string | null>(null);

  const withBusy = (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    void run(fn).finally(() => setBusy(null));
  };

  const backup = (withCovers: boolean) => {
    if (withCovers && !gate('advanced_backup')) return;
    withBusy(withCovers ? 'backup_full' : 'backup', async () => {
      const r = repos();
      const covers = withCovers ? await readCoversBase64(await r.books.coverUris()) : undefined;
      const { json, fileName } = await exportBackup(r.db, { covers });
      await shareTextFile(fileName, json, 'application/json');
      track('export_completed', { kind: withCovers ? 'backup_full' : 'backup' });
    });
  };

  const restore = () =>
    withBusy('restore', async () => {
      const raw = await pickTextFile(['application/json', 'text/plain', '*/*'], 200 * 1024 * 1024);
      if (!raw) return;
      const s = describeBackup(raw);
      const doRestore = (mode: 'merge' | 'replace') =>
        void run(async () => {
          const res = await restoreFromBackup(repos().db, raw, { mode, writeCovers: writeCoversBase64, fileExists });
          cleanOrphanCovers(await repos().books.coverUris());
          track('import_completed', { kind: `backup_${mode}`, rows: res.rows });
          Alert.alert(t('transfer.restoreDone'), t('transfer.restoredRows', { count: res.rows }));
        });
      Alert.alert(
        t('transfer.restoreTitle'),
        t('transfer.backupSummary', { date: fmt.day(s.createdAt.slice(0, 10)), books: s.books, quotes: s.quotes, notes: s.notes, sessions: s.sessions }) + (s.includesCovers ? `\n${t('transfer.includesCovers')}` : ''),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('transfer.merge'), onPress: () => doRestore('merge') },
          {
            text: t('transfer.replace'),
            style: 'destructive',
            onPress: () =>
              Alert.alert(t('transfer.replaceTitle'), t('transfer.replaceBody'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('transfer.replaceConfirm'), style: 'destructive', onPress: () => doRestore('replace') },
              ]),
          },
        ],
      );
    });

  const csv = () => {
    if (!gate('csv_export')) return;
    withBusy('csv', async () => {
      const { csv: content, fileName } = await exportLibraryCsv(repos().db);
      await shareTextFile(fileName, content, 'text/csv');
    });
  };

  const pdf = () => {
    if (!gate('pdf_export')) return;
    withBusy('pdf', async () => {
      const books = await loadExportBooks(repos().db);
      const html = libraryHtml(books, {
        title: t('transfer.pdfTitle'),
        generated: t('transfer.pdfGenerated', { date: fmt.day(new Date().toISOString().slice(0, 10)), count: books.length }),
        columns: [t('book.title'), t('book.author'), t('book.status'), t('review.rating'), t('book.finished')],
        status: (s) => t(`status.${s}`),
      });
      await sharePdf(html, `booknest-library-${new Date().toISOString().slice(0, 10)}.pdf`);
      track('export_completed', { kind: 'pdf' });
    });
  };

  const wipe = () =>
    Alert.alert(t('transfer.deleteAllTitle'), t('transfer.deleteAllBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('transfer.deleteAllConfirm'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('transfer.deleteAllTitle'), t('transfer.deleteAllFinal'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: () =>
                void run(async () => {
                  await cancelAllReminders();
                  await deleteAllUserData(repos().db);
                  cleanOrphanCovers([]);
                  resetLocalEntitlement();
                  usePreferences.getState().reset();
                  router.replace('/onboarding');
                }),
            },
          ]),
      },
    ]);

  return (
    <Page edges={['bottom']}>
      <Section title={t('transfer.backup')}>
        <Text variant="bodySmall" tone="muted">
          {t('transfer.backupIntro')}
        </Text>
        <Button label={t('transfer.exportBackup')} icon="download" onPress={() => backup(false)} loading={busy === 'backup'} testID="export-backup" />
        <Button label={t('transfer.exportFullBackup')} icon="images" variant="secondary" onPress={() => backup(true)} loading={busy === 'backup_full'} />
        <Button label={t('transfer.restore')} icon="cloud-upload" variant="secondary" onPress={restore} loading={busy === 'restore'} testID="restore-backup" />
      </Section>

      <Section title={t('transfer.importExport')}>
        <Button label={t('transfer.importCsv')} icon="document-text" variant="secondary" onPress={() => router.push('/settings/import')} testID="import-csv" />
        <Button label={t('transfer.exportCsv')} icon="grid" variant="secondary" onPress={csv} loading={busy === 'csv'} />
        <Button label={t('transfer.exportPdf')} icon="print" variant="secondary" onPress={pdf} loading={busy === 'pdf'} />
      </Section>

      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('transfer.privacyNote')}
        </Text>
      </Paper>

      <Section title={t('transfer.dangerZone')}>
        <Button label={t('transfer.deleteAll')} variant="danger" icon="trash" onPress={wipe} testID="delete-all" />
      </Section>
    </Page>
  );
}
