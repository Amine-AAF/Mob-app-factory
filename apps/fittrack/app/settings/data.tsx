import { Button, Card, Screen, Text } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { InfoNote, PremiumGate } from '@/components/ui';
import { repos } from '@/database';
import { useExercises } from '@/hooks';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, describeBackup, exportCsv, exportUserData, importUserData } from '@/services/backupService';
import { pickTextFile, shareText } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { deleteAllPhotoFiles } from '@/services/photos';
import { cancelAllReminders, syncNotifications } from '@/services/reminders';
import { restoreActiveSession } from '@/services/workoutService';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

/** Backup (always free: data portability), restore, CSV export (Premium) and full deletion. */
export default function DataSettings() {
  const { t, i18n } = useTranslation();
  const premium = useIsPremium();
  const ex = useExercises();
  const [busy, setBusy] = useState<string | null>(null);

  const backup = async () => {
    setBusy('backup');
    try {
      const { json, fileName } = await exportUserData(repos().db);
      const res = await shareText(fileName, json, 'application/json', t('data.backupTitle'));
      if (res === 'unavailable') Alert.alert(t('data.shareUnavailable'));
      if (res === 'error') Alert.alert(t('common.error'), t('data.exportError'));
    } finally {
      setBusy(null);
    }
  };

  const csv = async () => {
    setBusy('csv');
    try {
      const files = await exportCsv(repos().db, (id) => ex.get(id)?.name ?? id);
      for (const f of files) await shareText(f.fileName, f.content, 'text/csv', t('data.csvTitle'));
    } catch (e) {
      recordError(e, 'csv_export');
      Alert.alert(t('common.error'), t('data.exportError'));
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    const picked = await pickTextFile();
    if (picked.status !== 'ok') return;
    let summary: ReturnType<typeof describeBackup>;
    try {
      summary = describeBackup(picked.text);
    } catch {
      return Alert.alert(t('data.invalidTitle'), t('data.invalidBody'));
    }
    Alert.alert(
      t('data.restoreTitle'),
      t('data.restoreBody', { date: fmt.mediumDate(new Date(summary.createdAt)), sessions: summary.sessions, programs: summary.programs, measurements: summary.measurements, cardio: summary.cardio }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('data.restoreConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await importUserData(repos().db, picked.text);
              await restoreActiveSession(repos());
              useSession.getState().bump();
              await syncNotifications(repos(), i18n.t);
              Alert.alert(t('data.restoredTitle'));
            } catch (e) {
              recordError(e, 'restore');
              Alert.alert(t('data.invalidTitle'), t('data.restoreFailed'));
            }
          },
        },
      ],
    );
  };

  const wipe = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders();
          await deleteAllUserData(repos().db);
          deleteAllPhotoFiles();
          resetLocalEntitlement();
          usePreferences.getState().reset();
          useSession.getState().setActiveSession(null);
          useSession.getState().bump();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.data') }} />
      <InfoNote text={t('data.localOnly')} icon="phone-portrait-outline" />
      <Card>
        <Text variant="subheading">{t('data.backupTitle')}</Text>
        <Text variant="bodySmall" tone="muted">{t('data.backupBody')}</Text>
        <Button label={t('data.backup')} icon="download-outline" loading={busy === 'backup'} onPress={() => void backup()} testID="export-backup" />
        <Button label={t('data.restore')} icon="cloud-upload-outline" variant="secondary" onPress={() => void restore()} testID="restore-backup" />
        <Text variant="caption" tone="subtle">{t('data.photosNote')}</Text>
      </Card>
      {premium ? (
        <Card>
          <Text variant="subheading">{t('data.csvTitle')}</Text>
          <Text variant="bodySmall" tone="muted">{t('data.csvBody')}</Text>
          <Button label={t('data.csv')} icon="document-text-outline" variant="secondary" loading={busy === 'csv'} onPress={() => void csv()} />
        </Card>
      ) : (
        <PremiumGate title={t('premium.csvTitle')} message={t('premium.csvBody')} source="csv" />
      )}
      <Card>
        <Text variant="subheading">{t('data.deleteTitle')}</Text>
        <Text variant="bodySmall" tone="muted">{t('data.deleteExplain')}</Text>
        <Button label={t('data.deleteConfirm')} variant="danger" onPress={wipe} testID="delete-all" />
      </Card>
      <Text variant="caption" tone="subtle">{t('data.dateNote', { date: fmt.mediumDate(fromDayKey(useSession.getState().today || '2026-01-01')) })}</Text>
    </Screen>
  );
}
