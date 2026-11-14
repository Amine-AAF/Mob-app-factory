import { Button, Card, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { PremiumLock } from '@/components/media';
import { Notice, ScreenHeader } from '@/components/ui';
import { repos } from '@/database';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backup';
import { cleanOrphanFiles, refreshHomes } from '@/services/boot';
import { clock } from '@/services/clock';
import { deleteAllFiles, pickTextFile, shareTextExport } from '@/services/files';
import { exportCsv, exportPdf, type ExportKind } from '@/services/exports';
import { resetLocalEntitlement } from '@/services/monetization';
import { mutate } from '@/services/mutations';
import { cancelAll } from '@/services/reminders';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const KINDS: ExportKind[] = ['assets', 'inventory', 'expenses'];

export default function DataSettings() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      recordError(e, `data_${key}`);
      Alert.alert(t('common.error'), t('data.failed'));
    } finally {
      setBusy(null);
    }
  };

  const backup = () =>
    run('backup', async () => {
      const { json, fileName } = await exportUserData(repos().db, clock.now());
      const res = await shareTextExport(fileName, json, 'application/json', t('data.backupShare'));
      if (res === 'no_app') Alert.alert(t('common.error'), t('files.noApp'));
    });

  const restore = () =>
    Alert.alert(t('data.restoreTitle'), t('data.restoreWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.restore'),
        style: 'destructive',
        onPress: () =>
          void run('restore', async () => {
            const picked = await pickTextFile();
            if (picked.status !== 'ok') return;
            try {
              const { restoredRows } = await mutate(() => importUserData(repos().db, picked.value), { homes: true });
              await cleanOrphanFiles(repos());
              Alert.alert(t('data.restoredTitle'), t('data.restored', { count: restoredRows }));
            } catch (e) {
              const code = (e as { code?: string }).code;
              Alert.alert(t('common.error'), t(`data.restoreErrors.${code ?? 'unknown'}`, { defaultValue: t('data.restoreErrors.unknown') }));
            }
          }),
      },
    ]);

  const wipe = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          void run('delete', async () => {
            await cancelAll();
            await deleteAllUserData(repos().db);
            deleteAllFiles();
            resetLocalEntitlement();
            await refreshHomes(repos());
            usePreferences.getState().reset();
            usePreferences.getState().set({ onboardingCompleted: false });
            router.replace('/onboarding');
          }),
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title={t('settings.data')} back />
      <Notice icon="phone-portrait-outline">{t('data.localOnly')}</Notice>

      <SectionHeader title={t('data.backupSection')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('data.backupHint')}
        </Text>
        <Stack gap={2}>
          <Button label={t('data.backup')} icon="cloud-upload-outline" onPress={backup} loading={busy === 'backup'} testID="backup" />
          <Button label={t('data.restore')} icon="cloud-download-outline" variant="secondary" onPress={restore} loading={busy === 'restore'} />
        </Stack>
        <Text variant="caption" tone="subtle">
          {t('data.filesNotIncluded')}
        </Text>
      </Card>

      <SectionHeader title={t('data.exportSection')} />
      {!isPremium ? (
        <PremiumLock feature="export" message={t('data.exportLocked')} />
      ) : home ? (
        <Card>
          {KINDS.map((k) => (
            <Stack key={k} gap={2}>
              <Text variant="subheading">{t(`export.kinds.${k}`)}</Text>
              <Stack gap={2}>
                <Button label={t('export.csv')} size="md" variant="secondary" icon="grid-outline" loading={busy === `${k}-csv`} onPress={() => run(`${k}-csv`, () => exportCsv(k, repos(), home, t, today))} />
                <Button label={t('export.pdf')} size="md" variant="secondary" icon="document-outline" loading={busy === `${k}-pdf`} onPress={() => run(`${k}-pdf`, () => exportPdf(k, repos(), home, t, today))} />
              </Stack>
            </Stack>
          ))}
        </Card>
      ) : null}

      <SectionHeader title={t('data.dangerZone')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('data.deleteHint')}
        </Text>
        <Button label={t('data.deleteAll')} variant="danger" icon="trash-outline" onPress={wipe} loading={busy === 'delete'} testID="delete-all" />
      </Card>
    </Screen>
  );
}
