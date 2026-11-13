import type { SqlDatabase } from '@factory/storage';

import { aad, openJson, sealJson } from '@/crypto/aead';
import { wipe } from '@/crypto/bytes';
import { CryptoError, isCryptoError } from '@/crypto/errors';
import { derivePasswordKey, newKdfParams, validateKdfParams, type KdfParams, type KdfProfileId } from '@/crypto/kdf';
import { deriveVaultKeys, generateVaultKey, unwrapVaultKey, wipeVaultKeys, wrapVaultKey, type VaultKeys } from '@/crypto/keys';
import { randomId } from '@/crypto/random';
import { auditLogins, type AuditInput, type AuditReport } from '@/features/audit/audit';
import { BUILTIN_CATEGORIES } from '@/features/categories/defaults';

import { MIN_MASTER_PASSWORD_LENGTH, VaultError } from './errors';
import { registerFailure, remainingLockoutMs, type LockoutState } from './lockout';
import { normalizeMeta, normalizeSecret } from './schema';
import { DEFAULT_CATEGORY_ID, type AnyMeta, type AnySecret, type Category, type EntryType, type ItemInput, type LoginSecret, type SecretByType, type VaultItem } from './types';

/** Vault storage format. Bump (with a migration path) if the key hierarchy or AAD scheme changes. */
export const VAULT_FORMAT_VERSION = 1;
/** Envelope format used for rows written by this version (see crypto/aead.ts). */
export const ROW_CRYPTO_VERSION = 1;

export type UnlockResult =
  | { status: 'ok' }
  | { status: 'wrong_password'; failedAttempts: number; lockoutMs: number }
  | { status: 'locked_out'; remainingMs: number };

interface MetaRow {
  vault_id: string;
  format_version: number;
  kdf: string;
  wrapped_key: string;
  key_check: string;
  key_version: number;
  created_at: number;
  password_changed_at: number;
  key_rotated_at: number;
  failed_attempts: number;
  lockout_until: number;
  biometric_enabled: number;
}

interface EntryRow {
  id: string;
  type: EntryType;
  meta_ct: string;
  secret_ct: string;
  key_version: number;
  crypto_version: number;
  created_at: number;
  updated_at: number;
}

interface CategoryRow {
  id: string;
  builtin: string | null;
  data_ct: string | null;
  key_version: number;
  sort_order: number;
}

export interface VaultInfo {
  vaultId: string;
  createdAt: number;
  passwordChangedAt: number;
  keyRotatedAt: number;
  keyVersion: number;
  kdf: KdfParams;
  biometricEnabled: boolean;
}

/** Plaintext snapshot used ONLY transiently to build/restore an encrypted backup. */
export interface VaultSnapshot {
  categories: Omit<Category, 'sortOrder'>[];
  items: { id: string; type: EntryType; createdAt: number; updatedAt: number; meta: AnyMeta; secret: AnySecret }[];
}

export interface SaveOptions {
  /** Max previous passwords kept per login (plan dependent). */
  historyLimit: number;
}

const ctxEntry = (vaultId: string, id: string, type: EntryType, field: 'meta' | 'secret', keyVersion: number, cryptoVersion: number) =>
  aad('entry', vaultId, id, type, field, `k${keyVersion}`, `c${cryptoVersion}`);
const ctxCategory = (vaultId: string, id: string, keyVersion: number) => aad('category', vaultId, id, `k${keyVersion}`);
const ctxKeyCheck = (vaultId: string, keyVersion: number) => aad('keycheck', vaultId, `k${keyVersion}`);

export interface VaultServiceDeps {
  db: SqlDatabase;
  now?: () => number;
}

export type VaultService = ReturnType<typeof createVaultService>;

export function createVaultService({ db, now = Date.now }: VaultServiceDeps) {
  // Unlocked state lives only in this closure (not in React state / devtools).
  let keys: VaultKeys | null = null;
  let vaultKey: Uint8Array | null = null;
  let items = new Map<string, VaultItem>();
  let categories: Category[] = [];
  let corrupted: string[] = [];
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((l) => l());

  async function readMeta(): Promise<MetaRow | null> {
    return db.getFirstAsync<MetaRow>('SELECT * FROM vault_meta WHERE id = 1', []);
  }

  async function requireMeta(): Promise<MetaRow> {
    const m = await readMeta();
    if (!m) throw new VaultError('no_vault');
    if (m.format_version > VAULT_FORMAT_VERSION) throw new CryptoError('unsupported_version');
    return m;
  }

  function requireKeys(): VaultKeys {
    if (!keys) throw new VaultError('locked');
    return keys;
  }

  function encryptRow(k: VaultKeys, id: string, type: EntryType, meta: AnyMeta, secret: AnySecret) {
    return {
      meta_ct: sealJson(k.entries, meta, ctxEntry(k.vaultId, id, type, 'meta', k.keyVersion, ROW_CRYPTO_VERSION)),
      secret_ct: sealJson(k.entries, secret, ctxEntry(k.vaultId, id, type, 'secret', k.keyVersion, ROW_CRYPTO_VERSION)),
    };
  }

  function decryptMeta(k: VaultKeys, row: Pick<EntryRow, 'id' | 'type' | 'meta_ct' | 'key_version' | 'crypto_version'>): AnyMeta {
    if (row.key_version !== k.keyVersion) throw new CryptoError('auth_failed');
    return normalizeMeta(row.type, openJson(k.entries, row.meta_ct, ctxEntry(k.vaultId, row.id, row.type, 'meta', row.key_version, row.crypto_version)));
  }

  function decryptSecret(k: VaultKeys, row: Pick<EntryRow, 'id' | 'type' | 'secret_ct' | 'key_version' | 'crypto_version'>): AnySecret {
    if (row.key_version !== k.keyVersion) throw new CryptoError('auth_failed');
    return normalizeSecret(row.type, openJson(k.entries, row.secret_ct, ctxEntry(k.vaultId, row.id, row.type, 'secret', row.key_version, row.crypto_version)), now());
  }

  function decodeCategory(k: VaultKeys, row: CategoryRow): Category | null {
    const builtin = BUILTIN_CATEGORIES.find((b) => b.key === row.builtin);
    let data: { name?: string; color?: string; icon?: string } = {};
    if (row.data_ct) data = openJson(k.categories, row.data_ct, ctxCategory(k.vaultId, row.id, row.key_version));
    if (!builtin && !row.data_ct) return null;
    return {
      id: row.id,
      builtin: builtin?.key ?? null,
      name: typeof data.name === 'string' ? data.name.slice(0, 60) : '',
      color: typeof data.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(data.color) ? data.color : (builtin?.color ?? '#64748B'),
      icon: typeof data.icon === 'string' ? data.icon.slice(0, 40) : (builtin?.icon ?? 'folder'),
      sortOrder: row.sort_order,
    };
  }

  async function loadAll(k: VaultKeys): Promise<void> {
    const rows = await db.getAllAsync<EntryRow>('SELECT id, type, meta_ct, secret_ct, key_version, crypto_version, created_at, updated_at FROM entries', []);
    const next = new Map<string, VaultItem>();
    const bad: string[] = [];
    for (const r of rows) {
      try {
        next.set(r.id, { id: r.id, type: r.type, createdAt: r.created_at, updatedAt: r.updated_at, meta: decryptMeta(k, r) } as VaultItem);
      } catch {
        // A single damaged row must not make the whole vault unusable; it is reported in the UI.
        bad.push(r.id);
      }
    }
    const catRows = await db.getAllAsync<CategoryRow>('SELECT id, builtin, data_ct, key_version, sort_order FROM categories ORDER BY sort_order, created_at', []);
    const cats: Category[] = [];
    for (const r of catRows) {
      try {
        const c = decodeCategory(k, r);
        if (c) cats.push(c);
      } catch {
        bad.push(`category:${r.id}`);
      }
    }
    items = next;
    categories = cats;
    corrupted = bad;
  }

  async function seedBuiltinCategories(keyVersion: number): Promise<void> {
    let order = 0;
    for (const b of BUILTIN_CATEGORIES) {
      await db.runAsync('INSERT INTO categories (id, builtin, data_ct, key_version, sort_order, created_at) VALUES (?, ?, NULL, ?, ?, ?)', [b.id, b.key, keyVersion, order++, now()]);
    }
  }

  async function openSession(vk: Uint8Array, meta: MetaRow): Promise<void> {
    const k = deriveVaultKeys(vk, meta.vault_id, meta.key_version);
    try {
      const check = openJson<{ vaultId?: string }>(k.entries, meta.key_check, ctxKeyCheck(meta.vault_id, meta.key_version));
      if (check.vaultId !== meta.vault_id) throw new CryptoError('auth_failed');
    } catch (e) {
      wipeVaultKeys(k);
      throw e;
    }
    lockInternal();
    keys = k;
    vaultKey = vk;
    await loadAll(k);
    notify();
  }

  function lockInternal() {
    wipeVaultKeys(keys);
    wipe(vaultKey);
    keys = null;
    vaultKey = null;
    items = new Map();
    categories = [];
    corrupted = [];
  }

  /** Derives the KEK and unwraps VK, applying the persisted lockout policy. */
  async function verifyPassword(password: string, meta: MetaRow): Promise<{ ok: true; vk: Uint8Array } | { ok: false; result: UnlockResult }> {
    const t = now();
    const state: LockoutState = { failedAttempts: meta.failed_attempts, lockoutUntil: meta.lockout_until };
    const remaining = remainingLockoutMs(state, t);
    if (remaining > 0) return { ok: false, result: { status: 'locked_out', remainingMs: remaining } };

    const kdf = validateKdfParams(JSON.parse(meta.kdf));
    const kek = await derivePasswordKey(password, kdf);
    try {
      const vk = unwrapVaultKey(kek, meta.wrapped_key, meta.vault_id, meta.key_version);
      if (meta.failed_attempts !== 0 || meta.lockout_until !== 0) await db.runAsync('UPDATE vault_meta SET failed_attempts = 0, lockout_until = 0 WHERE id = 1', []);
      return { ok: true, vk };
    } catch (e) {
      if (!isCryptoError(e, 'wrong_password')) throw e;
      const next = registerFailure(state, now());
      await db.runAsync('UPDATE vault_meta SET failed_attempts = ?, lockout_until = ? WHERE id = 1', [next.failedAttempts, next.lockoutUntil]);
      return { ok: false, result: { status: 'wrong_password', failedAttempts: next.failedAttempts, lockoutMs: remainingLockoutMs(next, now()) } };
    } finally {
      wipe(kek);
    }
  }

  async function writeItem(k: VaultKeys, id: string, type: EntryType, meta: AnyMeta, secret: AnySecret, createdAt: number, updatedAt: number) {
    const ct = encryptRow(k, id, type, meta, secret);
    await db.runAsync(
      `INSERT INTO entries (id, type, meta_ct, secret_ct, key_version, crypto_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET type = excluded.type, meta_ct = excluded.meta_ct, secret_ct = excluded.secret_ct,
         key_version = excluded.key_version, crypto_version = excluded.crypto_version, updated_at = excluded.updated_at`,
      [id, type, ct.meta_ct, ct.secret_ct, k.keyVersion, ROW_CRYPTO_VERSION, createdAt, updatedAt],
    );
  }

  async function getRow(id: string): Promise<EntryRow> {
    const row = await db.getFirstAsync<EntryRow>('SELECT * FROM entries WHERE id = ?', [id]);
    if (!row) throw new VaultError('not_found');
    return row;
  }

  async function writeCategory(k: VaultKeys, c: { id: string; builtin: string | null; name: string; color: string; icon: string }, sortOrder: number) {
    const builtin = BUILTIN_CATEGORIES.find((b) => b.key === c.builtin);
    const untouched = builtin && !c.name && c.color === builtin.color && c.icon === builtin.icon;
    const dataCt = untouched ? null : sealJson(k.categories, { name: c.name, color: c.color, icon: c.icon }, ctxCategory(k.vaultId, c.id, k.keyVersion));
    await db.runAsync(
      `INSERT INTO categories (id, builtin, data_ct, key_version, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data_ct = excluded.data_ct, key_version = excluded.key_version, sort_order = excluded.sort_order`,
      [c.id, builtin?.key ?? null, dataCt, k.keyVersion, sortOrder, now()],
    );
  }

  const service = {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async exists(): Promise<boolean> {
      return (await readMeta()) !== null;
    },

    async info(): Promise<VaultInfo | null> {
      const m = await readMeta();
      if (!m) return null;
      return {
        vaultId: m.vault_id,
        createdAt: m.created_at,
        passwordChangedAt: m.password_changed_at,
        keyRotatedAt: m.key_rotated_at,
        keyVersion: m.key_version,
        kdf: JSON.parse(m.kdf) as KdfParams,
        biometricEnabled: m.biometric_enabled === 1,
      };
    },

    async lockoutState(): Promise<{ failedAttempts: number; remainingMs: number }> {
      const m = await readMeta();
      if (!m) return { failedAttempts: 0, remainingMs: 0 };
      return { failedAttempts: m.failed_attempts, remainingMs: remainingLockoutMs({ failedAttempts: m.failed_attempts, lockoutUntil: m.lockout_until }, now()) };
    },

    isUnlocked: () => keys !== null,

    /** Creates a new vault and leaves it unlocked. Never overwrites an existing vault. */
    async create(password: string, profile: KdfProfileId = 'standard'): Promise<void> {
      if (password.length < MIN_MASTER_PASSWORD_LENGTH) throw new VaultError('password_too_short');
      if (await readMeta()) throw new VaultError('vault_exists');
      const vaultId = randomId();
      const kdf = newKdfParams(profile);
      const kek = await derivePasswordKey(password, kdf);
      const vk = generateVaultKey();
      const k = deriveVaultKeys(vk, vaultId, 1);
      try {
        const wrapped = wrapVaultKey(kek, vk, vaultId, 1);
        const check = sealJson(k.entries, { vaultId }, ctxKeyCheck(vaultId, 1));
        const t = now();
        await db.withTransactionAsync(async () => {
          await db.runAsync(
            `INSERT INTO vault_meta (id, vault_id, format_version, kdf, wrapped_key, key_check, key_version, created_at, password_changed_at, key_rotated_at)
             VALUES (1, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
            [vaultId, VAULT_FORMAT_VERSION, JSON.stringify(kdf), wrapped, check, t, t, t],
          );
          await db.runAsync('DELETE FROM entries', []);
          await db.runAsync('DELETE FROM categories', []);
          await seedBuiltinCategories(1);
        });
      } finally {
        wipe(kek);
        wipeVaultKeys(k);
      }
      const meta = await requireMeta();
      await openSession(vk, meta);
    },

    async unlock(password: string): Promise<UnlockResult> {
      const meta = await requireMeta();
      const r = await verifyPassword(password, meta);
      if (!r.ok) return r.result;
      await openSession(r.vk, meta);
      return { status: 'ok' };
    },

    /** Biometric path: VK comes from Keystore-protected storage after a successful BiometricPrompt. */
    async unlockWithVaultKey(vk: Uint8Array): Promise<void> {
      const meta = await requireMeta();
      try {
        await openSession(vk, meta);
      } catch (e) {
        wipe(vk);
        throw e;
      }
    },

    lock(): void {
      const was = keys !== null;
      lockInternal();
      if (was) notify();
    },

    /** Copy of VK for enrolling biometric unlock. The caller must wipe it. */
    exportVaultKeyCopy(): Uint8Array {
      if (!vaultKey) throw new VaultError('locked');
      return Uint8Array.from(vaultKey);
    },

    async setBiometricEnabled(enabled: boolean): Promise<void> {
      await db.runAsync('UPDATE vault_meta SET biometric_enabled = ? WHERE id = 1', [enabled ? 1 : 0]);
    },

    items(): VaultItem[] {
      return [...items.values()];
    },

    item(id: string): VaultItem | undefined {
      return items.get(id);
    },

    categories(): Category[] {
      return [...categories];
    },

    corruptedIds(): string[] {
      return [...corrupted];
    },

    async getSecret<K extends EntryType>(id: string, _type?: K): Promise<SecretByType[K]> {
      const k = requireKeys();
      return decryptSecret(k, await getRow(id)) as SecretByType[K];
    },

    async saveItem<K extends EntryType>(input: ItemInput<K>, opts: SaveOptions): Promise<VaultItem> {
      const k = requireKeys();
      const t = now();
      const meta = normalizeMeta(input.type, input.meta);
      if (!meta.title) throw new VaultError('title_required');
      if (!categories.some((c) => c.id === meta.categoryId)) meta.categoryId = DEFAULT_CATEGORY_ID;
      let secret = normalizeSecret(input.type, input.secret, t);
      const existing = input.id ? items.get(input.id) : undefined;
      const id = existing?.id ?? randomId();
      const createdAt = existing?.createdAt ?? t;

      if (input.type === 'login') {
        const next = secret as LoginSecret;
        // History is owned by the service: callers cannot inject or erase entries.
        let history: LoginSecret['history'] = [];
        let passwordUpdatedAt = t;
        if (existing && existing.type === 'login') {
          const prev = (await service.getSecret(id)) as LoginSecret;
          history = prev.history;
          passwordUpdatedAt = prev.passwordUpdatedAt;
          if (prev.password !== next.password) {
            passwordUpdatedAt = t;
            if (prev.password) history = [{ password: prev.password, replacedAt: t }, ...prev.history];
          }
        }
        secret = { ...next, passwordUpdatedAt, history: history.slice(0, Math.max(0, opts.historyLimit)) } as SecretByType[K];
      }

      if (existing) meta.lastViewedAt = existing.meta.lastViewedAt;
      await writeItem(k, id, input.type, meta, secret, createdAt, t);
      const item = { id, type: input.type, createdAt, updatedAt: t, meta } as VaultItem;
      items.set(id, item);
      corrupted = corrupted.filter((c) => c !== id);
      notify();
      return item;
    },

    /** Updates meta-only fields (favourite, last viewed) without touching `updated_at`. */
    async patchMeta(id: string, patch: Partial<Pick<AnyMeta, 'favorite' | 'lastViewedAt' | 'categoryId'>>): Promise<void> {
      const k = requireKeys();
      const item = items.get(id);
      if (!item) throw new VaultError('not_found');
      const row = await getRow(id);
      const meta = normalizeMeta(item.type, { ...item.meta, ...patch });
      const metaCt = sealJson(k.entries, meta, ctxEntry(k.vaultId, id, item.type, 'meta', k.keyVersion, row.crypto_version));
      await db.runAsync('UPDATE entries SET meta_ct = ? WHERE id = ?', [metaCt, id]);
      items.set(id, { ...item, meta } as VaultItem);
      notify();
    },

    async deleteItem(id: string): Promise<void> {
      requireKeys();
      await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
      items.delete(id);
      corrupted = corrupted.filter((c) => c !== id);
      notify();
    },

    /** Permanently removes rows that can no longer be decrypted (after explicit user confirmation). */
    async purgeCorrupted(): Promise<number> {
      requireKeys();
      const ids = corrupted.filter((c) => !c.startsWith('category:'));
      for (const id of ids) await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
      corrupted = corrupted.filter((c) => c.startsWith('category:'));
      notify();
      return ids.length;
    },

    async saveCategory(input: { id?: string; name: string; color: string; icon: string }): Promise<Category> {
      const k = requireKeys();
      const existing = input.id ? categories.find((c) => c.id === input.id) : undefined;
      const id = existing?.id ?? `cat_${randomId()}`;
      const name = input.name.trim().slice(0, 60);
      if (!existing?.builtin && !name) throw new VaultError('title_required');
      const sortOrder = existing?.sortOrder ?? Math.max(0, ...categories.map((c) => c.sortOrder)) + 1;
      const cat: Category = { id, builtin: existing?.builtin ?? null, name, color: input.color, icon: input.icon, sortOrder };
      await writeCategory(k, cat, sortOrder);
      categories = existing ? categories.map((c) => (c.id === id ? cat : c)) : [...categories, cat];
      notify();
      return cat;
    },

    /** Deletes a category and moves its items to "Other" (which cannot be deleted). */
    async deleteCategory(id: string): Promise<number> {
      const k = requireKeys();
      if (id === DEFAULT_CATEGORY_ID) throw new VaultError('category_protected');
      const affected = [...items.values()].filter((i) => i.meta.categoryId === id);
      await db.withTransactionAsync(async () => {
        for (const item of affected) {
          const row = await getRow(item.id);
          const meta = { ...item.meta, categoryId: DEFAULT_CATEGORY_ID };
          await db.runAsync('UPDATE entries SET meta_ct = ? WHERE id = ?', [
            sealJson(k.entries, meta, ctxEntry(k.vaultId, item.id, item.type, 'meta', k.keyVersion, row.crypto_version)),
            item.id,
          ]);
        }
        await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
      });
      for (const item of affected) items.set(item.id, { ...item, meta: { ...item.meta, categoryId: DEFAULT_CATEGORY_ID } } as VaultItem);
      categories = categories.filter((c) => c.id !== id);
      notify();
      return affected.length;
    },

    /** Verifies the master password without unlocking (used before sensitive actions). */
    async verifyMasterPassword(password: string): Promise<UnlockResult> {
      const meta = await requireMeta();
      const r = await verifyPassword(password, meta);
      if (!r.ok) return r.result;
      wipe(r.vk);
      return { status: 'ok' };
    },

    /**
     * Re-wraps VK under a key derived from the new password with a fresh salt (and optionally
     * stronger KDF parameters). Data is not re-encrypted: VK does not change.
     */
    async changeMasterPassword(current: string, next: string, profile?: KdfProfileId): Promise<UnlockResult> {
      if (next.length < MIN_MASTER_PASSWORD_LENGTH) throw new VaultError('password_too_short');
      const meta = await requireMeta();
      const r = await verifyPassword(current, meta);
      if (!r.ok) return r.result;
      const oldKdf = JSON.parse(meta.kdf) as KdfParams;
      const kdf = profile ? newKdfParams(profile) : { ...newKdfParams(), memoryKiB: oldKdf.memoryKiB, iterations: oldKdf.iterations, parallelism: oldKdf.parallelism };
      const kek = await derivePasswordKey(next, kdf);
      try {
        const wrapped = wrapVaultKey(kek, r.vk, meta.vault_id, meta.key_version);
        await db.runAsync('UPDATE vault_meta SET kdf = ?, wrapped_key = ?, password_changed_at = ? WHERE id = 1', [JSON.stringify(kdf), wrapped, now()]);
      } finally {
        wipe(kek, r.vk);
      }
      return { status: 'ok' };
    },

    /**
     * Generates a new VK and re-encrypts every row atomically. Use after a suspected key
     * exposure (e.g. the device was compromised while unlocked). Biometric enrolment must be
     * redone afterwards (the stored VK copy is obsolete) — the caller handles that.
     */
    async rotateVaultKey(password: string): Promise<UnlockResult> {
      const old = requireKeys();
      const meta = await requireMeta();
      const r = await verifyPassword(password, meta);
      if (!r.ok) return r.result;
      wipe(r.vk);
      const kdf = validateKdfParams(JSON.parse(meta.kdf));
      const kek = await derivePasswordKey(password, kdf);
      const newVk = generateVaultKey();
      const nextVersion = meta.key_version + 1;
      const nk = deriveVaultKeys(newVk, meta.vault_id, nextVersion);
      try {
        const rows = await db.getAllAsync<EntryRow>('SELECT * FROM entries', []);
        const catRows = await db.getAllAsync<CategoryRow>('SELECT id, builtin, data_ct, key_version, sort_order FROM categories', []);
        // Decrypt everything first: if any row fails, nothing is written.
        const plain = rows.map((row) => ({ row, meta: decryptMeta(old, row), secret: decryptSecret(old, row) }));
        const cats = catRows.map((row) => decodeCategory(old, row)).filter((c): c is Category => !!c);
        await db.withTransactionAsync(async () => {
          for (const p of plain) await writeItem(nk, p.row.id, p.row.type, p.meta, p.secret, p.row.created_at, p.row.updated_at);
          for (const c of cats) await writeCategory(nk, c, c.sortOrder);
          await db.runAsync('UPDATE vault_meta SET wrapped_key = ?, key_check = ?, key_version = ?, key_rotated_at = ?, biometric_enabled = 0 WHERE id = 1', [
            wrapVaultKey(kek, newVk, meta.vault_id, nextVersion),
            sealJson(nk.entries, { vaultId: meta.vault_id }, ctxKeyCheck(meta.vault_id, nextVersion)),
            nextVersion,
            now(),
          ]);
        });
      } catch (e) {
        wipe(newVk);
        wipeVaultKeys(nk);
        throw e;
      } finally {
        wipe(kek);
      }
      wipeVaultKeys(nk);
      await openSession(newVk, await requireMeta());
      return { status: 'ok' };
    },

    /**
     * Local password audit. Login secrets are decrypted one at a time; only the report
     * (ids + counts) is returned. Reuse detection uses the audit HMAC subkey.
     */
    async audit(): Promise<AuditReport> {
      const k = requireKeys();
      const inputs: AuditInput[] = [];
      for (const item of items.values()) {
        if (item.type !== 'login') continue;
        inputs.push({ id: item.id, meta: item.meta, secret: (await service.getSecret(item.id)) as LoginSecret });
      }
      try {
        return auditLogins(inputs, k.audit, now());
      } finally {
        inputs.length = 0;
      }
    },

    /** Decrypts the whole vault for an immediate encrypted export. Never persist the result. */
    async snapshot(): Promise<VaultSnapshot> {
      const k = requireKeys();
      const rows = await db.getAllAsync<EntryRow>('SELECT * FROM entries', []);
      return {
        categories: categories.map(({ sortOrder: _s, ...c }) => c),
        items: rows.map((row) => ({ id: row.id, type: row.type, createdAt: row.created_at, updatedAt: row.updated_at, meta: decryptMeta(k, row), secret: decryptSecret(k, row) })),
      };
    },

    /**
     * Imports a decrypted snapshot atomically (all or nothing).
     *  - 'replace' deletes the current content first (the UI requires explicit confirmation).
     *  - 'merge' adds missing items and keeps the most recently updated copy on id conflicts.
     */
    async importSnapshot(snapshot: VaultSnapshot, mode: 'replace' | 'merge'): Promise<{ added: number; updated: number; skipped: number }> {
      const k = requireKeys();
      const t = now();
      // Validate and normalise everything BEFORE writing anything.
      const incoming = snapshot.items.map((i) => {
        if (!i || typeof i.id !== 'string' || !/^[0-9a-f]{32}$/.test(i.id)) throw new CryptoError('malformed');
        if (!['login', 'note', 'card', 'identity'].includes(i.type)) throw new CryptoError('malformed');
        return {
          id: i.id,
          type: i.type,
          createdAt: Number.isFinite(i.createdAt) ? i.createdAt : t,
          updatedAt: Number.isFinite(i.updatedAt) ? i.updatedAt : t,
          meta: normalizeMeta(i.type, i.meta),
          secret: normalizeSecret(i.type, i.secret, t),
        };
      });
      const incomingCats = snapshot.categories
        .filter((c) => c && typeof c.id === 'string' && /^cat_[0-9a-z_]{1,40}$/.test(c.id))
        .map((c) => ({ id: c.id, builtin: c.builtin, name: String(c.name ?? '').slice(0, 60), color: /^#[0-9A-Fa-f]{6}$/.test(c.color) ? c.color : '#64748B', icon: String(c.icon ?? 'folder').slice(0, 40) }));

      let added = 0;
      let updated = 0;
      let skipped = 0;
      await db.withTransactionAsync(async () => {
        if (mode === 'replace') {
          await db.runAsync('DELETE FROM entries', []);
          await db.runAsync('DELETE FROM categories', []);
          await seedBuiltinCategories(k.keyVersion);
        }
        const existingRows = await db.getAllAsync<{ id: string; updated_at: number }>('SELECT id, updated_at FROM entries', []);
        const existing = new Map(existingRows.map((r) => [r.id, r.updated_at]));
        const catIds = new Set((await db.getAllAsync<{ id: string }>('SELECT id FROM categories', [])).map((r) => r.id));
        let order = catIds.size;
        for (const c of incomingCats) {
          if (catIds.has(c.id) && mode === 'merge' && !c.builtin) continue;
          await writeCategory(k, c, order++);
          catIds.add(c.id);
        }
        for (const i of incoming) {
          if (!catIds.has(i.meta.categoryId)) i.meta.categoryId = DEFAULT_CATEGORY_ID;
          const current = existing.get(i.id);
          if (current !== undefined && current >= i.updatedAt) {
            skipped++;
            continue;
          }
          await writeItem(k, i.id, i.type, i.meta, i.secret, i.createdAt, i.updatedAt);
          if (current === undefined) added++;
          else updated++;
        }
      });
      await loadAll(k);
      notify();
      return { added, updated, skipped };
    },

    /** Erases the vault and every row. Irreversible; the UI confirms with the master password. */
    async destroy(): Promise<void> {
      lockInternal();
      await db.withTransactionAsync(async () => {
        for (const table of ['entries', 'categories', 'vault_meta', 'backup_log', 'settings']) await db.runAsync(`DELETE FROM ${table}`, []);
      });
      notify();
    },
  };
  return service;
}
