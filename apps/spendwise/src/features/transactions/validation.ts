import type { Account, TransactionInput } from '@/types';
import { isValidDayKey, TIME_KEY } from '@/utils/dates';
import { MAX_MINOR } from '@/utils/money';

export type TxError =
  | 'amount'
  | 'account'
  | 'to_account'
  | 'same_account'
  | 'to_amount'
  | 'category'
  | 'date'
  | 'time'
  | 'archived_account';

/** Business validation of a transaction before it is written. Returns the first error or null. */
export function validateTransaction(input: TransactionInput, accounts: ReadonlyMap<string, Pick<Account, 'id' | 'currency' | 'archived'>>): TxError | null {
  if (!Number.isSafeInteger(input.amount) || Math.abs(input.amount) > MAX_MINOR) return 'amount';
  if (input.type === 'adjustment' ? input.amount === 0 : input.amount <= 0) return 'amount';
  const from = accounts.get(input.accountId);
  if (!from) return 'account';
  if (!isValidDayKey(input.date)) return 'date';
  if (input.time && !TIME_KEY.test(input.time)) return 'time';
  if (input.type === 'transfer') {
    if (!input.toAccountId) return 'to_account';
    if (input.toAccountId === input.accountId) return 'same_account';
    const to = accounts.get(input.toAccountId);
    if (!to) return 'to_account';
    if (to.currency !== from.currency && (!input.toAmount || input.toAmount <= 0)) return 'to_amount';
    if (input.toAmount !== null && (!Number.isSafeInteger(input.toAmount) || input.toAmount <= 0 || input.toAmount > MAX_MINOR)) return 'to_amount';
  } else if (input.toAccountId) return 'to_account';
  if ((input.type === 'expense' || input.type === 'income' || input.type === 'refund') && !input.categoryId) return 'category';
  return null;
}

export class ValidationError extends Error {
  constructor(public readonly code: string) {
    super(`Validation error: ${code}`);
    this.name = 'ValidationError';
  }
}
