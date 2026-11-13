import type { Account, Transaction } from '@/types';

/**
 * Effect of one transaction on each account it touches (pure reference implementation;
 * the repository computes the same thing in SQL and tests compare both).
 *
 * - expense:     source -amount
 * - income:      source +amount
 * - refund:      source +amount
 * - adjustment:  source +amount (signed)
 * - transfer:    source -amount, destination +toAmount (or +amount)
 */
export function balanceEffects(tx: Pick<Transaction, 'type' | 'amount' | 'accountId' | 'toAccountId' | 'toAmount'>): { accountId: string; delta: number }[] {
  switch (tx.type) {
    case 'expense':
      return [{ accountId: tx.accountId, delta: -tx.amount }];
    case 'income':
    case 'refund':
    case 'adjustment':
      return [{ accountId: tx.accountId, delta: tx.amount }];
    case 'transfer':
      return tx.toAccountId
        ? [
            { accountId: tx.accountId, delta: -tx.amount },
            { accountId: tx.toAccountId, delta: tx.toAmount ?? tx.amount },
          ]
        : [{ accountId: tx.accountId, delta: -tx.amount }];
  }
}

/** Balance of every account = initial balance + effects of all its transactions. */
export function computeBalances(
  accounts: readonly Pick<Account, 'id' | 'initialBalance'>[],
  txs: readonly Pick<Transaction, 'type' | 'amount' | 'accountId' | 'toAccountId' | 'toAmount'>[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of accounts) out[a.id] = a.initialBalance;
  for (const tx of txs) {
    for (const e of balanceEffects(tx)) {
      if (e.accountId in out) out[e.accountId] = (out[e.accountId] ?? 0) + e.delta;
    }
  }
  return out;
}

/**
 * Total available balance per currency over non-archived accounts.
 * Currencies are never mixed; conversion (if any) is the caller's explicit choice.
 */
export function totalsByCurrency(accounts: readonly Pick<Account, 'id' | 'currency' | 'archived'>[], balances: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of accounts) {
    if (a.archived) continue;
    out[a.currency] = (out[a.currency] ?? 0) + (balances[a.id] ?? 0);
  }
  return out;
}
