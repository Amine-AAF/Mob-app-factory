import { BackupError } from '@factory/storage';
import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { File, Paths } from 'expo-file-system';
import { router, Stack as RouterStack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { allQuestions } from '@/content';
import { repos } from '@/database';
import { useContentLanguage } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, exportUserData, formatAnswersExport, importUserData } from '@/services/backup';
import { resetLocalEntitlement } from '@/services/monetization';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

type Busy = 'backup' | 'answers' | 'import' | 'delete' | null;

/** Writes a file to the cache directory and opens the system share sheet (save to Files, Drive, e-mail…). */
async function shareFile(fileName: string, content: string, mimeType: string, dialogTitle: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
}

export default function DataScreen() {
  const { t } = useTranslation();
  const lng = useContentLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);

  const run = async (kind: Exclude<Busy, null>, task: () => Promise<void>) => {
    setBusy(kind);
    setMessage(null);
    try {
      await task();
    } catch (e) {
      recordError(e, `data_${kind}`);
      setMessage(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const exportBackup = () =>
    run('backup', async () => {
      const { json, fileName } = await exportUserData(repos().db);
      await shareFile(fileName, json, 'application/json', t('data.backup'));
      setMessage(t('data.exported'));
    });

  const exportAnswers = () =>
    run('answers', async () => {
      const practice = repos().practice;
      const [answers, sessions] = await Promise.all([practice.listAnswers(), practice.listMocks(200)]);
      const mocks = await Promise.all(sessions.map(async (s) => ({ startedAt: s.startedAt, answers: await practice.getMockAnswers(s.id) })));
      const questions = new Map(allQuestions(lng).map((q) => [q.id, q.question]));
      const text = formatAnswersExport(
        { answers, mocks },
        {
          title: t('data.answersTitle'),
          builderSection: t('practice.builder.title'),
          mockSection: t('practice.mock.title'),
          question: (id) => questions.get(id) ?? id,
          skipped: t('mock.skipped'),
          notes: t('mock.notes'),
        },
      );
      await shareFile(`interviewready-answers-${new Date().toISOString().slice(0, 10)}.md`, text, 'text/markdown', t('data.exportAnswers'));
      setMessage(t('data.exported'));
    });

  const restoreFrom = async (raw: string) => {
    try {
      const { restoredRows } = await importUserData(repos().db, raw);
      useSession.getState().setProfile(await repos().profile.get());
      usePreferences.getState().set({ onboardingCompleted: true });
      useSession.getState().bump();
      setMessage(t('data.imported', { count: restoredRows }));
    } catch (e) {
      if (e instanceof BackupError) setMessage(e.code === 'newer_schema' ? t('data.importNewer') : t('data.importInvalid'));
      else {
        recordError(e, 'data_import');
        setMessage(t('common.error'));
      }
    }
  };

  const importBackup = async () => {
    setMessage(null);
    try {
      const picked = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', '*/*'] });
      if (picked.canceled || !picked.result) return;
      const raw = await picked.result.text();
      Alert.alert(t('data.importConfirmTitle'), t('data.importConfirmBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('data.import'),
          onPress: async () => {
            setBusy('import');
            await restoreFrom(raw);
            setBusy(null);
          },
        },
      ]);
    } catch (e) {
      recordError(e, 'data_pick');
      setMessage(t('data.importInvalid'));
    }
  };

  const deleteAll = () => {
    Alert.alert(t('data.deleteConfirmTitle'), t('data.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          try {
            await deleteAllUserData(repos().db);
            resetLocalEntitlement();
            usePreferences.getState().reset();
            useSession.getState().setProfile(null);
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
    <Screen edges={[]} testID="data">
      <RouterStack.Screen options={{ title: t('data.title') }} />
      <Text tone="muted">{t('data.intro')}</Text>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('data.backup')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.backupDesc')}
          </Text>
          <Button label={t('data.backup')} icon="download-outline" variant="secondary" onPress={exportBackup} loading={busy === 'backup'} testID="export-backup" />
        </Stack>
      </Card>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('data.exportAnswers')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.exportAnswersDesc')}
          </Text>
          <Button label={t('data.exportAnswers')} icon="document-text-outline" variant="secondary" onPress={exportAnswers} loading={busy === 'answers'} testID="export-answers" />
        </Stack>
      </Card>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading">{t('data.import')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.importDesc')}
          </Text>
          <Button label={t('data.import')} icon="cloud-upload-outline" variant="secondary" onPress={importBackup} loading={busy === 'import'} testID="import-backup" />
        </Stack>
      </Card>

      <Card>
        <Stack gap={2}>
          <Text variant="subheading" tone="danger">
            {t('data.delete')}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('data.deleteDesc')}
          </Text>
          <Button label={t('data.delete')} icon="trash-outline" variant="danger" onPress={deleteAll} loading={busy === 'delete'} testID="delete-all" />
        </Stack>
      </Card>

      {message ? (
        <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </Screen>
  );
}
