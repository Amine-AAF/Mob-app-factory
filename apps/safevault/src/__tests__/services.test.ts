import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { toHex } from '@/crypto/bytes';
import { biometricAvailability, enrollBiometric, readBiometricKey, removeBiometricKey } from '@/services/biometric';
import { clearClipboardIfExpired, clearClipboardNow, copySecret, hasPendingClipboard } from '@/services/clipboard';

describe('clipboard protection (JS fallback path)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('clears the copied secret after the delay', async () => {
    await copySecret('s3cret', 30);
    expect(await Clipboard.getStringAsync()).toBe('s3cret');
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(await Clipboard.getStringAsync()).toBe('');
    expect(hasPendingClipboard()).toBe(false);
  });

  it('does not wipe something the user copied afterwards', async () => {
    await copySecret('s3cret', 30);
    await Clipboard.setStringAsync('user text');
    expect(await clearClipboardNow()).toBe(false);
    expect(await Clipboard.getStringAsync()).toBe('user text');
  });

  it('clears on lock and on resume after the deadline', async () => {
    await copySecret('a', 0);
    expect(await clearClipboardNow()).toBe(true);
    expect(await Clipboard.getStringAsync()).toBe('');
    let t = 1000;
    await copySecret('b', 15, () => t);
    t += 10_000;
    expect(await clearClipboardIfExpired(t)).toBe(false);
    t += 6_000;
    expect(await clearClipboardIfExpired(t)).toBe(true);
  });
});

describe('biometric unlock', () => {
  it('stores the vault key behind authentication and wipes the caller buffer', async () => {
    const vk = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
    const expected = toHex(vk);
    await enrollBiometric('v1', vk, 'prompt');
    expect(vk.every((b) => b === 0)).toBe(true);
    const call = (SecureStore.setItemAsync as jest.Mock).mock.calls[0];
    expect(call[2]).toMatchObject({ requireAuthentication: true, keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    const r = await readBiometricKey('v1', 'prompt');
    expect(r.status).toBe('ok');
    if (r.status === 'ok') expect(toHex(r.vaultKey)).toBe(expected);
    await removeBiometricKey('v1');
    expect((await readBiometricKey('v1', 'prompt')).status).toBe('invalidated');
  });

  it('maps cancellation and permanent invalidation', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('User canceled the authentication'));
    expect((await readBiometricKey('v1', 'p')).status).toBe('cancelled');
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('KeyPermanentlyInvalidatedException'));
    expect((await readBiometricKey('v1', 'p')).status).toBe('invalidated');
  });

  it('accepts only strong biometrics', async () => {
    expect(await biometricAvailability()).toBe('available');
    (LocalAuthentication.getEnrolledLevelAsync as jest.Mock).mockResolvedValueOnce(2);
    expect(await biometricAvailability()).toBe('weak_only');
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValueOnce(false);
    expect(await biometricAvailability()).toBe('not_enrolled');
  });
});
