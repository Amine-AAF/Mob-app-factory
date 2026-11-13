import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SecretInput } from '@/components/inputs';
import { MasterPasswordFields } from '@/components/MasterPasswordFields';
import { Notice } from '@/components/vault';
import { recommendProfile } from '@/crypto/kdf';
import { logBackup } from '@/database';
import { BACKUP_VERSION, BackupError, decryptBackup, parseBackup } from '@/features/backup/format';
import { useMasterPasswordForm } from '@/hooks/useMasterPasswordForm';
import { fmt } from '@/i18n';
import { pickBackupFile } from '@/services/backupFiles';
import { getContext, vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { createVault } from '@/store/vault';
import type { VaultSnapshot } from '@/vault/vaultService';

/**
 * Restore on a fresh install (no vault yet):
 *  1. pick the encrypted file (structure checked without password),
 *  2. enter the backup password (integrity verified while decrypting),
 *  3. choose a master password for this device, then import atomically.
 */
export default function Restore() {
  const { t } = useTranslation();
  const router = useRouter();
  const form = useMasterPasswordForm();
  const [file, setFile] = useState<{ name: string; text: string; createdAt: number } | null>(null);
  const [backupPassword, setBackupPassword] = useState('');
  const [decrypted, setDecrypted] = useState<{ snapshot: VaultSnapshot; count: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    try {
      const f = await pickBackupFile();
      if (!f) return;
      const header = parseBackup(f.text);
      setFile({ ...f, createdAt: header.createdAt });
    } catch (e) {
      setError(t(`backup.errors.${e instanceof BackupError ? e.code : 'corrupted'}`));
    }
  };

  const decrypt = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const r = await decryptBackup(file.text, backupPassword);
      setBackupPassword('');
      setDecrypted({ snapshot: r.snapshot, count: r.itemCount });
    } catch (e) {
      setError(t(`backup.errors.${e instanceof BackupError ? e.code : 'corrupted'}`));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!decrypted || !form.valid) return;
    setBusy(true);
    setError(null);
    try {
      await createVault(form.password, await recommendProfile());
      form.reset();
      await vaultService().importSnapshot(decrypted.snapshot, 'replace');
      await logBackup(getContext().db, 'import', decrypted.count, BACKUP_VERSION, Date.now());
      setDecrypted(null);
      router.replace('/(tabs)');
    } catch (e) {
      logEvent('restore_failed', e);
      setError(t('backup.errors.import_failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      {!decrypted ? (
        <Stack gap={4}>
          <Text tone="muted">{t('restore.intro')}</Text>
          <Button label={file ? t('restore.changeFile') : t('restore.pick')} icon="document-attach" variant={file ? 'secondary' : 'primary'} onPress={pick} />
          {file ? (
            <Card>
              <Text variant="subheading" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="bodySmall" tone="muted">
                {t('restore.createdAt', { date: fmt.dateTime(file.createdAt) })}
              </Text>
            </Card>
          ) : null}
          {file ? (
            <>
              <SecretInput label={t('restore.backupPassword')} value={backupPassword} onChangeText={setBackupPassword} onSubmitEditing={decrypt} />
              <Button label={t('restore.decrypt')} loading={busy} disabled={!backupPassword} onPress={decrypt} />
            </>
          ) : null}
        </Stack>
      ) : (
        <Stack gap={4}>
          <Notice tone="success" title={t('restore.verified')}>
            {t('restore.verifiedBody', { count: decrypted.count })}
          </Notice>
          <Text tone="muted">{t('restore.chooseMaster')}</Text>
          <MasterPasswordFields form={form} />
          <Notice tone="danger" icon="alert-circle">
            {t('create.noRecoveryBody')}
          </Notice>
          <Button label={t('restore.finish')} loading={busy} disabled={!form.valid} onPress={finish} />
        </Stack>
      )}
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
