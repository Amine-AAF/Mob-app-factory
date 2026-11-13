import { BackupError } from '@factory/storage';
import { Badge, Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { formatDay } from '@/components/finance';
import { SwitchRow } from '@/components/inputs';
import { repos } from '@/database';
import { deleteAllData, exportBackup, readBackup, restoreBackup } from '@/features/backup/backup';
import { CsvError } from '@/features/backup/csv';
import { commitImport, exportTransactionsCsv, prepareImport } from '@/features/backup/importExport';
import { CSV_COLUMNS, REQUIRED_COLUMNS, type ImportPreview } from '@/features/backup/transactionsCsv';
import { categoryName } from '@/i18n';
import { useMoney } from '@/hooks';
import { recordError } from '@/services/analytics';
import { reloadSession } from '@/services/boot';
import { clock } from '@/services/clock';
import { pickTextFile, shareTextFile } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { cancelAllReminders } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';
import { periodRange, type PeriodKind } from '@/utils/dates';

type Busy = 'csv' | 'import' | 'commit' | 'backup' | 'restore' | 'delete' | null;

/**
 * Everything here is LOCAL: exports go to the system share sheet chosen by the user,
 * imports are previewed and validated before anything is written, and nothing is
 * overwritten without an explicit confirmation. No ad is shown on this screen.
 */
export default function DataScreen() {
  const { t } = useTranslation();
  const money = useMoney();
  const isPremium = useIsPremium();
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [range, setRange] = useState<'all' | PeriodKind>('all');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const nameOf = (c: Parameters<typeof categoryName>[0]) => categoryName(c, t);

  async function exportCsv() {
    setBusy('csv');
    setMessage(null);
    try {
      const r = range === 'all' ? undefined : periodRange(range, clock.today());
      const { csv, count } = await exportTransactionsCsv(repos(), nameOf, r);
      await shareTextFile(`spendwise-transactions-${clock.today()}.csv`, csv, 'text/csv', t('data.exportCsv'));
      setMessage(t('data.exported', { count }));
    } catch (e) {
      recordError(e, 'csv_export');
      setMessage(t('common.error'));
    } finally {
      setBusy(null);
    }
  }

  async function pickCsv() {
    setBusy('import');
    setMessage(null);
    try {
      const text = await pickTextFile(['text/csv', 'text/comma-separated-values', 'text/plain', '*/*']);
      if (text === null) return;
      setPreview(await prepareImport(repos(), text, nameOf));
    } catch (e) {
      if (e instanceof CsvError) setMessage(t(`data.csvErrors.${e.code}`));
      else {
        recordError(e, 'csv_preview');
        setMessage(t('data.csvErrors.unreadable'));
      }
    } finally {
      setBusy(null);
    }
  }

  async function confirmImport() {
    if (!preview) return;
    setBusy('commit');
    try {
      const res = await commitImport(repos(), preview, { includeDuplicates });
      setPreview(null);
      await reloadSession();
      setMessage(t('data.imported', { count: res.imported }));
    } catch (e) {
      recordError(e, 'csv_commit');
      setMessage(t('data.importFailed'));
    } finally {
      setBusy(null);
    }
  }

  async function backup() {
    setBusy('backup');
    setMessage(null);
    try {
      const { json, fileName } = await exportBackup(repos().db);
      await shareTextFile(fileName, json, 'application/json', t('data.backup'));
      setMessage(t('data.backupDone'));
    } catch (e) {
      recordError(e, 'backup_export');
      setMessage(t('common.error'));
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    setMessage(null);
    try {
      const raw = await pickTextFile(['application/json', 'text/plain', '*/*']);
      if (raw === null) return;
      const { backup: file, summary } = readBackup(raw);
      Alert.alert(
        t('data.restoreConfirmTitle'),
        t('data.restoreConfirmBody', { date: formatDay(summary.createdAt.slice(0, 10)), transactions: summary.counts.transactions ?? 0, accounts: summary.counts.accounts ?? 0 }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('data.restore'),
            style: 'destructive',
            onPress: async () => {
              setBusy('restore');
              try {
                await restoreBackup(repos().db, file);
                await repos().categories.seedDefaults();
                await reloadSession();
                setMessage(t('data.restored'));
              } catch (e) {
                if (!(e instanceof BackupError)) recordError(e, 'backup_restore');
                setMessage(t('data.restoreFailed'));
              } finally {
                setBusy(null);
              }
            },
          },
        ],
      );
    } catch (e) {
      if (e instanceof BackupError) setMessage(t(`data.backupErrors.${e.code}`));
      else {
        recordError(e, 'backup_read');
        setMessage(t('data.backupErrors.invalid_format'));
      }
    }
  }

  function deleteEverything() {
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          try {
            await deleteAllData(repos().db);
            await repos().categories.seedDefaults();
            await cancelAllReminders();
            resetLocalEntitlement();
            const { interfaceLanguage, theme } = usePreferences.getState();
            usePreferences.getState().reset();
            usePreferences.getState().set({ interfaceLanguage, theme });
            await reloadSession();
            useSession.getState().bump();
            router.replace('/onboarding');
          } catch (e) {
            recordError(e, 'delete_all');
            setMessage(t('common.error'));
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  }

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('data.title') }} />
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('data.localOnly')}
        </Text>
      </Card>
      {message ? (
        <Card tone="primary">
          <Text accessibilityLiveRegion="polite">{message}</Text>
        </Card>
      ) : null}

      {preview ? (
        <Card testID="import-preview">
          <Text variant="heading">{t('data.previewTitle')}</Text>
          <Row gap={2} wrap>
            <Badge label={t('data.previewValid', { count: preview.rows.length - preview.duplicates })} tone="success" />
            {preview.duplicates ? <Badge label={t('data.previewDuplicates', { count: preview.duplicates })} tone="warning" /> : null}
            {preview.errors.length ? <Badge label={t('data.previewErrors', { count: preview.errors.length })} tone="danger" /> : null}
          </Row>
          {preview.newAccounts.length ? <Text variant="bodySmall">{t('data.previewNewAccounts', { names: preview.newAccounts.map((a) => `${a.name} (${a.currency})`).join(', ') })}</Text> : null}
          {preview.fallbackCategories ? <Text variant="bodySmall" tone="muted">{t('data.previewFallback', { count: preview.fallbackCategories })}</Text> : null}
          {preview.errors.slice(0, 5).map((e) => (
            <Text key={`${e.line}-${e.code}`} variant="caption" tone="danger">
              {t('data.rowError', { line: e.line, field: e.code })}
            </Text>
          ))}
          {preview.rows.slice(0, 5).map((r) => (
            <Text key={r.line} variant="caption" tone={r.duplicate ? 'subtle' : 'muted'} numberOfLines={1}>
              {r.date} · {t(`tx.types.${r.type}`)} · {money(r.amount, r.currency)} · {r.accountName} {r.description ? `· ${r.description}` : ''}
            </Text>
          ))}
          {preview.duplicates ? <SwitchRow label={t('data.includeDuplicates')} value={includeDuplicates} onChange={setIncludeDuplicates} /> : null}
          <Row gap={2}>
            <Button label={t('common.cancel')} variant="secondary" size="md" onPress={() => setPreview(null)} />
            <Button label={t('data.importConfirm', { count: preview.rows.length - (includeDuplicates ? 0 : preview.duplicates) })} size="md" onPress={confirmImport} loading={busy === 'commit'} disabled={preview.rows.length - (includeDuplicates ? 0 : preview.duplicates) === 0} testID="import-confirm" />
          </Row>
        </Card>
      ) : null}

      <Card>
        <Text variant="subheading">{t('data.exportCsv')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.exportCsvDesc')}
        </Text>
        <Row gap={2} wrap>
          <Chip label={t('data.rangeAll')} selected={range === 'all'} onPress={() => setRange('all')} />
          {(['month', 'year'] as const).map((k) => (
            <Chip key={k} label={t(`data.range.${k}`)} icon={isPremium ? undefined : 'lock-closed-outline'} selected={range === k} onPress={() => (isPremium ? setRange(k) : router.push('/paywall?source=export'))} />
          ))}
        </Row>
        <Button label={t('data.exportCsv')} icon="document-text-outline" variant="secondary" size="md" onPress={exportCsv} loading={busy === 'csv'} testID="export-csv" />
      </Card>

      <Card>
        <Text variant="subheading">{t('data.importCsv')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.importCsvDesc')}
        </Text>
        <Text variant="mono" tone="muted">
          {CSV_COLUMNS.join(',')}
        </Text>
        <Text variant="caption" tone="muted">
          {t('data.csvRequired', { columns: REQUIRED_COLUMNS.join(', ') })}
        </Text>
        <Button label={t('data.importCsv')} icon="cloud-upload-outline" variant="secondary" size="md" onPress={pickCsv} loading={busy === 'import'} testID="import-csv" />
      </Card>

      <Card>
        <Text variant="subheading">{t('data.backup')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.backupDesc')}
        </Text>
        <Stack gap={2}>
          <Button label={t('data.backup')} icon="save-outline" variant="secondary" size="md" onPress={backup} loading={busy === 'backup'} testID="backup" />
          <Button label={t('data.restore')} icon="refresh-outline" variant="secondary" size="md" onPress={restore} loading={busy === 'restore'} testID="restore" />
        </Stack>
      </Card>

      <Card>
        <Text variant="subheading">{t('data.deleteTitle')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.deleteDesc')}
        </Text>
        <Button label={t('data.deleteConfirm')} icon="trash-outline" variant="danger" size="md" onPress={deleteEverything} loading={busy === 'delete'} testID="delete-all" />
      </Card>
    </Screen>
  );
}
