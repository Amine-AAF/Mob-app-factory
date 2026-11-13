import { addDays } from '@factory/app-core';
import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Note } from '@/components/ui';
import { repos } from '@/database';
import { weekStart } from '@/domain/planner';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';
import { clock } from '@/services/clock';
import { pickTextFile, shareFile } from '@/services/files';
import { resetLocalEntitlement } from '@/services/monetization';
import { entryTitles, syncNotifications } from '@/services/planning';
import { planAsCsv, planAsText } from '@/services/share';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

/** Backup / restore, plan export (premium) and "delete all my data". */
export default function DataSettings() {
  const { t, lng } = useLang();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setMessage(null);
    try {
      await fn();
    } catch (e) {
      recordError(e, `data_${key}`);
      setMessage(t('data.error'));
    } finally {
      setBusy(null);
    }
  };

  const doExport = () =>
    run('export', async () => {
      const { json, fileName } = await exportUserData(repos().db);
      await shareFile(fileName, json, 'application/json', t('data.export'));
      setMessage(t('data.exported'));
    });

  const doImport = () =>
    run('import', async () => {
      const raw = await pickTextFile(['application/json']);
      if (!raw) return;
      try {
        const { restoredRows } = await importUserData(repos().db, raw);
        dataChanged();
        await syncNotifications(t, lng);
        setMessage(t('data.imported', { count: restoredRows }));
      } catch {
        setMessage(t('data.invalidBackup'));
      }
    });

  const exportPlan = (format: 'text' | 'csv') =>
    run(`plan_${format}`, async () => {
      const start = weekStart(clock.today(), firstDay);
      const entries = await repos().plan.range(start, addDays(start, 13));
      const titles = await entryTitles(entries, lng);
      if (format === 'csv') await shareFile(`mealwise-plan-${start}.csv`, planAsCsv(entries, titles, t), 'text/csv', t('data.exportPlan'));
      else await shareFile(`mealwise-plan-${start}.txt`, planAsText(entries, titles, t, (d) => fmt.dayLong(d)), 'text/plain', t('data.exportPlan'));
    });

  const deleteAll = () =>
    Alert.alert(t('data.deleteTitle'), t('data.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('data.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          void run('delete', async () => {
            await deleteAllUserData(repos().db);
            resetLocalEntitlement();
            await syncNotifications(t, lng);
            dataChanged();
            setMessage(t('data.deleted'));
          }),
      },
    ]);

  return (
    <Screen edges={[]}>
      <Note>{t('data.intro')}</Note>
      <Card>
        <Text variant="subheading">{t('data.backup')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.backupHint')}
        </Text>
        <Stack gap={2}>
          <Button label={t('data.export')} icon="download-outline" variant="secondary" onPress={doExport} loading={busy === 'export'} />
          <Button label={t('data.import')} icon="push-outline" variant="secondary" onPress={doImport} loading={busy === 'import'} />
        </Stack>
      </Card>
      <Card>
        <Text variant="subheading">{t('data.exportPlan')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.exportPlanHint')}
        </Text>
        {isPremium ? (
          <Stack gap={2}>
            <Button label={t('data.asText')} variant="secondary" icon="document-text-outline" onPress={() => void exportPlan('text')} loading={busy === 'plan_text'} />
            <Button label={t('data.asCsv')} variant="secondary" icon="grid-outline" onPress={() => void exportPlan('csv')} loading={busy === 'plan_csv'} />
          </Stack>
        ) : (
          <Text variant="bodySmall" tone="warning">
            {t('premium.exportBody')}
          </Text>
        )}
      </Card>
      <Card>
        <Text variant="subheading">{t('data.deleteTitle')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('data.deleteHint')}
        </Text>
        <Button label={t('data.deleteAll')} variant="danger" icon="trash-outline" onPress={deleteAll} loading={busy === 'delete'} testID="delete-all" />
      </Card>
      {message ? <Text tone="muted">{message}</Text> : null}
    </Screen>
  );
}
