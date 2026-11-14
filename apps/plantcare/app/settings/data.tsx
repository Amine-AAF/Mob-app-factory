import { Button, Card, Screen, SectionHeader, Text } from '@factory/design-system';
import { Stack as RouterStack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { PremiumCard } from '@/components/care';
import { repos } from '@/database';
import { useMutation } from '@/hooks/useData';
import { deleteEverything, exportBackup, exportCareReportPdf, importBackup } from '@/services/dataService';
import { resetLocalEntitlement } from '@/services/monetization';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function DataSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const exportJson = () =>
    run('export', async () => {
      const r = await exportBackup(repos(), t);
      if (r === 'error') Alert.alert(t('common.error'), t('data.exportFailed'));
      if (r === 'no_app') Alert.alert(t('common.error'), t('data.noShareApp'));
    });

  const exportPdf = () =>
    run('pdf', async () => {
      const r = await exportCareReportPdf(repos(), t);
      if (r !== 'shared') Alert.alert(t('common.error'), t('data.exportFailed'));
    });

  const restore = () =>
    Alert.alert(t('data.restoreTitle'), t('data.restoreBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.restoreConfirm'),
        style: 'destructive',
        onPress: () =>
          void run('import', async () => {
            const r = await mutate((rp) => importBackup(rp));
            if (r.status === 'ok') Alert.alert(t('data.restoreDone'), t('data.restoreDoneBody', { count: r.rows }));
            else if (r.status === 'invalid') Alert.alert(t('common.error'), t(`data.errors.${r.code}`, { defaultValue: t('data.errors.invalid_format') }));
            else if (r.status === 'error') Alert.alert(t('common.error'), t('data.errors.invalid_format'));
          }),
      },
    ]);

  const wipe = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          void run('delete', async () => {
            await mutate((r) => deleteEverything(r));
            resetLocalEntitlement();
            usePreferences.getState().set({ onboardingCompleted: false });
            router.replace('/onboarding');
          }),
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.data') }} />
      <Text tone="muted">{t('data.intro')}</Text>
      <SectionHeader title={t('data.backup')} />
      <Card>
        <Text variant="bodySmall">{t('data.backupBody')}</Text>
        <Button size="md" icon="download-outline" label={t('data.export')} onPress={() => void exportJson()} loading={busy === 'export'} />
        <Button size="md" variant="secondary" icon="cloud-upload-outline" label={t('data.restore')} onPress={restore} loading={busy === 'import'} />
        <Text variant="caption" tone="muted">
          {t('data.photosNote')}
        </Text>
      </Card>
      <SectionHeader title={t('data.pdf')} />
      {isPremium ? (
        <Card>
          <Text variant="bodySmall">{t('data.pdfBody')}</Text>
          <Button size="md" icon="document-text-outline" label={t('data.exportPdf')} onPress={() => void exportPdf()} loading={busy === 'pdf'} />
        </Card>
      ) : (
        <PremiumCard title={t('premium.pdfTitle')} message={t('premium.pdfBody')} source="pdf" />
      )}
      <SectionHeader title={t('data.danger')} />
      <Card>
        <Text variant="bodySmall">{t('data.deleteHint')}</Text>
        <Button size="md" variant="danger" icon="trash-outline" label={t('data.deleteAll')} onPress={wipe} loading={busy === 'delete'} testID="delete-all" />
      </Card>
    </Screen>
  );
}
