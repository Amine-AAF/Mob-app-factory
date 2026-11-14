import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { PremiumCard } from '@/components/forms';
import { repos } from '@/database';
import { useLabels } from '@/hooks/useLabels';
import { recordError, setAnalyticsConsent } from '@/services/analytics';
import { itemsToCsv, wipeAllData } from '@/services/backupCore';
import { exportBackup, pickAndRestore, shareText } from '@/services/backupService';
import { clock } from '@/services/clock';
import { afterWrite, reloadSettings, reloadTaxonomy } from '@/services/data';
import { resetLocalEntitlement } from '@/services/monetization';
import { deleteAllPhotos } from '@/services/photos';
import { cancelAllNotifications } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { Button, Card, Icon, Row, Screen, SectionHeader, Stack, SwitchRow, Text, useTheme } from '@/ui';

type Busy = null | 'export' | 'csv' | 'restore' | 'wipe';

export default function DataScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const labels = useLabels();
  const [includePhotos, setIncludePhotos] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);

  const shareFeedback = (res: 'shared' | 'unavailable' | 'error') => {
    if (res === 'unavailable') Alert.alert(t('settings.data.shareUnavailable'));
    else if (res === 'error') Alert.alert(t('common.error'));
  };

  const exportJson = async () => {
    setBusy('export');
    const res = await exportBackup(repos(), includePhotos, t('settings.data.exportDialog'));
    setBusy(null);
    shareFeedback(res);
  };

  const exportCsv = async () => {
    setBusy('csv');
    try {
      const items = await repos().wardrobe.list({ archived: 'all' });
      const csv = itemsToCsv(items, { category: labels.category, tag: labels.style });
      shareFeedback(await shareText(`closetwise-wardrobe-${clock.today()}.csv`, csv, 'text/csv', t('settings.data.csvDialog')));
    } catch (e) {
      recordError(e, 'csv_export');
      Alert.alert(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    setBusy('restore');
    try {
      const r = repos();
      const res = await pickAndRestore(r);
      if (!res.ok) {
        if (res.error !== 'cancelled') {
          const msg =
            res.error === 'wrong_app'
              ? t('settings.data.restoreErrors.wrongApp')
              : res.error === 'newer_schema'
                ? t('settings.data.restoreErrors.newerSchema')
                : res.error === 'read_failed'
                  ? t('settings.data.restoreErrors.readFailed')
                  : t('settings.data.restoreErrors.invalid');
          Alert.alert(t('settings.data.restoreFailed'), msg);
        }
        return;
      }
      await Promise.all([reloadTaxonomy(r), reloadSettings(r)]);
      afterWrite({ notifications: true });
      Alert.alert(
        t('settings.data.restoreDone'),
        [t('settings.data.restoreRows', { count: res.rows }), t('settings.data.restorePhotos', { count: res.photos }), res.missingPhotos > 0 ? t('settings.data.restoreMissing', { count: res.missingPhotos }) : null]
          .filter(Boolean)
          .join('\n'),
      );
    } catch (e) {
      recordError(e, 'restore');
      Alert.alert(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const confirmRestore = () =>
    Alert.alert(t('settings.data.restoreConfirmTitle'), t('settings.data.restoreConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.data.restoreConfirm'), style: 'destructive', onPress: () => void doRestore() },
    ]);

  const wipe = async () => {
    setBusy('wipe');
    try {
      const r = repos();
      await wipeAllData(r);
      deleteAllPhotos();
      await cancelAllNotifications();
      const { interfaceLanguage, theme: themePref, reset, set } = usePreferences.getState();
      reset();
      set({ interfaceLanguage, theme: themePref });
      setAnalyticsConsent(false);
      resetLocalEntitlement();
      await Promise.all([reloadTaxonomy(r), reloadSettings(r)]);
      afterWrite({ notifications: true });
      router.replace('/onboarding');
    } catch (e) {
      recordError(e, 'wipe');
      Alert.alert(t('common.error'));
      setBusy(null);
    }
  };

  const confirmWipe = () =>
    Alert.alert(t('settings.data.wipeTitle'), t('settings.data.wipeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.data.wipeContinue'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('settings.data.wipeFinalTitle'), t('settings.data.wipeFinalMessage'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('settings.data.wipeConfirm'), style: 'destructive', onPress: () => void wipe() },
          ]),
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.data.title') }} />
      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="phone-portrait-outline" size={16} color={theme.colors.textMuted} />
          <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
            {t('settings.data.storageNote')}
          </Text>
        </Row>
      </Card>

      <SectionHeader title={t('settings.data.exportTitle')} />
      {isPremium ? (
        <Card>
          <Text tone="muted">{t('settings.data.exportMessage')}</Text>
          <SwitchRow title={t('settings.data.includePhotos')} subtitle={t('settings.data.includePhotosHint')} value={includePhotos} onChange={setIncludePhotos} />
          <Stack gap={2}>
            <Button icon="download-outline" label={t('settings.data.exportJson')} onPress={() => void exportJson()} loading={busy === 'export'} disabled={!!busy} />
            <Button variant="secondary" icon="document-text-outline" label={t('settings.data.exportCsv')} onPress={() => void exportCsv()} loading={busy === 'csv'} disabled={!!busy} />
          </Stack>
        </Card>
      ) : (
        <PremiumCard message={t('settings.data.exportPremium')} source="export" />
      )}

      <SectionHeader title={t('settings.data.restoreTitle')} />
      <Card>
        <Text tone="muted">{t('settings.data.restoreMessage')}</Text>
        <Button variant="secondary" icon="cloud-upload-outline" label={t('settings.data.restore')} onPress={confirmRestore} loading={busy === 'restore'} disabled={!!busy} />
      </Card>

      <SectionHeader title={t('settings.data.wipeSection')} />
      <Card>
        <Text tone="muted">{t('settings.data.wipeHint')}</Text>
        <Button variant="danger" icon="trash-outline" label={t('settings.data.wipe')} onPress={confirmWipe} loading={busy === 'wipe'} disabled={!!busy} />
      </Card>
    </Screen>
  );
}
