import { Button, Card, Chip, Divider, ListRow, Row, Screen, Stack, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { SecretInput, Toggle } from '@/components/inputs';
import { Notice } from '@/components/vault';
import { AUTO_LOCK_CHOICES } from '@/services/autolock';
import { biometricAvailability, type BiometricAvailability } from '@/services/biometric';
import { CLIPBOARD_CLEAR_CHOICES } from '@/services/clipboard';
import { updateSettings, vaultService } from '@/services/context';
import { applyScreenProtection } from '@/services/screenSecurity';
import { useApp } from '@/store/app';
import { destroyVault, disableBiometrics, enableBiometrics, useVault } from '@/store/vault';

function durationLabel(t: TFunction, s: number) {
  if (s === 0) return t('settings.security.immediately');
  return s < 60 ? t('time.seconds', { count: s }) : t('time.minutes', { count: s / 60 });
}

export default function SecuritySettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useApp((s) => s.settings);
  const info = useVault((s) => s.info);
  const [bio, setBio] = useState<BiometricAvailability | null>(null);
  const [rotatePassword, setRotatePassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [busy, setBusy] = useState<'rotate' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    void biometricAvailability().then(setBio);
  }, []);

  const toggleBiometric = async (on: boolean) => {
    setMessage(null);
    if (on) {
      const ok = await enableBiometrics(t('settings.security.biometricEnrollPrompt'));
      if (!ok) setMessage({ tone: 'danger', text: t('settings.security.biometricFailed') });
    } else await disableBiometrics();
  };

  const rotate = async () => {
    setBusy('rotate');
    setMessage(null);
    try {
      const r = await vaultService().rotateVaultKey(rotatePassword);
      setRotatePassword('');
      if (r.status === 'ok') {
        await disableBiometrics();
        setMessage({ tone: 'success', text: t('settings.security.rotated') });
      } else setMessage({ tone: 'danger', text: r.status === 'locked_out' ? t('unlock.lockedOut', { seconds: Math.ceil(r.remainingMs / 1000) }) : t('unlock.wrongLocked') });
    } catch {
      setMessage({ tone: 'danger', text: t('errors.generic') });
    } finally {
      setBusy(null);
    }
  };

  const destroy = () => {
    Alert.alert(t('settings.security.deleteTitle'), t('settings.security.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.security.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          const r = await vaultService().verifyMasterPassword(deletePassword);
          setDeletePassword('');
          if (r.status !== 'ok') {
            setBusy(null);
            setMessage({ tone: 'danger', text: t('unlock.wrongLocked') });
            return;
          }
          await destroyVault();
          setBusy(null);
          router.replace('/welcome');
        },
      },
    ]);
  };

  return (
    <Screen edges={[]}>
      <Card>
        <Text variant="subheading">{t('settings.security.autoLock')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('settings.security.autoLockHint')}
        </Text>
        <Row gap={2} wrap>
          {AUTO_LOCK_CHOICES.map((s) => (
            <Chip key={s} label={durationLabel(t, s)} selected={settings.autoLockSeconds === s} onPress={() => void updateSettings({ autoLockSeconds: s })} />
          ))}
        </Row>
      </Card>
      <Card>
        <Text variant="subheading">{t('settings.security.clipboard')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('settings.security.clipboardHint')}
        </Text>
        <Row gap={2} wrap>
          {CLIPBOARD_CLEAR_CHOICES.map((s) => (
            <Chip key={s} label={s === 0 ? t('settings.security.never') : durationLabel(t, s)} selected={settings.clipboardClearSeconds === s} onPress={() => void updateSettings({ clipboardClearSeconds: s })} />
          ))}
        </Row>
      </Card>
      <Card>
        <Toggle
          label={t('settings.security.biometric')}
          description={bio === 'available' || info?.biometricEnabled ? t('settings.security.biometricHint') : t(`settings.security.biometricUnavailable.${bio ?? 'unsupported'}`)}
          value={!!info?.biometricEnabled}
          disabled={bio !== 'available' && !info?.biometricEnabled}
          onChange={(v) => void toggleBiometric(v)}
        />
        <Divider />
        <Toggle
          label={t('settings.security.screenshots')}
          description={t('settings.security.screenshotsHint')}
          value={settings.screenProtection}
          onChange={(v) => {
            void updateSettings({ screenProtection: v });
            void applyScreenProtection(v);
          }}
        />
      </Card>
      <Card>
        <ListRow icon="key" title={t('changePassword.title')} subtitle={t('changePassword.subtitle')} onPress={() => router.push('/settings/change-password')} />
      </Card>
      <Card>
        <Text variant="subheading">{t('settings.security.rotate')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('settings.security.rotateHint')}
        </Text>
        <SecretInput label={t('unlock.password')} value={rotatePassword} onChangeText={setRotatePassword} />
        <Button label={t('settings.security.rotateAction')} variant="secondary" size="md" loading={busy === 'rotate'} disabled={!rotatePassword} onPress={rotate} />
      </Card>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Card>
        <Stack gap={2}>
          <Text variant="subheading" tone="danger">
            {t('settings.security.deleteTitle')}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('settings.security.deleteHint')}
          </Text>
          <SecretInput label={t('unlock.password')} value={deletePassword} onChangeText={setDeletePassword} />
          <Button label={t('settings.security.deleteAction')} variant="danger" size="md" loading={busy === 'delete'} disabled={!deletePassword} onPress={destroy} />
        </Stack>
      </Card>
    </Screen>
  );
}
