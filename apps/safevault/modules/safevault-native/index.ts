import { requireOptionalNativeModule } from 'expo';

/**
 * JS binding of SafeVault's local native module (android/…/SafeVaultNativeModule.kt).
 * `null` when the native code is not part of the binary (Jest, Expo Go, web): callers
 * fall back to audited pure-JS implementations that produce identical results.
 *
 * Byte arrays cross the bridge as base64 strings. The native side zeroes its own
 * copies (char/byte arrays) as soon as the derivation is done.
 */
export interface SafeVaultNativeModule {
  /** Argon2id (RFC 9106, v1.3) via BouncyCastle. Returns the derived key as base64. */
  argon2id(passwordB64: string, saltB64: string, memoryKiB: number, iterations: number, parallelism: number, length: number): Promise<string>;
  /**
   * Copies text to the clipboard flagged as sensitive (ClipDescription.EXTRA_IS_SENSITIVE,
   * Android 13+): the system clipboard preview overlay does not show it.
   * `label` identifies this copy so `clearClipboardIfLabel` only clears our own clip.
   */
  copySensitive(text: string, label: string): Promise<void>;
  /** Clears the primary clip only if its label still equals `label`. Returns true if cleared. */
  clearClipboardIfLabel(label: string): Promise<boolean>;
  /** True when the device has a secure lock screen (PIN/pattern/password). */
  isDeviceSecure(): boolean;
}

export const SafeVaultNative: SafeVaultNativeModule | null = requireOptionalNativeModule<SafeVaultNativeModule>('SafeVaultNative');
