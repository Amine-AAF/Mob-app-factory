import { Button, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Page, Paper, Pill, Serif } from '@/components/ui';
import { remainingQuota } from '@/config/limits';
import { repos } from '@/database';
import type { ImportPreview } from '@/features/transfer/csv';
import { useAction } from '@/hooks';
import { pickTextFile } from '@/services/files';
import { commitCsvImport, previewCsvImport, type ImportOutcome } from '@/services/transferService';
import { useIsPremium } from '@/store/session';

/** CSV import: preview first (validation errors, duplicates), then an explicit import. Never overwrites. */
export default function ImportCsv() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const premium = useIsPremium();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [quota, setQuota] = useState(Infinity);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [result, setResult] = useState<ImportOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () =>
    void run(async () => {
      const raw = await pickTextFile(['text/csv', 'text/comma-separated-values', 'text/plain', '*/*']);
      if (!raw) return;
      setResult(null);
      setPreview(await previewCsvImport(repos(), raw));
      setQuota(remainingQuota('books', await repos().books.count(), premium));
    });

  const commit = () => {
    if (!preview) return;
    setBusy(true);
    void run(async () => setResult(await commitCsvImport(repos(), preview, { includeDuplicates }))).finally(() => setBusy(false));
  };

  const toImport = preview ? preview.rows.filter((r) => !r.errors.length && (includeDuplicates || !r.duplicate)).length : 0;
  const issues = preview?.rows.filter((r) => r.errors.length || r.warnings.length || r.duplicate).slice(0, 50) ?? [];

  return (
    <Page
      edges={['bottom']}
      footer={
        result ? (
          <Button label={t('common.done')} size="lg" onPress={() => router.back()} />
        ) : preview ? (
          <Button label={t('transfer.importN', { count: Math.min(toImport, quota) })} size="lg" disabled={!toImport || quota <= 0} onPress={commit} loading={busy} testID="commit-import" />
        ) : (
          <Button label={t('transfer.chooseCsv')} size="lg" icon="folder-open" onPress={pick} testID="pick-csv" />
        )
      }
    >
      <Text tone="muted">{t('transfer.csvIntro')}</Text>
      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('transfer.csvColumns')}
        </Text>
      </Paper>

      {result ? (
        <Paper tone="primary" testID="import-result">
          <Serif size={20}>{t('transfer.importDone')}</Serif>
          <Text>{t('transfer.imported', { count: result.imported })}</Text>
          {result.skippedDuplicates ? <Text variant="bodySmall">{t('transfer.skippedDuplicates', { count: result.skippedDuplicates })}</Text> : null}
          {result.skippedInvalid ? <Text variant="bodySmall">{t('transfer.skippedInvalid', { count: result.skippedInvalid })}</Text> : null}
          {result.skippedLimit ? <Text variant="bodySmall">{t('transfer.skippedLimit', { count: result.skippedLimit })}</Text> : null}
        </Paper>
      ) : null}

      {preview && !result ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Pill label={t('transfer.validRows', { count: preview.valid })} tone="success" icon="checkmark" />
            {preview.invalid ? <Pill label={t('transfer.invalidRows', { count: preview.invalid })} tone="danger" icon="alert-circle" /> : null}
            {preview.duplicates ? <Pill label={t('transfer.duplicateRows', { count: preview.duplicates })} tone="warning" icon="copy" /> : null}
          </View>
          {quota !== Infinity && toImport > quota ? (
            <Paper tone="alt">
              <Text variant="bodySmall">{t('transfer.quotaWarning', { count: quota })}</Text>
            </Paper>
          ) : null}
          {preview.duplicates ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ flex: 1 }}>{t('transfer.includeDuplicates')}</Text>
              <Switch value={includeDuplicates} onValueChange={setIncludeDuplicates} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t('transfer.includeDuplicates')} />
            </View>
          ) : null}
          {preview.unknownColumns.length ? (
            <Text variant="caption" tone="subtle">
              {t('transfer.ignoredColumns', { columns: preview.unknownColumns.slice(0, 8).join(', ') })}
            </Text>
          ) : null}
          {issues.map((row) => (
            <Paper key={row.line} style={{ gap: 4 }}>
              <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                {t('transfer.line', { line: row.line })} — {row.book.title || '∅'}
              </Text>
              {row.errors.map((e) => (
                <Text key={e} variant="caption" tone="danger">
                  {t(`transfer.issues.${e}`)}
                </Text>
              ))}
              {row.warnings.map((w) => (
                <Text key={w} variant="caption" tone="warning">
                  {t(`transfer.issues.${w}`)}
                </Text>
              ))}
              {row.duplicate ? (
                <Text variant="caption" tone="subtle">
                  {t(`transfer.duplicateReason.${row.duplicate.reason}`)}
                </Text>
              ) : null}
            </Paper>
          ))}
          <Button label={t('transfer.chooseOther')} variant="ghost" onPress={pick} />
        </>
      ) : null}
    </Page>
  );
}
