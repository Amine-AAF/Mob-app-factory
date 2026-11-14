import { CSV_MAX_ROWS } from '@/constants';
import type { PaymentMethod, TransactionType } from '@/types';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@/types';
import { isValidDayKey, TIME_KEY, type DayKey } from '@/utils/dates';
import { isSupportedCurrency, minorToDecimalString, parseAmount } from '@/utils/money';

import { CsvError, detectDelimiter, parseCsv, toCsv } from './csv';

/**
 * SpendWise CSV format v1 (documented in docs/csv-format.md):
 *
 *   date,type,amount,currency,account,category,to_account,to_amount,description,notes,payment_method,time
 *
 * - date: YYYY-MM-DD · type: expense | income | transfer | refund | adjustment
 * - amount: positive decimal using "." (adjustments may be negative); currency: ISO 4217
 * - account / to_account: account names (to_account only for transfers)
 * - category: category name (expense, income, refund); unknown names fall back to "Other"
 * Only `date, type, amount, currency, account` are required.
 */
export const CSV_COLUMNS = ['date', 'type', 'amount', 'currency', 'account', 'category', 'to_account', 'to_amount', 'description', 'notes', 'payment_method', 'time'] as const;
export const REQUIRED_COLUMNS = ['date', 'type', 'amount', 'currency', 'account'] as const;

export interface ExportRow {
  date: DayKey;
  type: TransactionType;
  amount: number;
  currency: string;
  account: string;
  category: string;
  toAccount: string;
  toAmount: number | null;
  toCurrency: string | null;
  description: string;
  notes: string;
  paymentMethod: string;
  time: string;
}

export function transactionsToCsv(rows: readonly ExportRow[]): string {
  return toCsv(
    CSV_COLUMNS,
    rows.map((r) => [
      r.date,
      r.type,
      minorToDecimalString(r.amount, r.currency),
      r.currency,
      r.account,
      r.category,
      r.toAccount,
      r.toAmount !== null && r.toCurrency ? minorToDecimalString(r.toAmount, r.toCurrency) : '',
      r.description,
      r.notes,
      r.paymentMethod,
      r.time,
    ]),
    new Set([2, 7]),
  );
}

export interface ImportContext {
  /** lower-cased account name -> account */
  accounts: Map<string, { id: string; currency: string }>;
  /** lower-cased category name (translated or custom) -> category */
  categories: Map<string, { id: string; kind: 'expense' | 'income' }>;
  fallbackCategory: { expense: string; income: string };
  /** Fingerprints of existing transactions (see `fingerprint`). */
  existing: Set<string>;
}

export interface ParsedRow {
  line: number;
  date: DayKey;
  type: TransactionType;
  amount: number;
  currency: string;
  accountName: string;
  accountId: string | null;
  toAccountName: string | null;
  toAccountId: string | null;
  toAmount: number | null;
  categoryId: string | null;
  categoryFallback: boolean;
  description: string;
  notes: string;
  paymentMethod: PaymentMethod | null;
  time: string | null;
  duplicate: boolean;
}

export type RowError = { line: number; code: 'date' | 'type' | 'amount' | 'currency' | 'account' | 'to_account' | 'currency_mismatch' | 'to_amount' | 'time' };

export interface ImportPreview {
  rows: ParsedRow[];
  errors: RowError[];
  duplicates: number;
  /** Account names that don't exist yet and will be created (with the row's currency). */
  newAccounts: { name: string; currency: string }[];
  fallbackCategories: number;
}

const norm = (s: string) => s.trim().toLowerCase();

export function fingerprint(t: { date: string; type: string; amount: number; currency: string; accountKey: string; description: string }): string {
  return [t.date, t.type, t.amount, t.currency, norm(t.accountKey), norm(t.description)].join('|');
}

/** Parses and validates a CSV file. Nothing is written: the result is shown as a preview. */
export function previewImport(text: string, ctx: ImportContext): ImportPreview {
  if (!text.trim()) throw new CsvError('empty');
  const table = parseCsv(text, detectDelimiter(text));
  const header = (table[0] ?? []).map(norm);
  if (REQUIRED_COLUMNS.some((c) => !header.includes(c))) throw new CsvError('missing_columns');
  if (table.length - 1 > CSV_MAX_ROWS) throw new CsvError('too_many_rows');
  const col = (row: string[], name: (typeof CSV_COLUMNS)[number]) => {
    const i = header.indexOf(name);
    const v = i >= 0 ? (row[i] ?? '') : '';
    return v.startsWith("'") && /^'[=+\-@]/.test(v) ? v.slice(1) : v; // undo our own formula escaping
  };

  const rows: ParsedRow[] = [];
  const errors: RowError[] = [];
  const newAccounts = new Map<string, { name: string; currency: string }>();
  let fallbackCategories = 0;

  table.slice(1).forEach((r, idx) => {
    const line = idx + 2;
    const date = col(r, 'date').trim();
    if (!isValidDayKey(date)) return void errors.push({ line, code: 'date' });
    const type = norm(col(r, 'type')) as TransactionType;
    if (!TRANSACTION_TYPES.includes(type)) return void errors.push({ line, code: 'type' });
    const currency = col(r, 'currency').trim().toUpperCase();
    if (!isSupportedCurrency(currency)) return void errors.push({ line, code: 'currency' });
    const parsed = parseAmount(col(r, 'amount'), currency, { allowNegative: type === 'adjustment' });
    if (!parsed.ok || parsed.minor === 0) return void errors.push({ line, code: 'amount' });
    const accountName = col(r, 'account').trim();
    if (!accountName) return void errors.push({ line, code: 'account' });
    const account = ctx.accounts.get(norm(accountName)) ?? null;
    const pending = newAccounts.get(norm(accountName));
    const accountCurrency = account?.currency ?? pending?.currency ?? currency;
    if (accountCurrency !== currency) return void errors.push({ line, code: 'currency_mismatch' });
    if (!account && !pending) newAccounts.set(norm(accountName), { name: accountName, currency });

    let toAccountName: string | null = null;
    let toAccountId: string | null = null;
    let toAmount: number | null = null;
    if (type === 'transfer') {
      toAccountName = col(r, 'to_account').trim();
      if (!toAccountName || norm(toAccountName) === norm(accountName)) return void errors.push({ line, code: 'to_account' });
      const to = ctx.accounts.get(norm(toAccountName)) ?? null;
      toAccountId = to?.id ?? null;
      const toCurrency = to?.currency ?? newAccounts.get(norm(toAccountName))?.currency ?? currency;
      if (!to && !newAccounts.has(norm(toAccountName))) newAccounts.set(norm(toAccountName), { name: toAccountName, currency: toCurrency });
      const rawTo = col(r, 'to_amount').trim();
      if (rawTo) {
        const p = parseAmount(rawTo, toCurrency);
        if (!p.ok || p.minor <= 0) return void errors.push({ line, code: 'to_amount' });
        toAmount = p.minor;
      } else if (toCurrency !== currency) return void errors.push({ line, code: 'to_amount' });
      else toAmount = parsed.minor;
    }

    let categoryId: string | null = null;
    let categoryFallback = false;
    if (type === 'expense' || type === 'income' || type === 'refund') {
      const kind = type === 'income' ? 'income' : 'expense';
      const cat = ctx.categories.get(norm(col(r, 'category')));
      if (cat && cat.kind === kind) categoryId = cat.id;
      else {
        categoryId = ctx.fallbackCategory[kind];
        categoryFallback = true;
        fallbackCategories++;
      }
    }

    const time = col(r, 'time').trim();
    if (time && !TIME_KEY.test(time)) return void errors.push({ line, code: 'time' });
    const pm = norm(col(r, 'payment_method')) as PaymentMethod;
    const description = col(r, 'description').trim().slice(0, 200);
    const duplicate = ctx.existing.has(fingerprint({ date, type, amount: parsed.minor, currency, accountKey: accountName, description }));

    rows.push({
      line,
      date,
      type,
      amount: parsed.minor,
      currency,
      accountName,
      accountId: account?.id ?? null,
      toAccountName,
      toAccountId,
      toAmount,
      categoryId,
      categoryFallback,
      description,
      notes: col(r, 'notes').trim().slice(0, 1000),
      paymentMethod: PAYMENT_METHODS.includes(pm) ? pm : null,
      time: time || null,
      duplicate,
    });
  });

  return { rows, errors, duplicates: rows.filter((r) => r.duplicate).length, newAccounts: [...newAccounts.values()], fallbackCategories };
}
