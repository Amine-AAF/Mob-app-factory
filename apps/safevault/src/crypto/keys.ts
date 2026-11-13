import { hkdf } from '@noble/hashes/hkdf.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { aad, KEY_LENGTH, open, seal } from './aead';
import { fromBase64, toBase64, toHex, utf8Encode, wipe } from './bytes';
import { CryptoError } from './errors';
import { randomBytes } from './random';

/**
 * Key hierarchy (see docs/SECURITY.md §3):
 *
 *   master password ──Argon2id(salt, m, t, p)──► KEK (password key, never stored)
 *                                                 │ wraps (XChaCha20-Poly1305)
 *   CSPRNG ──────────────────────────────────────► VK (vault key, 256 bit, stored only wrapped)
 *                                                 │ HKDF-SHA256(info = purpose)
 *                     ┌────────────┬──────────────┼───────────────┐
 *                 entries key  categories key  audit key (HMAC)  (future purposes)
 *
 * - Derivation key and encryption keys are separate: changing the master password only
 *   re-wraps VK; rotating VK re-encrypts the data.
 * - Each purpose has its own subkey, so a ciphertext of one kind can never be opened as another.
 * - VK is never written in clear anywhere. With biometric unlock enabled, a copy is kept in
 *   Android Keystore-protected storage that requires user authentication (services/biometric.ts).
 */
export interface VaultKeys {
  vaultId: string;
  keyVersion: number;
  entries: Uint8Array;
  categories: Uint8Array;
  audit: Uint8Array;
}

export function generateVaultKey(): Uint8Array {
  return randomBytes(KEY_LENGTH);
}

function subkey(vaultKey: Uint8Array, vaultId: string, purpose: string): Uint8Array {
  return hkdf(sha256, vaultKey, utf8Encode(`safevault/vault/${vaultId}`), utf8Encode(`safevault/v1/${purpose}`), KEY_LENGTH);
}

export function deriveVaultKeys(vaultKey: Uint8Array, vaultId: string, keyVersion: number): VaultKeys {
  if (vaultKey.length !== KEY_LENGTH) throw new CryptoError('invalid_key');
  return {
    vaultId,
    keyVersion,
    entries: subkey(vaultKey, vaultId, 'entries'),
    categories: subkey(vaultKey, vaultId, 'categories'),
    audit: subkey(vaultKey, vaultId, 'audit-hmac'),
  };
}

export function wipeVaultKeys(keys: VaultKeys | null | undefined): void {
  if (!keys) return;
  wipe(keys.entries, keys.categories, keys.audit);
}

const wrapContext = (vaultId: string, keyVersion: number, purpose: 'password' | 'backup') => aad('wrap', purpose, vaultId, `k${keyVersion}`);

/** Encrypts VK under the password key. Returns a base64 envelope. */
export function wrapVaultKey(kek: Uint8Array, vaultKey: Uint8Array, vaultId: string, keyVersion: number, purpose: 'password' | 'backup' = 'password'): string {
  return toBase64(seal(kek, vaultKey, wrapContext(vaultId, keyVersion, purpose)));
}

/** Throws `wrong_password` when the key does not authenticate (wrong password or tampered row). */
export function unwrapVaultKey(kek: Uint8Array, wrapped: string, vaultId: string, keyVersion: number, purpose: 'password' | 'backup' = 'password'): Uint8Array {
  try {
    const vk = open(kek, fromBase64(wrapped), wrapContext(vaultId, keyVersion, purpose));
    if (vk.length !== KEY_LENGTH) throw new CryptoError('malformed');
    return vk;
  } catch (e) {
    if (e instanceof CryptoError && e.code === 'unsupported_version') throw e;
    throw new CryptoError('wrong_password');
  }
}

/**
 * Keyed fingerprint of a secret, used only in memory by the security audit to detect
 * reuse without keeping plaintext copies. Never persisted, never exported.
 */
export function auditFingerprint(auditKey: Uint8Array, secret: string): string {
  const bytes = utf8Encode(secret);
  try {
    return toHex(hmac(sha256, auditKey, bytes));
  } finally {
    wipe(bytes);
  }
}
