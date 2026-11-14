import * as Clipboard from 'expo-clipboard';
import { SafeVaultNative } from 'safevault-native';

import { randomId } from '@/crypto/random';

/**
 * Secure copy.
 *  - Android 13+: the clip is flagged sensitive (no clipboard preview overlay, hidden from
 *    keyboards' clipboard history that honour the flag) through the native module.
 *  - The clip is cleared after the configured delay, when the vault locks, and when the app
 *    goes to the background with "lock immediately".
 *  - Clearing is label-checked natively: if the user copied something else since, it is kept.
 *
 * Limits (SECURITY.md): JS timers don't run while the process is frozen/killed; the clear then
 * happens on next resume. Android 13+ also clears the clipboard by itself after one hour.
 * Without the native module (Expo Go/tests) we fall back to expo-clipboard and only clear
 * if the clipboard still contains our value.
 */
export const CLIPBOARD_CLEAR_CHOICES = [15, 30, 60, 120, 0] as const; // seconds, 0 = never

let pending: { label: string; value: string | null; timer: ReturnType<typeof setTimeout> | null; deadline: number } | null = null;

async function clearIfOurs(): Promise<boolean> {
  const p = pending;
  pending = null;
  if (!p) return false;
  if (p.timer) clearTimeout(p.timer);
  try {
    if (SafeVaultNative) return await SafeVaultNative.clearClipboardIfLabel(p.label);
    const current = await Clipboard.getStringAsync();
    if (current === p.value) {
      await Clipboard.setStringAsync('');
      return true;
    }
  } catch {
    // Clipboard access can fail when the app is not focused; nothing sensitive to report.
  }
  return false;
}

export async function copySecret(value: string, clearAfterSeconds: number, now: () => number = Date.now): Promise<void> {
  await clearIfOurs();
  const label = `safevault-${randomId()}`;
  if (SafeVaultNative) await SafeVaultNative.copySensitive(value, label);
  else await Clipboard.setStringAsync(value);
  const timer = clearAfterSeconds > 0 ? setTimeout(() => void clearIfOurs(), clearAfterSeconds * 1000) : null;
  // In the JS fallback we must remember the value to compare it; with the native module we don't.
  pending = { label, value: SafeVaultNative ? null : value, timer, deadline: clearAfterSeconds > 0 ? now() + clearAfterSeconds * 1000 : Number.POSITIVE_INFINITY };
}

/** Called on lock and on resume: clears our clip now (lock) or if its deadline passed (resume). */
export async function clearClipboardNow(): Promise<boolean> {
  return clearIfOurs();
}

export async function clearClipboardIfExpired(now: number = Date.now()): Promise<boolean> {
  if (pending && now >= pending.deadline) return clearIfOurs();
  return false;
}

export function hasPendingClipboard(): boolean {
  return pending !== null;
}
