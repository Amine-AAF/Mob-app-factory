import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Optional lock of the Documents section with the phone's own security: biometrics
 * (fingerprint/face) or the device PIN/pattern/password as fallback, via Android's
 * BiometricPrompt. TravelWise never stores a PIN itself.
 *
 * This is an ACCESS GATE in the app UI, not encryption: see docs/security.md.
 */
export type LockAvailability = 'available' | 'no_device_security';

export async function lockAvailability(): Promise<LockAvailability> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    // SECRET = device PIN/pattern/password; BIOMETRIC_* = enrolled biometrics.
    return level >= LocalAuthentication.SecurityLevel.SECRET ? 'available' : 'no_device_security';
  } catch {
    return 'no_device_security';
  }
}

export async function authenticate(promptMessage: string, cancelLabel: string): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: false });
    return res.success;
  } catch {
    return false;
  }
}

/** Unlock lasts a few minutes, and is dropped when the app goes to the background. */
export const UNLOCK_DURATION_MS = 5 * 60 * 1000;

export function isUnlockValid(unlockedAt: number | null, now: number): boolean {
  return unlockedAt !== null && now - unlockedAt >= 0 && now - unlockedAt < UNLOCK_DURATION_MS;
}
