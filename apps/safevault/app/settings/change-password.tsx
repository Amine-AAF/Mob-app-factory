import { Button, Screen, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SecretInput } from '@/components/inputs';
import { MasterPasswordFields } from '@/components/MasterPasswordFields';
import { Notice } from '@/components/vault';
import { isWeakerThan } from '@/crypto/kdf';
import { useMasterPasswordForm } from '@/hooks/useMasterPasswordForm';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { useVault } from '@/store/vault';

export default function ChangePassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const info = useVault((s) => s.info);
  const form = useMasterPasswordForm();
  const [current, setCurrent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      // Also upgrades old KDF parameters to the current default profile.
      const upgrade = info && isWeakerThan(info.kdf, 'standard') ? 'standard' : undefined;
      const r = await vaultService().changeMasterPassword(current, form.password, upgrade);
      setCurrent('');
      if (r.status === 'ok') {
        form.reset();
        useVault.setState({ info: await vaultService().info() });
        router.back();
      } else setError(r.status === 'locked_out' ? t('unlock.lockedOut', { seconds: Math.ceil(r.remainingMs / 1000) }) : t('changePassword.wrongCurrent'));
    } catch (e) {
      logEvent('change_password_failed', e);
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('changePassword.submit')} loading={busy} disabled={!current || !form.valid} onPress={submit} />}>
      <Text tone="muted">{t('changePassword.intro')}</Text>
      <SecretInput label={t('changePassword.current')} value={current} onChangeText={setCurrent} />
      <MasterPasswordFields form={form} labels={{ password: t('changePassword.new'), confirm: t('create.confirm') }} />
      <Notice tone="warning">{t('changePassword.backupReminder')}</Notice>
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
