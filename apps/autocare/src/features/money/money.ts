import type { CurrencyCode } from '@/types';

/**
 * Money is stored as integer minor units with an explicit currency.
 * Totals are always grouped by currency: AutoCare never adds EUR to USD
 * without an explicit, user-provided conversion rate.
 */
export interface Money {
  minor: number;
  currency: CurrencyCode;
}

/** Totals per currency, e.g. { EUR: 12345, MAD: 50000 }. */
export type CurrencyTotals = Record<CurrencyCode, number>;

export const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'AUD', 'CHF', 'MXN', 'BRL', 'ARS', 'COP', 'CLP', 'PEN', 'XOF', 'DZD', 'TND', 'AED', 'SAR', 'INR', 'JPY', 'CNY', 'ZAR', 'TRY', 'PLN', 'SEK', 'NOK', 'DKK'] as const;

export function isCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export function addTo(totals: CurrencyTotals, money: Money | null | undefined): CurrencyTotals {
  if (!money || !Number.isFinite(money.minor)) return totals;
  totals[money.currency] = (totals[money.currency] ?? 0) + money.minor;
  return totals;
}

export function sumByCurrency(items: Iterable<Money | null | undefined>): CurrencyTotals {
  const totals: CurrencyTotals = {};
  for (const m of items) addTo(totals, m);
  return totals;
}

export function mergeTotals(...all: CurrencyTotals[]): CurrencyTotals {
  const out: CurrencyTotals = {};
  for (const t of all) for (const [c, v] of Object.entries(t)) out[c] = (out[c] ?? 0) + v;
  return out;
}

/** Currencies present, the preferred one first then by amount. */
export function currenciesOf(totals: CurrencyTotals, preferred?: CurrencyCode): CurrencyCode[] {
  return Object.keys(totals)
    .filter((c) => totals[c] !== 0 || c === preferred)
    .sort((a, b) => (a === preferred ? -1 : b === preferred ? 1 : (totals[b] ?? 0) - (totals[a] ?? 0)));
}

/** True when totals hold a single currency (so a single figure can be shown). */
export function singleCurrency(totals: CurrencyTotals): CurrencyCode | null {
  const keys = Object.keys(totals).filter((c) => totals[c] !== 0);
  return keys.length === 1 ? keys[0]! : null;
}

/**
 * Converts totals into one currency with explicit user-provided rates
 * ("1 unit of <key> = rate units of target"). Currencies without a rate are
 * reported in `missing` instead of being silently dropped or added as-is.
 */
export function convertTotals(totals: CurrencyTotals, target: CurrencyCode, rates: Record<CurrencyCode, number>): { minor: number; missing: CurrencyCode[] } {
  let minor = 0;
  const missing: CurrencyCode[] = [];
  for (const [currency, value] of Object.entries(totals)) {
    if (currency === target) minor += value;
    else if (rates[currency] && rates[currency]! > 0) minor += Math.round(value * rates[currency]!);
    else if (value !== 0) missing.push(currency);
  }
  return { minor, missing };
}
