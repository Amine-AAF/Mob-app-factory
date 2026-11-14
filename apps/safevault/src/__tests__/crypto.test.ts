import { argon2id } from '@noble/hashes/argon2.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { aad, open, openJson, seal, sealJson, NONCE_LENGTH } from '@/crypto/aead';
import { constantTimeEqual, fromBase64, toBase64, toHex, utf8Decode, utf8Encode } from '@/crypto/bytes';
import { CryptoError } from '@/crypto/errors';
import {
  computeKatHex,
  derivePasswordKey,
  forceEngine,
  jsEngine,
  KAT_EXPECTED_HEX,
  KDF_LIMITS,
  newKdfParams,
  selectEngine,
  validateKdfParams,
  type Argon2Engine,
} from '@/crypto/kdf';
import { auditFingerprint, deriveVaultKeys, generateVaultKey, unwrapVaultKey, wrapVaultKey } from '@/crypto/keys';
import { randomBytes, randomInt, setRandomSource } from '@/crypto/random';

const key = () => randomBytes(32);
const sha256Hex = (x: string) => toHex(sha256(utf8Encode(x)));

describe('bytes', () => {
  it('round-trips UTF-8 including emoji and accents', () => {
    const s = 'Mot de passe: été ☃ 🔐 ñ';
    expect(utf8Decode(utf8Encode(s))).toBe(s);
    expect(toHex(utf8Encode('é'))).toBe('c3a9');
  });

  it('rejects malformed UTF-8', () => {
    expect(() => utf8Decode(Uint8Array.of(0xc3))).toThrow(CryptoError);
    expect(() => utf8Decode(Uint8Array.of(0xc0, 0x80))).toThrow(CryptoError); // overlong
  });

  it('round-trips base64 for all lengths and matches Node', () => {
    for (let n = 0; n < 40; n++) {
      const b = randomBytes(n);
      const enc = toBase64(b);
      expect(enc).toBe(Buffer.from(b).toString('base64'));
      expect(Array.from(fromBase64(enc))).toEqual(Array.from(b));
    }
  });

  it('rejects invalid base64', () => {
    expect(() => fromBase64('abc')).toThrow(CryptoError);
    expect(() => fromBase64('ab!d')).toThrow(CryptoError);
    expect(() => fromBase64('a=bc')).toThrow(CryptoError);
  });

  it('compares in constant time semantics', () => {
    expect(constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2))).toBe(true);
    expect(constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 3))).toBe(false);
    expect(constantTimeEqual(Uint8Array.of(1), Uint8Array.of(1, 2))).toBe(false);
  });
});

describe('random', () => {
  afterEach(() => setRandomSource(null));

  it('returns the requested number of bytes, including > 1024', () => {
    expect(randomBytes(5000)).toHaveLength(5000);
  });

  it('fails closed when the RNG is unavailable', () => {
    setRandomSource({
      bytes: () => {
        throw new Error('boom');
      },
    });
    expect(() => randomBytes(16)).toThrow(new CryptoError('rng_unavailable'));
    setRandomSource({ bytes: () => new Uint8Array(1) });
    expect(() => randomBytes(16)).toThrow(new CryptoError('rng_unavailable'));
  });

  it('randomInt is unbiased-looking and in range', () => {
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 6000; i++) counts[randomInt(6)]++;
    counts.forEach((c) => expect(c).toBeGreaterThan(800));
    expect(() => randomInt(0)).toThrow();
  });
});

describe('AEAD envelope (XChaCha20-Poly1305)', () => {
  const ctx = aad('entry', 'v1', 'id1', 'login', 'secret', 'k1', 'c1');

  it('encrypts and decrypts', () => {
    const k = key();
    const env = seal(k, utf8Encode('hunter2'), ctx);
    expect(env[0]).toBe(1);
    expect(env[1]).toBe(1);
    expect(utf8Decode(open(k, env, ctx))).toBe('hunter2');
  });

  it('does not contain the plaintext', () => {
    const k = key();
    const env = sealJson(k, { password: 'VerySecretValue123' }, ctx);
    expect(env).not.toContain('VerySecretValue123');
    expect(Buffer.from(fromBase64(env)).toString('latin1')).not.toContain('VerySecretValue123');
  });

  it('uses a fresh random nonce for every encryption', () => {
    const k = key();
    const nonces = new Set<string>();
    for (let i = 0; i < 500; i++) nonces.add(toHex(seal(k, utf8Encode('same'), ctx).subarray(2, 2 + NONCE_LENGTH)));
    expect(nonces.size).toBe(500);
  });

  it('detects tampering of any byte', () => {
    const k = key();
    const env = seal(k, utf8Encode('data'), ctx);
    for (let i = 2; i < env.length; i++) {
      const t = Uint8Array.from(env);
      t[i] = t[i]! ^ 0x01;
      expect(() => open(k, t, ctx)).toThrow(new CryptoError('auth_failed'));
    }
  });

  it('fails with the wrong key or the wrong context (AAD)', () => {
    const k = key();
    const env = seal(k, utf8Encode('data'), ctx);
    expect(() => open(key(), env, ctx)).toThrow(new CryptoError('auth_failed'));
    expect(() => open(k, env, aad('entry', 'v1', 'id2', 'login', 'secret', 'k1', 'c1'))).toThrow(new CryptoError('auth_failed'));
  });

  it('rejects unknown versions, truncated envelopes and bad keys', () => {
    const k = key();
    const env = seal(k, utf8Encode('data'), ctx);
    const v2 = Uint8Array.from(env);
    v2[0] = 2;
    expect(() => open(k, v2, ctx)).toThrow(new CryptoError('unsupported_version'));
    expect(() => open(k, env.subarray(0, 20), ctx)).toThrow(new CryptoError('malformed'));
    expect(() => seal(new Uint8Array(16), utf8Encode('x'), ctx)).toThrow(new CryptoError('invalid_key'));
  });

  it('rejects separators inside AAD parts (no context confusion)', () => {
    expect(() => aad('a|b')).toThrow(CryptoError);
  });

  it('openJson reports malformed JSON as malformed', () => {
    const k = key();
    const env = toBase64(seal(k, utf8Encode('{not json'), ctx));
    expect(() => openJson(k, env, ctx)).toThrow(new CryptoError('malformed'));
  });
});

describe('Argon2id KDF', () => {
  afterEach(() => forceEngine(null));

  it('matches the RFC 9106 Argon2id test vector (reference implementation used by the JS engine)', () => {
    const tag = argon2id(new Uint8Array(32).fill(1), new Uint8Array(16).fill(2), {
      t: 3,
      m: 32,
      p: 4,
      dkLen: 32,
      key: new Uint8Array(8).fill(3),
      personalization: new Uint8Array(12).fill(4),
    });
    expect(toHex(tag)).toBe('0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659');
  });

  it('the embedded KAT value matches the JS engine', async () => {
    expect(await computeKatHex(jsEngine)).toBe(KAT_EXPECTED_HEX);
  });

  it('accepts a native engine only if it passes the KAT', async () => {
    const good: Argon2Engine = { name: 'native', derive: jsEngine.derive };
    expect((await selectEngine(KAT_EXPECTED_HEX, good)).name).toBe('native');
    const bad: Argon2Engine = { name: 'native', derive: async (_p, _s, _m, _t, _pp, len) => new Uint8Array(len) };
    expect((await selectEngine(KAT_EXPECTED_HEX, bad)).name).toBe('js');
    const crashing: Argon2Engine = {
      name: 'native',
      derive: async () => {
        throw new Error('oom');
      },
    };
    expect((await selectEngine(KAT_EXPECTED_HEX, crashing)).name).toBe('js');
    expect((await selectEngine(KAT_EXPECTED_HEX, null)).name).toBe('js');
  });

  it('new parameters use a unique random 16-byte salt and safe defaults', () => {
    const a = newKdfParams();
    const b = newKdfParams();
    expect(a.salt).not.toBe(b.salt);
    expect(fromBase64(a.salt)).toHaveLength(16);
    expect(a).toMatchObject({ algorithm: 'argon2id', version: 19, memoryKiB: 65536, iterations: 3, parallelism: 1, keyLength: 32 });
  });

  it('refuses parameters below the floor or above the ceiling (downgrade / DoS protection)', () => {
    const p = newKdfParams();
    expect(() => validateKdfParams({ ...p, memoryKiB: KDF_LIMITS.minMemoryKiB - 1 })).toThrow(new CryptoError('kdf_params_invalid'));
    expect(() => validateKdfParams({ ...p, iterations: 1 })).toThrow(CryptoError);
    expect(() => validateKdfParams({ ...p, memoryKiB: KDF_LIMITS.maxMemoryKiB + 1 })).toThrow(CryptoError);
    expect(() => validateKdfParams({ ...p, algorithm: 'pbkdf2' })).toThrow(CryptoError);
    expect(() => validateKdfParams({ ...p, salt: toBase64(new Uint8Array(8)) })).toThrow(CryptoError);
    expect(() => validateKdfParams({ ...p, salt: '***' })).toThrow(CryptoError);
    expect(validateKdfParams(p)).toEqual(p);
  });

  it('real Argon2id output depends on password and salt and is deterministic', async () => {
    // Small memory so the test stays fast; the algorithm is identical at production cost.
    const enc = (x: string) => new TextEncoder().encode(x);
    const d = (pw: string, salt: string) => jsEngine.derive(enc(pw), enc(salt), 256, 2, 1, 32).then(toHex);
    const k1 = await d('password one', 'salt-salt-salt-1');
    expect(await d('password one', 'salt-salt-salt-1')).toBe(k1);
    expect(await d('password two', 'salt-salt-salt-1')).not.toBe(k1);
    expect(await d('password one', 'salt-salt-salt-2')).not.toBe(k1);
    expect(k1).not.toBe(sha256Hex('password one'));
  }, 120_000);

  it('derivePasswordKey validates params and passes them unchanged to the engine', async () => {
    const calls: unknown[][] = [];
    forceEngine({ name: 'js', derive: async (...args) => (calls.push([Uint8Array.from(args[0]), ...args]), new Uint8Array(32).fill(9)) });
    const params = newKdfParams();
    const key = await derivePasswordKey('pässwörd', params);
    expect(key).toHaveLength(32);
    const [pw, original, salt, m, t, p, len] = calls[0] as [Uint8Array, Uint8Array, Uint8Array, number, number, number, number];
    expect(toHex(pw)).toBe(toHex(utf8Encode('pässwörd')));
    expect(original.every((b) => b === 0)).toBe(true); // password bytes wiped after derivation
    expect(toBase64(salt)).toBe(params.salt);
    expect([m, t, p, len]).toEqual([65536, 3, 1, 32]);
    await expect(derivePasswordKey('x', { ...params, memoryKiB: 1024 })).rejects.toEqual(new CryptoError('kdf_params_invalid'));
    forceEngine({ name: 'js', derive: async () => new Uint8Array(16) });
    await expect(derivePasswordKey('x', params)).rejects.toEqual(new CryptoError('kdf_failed'));
  });
});

describe('key hierarchy', () => {
  it('wraps and unwraps the vault key; wrong KEK -> wrong_password', () => {
    const kek = key();
    const vk = generateVaultKey();
    const wrapped = wrapVaultKey(kek, vk, 'vault1', 1);
    expect(toHex(unwrapVaultKey(kek, wrapped, 'vault1', 1))).toBe(toHex(vk));
    expect(() => unwrapVaultKey(key(), wrapped, 'vault1', 1)).toThrow(new CryptoError('wrong_password'));
    expect(() => unwrapVaultKey(kek, wrapped, 'vault2', 1)).toThrow(new CryptoError('wrong_password'));
    expect(() => unwrapVaultKey(kek, wrapped, 'vault1', 2)).toThrow(new CryptoError('wrong_password'));
    expect(() => unwrapVaultKey(kek, wrapped, 'vault1', 1, 'backup')).toThrow(new CryptoError('wrong_password'));
  });

  it('derives distinct subkeys per purpose, vault and key version', () => {
    const vk = generateVaultKey();
    const a = deriveVaultKeys(vk, 'v1', 1);
    const b = deriveVaultKeys(vk, 'v2', 1);
    const hexes = [a.entries, a.categories, a.audit, b.entries].map(toHex);
    expect(new Set(hexes).size).toBe(4);
    expect(hexes).not.toContain(toHex(vk));
  });

  it('audit fingerprints are keyed (no plain hash) and stable', () => {
    const k1 = key();
    expect(auditFingerprint(k1, 'abc')).toBe(auditFingerprint(k1, 'abc'));
    expect(auditFingerprint(k1, 'abc')).not.toBe(auditFingerprint(key(), 'abc'));
  });
});
