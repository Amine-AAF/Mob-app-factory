/**
 * Cryptographic and vault errors carry a stable machine code only.
 * Messages never contain key material, passwords, plaintext or ciphertext,
 * so they are safe to display or to pass to `console.warn` in development.
 */
export type CryptoErrorCode =
  | 'auth_failed' // AEAD tag mismatch: wrong key, tampered data or wrong context (AAD)
  | 'wrong_password' // the vault key could not be unwrapped with the derived key
  | 'malformed' // envelope/encoding structurally invalid
  | 'unsupported_version' // envelope, backup or vault format produced by a newer/unknown version
  | 'kdf_params_invalid' // KDF parameters outside the accepted bounds
  | 'kdf_failed' // the KDF implementation failed (e.g. out of memory)
  | 'invalid_key' // key of the wrong length
  | 'rng_unavailable'; // no cryptographically secure random source

export class CryptoError extends Error {
  readonly code: CryptoErrorCode;
  constructor(code: CryptoErrorCode) {
    super(`crypto:${code}`);
    this.name = 'CryptoError';
    this.code = code;
  }
}

export function isCryptoError(e: unknown, code?: CryptoErrorCode): e is CryptoError {
  return e instanceof CryptoError && (code === undefined || e.code === code);
}
