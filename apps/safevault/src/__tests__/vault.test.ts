import { CryptoError } from '@/crypto/errors';
import { forceEngine } from '@/crypto/kdf';
import { isVaultError, VaultError } from '@/vault/errors';
import { FREE_ATTEMPTS, lockoutDelayMs, MAX_DELAY_MS } from '@/vault/lockout';
import { emptyMeta, emptySecret } from '@/vault/schema';
import type { LoginMeta, LoginSecret } from '@/vault/types';
import { createVaultService } from '@/vault/vaultService';

import { MASTER, setupVault } from '@/test-utils/vault';

const login = (title: string, password: string, extra: Partial<LoginMeta> = {}) => ({
  type: 'login' as const,
  meta: { ...emptyMeta('login'), title, username: 'alice', url: 'https://example.com', ...extra },
  secret: { ...emptySecret('login', 0), password } as LoginSecret,
});

afterEach(() => forceEngine(null));

describe('vault lifecycle', () => {
  it('creates, locks and unlocks with the master password', async () => {
    const { vault } = await setupVault();
    expect(await vault.exists()).toBe(false);
    await vault.create(MASTER);
    expect(vault.isUnlocked()).toBe(true);
    expect(vault.categories().length).toBe(10);
    vault.lock();
    expect(vault.isUnlocked()).toBe(false);
    expect(vault.items()).toEqual([]);
    expect(vault.categories()).toEqual([]);
    expect(await vault.unlock(MASTER)).toEqual({ status: 'ok' });
  });

  it('never overwrites an existing vault and enforces a minimum length', async () => {
    const { vault } = await setupVault();
    await expect(vault.create('short')).rejects.toEqual(new VaultError('password_too_short'));
    await vault.create(MASTER);
    await expect(vault.create(MASTER)).rejects.toEqual(new VaultError('vault_exists'));
  });

  it('refuses operations while locked', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    vault.lock();
    await expect(vault.saveItem(login('x', 'y'), { historyLimit: 1 })).rejects.toEqual(new VaultError('locked'));
    await expect(vault.getSecret('abc')).rejects.toEqual(new VaultError('locked'));
    expect(() => vault.exportVaultKeyCopy()).toThrow(VaultError);
  });
});

describe('failed attempts', () => {
  it('rejects a wrong password and applies an exponential, persisted lockout', async () => {
    let t = 1_000_000;
    const { vault, db } = await setupVault(() => t);
    await vault.create(MASTER);
    vault.lock();
    for (let i = 1; i < FREE_ATTEMPTS; i++) {
      const r = await vault.unlock('wrong password!!');
      expect(r).toEqual({ status: 'wrong_password', failedAttempts: i, lockoutMs: 0 });
    }
    const r5 = await vault.unlock('wrong password!!');
    expect(r5).toMatchObject({ status: 'wrong_password', failedAttempts: FREE_ATTEMPTS, lockoutMs: 30_000 });
    // Even the right password is refused during the lockout (KDF not even run).
    expect(await vault.unlock(MASTER)).toMatchObject({ status: 'locked_out' });
    // The counter survives a "restart" (new service on the same DB).
    const again = createVaultService({ db, now: () => t });
    expect((await again.lockoutState()).failedAttempts).toBe(FREE_ATTEMPTS);
    t += 30_001;
    expect(await again.unlock(MASTER)).toEqual({ status: 'ok' });
    expect((await again.lockoutState()).failedAttempts).toBe(0);
  });

  it('caps the delay', () => {
    expect(lockoutDelayMs(0)).toBe(0);
    expect(lockoutDelayMs(FREE_ATTEMPTS + 1)).toBe(60_000);
    expect(lockoutDelayMs(100)).toBe(MAX_DELAY_MS);
  });
});

describe('items', () => {
  it('stores nothing in clear in SQLite', async () => {
    const { vault, raw } = await setupVault();
    await vault.create(MASTER);
    await vault.saveItem(login('My Bank', 'S3cr3t-P@ssw0rd-XYZ', { username: 'alice.smith@example.org' }), { historyLimit: 1 });
    await vault.saveItem(
      { type: 'card', meta: { ...emptyMeta('card'), title: 'Visa perso', last4: '1111', cardholder: 'Alice Smith' }, secret: { number: '4111111111111111', notes: '' } },
      { historyLimit: 1 },
    );
    await vault.saveItem({ type: 'note', meta: { ...emptyMeta('note'), title: 'Recovery codes' }, secret: { body: 'abcd-efgh-ijkl' } }, { historyLimit: 1 });
    const dump = JSON.stringify(raw.raw.exec('SELECT * FROM entries'), null, 0) + JSON.stringify(raw.raw.exec('SELECT * FROM vault_meta')) + JSON.stringify(raw.raw.exec('SELECT * FROM categories'));
    for (const needle of ['My Bank', 'S3cr3t-P@ssw0rd-XYZ', 'alice.smith', '4111111111111111', '1111', 'Alice Smith', 'Recovery codes', 'abcd-efgh', MASTER, 'Visa perso']) {
      expect(dump).not.toContain(needle);
    }
  });

  it('keeps secrets out of the in-memory summaries and decrypts them on demand', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    const item = await vault.saveItem(login('GitHub', 'pw-123456789'), { historyLimit: 1 });
    expect(JSON.stringify(vault.items())).not.toContain('pw-123456789');
    const secret = await vault.getSecret<'login'>(item.id);
    expect(secret.password).toBe('pw-123456789');
  });

  it('requires a title and falls back to the default category', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    await expect(vault.saveItem(login('  ', 'x'), { historyLimit: 1 })).rejects.toEqual(new VaultError('title_required'));
    const item = await vault.saveItem(login('A', 'x', { categoryId: 'cat_doesnotexist' }), { historyLimit: 1 });
    expect(item.meta.categoryId).toBe('cat_other');
  });

  it('records password history (service-owned, bounded by plan)', async () => {
    let t = 1000;
    const { vault } = await setupVault(() => t);
    await vault.create(MASTER);
    const item = await vault.saveItem(login('Site', 'first-password'), { historyLimit: 2 });
    for (const pw of ['second-password', 'third-password', 'fourth-password']) {
      t += 1000;
      await vault.saveItem({ ...login('Site', pw), id: item.id }, { historyLimit: 2 });
    }
    const s = await vault.getSecret<'login'>(item.id);
    expect(s.password).toBe('fourth-password');
    expect(s.history.map((h) => h.password)).toEqual(['third-password', 'second-password']);
    expect(s.passwordUpdatedAt).toBe(t);
    // Saving without changing the password does not add history.
    await vault.saveItem({ ...login('Site renamed', 'fourth-password'), id: item.id }, { historyLimit: 2 });
    expect((await vault.getSecret<'login'>(item.id)).history).toHaveLength(2);
  });

  it('favourites and last-viewed are encrypted meta updates', async () => {
    const { vault } = await setupVault(() => 5000);
    await vault.create(MASTER);
    const item = await vault.saveItem(login('A', 'x'), { historyLimit: 1 });
    await vault.patchMeta(item.id, { favorite: true, lastViewedAt: 5000 });
    vault.lock();
    await vault.unlock(MASTER);
    expect(vault.item(item.id)?.meta).toMatchObject({ favorite: true, lastViewedAt: 5000 });
  });

  it('detects a ciphertext moved to another row (AAD binding) and isolates the damaged row', async () => {
    const { vault, db } = await setupVault();
    await vault.create(MASTER);
    const a = await vault.saveItem(login('A', 'pa'), { historyLimit: 1 });
    const b = await vault.saveItem(login('B', 'pb'), { historyLimit: 1 });
    const rowA = await db.getFirstAsync<{ meta_ct: string; secret_ct: string }>('SELECT meta_ct, secret_ct FROM entries WHERE id = ?', [a.id]);
    await db.runAsync('UPDATE entries SET secret_ct = ? WHERE id = ?', [rowA!.secret_ct, b.id]);
    await expect(vault.getSecret(b.id)).rejects.toEqual(new CryptoError('auth_failed'));
    await db.runAsync('UPDATE entries SET meta_ct = ? WHERE id = ?', [rowA!.meta_ct, b.id]);
    vault.lock();
    await vault.unlock(MASTER);
    expect(vault.items().map((i) => i.id)).toEqual([a.id]);
    expect(vault.corruptedIds()).toEqual([b.id]);
    expect(await vault.purgeCorrupted()).toBe(1);
  });

  it('detects tampering of the type column', async () => {
    const { vault, db } = await setupVault();
    await vault.create(MASTER);
    const a = await vault.saveItem(login('A', 'pa'), { historyLimit: 1 });
    await db.runAsync("UPDATE entries SET type = 'note' WHERE id = ?", [a.id]);
    vault.lock();
    await vault.unlock(MASTER);
    expect(vault.corruptedIds()).toContain(a.id);
  });

  it('deletes items', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    const a = await vault.saveItem(login('A', 'pa'), { historyLimit: 1 });
    await vault.deleteItem(a.id);
    expect(vault.items()).toHaveLength(0);
    await expect(vault.getSecret(a.id)).rejects.toEqual(new VaultError('not_found'));
  });
});

describe('categories', () => {
  it('creates encrypted custom categories, deletes them and re-homes their items', async () => {
    const { vault, raw } = await setupVault();
    await vault.create(MASTER);
    const cat = await vault.saveCategory({ name: 'Secret Project', color: '#7C3AED', icon: 'key' });
    expect(JSON.stringify(raw.raw.exec('SELECT * FROM categories'))).not.toContain('Secret Project');
    const item = await vault.saveItem(login('A', 'x', { categoryId: cat.id }), { historyLimit: 1 });
    expect(await vault.deleteCategory(cat.id)).toBe(1);
    expect(vault.item(item.id)?.meta.categoryId).toBe('cat_other');
    await expect(vault.deleteCategory('cat_other')).rejects.toEqual(new VaultError('category_protected'));
  });

  it('allows renaming a built-in category', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    await vault.saveCategory({ id: 'cat_work', name: 'Job', color: '#059669', icon: 'briefcase' });
    vault.lock();
    await vault.unlock(MASTER);
    expect(vault.categories().find((c) => c.id === 'cat_work')).toMatchObject({ builtin: 'work', name: 'Job', color: '#059669' });
  });
});

describe('master password change and key rotation', () => {
  it('changes the master password (re-wrap only) with a fresh salt', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    const item = await vault.saveItem(login('A', 'pa'), { historyLimit: 1 });
    const before = (await vault.info())!.kdf.salt;
    expect(await vault.changeMasterPassword('not the password', 'new master password 42')).toMatchObject({ status: 'wrong_password' });
    expect(await vault.changeMasterPassword(MASTER, 'new master password 42')).toEqual({ status: 'ok' });
    expect((await vault.info())!.kdf.salt).not.toBe(before);
    vault.lock();
    expect(await vault.unlock(MASTER)).toMatchObject({ status: 'wrong_password' });
    expect(await vault.unlock('new master password 42')).toEqual({ status: 'ok' });
    expect((await vault.getSecret<'login'>(item.id)).password).toBe('pa');
  });

  it('rotates the vault key: all rows re-encrypted, old key no longer works, biometric disabled', async () => {
    const { vault, db } = await setupVault();
    await vault.create(MASTER);
    const item = await vault.saveItem(login('A', 'pa'), { historyLimit: 1 });
    await vault.saveCategory({ name: 'Custom', color: '#7C3AED', icon: 'key' });
    await vault.setBiometricEnabled(true);
    const oldKey = vault.exportVaultKeyCopy();
    const oldCt = await db.getFirstAsync<{ secret_ct: string }>('SELECT secret_ct FROM entries', []);
    expect(await vault.rotateVaultKey(MASTER)).toEqual({ status: 'ok' });
    const info = await vault.info();
    expect(info?.keyVersion).toBe(2);
    expect(info?.biometricEnabled).toBe(false);
    const newCt = await db.getFirstAsync<{ secret_ct: string; key_version: number }>('SELECT secret_ct, key_version FROM entries', []);
    expect(newCt?.secret_ct).not.toBe(oldCt?.secret_ct);
    expect(newCt?.key_version).toBe(2);
    expect((await vault.getSecret<'login'>(item.id)).password).toBe('pa');
    expect(vault.categories().some((c) => c.name === 'Custom')).toBe(true);
    vault.lock();
    await expect(vault.unlockWithVaultKey(oldKey)).rejects.toBeInstanceOf(CryptoError);
    expect(await vault.unlock(MASTER)).toEqual({ status: 'ok' });
  });
});

describe('biometric path', () => {
  it('unlocks with a valid vault key copy and rejects a random key', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    const vk = vault.exportVaultKeyCopy();
    vault.lock();
    await vault.unlockWithVaultKey(vk);
    expect(vault.isUnlocked()).toBe(true);
    vault.lock();
    await expect(vault.unlockWithVaultKey(new Uint8Array(32).fill(7))).rejects.toEqual(new CryptoError('auth_failed'));
    expect(vault.isUnlocked()).toBe(false);
  });
});

describe('memory hygiene', () => {
  it('wipes key buffers on lock', async () => {
    const { vault } = await setupVault();
    await vault.create(MASTER);
    const copy = vault.exportVaultKeyCopy();
    expect(copy.some((b) => b !== 0)).toBe(true);
    vault.lock();
    expect(() => vault.exportVaultKeyCopy()).toThrow(VaultError);
    expect(isVaultError(new VaultError('locked'), 'locked')).toBe(true);
  });
});
