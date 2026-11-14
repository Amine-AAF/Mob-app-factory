import type { Id } from '@/types/models';

/**
 * Shared-expense arithmetic, all in integer minor units so balances always sum to zero.
 * No payment is ever made: the app only computes who owes whom.
 */

/** Splits `total` into `n` near-equal integer parts; the first `total % n` parts get one extra unit. */
export function splitEqually(total: number, ids: Id[]): Map<Id, number> {
  if (!Number.isInteger(total) || total < 0) throw new RangeError('total must be a non-negative integer');
  if (!ids.length) throw new RangeError('at least one participant is required');
  const base = Math.floor(total / ids.length);
  let rest = total - base * ids.length;
  const out = new Map<Id, number>();
  for (const id of ids) {
    out.set(id, base + (rest > 0 ? 1 : 0));
    if (rest > 0) rest--;
  }
  return out;
}

/**
 * Allocates `total` proportionally to `weights` with the largest-remainder method,
 * so the parts are integers that sum exactly to `total`. Ties go to the earliest id.
 */
export function allocateProportionally(total: number, weights: Map<Id, number>): Map<Id, number> {
  const entries = [...weights.entries()].filter(([, w]) => w > 0);
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  const out = new Map<Id, number>([...weights.keys()].map((id) => [id, 0]));
  if (sum === 0 || total === 0) return out;
  const raw = entries.map(([id, w], i) => ({ id, i, exact: (total * w) / sum }));
  let allocated = 0;
  for (const r of raw) {
    const floor = Math.floor(r.exact);
    out.set(r.id, floor);
    allocated += floor;
  }
  const order = [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)) || a.i - b.i);
  for (let k = 0; k < total - allocated; k++) {
    const r = order[k % order.length]!;
    out.set(r.id, out.get(r.id)! + 1);
  }
  return out;
}

export type SplitError = 'no_participants' | 'shares_mismatch' | 'negative_share';

/** Validates custom shares: non-negative integers summing exactly to the expense amount. */
export function validateCustomShares(total: number, shares: Map<Id, number>): SplitError | null {
  if (shares.size === 0) return 'no_participants';
  let sum = 0;
  for (const v of shares.values()) {
    if (!Number.isInteger(v) || v < 0) return 'negative_share';
    sum += v;
  }
  return sum === total ? null : 'shares_mismatch';
}

export interface SharedExpense {
  /** Amount in the trip currency (minor units). */
  tripAmountMinor: number;
  /** Original amount the shares refer to. */
  amountMinor: number;
  paidBy: Id | null;
  /** Shares in the expense's own currency; empty = not shared. */
  shares: Map<Id, number>;
}

/**
 * Net balance per participant in the trip currency: positive = should receive,
 * negative = should pay back. Expenses without a payer or without shares are ignored.
 * Each expense is converted by allocating its trip amount proportionally to the shares,
 * so per-expense rounding never creates or loses a cent.
 */
export function computeBalances(participants: Id[], expenses: SharedExpense[]): Map<Id, number> {
  const balance = new Map<Id, number>(participants.map((p) => [p, 0]));
  for (const e of expenses) {
    if (!e.paidBy || e.shares.size === 0 || !balance.has(e.paidBy)) continue;
    const owed = allocateProportionally(e.tripAmountMinor, e.shares);
    const allocated = [...owed.values()].reduce((s, v) => s + v, 0);
    balance.set(e.paidBy, balance.get(e.paidBy)! + allocated);
    for (const [p, v] of owed) if (balance.has(p)) balance.set(p, balance.get(p)! - v);
  }
  return balance;
}

export interface Transfer {
  from: Id;
  to: Id;
  amountMinor: number;
}

/**
 * Suggested reimbursements: greedily matches the largest debtor with the largest
 * creditor. Produces at most n-1 transfers and settles every balance exactly.
 */
export function suggestSettlements(balances: Map<Id, number>): Transfer[] {
  const creditors = [...balances].filter(([, v]) => v > 0).map(([id, v]) => ({ id, v }));
  const debtors = [...balances].filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v }));
  const byAmount = (a: { id: Id; v: number }, b: { id: Id; v: number }) => b.v - a.v || a.id.localeCompare(b.id);
  const out: Transfer[] = [];
  while (creditors.length && debtors.length) {
    creditors.sort(byAmount);
    debtors.sort(byAmount);
    const c = creditors[0]!;
    const d = debtors[0]!;
    const amount = Math.min(c.v, d.v);
    out.push({ from: d.id, to: c.id, amountMinor: amount });
    c.v -= amount;
    d.v -= amount;
    if (c.v === 0) creditors.shift();
    if (d.v === 0) debtors.shift();
  }
  return out;
}
