import { useMemo, useState } from 'react';

import { estimateStrength } from '@/features/generator/strength';
import { MIN_MASTER_PASSWORD_LENGTH } from '@/vault/errors';

/** Shared state for "choose a master password" forms (create, restore, change). */
export function useMasterPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const strength = useMemo(() => estimateStrength(password), [password]);
  const tooShort = password.length > 0 && password.length < MIN_MASTER_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  // A master password must be at least "fair" (score 2) — it protects everything else.
  const valid = password.length >= MIN_MASTER_PASSWORD_LENGTH && strength.score >= 2 && confirm === password;
  const reset = () => {
    setPassword('');
    setConfirm('');
  };
  return { password, setPassword, confirm, setConfirm, strength, tooShort, mismatch, valid, reset };
}
