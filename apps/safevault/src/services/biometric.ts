import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { SafeVaultNative } from 'safevault-native';

import { fromBase64, toBase64, wipe } from '@/crypto/bytes';

/**
 * Biometric unlock.
 *
 * The vault key (VK) copy is stored with expo-secure-store and `requireAuthentication: true`.
 * On Android this encrypts the value with an AES key held in the Android Keystore (hardware-
 * backed / StrongBox where available) whose use requires a successful BiometricPrompt
 * (class 3 / "strong" biometrics). The key is invalidated by the OS if biometrics are
 * re-enrolled, which makes `getItemAsync` fail: we then fall back to the master password.
 *
 * It is offered only if the device has a secure lock screen and strong biometrics enrolled.
 * The master password always remains the root of trust and works without biometrics.
 */
const keyName = (vaultId: string) => `safevault_vk_${vaultId}`;

export type BiometricAvailability = 'available' | 'no_hardware' | 'not_enrolled' | 'weak_only' | 'insecure_device' | 'unsupported';

export async function biometricAvailability(): Promise<BiometricAvailability> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return 'unsupported';
    if (!(await LocalAuthentication.hasHardwareAsync())) return 'no_hardware';
    if (!(await LocalAuthentication.isEnrolledAsync())) return 'not_enrolled';
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    if (level < LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) return 'weak_only';
    if (SafeVaultNative && !SafeVaultNative.isDeviceSecure()) return 'insecure_device';
    if (!SecureStore.canUseBiometricAuthentication()) return 'unsupported';
    return 'available';
  } catch {
    return 'unsupported';
  }
}

function options(prompt: string): SecureStore.SecureStoreOptions {
  return {
    requireAuthentication: true,
    authenticationPrompt: prompt,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}

/** Stores a VK copy behind biometrics. Takes ownership of `vaultKey` and wipes it. */
export async function enrollBiometric(vaultId: string, vaultKey: Uint8Array, prompt: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(keyName(vaultId), toBase64(vaultKey), options(prompt));
  } finally {
    wipe(vaultKey);
  }
}

export type BiometricUnlock = { status: 'ok'; vaultKey: Uint8Array } | { status: 'cancelled' } | { status: 'invalidated' };

export async function readBiometricKey(vaultId: string, prompt: string): Promise<BiometricUnlock> {
  try {
    const v = await SecureStore.getItemAsync(keyName(vaultId), options(prompt));
    if (!v) return { status: 'invalidated' };
    return { status: 'ok', vaultKey: fromBase64(v) };
  } catch (e) {
    const msg = String((e as { message?: string })?.message ?? '').toLowerCase();
    // User cancel / too many attempts → just show the password field. Anything else
    // (key permanently invalidated after biometric change) → disable biometrics.
    if (msg.includes('cancel') || msg.includes('authentication failed') || msg.includes('lockout')) return { status: 'cancelled' };
    return { status: 'invalidated' };
  }
}

export async function removeBiometricKey(vaultId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(keyName(vaultId));
  } catch {
    // Already gone.
  }
}
