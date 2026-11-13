import { argon2idAsync } from '@noble/hashes/argon2.js';
import { SafeVaultNative } from 'safevault-native';

import { constantTimeEqual, fromBase64, toBase64, toHex, utf8Encode, wipe } from './bytes';
import { CryptoError } from './errors';
import { randomBytes } from './random';

/**
 * Master-password key derivation: Argon2id (RFC 9106, version 0x13).
 *
 * Parameters are stored with the vault (and in every backup) so they can be raised
 * later without breaking old vaults. They are bounded on BOTH sides:
 *  - a floor (OWASP 2024 minimum: m = 19 MiB, t = 2, p = 1) so a tampered metadata row
 *    or backup can never downgrade the derivation to something cheap;
 *  - a ceiling so a malicious backup cannot freeze or crash the device (DoS).
 *
 * Implementations, producing bit-identical output:
 *  1. Native BouncyCastle (modules/safevault-native) — fast, used in release builds,
 *     trusted only after passing a known-answer test (KAT) against (2).
 *  2. @noble/hashes argon2id — audited pure JS, used in tests and as a fallback.
 *
 * The password is encoded as UTF-8 without Unicode normalisation (normalisation APIs are
 * not guaranteed to be identical across JS engines; changing the password bytes would lock
 * users out). This is documented in docs/SECURITY.md.
 */
export interface KdfParams {
  algorithm: 'argon2id';
  version: 19; // 0x13
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  /** base64, 16 random bytes, unique per vault (and per backup). */
  salt: string;
  keyLength: 32;
}

export type KdfProfileId = 'compatible' | 'standard' | 'high';

export const KDF_PROFILES: Record<KdfProfileId, Pick<KdfParams, 'memoryKiB' | 'iterations' | 'parallelism'>> = {
  /** Low-RAM devices. Still above the OWASP floor. */
  compatible: { memoryKiB: 32 * 1024, iterations: 4, parallelism: 1 },
  /** Default: 64 MiB, 3 passes (RFC 9106 "second recommended option" memory, single lane). */
  standard: { memoryKiB: 64 * 1024, iterations: 3, parallelism: 1 },
  /** Recent high-end devices. */
  high: { memoryKiB: 128 * 1024, iterations: 3, parallelism: 1 },
};

export const KDF_LIMITS = {
  minMemoryKiB: 19 * 1024,
  maxMemoryKiB: 256 * 1024,
  minIterations: 2,
  maxIterations: 10,
  minParallelism: 1,
  maxParallelism: 4,
  saltLength: 16,
} as const;

export const SALT_LENGTH = KDF_LIMITS.saltLength;

export function newKdfParams(profile: KdfProfileId = 'standard'): KdfParams {
  return { algorithm: 'argon2id', version: 19, ...KDF_PROFILES[profile], salt: toBase64(randomBytes(SALT_LENGTH)), keyLength: 32 };
}

/** Throws `kdf_params_invalid` unless the parameters are within the accepted bounds. */
export function validateKdfParams(p: unknown): KdfParams {
  const v = p as Partial<KdfParams> | null;
  const int = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
  if (
    !v ||
    v.algorithm !== 'argon2id' ||
    v.version !== 19 ||
    v.keyLength !== 32 ||
    !int(v.memoryKiB, KDF_LIMITS.minMemoryKiB, KDF_LIMITS.maxMemoryKiB) ||
    !int(v.iterations, KDF_LIMITS.minIterations, KDF_LIMITS.maxIterations) ||
    !int(v.parallelism, KDF_LIMITS.minParallelism, KDF_LIMITS.maxParallelism) ||
    typeof v.salt !== 'string'
  ) {
    throw new CryptoError('kdf_params_invalid');
  }
  let salt: Uint8Array;
  try {
    salt = fromBase64(v.salt);
  } catch {
    throw new CryptoError('kdf_params_invalid');
  }
  if (salt.length !== SALT_LENGTH) throw new CryptoError('kdf_params_invalid');
  return v as KdfParams;
}

/** True when `current` is weaker than the given profile (offer an upgrade at next password change). */
export function isWeakerThan(current: KdfParams, profile: KdfProfileId): boolean {
  const target = KDF_PROFILES[profile];
  return current.memoryKiB * current.iterations < target.memoryKiB * target.iterations;
}

/* ------------------------------------------------------------------ engines */

export interface Argon2Engine {
  readonly name: 'native' | 'js';
  derive(password: Uint8Array, salt: Uint8Array, memoryKiB: number, iterations: number, parallelism: number, length: number): Promise<Uint8Array>;
}

export const jsEngine: Argon2Engine = {
  name: 'js',
  async derive(password, salt, memoryKiB, iterations, parallelism, length) {
    // asyncTick yields to the event loop so the UI keeps rendering the progress state.
    return argon2idAsync(password, salt, { t: iterations, m: memoryKiB, p: parallelism, dkLen: length, asyncTick: 10 });
  },
};

const nativeEngine: Argon2Engine | null = SafeVaultNative
  ? {
      name: 'native',
      async derive(password, salt, memoryKiB, iterations, parallelism, length) {
        const out = await SafeVaultNative!.argon2id(toBase64(password), toBase64(salt), memoryKiB, iterations, parallelism, length);
        return fromBase64(out);
      },
    }
  : null;

/**
 * Known-answer test. The expected value is the Argon2id output of the reference
 * implementation (checked in src/__tests__/crypto.kdf.test.ts against @noble/hashes and
 * the RFC 9106 vector), with small parameters so the check costs a few milliseconds.
 */
export const KAT = {
  password: 'SafeVault-KAT-password',
  salt: 'SafeVault-KAT-salt!!', // 20 bytes
  memoryKiB: 64,
  iterations: 2,
  parallelism: 1,
  length: 32,
};

/** Expected KAT output (hex). Recomputed and asserted in the crypto tests. */
export const KAT_EXPECTED_HEX = '10e1f43c26fa3491cbb7a9d347a47d0410bb5d44ece85f9a74741029c415b8e6';

let selected: Argon2Engine | null = null;
let selectionReason: 'native' | 'js_no_native' | 'js_native_kat_failed' | 'js_forced' = 'js_no_native';

export async function selectEngine(expectedKatHex: string = KAT_EXPECTED_HEX, candidate: Argon2Engine | null = nativeEngine): Promise<Argon2Engine> {
  if (!candidate) {
    selected = jsEngine;
    selectionReason = 'js_no_native';
    return selected;
  }
  try {
    const out = await candidate.derive(utf8Encode(KAT.password), utf8Encode(KAT.salt), KAT.memoryKiB, KAT.iterations, KAT.parallelism, KAT.length);
    const ok = constantTimeEqual(out, hexToBytes(expectedKatHex));
    wipe(out);
    selected = ok ? candidate : jsEngine;
    selectionReason = ok ? 'native' : 'js_native_kat_failed';
  } catch {
    selected = jsEngine;
    selectionReason = 'js_native_kat_failed';
  }
  return selected;
}

export function forceEngine(engine: Argon2Engine | null): void {
  selected = engine;
  selectionReason = engine?.name === 'native' ? 'native' : 'js_forced';
}

export function engineStatus(): { engine: 'native' | 'js'; reason: typeof selectionReason } {
  return { engine: selected?.name ?? 'js', reason: selectionReason };
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Derives the 256-bit password key (KEK). The caller owns and must wipe the result. */
export async function derivePasswordKey(password: string, params: KdfParams): Promise<Uint8Array> {
  const p = validateKdfParams(params);
  const pwd = utf8Encode(password);
  const salt = fromBase64(p.salt);
  try {
    const engine = selected ?? jsEngine;
    const key = await engine.derive(pwd, salt, p.memoryKiB, p.iterations, p.parallelism, p.keyLength);
    if (key.length !== 32) throw new CryptoError('kdf_failed');
    return key;
  } catch (e) {
    if (e instanceof CryptoError) throw e;
    throw new CryptoError('kdf_failed');
  } finally {
    wipe(pwd);
  }
}

/** KAT output of the JS engine (used to validate the native engine). */
export async function computeKatHex(engine: Argon2Engine = jsEngine): Promise<string> {
  const out = await engine.derive(utf8Encode(KAT.password), utf8Encode(KAT.salt), KAT.memoryKiB, KAT.iterations, KAT.parallelism, KAT.length);
  return toHex(out);
}

/**
 * Rough benchmark used at vault creation to choose a profile: times a 16 MiB / 1 pass
 * derivation and extrapolates. Never selects a profile below the OWASP floor.
 */
export async function recommendProfile(now: () => number = Date.now): Promise<KdfProfileId> {
  const engine = selected ?? jsEngine;
  if (engine.name === 'js') return 'standard';
  const t0 = now();
  const out = await engine.derive(randomBytes(16), randomBytes(16), 16 * 1024, 1, 1, 32);
  wipe(out);
  const perMiBPass = (now() - t0) / 16;
  const estimate = (p: KdfProfileId) => perMiBPass * (KDF_PROFILES[p].memoryKiB / 1024) * KDF_PROFILES[p].iterations;
  if (estimate('high') < 1500) return 'high';
  if (estimate('standard') < 3000) return 'standard';
  return 'compatible';
}
