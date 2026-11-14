import { BackupError } from '@factory/storage';
import { Button, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Panel } from '@/components/ui';
import { repos } from '@/database';
import { resetLocalEntitlement } from '@/services/monetization';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backup';
import { pickJsonText, shareText } from '@/services/files';
import { rescheduleAll } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useFocus } from '@/store/focus';
import { useSession } from '@/store/session';

export default function DataSettings() {
  const { t, i18n } = useTranslation();
  const bump = useSession((s) => s.bump);
  const [busy, setBusy] = useState<string | null>(null);

  const exportAll = async () => {
    setBusy('export');
    try {
      const { json, fileName } = await exportUserData(repos().db);
      const ok = await shareText(fileName, json, 'application/json');
      if (!ok) Alert.alert(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const importAll = () =>
    Alert.alert(t('data.importTitle'), t('data.importBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.import'),
        style: 'destructive',
        onPress: async () => {
          setBusy('import');
          try {
            const raw = await pickJsonText();
            if (!raw) return;
            const { restoredRows } = await importUserData(repos().db, raw);
            await rescheduleAll(repos(), i18n.t);
            bump();
            Alert.alert(t('data.importDone', { count: restoredRows }));
          } catch (e) {
            const code = e instanceof BackupError ? e.code : 'unknown';
            Alert.alert(t('data.importFailed'), t(`data.errors.${code}`));
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
          await deleteAllUserData(repos().db);
          await rescheduleAll(repos(), i18n.t);
          useFocus.getState().clear();
          resetLocalEntitlement();
          usePreferences.getState().reset();
          bump();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.data') }} />
      <Text variant="bodySmall" tone="muted">
        {t('data.intro')}
      </Text>
      <Panel title={t('data.backup')} icon="cloud-download-outline">
        <Text variant="bodySmall" tone="muted">
          {t('data.backupHelp')}
        </Text>
        <Button label={t('data.export')} icon="share-outline" onPress={exportAll} loading={busy === 'export'} testID="export-data" />
        <Button label={t('data.import')} variant="secondary" icon="download-outline" onPress={importAll} loading={busy === 'import'} />
      </Panel>
      <Panel title={t('data.delete')} icon="trash-outline">
        <Text variant="bodySmall" tone="muted">
          {t('data.deleteHelp')}
        </Text>
        <Button label={t('data.deleteConfirm')} variant="danger" icon="trash" onPress={wipe} testID="delete-data" />
      </Panel>
    </Screen>
  );
}
