/** Vault-level errors (business rules). Codes only, never data. */
export type VaultErrorCode =
  | 'locked'
  | 'no_vault'
  | 'vault_exists'
  | 'not_found'
  | 'title_required'
  | 'password_too_short'
  | 'locked_out'
  | 'category_protected'
  | 'corrupted';

export class VaultError extends Error {
  readonly code: VaultErrorCode;
  constructor(code: VaultErrorCode) {
    super(`vault:${code}`);
    this.name = 'VaultError';
    this.code = code;
  }
}

export function isVaultError(e: unknown, code?: VaultErrorCode): e is VaultError {
  return e instanceof VaultError && (code === undefined || e.code === code);
}

/** Minimum master password length enforced by the service (the UI also shows a strength meter). */
export const MIN_MASTER_PASSWORD_LENGTH = 10;
