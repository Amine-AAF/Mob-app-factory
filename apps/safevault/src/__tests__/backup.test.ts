import { forceEngine } from '@/crypto/kdf';
import { BackupError, createBackup, decryptBackup, parseBackup } from '@/features/backup/format';
import { emptyMeta, emptySecret } from '@/vault/schema';
import type { LoginSecret } from '@/vault/types';

import { MASTER, setupVault } from '@/test-utils/vault';

afterEach(() => forceEngine(null));

async function vaultWithData() {
  const ctx = await setupVault(() => 10_000);
  await ctx.vault.create(MASTER);
  const cat = await ctx.vault.saveCategory({ name: 'Servers', color: '#475569', icon: 'server' });
  await ctx.vault.saveItem(
    { type: 'login', meta: { ...emptyMeta('login'), title: 'Prod DB', username: 'root', categoryId: cat.id }, secret: { ...emptySecret('login', 0), password: 'pr0d-Secret!' } as LoginSecret },
    { historyLimit: 1 },
  );
  await ctx.vault.saveItem({ type: 'note', meta: { ...emptyMeta('note'), title: 'Codes' }, secret: { body: 'recovery-1234' } }, { historyLimit: 1 });
  return ctx;
}

const opts = { now: 10_000, appVersion: '0.1.0' };

describe('encrypted backup', () => {
  it('exports without any plaintext and restores into a fresh install', async () => {
    const { vault } = await vaultWithData();
    const { text, itemCount } = await createBackup(await vault.snapshot(), 'backup pass phrase', opts);
    expect(itemCount).toBe(2);
    for (const needle of ['Prod DB', 'root', 'pr0d-Secret!', 'recovery-1234', 'Servers', 'Codes']) expect(text).not.toContain(needle);

    // "Reinstall": new empty database, new vault with another master password.
    const fresh = await setupVault(() => 20_000);
    const decrypted = await decryptBackup(text, 'backup pass phrase');
    await fresh.vault.create('a brand new master pw');
    const r = await fresh.vault.importSnapshot(decrypted.snapshot, 'replace');
    expect(r).toEqual({ added: 2, updated: 0, skipped: 0 });
    const prod = fresh.vault.items().find((i) => i.meta.title === 'Prod DB')!;
    expect((await fresh.vault.getSecret<'login'>(prod.id)).password).toBe('pr0d-Secret!');
    expect(fresh.vault.categories().find((c) => c.id === prod.meta.categoryId)?.name).toBe('Servers');
  });

  it('rejects a wrong password', async () => {
    const { vault } = await vaultWithData();
    const { text } = await createBackup(await vault.snapshot(), 'backup pass phrase', opts);
    await expect(decryptBackup(text, 'nope nope nope')).rejects.toEqual(new BackupError('wrong_password'));
  });

  it('detects tampering of the header (KDF params, date) and of the payload', async () => {
    const { vault } = await vaultWithData();
    const { text } = await createBackup(await vault.snapshot(), 'backup pass phrase', opts);
    const f = JSON.parse(text);
    await expect(decryptBackup(JSON.stringify({ ...f, createdAt: f.createdAt + 1 }), 'backup pass phrase')).rejects.toEqual(new BackupError('tampered'));
    const p = f.payload as string;
    const flipped = p.slice(0, 40) + (p[40] === 'A' ? 'B' : 'A') + p.slice(41);
    await expect(decryptBackup(JSON.stringify({ ...f, payload: flipped }), 'backup pass phrase')).rejects.toEqual(new BackupError('tampered'));
    // Changing the KDF parameters derives another key -> cannot unwrap.
    await expect(decryptBackup(JSON.stringify({ ...f, kdf: { ...f.kdf, iterations: f.kdf.iterations + 1 } }), 'backup pass phrase')).rejects.toEqual(new BackupError('wrong_password'));
  });

  it('refuses corrupted, foreign, truncated, oversized and future-version files', () => {
    expect(() => parseBackup('hello')).toThrow(new BackupError('not_a_backup'));
    expect(() => parseBackup('{"format":"other"}')).toThrow(new BackupError('not_a_backup'));
    expect(() => parseBackup('{"format":"safevault-backup","version":1')).toThrow(new BackupError('corrupted'));
    expect(() => parseBackup(JSON.stringify({ format: 'safevault-backup', version: 99 }))).toThrow(new BackupError('unsupported_version'));
    expect(() => parseBackup(JSON.stringify({ format: 'safevault-backup', version: 1, backupId: 'x' }))).toThrow(new BackupError('corrupted'));
  });

  it('refuses KDF parameters that would downgrade security or exhaust memory', async () => {
    const { vault } = await vaultWithData();
    const { text } = await createBackup(await vault.snapshot(), 'backup pass phrase', opts);
    const f = JSON.parse(text);
    expect(() => parseBackup(JSON.stringify({ ...f, kdf: { ...f.kdf, memoryKiB: 8 } }))).toThrow(new BackupError('corrupted'));
    expect(() => parseBackup(JSON.stringify({ ...f, kdf: { ...f.kdf, memoryKiB: 4 * 1024 * 1024 } }))).toThrow(new BackupError('corrupted'));
  });

  it('import is all-or-nothing: an invalid item leaves the vault untouched', async () => {
    const { vault } = await vaultWithData();
    const snap = await vault.snapshot();
    const before = vault.items().length;
    const broken = { ...snap, items: [...snap.items, { ...snap.items[0]!, id: 'not-a-valid-id' }] };
    await expect(vault.importSnapshot(broken, 'replace')).rejects.toBeTruthy();
    expect(vault.items()).toHaveLength(before);
  });

  it('merge keeps the most recent copy and reports counts', async () => {
    const { vault } = await vaultWithData();
    const snap = await vault.snapshot();
    expect(await vault.importSnapshot(snap, 'merge')).toEqual({ added: 0, updated: 0, skipped: 2 });
    const newer = { ...snap, items: snap.items.map((i) => ({ ...i, updatedAt: i.updatedAt + 1, meta: { ...i.meta, title: `${i.meta.title} (new)` } })) };
    expect(await vault.importSnapshot(newer, 'merge')).toEqual({ added: 0, updated: 2, skipped: 0 });
    expect(vault.items().every((i) => i.meta.title.endsWith('(new)'))).toBe(true);
  });
});
