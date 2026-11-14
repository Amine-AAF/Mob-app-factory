import { Button, Card, Screen, Text } from '@factory/design-system';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ToggleRow } from '@/components/fields';
import { repos } from '@/database';
import { BackupError } from '@factory/storage';
import { useData } from '@/hooks/useData';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, exportUserData, importUserData, type FileAccess } from '@/services/backup';
import { exportExpensesCsv, exportHealthCsv } from '@/services/exports';
import { clearExports, listFiles, readBase64, wipeAllFiles, writeBase64, writeExport } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { mutate } from '@/services/mutations';
import { cancelAllNotifications } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const files: FileAccess = { list: listFiles, read: readBase64, write: writeBase64 };

/**
 * Data ownership: backup, restore, CSV exports and full deletion.
 * Backup and deletion are always free (they are the user's rights).
 */
export default function DataSettings() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [includeFiles, setIncludeFiles] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: pets } = useData((r) => r.pets.listActive());

  const backup = async () => {
    setBusy('backup');
    try {
      const r = repos();
      const { json, fileName, skippedFiles } = await exportUserData(r.db, { files: includeFiles ? files : undefined, referenced: includeFiles ? await r.referencedFiles() : undefined });
      const f = writeExport(fileName, json);
      try {
        await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: t('data.backup') });
      } finally {
        if (f.exists) f.delete();
      }
      if (skippedFiles > 0) Alert.alert(t('data.backup'), t('data.skippedFiles', { count: skippedFiles }));
    } catch (e) {
      recordError(e, 'backup');
      Alert.alert(t('errors.exportTitle'), t('errors.exportBody'));
    } finally {
      setBusy(null);
    }
  };

  const restore = () =>
    Alert.alert(t('data.restoreTitle'), t('data.restoreBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.restore'),
        style: 'destructive',
        onPress: async () => {
          setBusy('restore');
          try {
            const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
            if (res.canceled || !res.assets[0]) return;
            const src = new File(res.assets[0].uri);
            const raw = await src.text();
            try {
              src.delete();
            } catch {
              // cache copy, removed by the OS eventually
            }
            const out = await mutate(t, () => importUserData(repos().db, raw, files));
            Alert.alert(t('data.restoreDoneTitle'), t('data.restoreDone', { rows: out.restoredRows, files: out.restoredFiles }));
          } catch (e) {
            const code = e instanceof BackupError ? e.code : 'invalid_format';
            recordError(e, 'restore');
            Alert.alert(t('data.restoreFailedTitle'), t(`data.restoreErrors.${code}`));
          } finally {
            setBusy(null);
          }
        },
      },
    ]);

  const wipe = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllNotifications();
          await mutate(t, () => deleteAllUserData(repos().db));
          wipeAllFiles();
          clearExports();
          resetLocalEntitlement();
          usePreferences.getState().reset();
          router.replace('/onboarding');
        },
      },
    ]);

  const premiumExport = (fn: () => Promise<void>) => async () => {
    if (!isPremium) return router.push('/paywall?source=csv_export');
    try {
      await fn();
    } catch (e) {
      recordError(e, 'csv_export');
      Alert.alert(t('errors.exportTitle'), t('errors.exportBody'));
    }
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.data') }} />
      <Card>
        <Text variant="subheading">{t('data.backup')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.backupBody')}
        </Text>
        <ToggleRow label={t('data.includeFiles')} help={t('data.includeFilesHelp')} value={includeFiles} onChange={setIncludeFiles} />
        <Button label={t('data.backup')} icon="cloud-download-outline" loading={busy === 'backup'} onPress={backup} testID="backup" />
        <Button label={t('data.restore')} icon="refresh-outline" variant="secondary" loading={busy === 'restore'} onPress={restore} />
      </Card>
      <Card>
        <Text variant="subheading">{t('data.exports')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.exportsBody')}
        </Text>
        <Button label={t('exports.expensesCsv')} icon="document-outline" variant="secondary" onPress={premiumExport(() => exportExpensesCsv(t))} />
        {(pets ?? []).map((p) => (
          <Button key={p.id} label={t('exports.healthCsvFor', { name: p.name })} icon="medkit-outline" variant="secondary" onPress={premiumExport(() => exportHealthCsv(p.id, t))} />
        ))}
      </Card>
      <Card>
        <Text variant="subheading">{t('data.deleteTitle')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.deleteHint')}
        </Text>
        <Button label={t('data.deleteConfirm')} icon="trash-outline" variant="danger" onPress={wipe} testID="delete-all" />
      </Card>
    </Screen>
  );
}
