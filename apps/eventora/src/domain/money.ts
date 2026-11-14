/**
 * Money handling.
 *
 * - Amounts are integers in minor units (cents) of an ISO 4217 currency, so
 *   sums are exact.
 * - Amounts in different currencies are NEVER added together implicitly:
 *   totals are returned per currency. A conversion only happens when the user
 *   entered an explicit rate (see `convertExplicit`).
 */

export interface Money {
  amountMinor: number;
  currency: string;
}

export const COMMON_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'MAD',
  'CAD',
  'CHF',
  'MXN',
  'COP',
  'ARS',
  'CLP',
  'PEN',
  'BRL',
  'XOF',
  'XAF',
  'DZD',
  'TND',
  'AED',
  'SAR',
  'INR',
  'JPY',
  'AUD',
] as const;

export function isValidCurrency(code: string | null | undefined): code is string {
  if (!code || !/^[A-Z]{3}$/.test(code)) return false;
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: code });
    return true;
  } catch {
    return false;
  }
}

/** Number of minor digits (EUR 2, JPY 0, …). */
export function currencyDigits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function toMinor(major: number, currency: string): number {
  return Math.round(major * 10 ** currencyDigits(currency));
}

export function toMajor(minor: number, currency: string): number {
  return minor / 10 ** currencyDigits(currency);
}

/**
 * Parses user input such as "1 234,56", "1,234.56", "1234.5" or "€ 12".
 * Returns minor units, or null when the text is not a valid non-negative amount.
 * The last "," or "." followed by 1–2 (or the currency's digits) digits is the decimal separator.
 */
export function parseAmount(text: string, currency: string): number | null {
  if (/-/.test(text)) return null;
  const cleaned = text.replace(/[\s  ']/g, '').replace(/[^\d.,]/g, '');
  if (!/\d/.test(cleaned)) return null;
  const digits = currencyDigits(currency);

  let intPart = cleaned;
  let fracPart = '';
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  if (hasComma && hasDot) {
    // Both present: the last one is the decimal separator ("1.234,56" / "1,234.56").
    const sep = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') ? ',' : '.';
    const i = cleaned.lastIndexOf(sep);
    intPart = cleaned.slice(0, i);
    fracPart = cleaned.slice(i + 1);
  } else if (hasComma || hasDot) {
    const sep = hasComma ? ',' : '.';
    const pieces = cleaned.split(sep);
    const tail = pieces[pieces.length - 1] ?? '';
    // A single separator followed by 1–2 digits is decimal ("12,5", "9.99");
    // repeated separators or a 3-digit group are thousands ("1.234", "1,000,000").
    if (pieces.length === 2 && tail.length > 0 && tail.length <= 2 && digits > 0) {
      intPart = pieces[0] ?? '';
      fracPart = tail;
    }
  }
  intPart = intPart.replace(/[.,]/g, '');
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) return null;
  if (fracPart.length > digits) return null;
  const minor = Number(intPart || '0') * 10 ** digits + Number(fracPart.padEnd(digits, '0') || '0');
  return Number.isSafeInteger(minor) ? minor : null;
}

export function formatMoney(minor: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(toMajor(minor, currency));
  } catch {
    return `${toMajor(minor, currency).toFixed(2)} ${currency}`;
  }
}

/** Plain number for editing fields ("1234.5" → "1234.50" style per locale-agnostic dot). */
export function minorToInput(minor: number, currency: string): string {
  if (!minor) return '';
  const digits = currencyDigits(currency);
  return toMajor(minor, currency).toFixed(digits);
}

export type CurrencyTotals = Record<string, number>;

/** Sums amounts grouped by currency (never across currencies). */
export function sumByCurrency(items: readonly Money[]): CurrencyTotals {
  const out: CurrencyTotals = {};
  for (const it of items) {
    if (!it.amountMinor) continue;
    out[it.currency] = (out[it.currency] ?? 0) + it.amountMinor;
  }
  return out;
}

/**
 * Converts using an explicit, user-entered rate. Rounds half away from zero to
 * the target's minor unit. Returns null when no valid rate is given.
 */
export function convertExplicit(amount: Money, target: string, rate: number | null | undefined): Money | null {
  if (amount.currency === target) return amount;
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return null;
  const major = toMajor(amount.amountMinor, amount.currency) * rate;
  return { amountMinor: toMinor(major, target), currency: target };
}

/** Lists totals as display rows, the primary currency first. */
export function totalsToList(totals: CurrencyTotals, primary?: string): Money[] {
  return Object.entries(totals)
    .map(([currency, amountMinor]) => ({ currency, amountMinor }))
    .sort((a, b) => (a.currency === primary ? -1 : b.currency === primary ? 1 : a.currency.localeCompare(b.currency)));
}
