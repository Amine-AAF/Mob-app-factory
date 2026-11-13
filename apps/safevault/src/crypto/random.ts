import * as ExpoCrypto from 'expo-crypto';

import { toHex } from './bytes';
import { CryptoError } from './errors';

/**
 * Cryptographically secure randomness.
 *
 * Production source: expo-crypto `getRandomBytes`, backed by java.security.SecureRandom
 * on Android (seeded by the OS CSPRNG). Never Math.random.
 * Tests inject Node's crypto.randomBytes through `setRandomSource`.
 */
export interface RandomSource {
  bytes(length: number): Uint8Array;
}

const EXPO_MAX_CHUNK = 1024; // expo-crypto accepts at most 1024 bytes per call

const expoSource: RandomSource = {
  bytes(length) {
    const out = new Uint8Array(length);
    for (let o = 0; o < length; o += EXPO_MAX_CHUNK) {
      const n = Math.min(EXPO_MAX_CHUNK, length - o);
      out.set(ExpoCrypto.getRandomBytes(n), o);
    }
    return out;
  },
};

let source: RandomSource = expoSource;

export function setRandomSource(next: RandomSource | null): void {
  source = next ?? expoSource;
}

export function randomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length < 0) throw new CryptoError('malformed');
  let out: Uint8Array;
  try {
    out = source.bytes(length);
  } catch {
    throw new CryptoError('rng_unavailable');
  }
  if (!(out instanceof Uint8Array) || out.length !== length) throw new CryptoError('rng_unavailable');
  return out;
}

function randomUint32(): number {
  const b = randomBytes(4);
  return ((b[0]! << 24) | (b[1]! << 16) | (b[2]! << 8) | b[3]!) >>> 0;
}

/**
 * Uniform integer in [0, max) using rejection sampling, so no value is more likely
 * than another (plain `x % max` is biased whenever 2^32 is not a multiple of max).
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) throw new CryptoError('malformed');
  const limit = Math.floor(0x100000000 / max) * max;
  for (;;) {
    const x = randomUint32();
    if (x < limit) return x % max;
  }
}

/** Fisher–Yates shuffle driven by the CSPRNG. Returns a new array. */
export function secureShuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** 128-bit random identifier (hex). Used for row ids: not secret, just unguessable and unique. */
export function randomId(): string {
  return toHex(randomBytes(16));
}
