import { sha256 } from '@noble/hashes/sha2.js';

import { aad, openJson, sealJson } from '@/crypto/aead';
import { toHex, utf8Encode, wipe } from '@/crypto/bytes';
import { isCryptoError } from '@/crypto/errors';
import { derivePasswordKey, newKdfParams, validateKdfParams, type KdfParams, type KdfProfileId } from '@/crypto/kdf';
import { generateVaultKey, unwrapVaultKey, wrapVaultKey } from '@/crypto/keys';
import { randomId } from '@/crypto/random';
import type { VaultSnapshot } from '@/vault/vaultService';

/**
 * Encrypted backup file (`*.safevault`, JSON text).
 *
 * {
 *   "format": "safevault-backup", "version": 1,
 *   "backupId": "<128-bit hex>", "createdAt": <epoch ms>,
 *   "kdf": { Argon2id params + fresh salt },            ← clear: needed to derive the key
 *   "wrappedKey": "<envelope: random backup key encrypted under Argon2id(password)>",
 *   "payload": "<envelope: { snapshot, itemCount, appVersion } encrypted under the backup key>"
 * }
 *
 * - The payload AAD includes SHA-256 of the canonical header, so changing any header field
 *   (version, id, date, KDF params) makes decryption fail → tampering is detected.
 * - `itemCount` inside the authenticated payload detects truncated/partial content.
 * - No secret, title or count is visible in clear. Only the format, the creation date and the
 *   KDF parameters are.
 * - KDF parameters are validated (floor + ceiling) BEFORE deriving: a crafted file can neither
 *   downgrade the KDF nor exhaust the device's memory.
 */
export const BACKUP_FORMAT = 'safevault-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_EXTENSION = 'safevault';
export const BACKUP_MIME = 'application/octet-stream';
export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;

export type BackupErrorCode = 'not_a_backup' | 'corrupted' | 'unsupported_version' | 'wrong_password' | 'tampered' | 'too_large';

export class BackupError extends Error {
  readonly code: BackupErrorCode;
  constructor(code: BackupErrorCode) {
    super(`backup:${code}`);
    this.name = 'BackupError';
    this.code = code;
  }
}

export interface BackupHeader {
  format: typeof BACKUP_FORMAT;
  version: number;
  backupId: string;
  createdAt: number;
  kdf: KdfParams;
}

interface BackupFile extends BackupHeader {
  wrappedKey: string;
  payload: string;
}

interface BackupPayload {
  snapshot: VaultSnapshot;
  itemCount: number;
  categoryCount: number;
  appVersion: string;
}

function canonicalHeader(h: BackupHeader): string {
  const k = h.kdf;
  return JSON.stringify([h.format, h.version, h.backupId, h.createdAt, k.algorithm, k.version, k.memoryKiB, k.iterations, k.parallelism, k.salt, k.keyLength]);
}

const payloadContext = (h: BackupHeader) => aad('backup', h.backupId, `v${h.version}`, toHex(sha256(utf8Encode(canonicalHeader(h)))));

export async function createBackup(
  snapshot: VaultSnapshot,
  password: string,
  opts: { now: number; appVersion: string; profile?: KdfProfileId },
): Promise<{ text: string; header: BackupHeader; itemCount: number }> {
  const header: BackupHeader = { format: BACKUP_FORMAT, version: BACKUP_VERSION, backupId: randomId(), createdAt: opts.now, kdf: newKdfParams(opts.profile ?? 'standard') };
  const kek = await derivePasswordKey(password, header.kdf);
  const backupKey = generateVaultKey();
  try {
    const wrappedKey = wrapVaultKey(kek, backupKey, header.backupId, 1, 'backup');
    const payload: BackupPayload = { snapshot, itemCount: snapshot.items.length, categoryCount: snapshot.categories.length, appVersion: opts.appVersion };
    const file: BackupFile = { ...header, wrappedKey, payload: sealJson(backupKey, payload, payloadContext(header)) };
    return { text: JSON.stringify(file), header, itemCount: payload.itemCount };
  } finally {
    wipe(kek, backupKey);
  }
}

/** Structural validation without any password. Safe to call on untrusted files. */
export function parseBackup(text: string): BackupFile {
  if (typeof text !== 'string') throw new BackupError('not_a_backup');
  if (text.length > MAX_BACKUP_BYTES) throw new BackupError('too_large');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError(text.trimStart().startsWith('{') ? 'corrupted' : 'not_a_backup');
  }
  const f = raw as Partial<BackupFile> | null;
  if (!f || typeof f !== 'object' || f.format !== BACKUP_FORMAT) throw new BackupError('not_a_backup');
  if (typeof f.version !== 'number' || !Number.isInteger(f.version)) throw new BackupError('corrupted');
  if (f.version > BACKUP_VERSION || f.version < 1) throw new BackupError('unsupported_version');
  if (typeof f.backupId !== 'string' || !/^[0-9a-f]{32}$/.test(f.backupId)) throw new BackupError('corrupted');
  if (typeof f.createdAt !== 'number' || typeof f.wrappedKey !== 'string' || typeof f.payload !== 'string') throw new BackupError('corrupted');
  try {
    validateKdfParams(f.kdf);
  } catch {
    throw new BackupError('corrupted');
  }
  return f as BackupFile;
}

export async function decryptBackup(text: string, password: string): Promise<{ header: BackupHeader; snapshot: VaultSnapshot; itemCount: number; appVersion: string }> {
  const file = parseBackup(text);
  const header: BackupHeader = { format: file.format, version: file.version, backupId: file.backupId, createdAt: file.createdAt, kdf: file.kdf };
  const kek = await derivePasswordKey(password, file.kdf);
  let backupKey: Uint8Array;
  try {
    backupKey = unwrapVaultKey(kek, file.wrappedKey, file.backupId, 1, 'backup');
  } catch (e) {
    // A wrong password and a modified wrappedKey are indistinguishable (both fail authentication).
    if (isCryptoError(e, 'unsupported_version')) throw new BackupError('unsupported_version');
    throw new BackupError('wrong_password');
  } finally {
    wipe(kek);
  }
  let payload: BackupPayload;
  try {
    payload = openJson<BackupPayload>(backupKey, file.payload, payloadContext(header));
  } catch (e) {
    // The key unwrapped fine, so the password is right: the header or payload was altered.
    throw new BackupError(isCryptoError(e, 'unsupported_version') ? 'unsupported_version' : 'tampered');
  } finally {
    wipe(backupKey);
  }
  const s = payload?.snapshot;
  if (!s || !Array.isArray(s.items) || !Array.isArray(s.categories)) throw new BackupError('corrupted');
  if (payload.itemCount !== s.items.length || payload.categoryCount !== s.categories.length) throw new BackupError('corrupted');
  return { header, snapshot: s, itemCount: payload.itemCount, appVersion: String(payload.appVersion ?? '') };
}

export function backupFileName(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `SafeVault-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}.${BACKUP_EXTENSION}`;
}
