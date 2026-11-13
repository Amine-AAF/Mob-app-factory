import { Button, Icon, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SecretInput } from '@/components/inputs';
import { Notice } from '@/components/vault';
import { attemptsBeforeDelay } from '@/vault/lockout';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { unlockWithBiometrics, unlockWithPassword, useVault } from '@/store/vault';

export default function Unlock() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const info = useVault((s) => s.info);
  const status = useVault((s) => s.status);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'danger' | 'warning'; text: string } | null>(null);
  const [lockedFor, setLockedFor] = useState(0);
  const triedBiometric = useRef(false);

  useEffect(() => {
    if (status === 'unlocked') router.replace('/(tabs)');
  }, [status, router]);

  // Countdown display for the persisted lockout.
  useEffect(() => {
    void vaultService()
      .lockoutState()
      .then((s) => setLockedFor(s.remainingMs));
  }, []);
  useEffect(() => {
    if (lockedFor <= 0) return;
    const timer = setTimeout(() => setLockedFor((ms) => Math.max(0, ms - 1000)), 1000);
    return () => clearTimeout(timer);
  }, [lockedFor]);

  const tryBiometric = useCallback(async () => {
    const r = await unlockWithBiometrics(t('unlock.biometricPrompt'));
    if (r === 'invalidated') setMessage({ tone: 'warning', text: t('unlock.biometricInvalidated') });
  }, [t]);

  useEffect(() => {
    if (info?.biometricEnabled && !triedBiometric.current) {
      triedBiometric.current = true;
      void tryBiometric();
    }
  }, [info?.biometricEnabled, tryBiometric]);

  const submit = async () => {
    if (!password || busy || lockedFor > 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await unlockWithPassword(password);
      if (r.status === 'ok') {
        setPassword('');
        return;
      }
      setPassword('');
      if (r.status === 'locked_out') {
        setLockedFor(r.remainingMs);
      } else {
        setLockedFor(r.lockoutMs);
        const left = attemptsBeforeDelay(r.failedAttempts);
        setMessage({ tone: 'danger', text: r.lockoutMs > 0 ? t('unlock.wrongLocked') : t('unlock.wrong', { count: left }) });
      }
    } catch (e) {
      logEvent('unlock_failed', e);
      setMessage({ tone: 'danger', text: t('unlock.error') });
    } finally {
      setBusy(false);
    }
  };

  const seconds = Math.ceil(lockedFor / 1000);
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 48, paddingBottom: 16 }}>
        <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock-closed" size={36} color={theme.colors.primary} />
        </View>
        <Text variant="title" center>
          {t('unlock.title')}
        </Text>
        <Text tone="muted" center>
          {t('unlock.subtitle')}
        </Text>
      </View>
      <Stack gap={4}>
        <SecretInput label={t('unlock.password')} value={password} onChangeText={setPassword} onSubmitEditing={submit} autoFocus={!info?.biometricEnabled} testID="unlock-password" returnKeyType="go" />
        {lockedFor > 0 ? <Notice tone="warning" icon="time">{t('unlock.lockedOut', { seconds })}</Notice> : message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        <Button label={busy ? t('unlock.unlocking') : t('unlock.submit')} loading={busy} disabled={!password || lockedFor > 0} onPress={submit} testID="unlock-submit" />
        {info?.biometricEnabled ? <Button label={t('unlock.useBiometric')} icon="finger-print" variant="secondary" onPress={tryBiometric} /> : null}
        <Text variant="caption" tone="subtle" center>
          {t('unlock.forgotten')}
        </Text>
      </Stack>
    </Screen>
  );
}
