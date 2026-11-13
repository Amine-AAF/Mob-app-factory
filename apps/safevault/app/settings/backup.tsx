import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { SecretInput, Toggle } from '@/components/inputs';
import { MasterPasswordFields } from '@/components/MasterPasswordFields';
import { Notice } from '@/components/vault';
import { APP_VERSION } from '@/config/brand';
import { lastBackup, logBackup } from '@/database';
import { BACKUP_VERSION, BackupError, backupFileName, createBackup, decryptBackup, parseBackup } from '@/features/backup/format';
import { useMasterPasswordForm } from '@/hooks/useMasterPasswordForm';
import { fmt } from '@/i18n';
import { pickBackupFile, saveBackupToFolder, shareBackup } from '@/services/backupFiles';
import { getContext, vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { useIsPremium } from '@/store/app';
import { useVault } from '@/store/vault';

type Msg = { tone: 'success' | 'danger' | 'warning'; text: string } | null;

export default function Backup() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const corrupted = useVault((s) => s.corrupted);
  const [last, setLast] = useState<{ createdAt: number; itemCount: number } | null>(null);
  const [master, setMaster] = useState('');
  const [separate, setSeparate] = useState(false);
  const separateForm = useMasterPasswordForm();
  const [destination, setDestination] = useState<'folder' | 'share'>('folder');
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [importFile, setImportFile] = useState<{ name: string; text: string; createdAt: number } | null>(null);
  const [importPassword, setImportPassword] = useState('');

  useEffect(() => {
    void lastBackup(getContext().db).then(setLast);
  }, []);

  const doExport = async () => {
    setBusy('export');
    setMsg(null);
    try {
      // The master password is always re-verified (also protects against typos when it is reused as the backup password).
      const check = await vaultService().verifyMasterPassword(master);
      if (check.status !== 'ok') {
        setMsg({ tone: 'danger', text: t('unlock.wrongLocked') });
        return;
      }
      const password = separate && isPremium ? separateForm.password : master;
      const snapshot = await vaultService().snapshot();
      const { text, itemCount } = await createBackup(snapshot, password, { now: Date.now(), appVersion: APP_VERSION });
      snapshot.items.length = 0;
      const name = backupFileName(new Date());
      const result = destination === 'folder' ? await saveBackupToFolder(name, text) : await shareBackup(name, text, t('backup.shareTitle'));
      if (result === 'cancelled' || result === 'unavailable') return;
      const now = Date.now();
      await logBackup(getContext().db, 'export', itemCount, BACKUP_VERSION, now);
      setLast({ createdAt: now, itemCount });
      setMsg({ tone: 'success', text: t('backup.exported', { count: itemCount }) });
    } catch (e) {
      logEvent('export_failed', e);
      setMsg({ tone: 'danger', text: t('errors.generic') });
    } finally {
      setMaster('');
      separateForm.reset();
      setBusy(null);
    }
  };

  const pickImport = async () => {
    setMsg(null);
    try {
      const f = await pickBackupFile();
      if (!f) return;
      setImportFile({ ...f, createdAt: parseBackup(f.text).createdAt });
    } catch (e) {
      setMsg({ tone: 'danger', text: t(`backup.errors.${e instanceof BackupError ? e.code : 'corrupted'}`) });
    }
  };

  const runImport = async (mode: 'replace' | 'merge') => {
    if (!importFile) return;
    setBusy('import');
    setMsg(null);
    try {
      const r = await decryptBackup(importFile.text, importPassword);
      const res = await vaultService().importSnapshot(r.snapshot, mode);
      await logBackup(getContext().db, 'import', r.itemCount, BACKUP_VERSION, Date.now());
      setImportFile(null);
      setMsg({ tone: 'success', text: t('backup.imported', res) });
    } catch (e) {
      setMsg({ tone: 'danger', text: t(`backup.errors.${e instanceof BackupError ? e.code : 'import_failed'}`) });
    } finally {
      setImportPassword('');
      setBusy(null);
    }
  };

  const confirmImport = (mode: 'replace' | 'merge') => {
    if (mode === 'merge') return void runImport('merge');
    // Never overwrite the existing vault without an explicit confirmation.
    Alert.alert(t('backup.replaceTitle'), t('backup.replaceBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('backup.replaceConfirm'), style: 'destructive', onPress: () => void runImport('replace') },
    ]);
  };

  const purge = () =>
    Alert.alert(t('backup.purgeTitle'), t('backup.purgeBody', { count: corrupted.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void vaultService().purgeCorrupted() },
    ]);

  return (
    <Screen edges={[]}>
      <Notice tone="primary" icon="lock-closed">
        {t('backup.explain')}
      </Notice>
      <Text variant="bodySmall" tone="muted">
        {last ? t('backup.last', { date: fmt.dateTime(last.createdAt), count: last.itemCount }) : t('backup.never')}
      </Text>

      <Card>
        <Text variant="heading">{t('backup.exportTitle')}</Text>
        <SecretInput label={t('backup.masterPassword')} value={master} onChangeText={setMaster} hint={t('backup.masterHint')} />
        <Toggle label={t('backup.separate')} description={isPremium ? t('backup.separateHint') : t('premium.featureLocked')} value={separate && isPremium} disabled={!isPremium} onChange={setSeparate} />
        {separate && isPremium ? <MasterPasswordFields form={separateForm} labels={{ password: t('backup.backupPassword'), confirm: t('create.confirm') }} /> : null}
        <Row gap={2}>
          <Chip label={t('backup.toFolder')} icon="folder-open" selected={destination === 'folder'} onPress={() => setDestination('folder')} />
          <Chip label={t('backup.toShare')} icon="share-social" selected={destination === 'share'} onPress={() => setDestination('share')} />
        </Row>
        <Button label={t('backup.export')} icon="download" loading={busy === 'export'} disabled={!master || (separate && isPremium && !separateForm.valid)} onPress={doExport} />
      </Card>

      <Card>
        <Text variant="heading">{t('backup.importTitle')}</Text>
        <Button label={importFile ? t('restore.changeFile') : t('restore.pick')} icon="document-attach" variant="secondary" onPress={pickImport} />
        {importFile ? (
          <Stack gap={3}>
            <Text variant="bodySmall" tone="muted">
              {t('restore.createdAt', { date: fmt.dateTime(importFile.createdAt) })}
            </Text>
            <SecretInput label={t('restore.backupPassword')} value={importPassword} onChangeText={setImportPassword} />
            <Button label={t('backup.merge')} disabled={!importPassword} loading={busy === 'import'} onPress={() => confirmImport('merge')} />
            <Button label={t('backup.replace')} variant="danger" disabled={!importPassword} onPress={() => confirmImport('replace')} />
            <Text variant="caption" tone="subtle">
              {t('backup.mergeHint')}
            </Text>
          </Stack>
        ) : null}
      </Card>

      {corrupted.length > 0 ? (
        <Card>
          <Text variant="subheading" tone="danger">
            {t('vault.corrupted', { count: corrupted.length })}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('backup.corruptedHint')}
          </Text>
          <Button label={t('backup.purge')} variant="danger" size="md" onPress={purge} />
        </Card>
      ) : null}

      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Notice tone="warning" title={t('backup.risksTitle')}>
        {t('backup.risksBody')}
      </Notice>
    </Screen>
  );
}
