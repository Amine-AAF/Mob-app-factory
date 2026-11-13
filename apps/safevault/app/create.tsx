import { Button, Screen, Stack, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/inputs';
import { MasterPasswordFields } from '@/components/MasterPasswordFields';
import { Notice } from '@/components/vault';
import { recommendProfile } from '@/crypto/kdf';
import { useMasterPasswordForm } from '@/hooks/useMasterPasswordForm';
import { logEvent } from '@/services/log';
import { createVault } from '@/store/vault';

export default function CreateVault() {
  const { t } = useTranslation();
  const router = useRouter();
  const form = useMasterPasswordForm();
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.valid || !understood) return;
    setBusy(true);
    setError(null);
    try {
      const profile = await recommendProfile();
      await createVault(form.password, profile);
      form.reset();
      router.replace('/(tabs)');
    } catch (e) {
      logEvent('create_vault_failed', e);
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      edges={[]}
      footer={
        <Button label={busy ? t('create.securing') : t('create.submit')} loading={busy} disabled={!form.valid || !understood} onPress={submit} testID="create-submit" />
      }
    >
      <Text tone="muted">{t('create.intro')}</Text>
      <MasterPasswordFields form={form} />
      <Notice tone="danger" icon="alert-circle" title={t('create.noRecoveryTitle')}>
        {t('create.noRecoveryBody')}
      </Notice>
      <Toggle label={t('create.understand')} value={understood} onChange={setUnderstood} testID="create-understand" />
      <Stack gap={1}>
        <Text variant="caption" tone="subtle">
          {t('create.tips')}
        </Text>
      </Stack>
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
