import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { createTestDatabase } from '@factory/testing';
import type { SqlDatabase } from '@factory/storage';

import { forceEngine, type Argon2Engine } from '@/crypto/kdf';
import { initDatabase } from '@/database';
import { createVaultService } from '@/vault/vaultService';

/**
 * TEST-ONLY KDF engine: deterministic and fast (HKDF of password+salt+params) so service
 * tests do not spend seconds in Argon2 at 64 MiB. Real Argon2id is covered by
 * crypto.kdf.test.ts. Never used outside Jest.
 */
export const fastTestEngine: Argon2Engine = {
  name: 'js',
  async derive(password, salt, m, t, p, length) {
    return hkdf(sha256, password, salt, new TextEncoder().encode(`test-kdf|${m}|${t}|${p}`), length);
  },
};

export async function setupVault(now: () => number = Date.now) {
  forceEngine(fastTestEngine);
  const raw = await createTestDatabase();
  const db = raw as unknown as SqlDatabase;
  await initDatabase(db);
  const vault = createVaultService({ db, now });
  return { db, raw, vault };
}

export const MASTER = 'correct horse battery staple';
