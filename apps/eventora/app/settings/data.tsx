import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Notice, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { mutate } from '@/hooks/useData';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';
import { wipeAllFiles } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { cancelAll } from '@/services/notifications';
import { pickTextFile, shareJson } from '@/services/sharing';
import { usePreferences } from '@/store/preferences';

/** Data ownership: JSON backup, restore and full deletion (always free). */
export default function DataSettings() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const doExport = async () => {
    setBusy('export');
    try {
      const { json, fileName } = await exportUserData(repos().db);
      const outcome = await shareJson(json, fileName, t('settings.backup'));
      if (outcome !== 'shared') Alert.alert(t('share.failed'));
    } finally {
      setBusy(null);
    }
  };

  const doImport = () =>
    Alert.alert(t('data.restoreTitle'), t('data.restoreBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.restoreConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy('import');
          try {
            const file = await pickTextFile('json');
            if (!file) return;
            const { restoredRows } = await mutate((r) => importUserData(r.db, file.text));
            Alert.alert(t('data.restored', { count: restoredRows }));
          } catch (e) {
            const code = (e as { code?: string }).code;
            Alert.alert(t('data.restoreFailed'), code ? t(`data.errors.${code}`) : undefined);
          } finally {
            setBusy(null);
          }
        },
      },
    ]);

  const doDelete = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await cancelAll().catch(() => undefined);
          await mutate((r) => deleteAllUserData(r.db));
          wipeAllFiles();
          resetLocalEntitlement();
          usePreferences.getState().reset();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('settings.data')} />
      <Notice icon="phone-portrait-outline" title={t('data.localTitle')}>
        {t('data.localBody')}
      </Notice>
      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('settings.backup')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.backupBody')}
          </Text>
          <Button icon="cloud-download-outline" label={t('settings.exportJson')} onPress={() => void doExport()} loading={busy === 'export'} testID="data-export" />
          <Button variant="secondary" icon="cloud-upload-outline" label={t('data.restore')} onPress={doImport} loading={busy === 'import'} />
        </Stack>
      </Card>
      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('data.deleteTitle')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.deleteHint')}
          </Text>
          <Button variant="danger" icon="trash-outline" label={t('data.deleteConfirm')} onPress={doDelete} />
        </Stack>
      </Card>
    </Screen>
  );
}
