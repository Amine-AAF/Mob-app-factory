import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';

import { concatBytes, fromBase64, toBase64, utf8Decode, utf8Encode } from './bytes';
import { CryptoError } from './errors';
import { randomBytes } from './random';

/**
 * Authenticated encryption envelope (format v1).
 *
 *   byte 0       envelope version (0x01)
 *   byte 1       algorithm id     (0x01 = XChaCha20-Poly1305, IETF construction)
 *   bytes 2..25  192-bit random nonce
 *   bytes 26..   ciphertext || 128-bit Poly1305 tag
 *
 * Why XChaCha20-Poly1305 (an AEAD equivalent to AES-256-GCM in strength):
 *  - 256-bit key, 128-bit authentication tag, standard construction (libsodium, RFC 8439 + XChaCha draft).
 *  - 192-bit nonces make random nonces safe: collision probability is negligible even
 *    after billions of messages, whereas a 96-bit GCM nonce reused once breaks GCM.
 *  - ARX design: constant-time in pure JavaScript (table-based AES in JS is not).
 *  - Implementation: @noble/ciphers (audited, maintained, no native code needed).
 *
 * Every call to `seal` uses a fresh nonce from the CSPRNG. The AAD (associated data)
 * binds a ciphertext to its context (vault id, row id, field, key version): moving a
 * ciphertext to another row or field makes decryption fail.
 */
export const ENVELOPE_VERSION = 1;
export const ALG_XCHACHA20_POLY1305 = 1;
export const KEY_LENGTH = 32;
export const NONCE_LENGTH = 24;
export const TAG_LENGTH = 16;
const HEADER_LENGTH = 2 + NONCE_LENGTH;

function checkKey(key: Uint8Array): void {
  if (!(key instanceof Uint8Array) || key.length !== KEY_LENGTH) throw new CryptoError('invalid_key');
}

export function seal(key: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): Uint8Array {
  checkKey(key);
  const nonce = randomBytes(NONCE_LENGTH);
  const ct = xchacha20poly1305(key, nonce, aad).encrypt(plaintext);
  return concatBytes(Uint8Array.of(ENVELOPE_VERSION, ALG_XCHACHA20_POLY1305), nonce, ct);
}

export function open(key: Uint8Array, envelope: Uint8Array, aad: Uint8Array): Uint8Array {
  checkKey(key);
  if (!(envelope instanceof Uint8Array) || envelope.length < 2) throw new CryptoError('malformed');
  if (envelope[0] !== ENVELOPE_VERSION || envelope[1] !== ALG_XCHACHA20_POLY1305) throw new CryptoError('unsupported_version');
  if (envelope.length < HEADER_LENGTH + TAG_LENGTH) throw new CryptoError('malformed');
  const nonce = envelope.subarray(2, HEADER_LENGTH);
  const ct = envelope.subarray(HEADER_LENGTH);
  try {
    return xchacha20poly1305(key, nonce, aad).decrypt(ct);
  } catch {
    // Never leak why: wrong key, tampered bytes and wrong AAD are indistinguishable by design.
    throw new CryptoError('auth_failed');
  }
}

/** Builds a canonical AAD from context parts ("safevault|v1|entry|<id>|meta|k1"). */
export function aad(...parts: (string | number)[]): Uint8Array {
  for (const p of parts) if (String(p).includes('|')) throw new CryptoError('malformed');
  return utf8Encode(['safevault', ...parts].join('|'));
}

/** Encrypts a JSON-serialisable value and returns a base64 envelope. */
export function sealJson(key: Uint8Array, value: unknown, context: Uint8Array): string {
  const plain = utf8Encode(JSON.stringify(value));
  try {
    return toBase64(seal(key, plain, context));
  } finally {
    plain.fill(0);
  }
}

export function openJson<T>(key: Uint8Array, envelopeB64: string, context: Uint8Array): T {
  const plain = open(key, fromBase64(envelopeB64), context);
  try {
    return JSON.parse(utf8Decode(plain)) as T;
  } catch (e) {
    if (e instanceof CryptoError) throw e;
    throw new CryptoError('malformed');
  } finally {
    plain.fill(0);
  }
}
