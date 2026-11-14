import { BackupError } from '@factory/storage';
import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { File, Paths } from 'expo-file-system';
import { router, Stack as RouterStack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { repos } from '@/database';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, describeBackup, exportUserData, importUserData } from '@/services/backupService';
import { resetLocalEntitlement } from '@/services/monetization';
import { cancelAllReminders, syncNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/** Export / import (JSON, documented in docs/backup-format.md) and full deletion. All local. */
export default function DataSettings() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<'export' | 'import' | 'delete' | null>(null);

  const doExport = async () => {
    setBusy('export');
    setMessage(null);
    try {
      const { json, fileName } = await exportUserData(repos().db);
      const file = new File(Paths.cache, fileName);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: t('data.export') });
      setMessage(t('data.exported'));
    } catch (e) {
      recordError(e, 'backup_export');
      setMessage(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const errorMessage = (e: unknown) => {
    if (e instanceof BackupError) return e.code === 'newer_schema' ? t('data.importNewer') : e.code === 'wrong_app' ? t('data.importWrongApp') : t('data.importInvalid');
    recordError(e, 'backup_import');
    return t('data.importFailed');
  };

  const doImport = async () => {
    setMessage(null);
    try {
      const picked = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', '*/*'] });
      if (picked.canceled || !picked.result) return;
      const raw = await picked.result.text();
      const info = describeBackup(raw);
      // Restoring replaces everything: always confirm with a summary of the file.
      Alert.alert(t('data.importConfirmTitle'), t('data.importConfirmBody', { habits: info.habits, logs: info.logs, tasks: info.tasks, date: fmt.date(new Date(info.createdAt)) }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('data.import'),
          style: 'destructive',
          onPress: async () => {
            setBusy('import');
            try {
              const { restoredRows } = await importUserData(repos().db, raw);
              usePreferences.getState().set({ onboardingCompleted: true });
              await syncNotifications(repos(), t);
              useSession.getState().bump();
              setMessage(t('data.imported', { count: restoredRows }));
            } catch (e) {
              setMessage(errorMessage(e));
            } finally {
              setBusy(null);
            }
          },
        },
      ]);
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  const doDelete = () => {
    Alert.alert(t('data.deleteConfirmTitle'), t('data.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          try {
            await deleteAllUserData(repos().db);
            await cancelAllReminders();
            resetLocalEntitlement();
            usePreferences.getState().reset();
            useSession.getState().bump();
            router.dismissAll();
            router.replace('/onboarding');
          } catch (e) {
            recordError(e, 'data_delete');
            setMessage(t('common.error'));
            setBusy(null);
          }
        },
      },
    ]);
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('data.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('data.intro')}</Text>
        <Card>
          <Text variant="subheading">{t('data.export')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.exportDesc')}
          </Text>
          <Button label={t('data.export')} icon="download-outline" variant="secondary" size="md" onPress={() => void doExport()} loading={busy === 'export'} testID="export" />
        </Card>
        <Card>
          <Text variant="subheading">{t('data.import')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.importDesc')}
          </Text>
          <Button label={t('data.import')} icon="cloud-upload-outline" variant="secondary" size="md" onPress={() => void doImport()} loading={busy === 'import'} />
        </Card>
        <Card>
          <Text variant="subheading" tone="danger">
            {t('data.delete')}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.deleteDesc')}
          </Text>
          <Button label={t('data.delete')} icon="trash-outline" variant="danger" size="md" onPress={doDelete} loading={busy === 'delete'} testID="delete-all" />
        </Card>
        {message ? (
          <Stack>
            <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
              {message}
            </Text>
          </Stack>
        ) : null}
      </Screen>
    </>
  );
}
