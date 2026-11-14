/**
 * Money is handled as integer minor units + ISO 4217 code.
 * Totals are always grouped by currency: amounts in different currencies are
 * never added together (no implicit conversion, no exchange-rate API).
 */
export interface Money {
  amountMinor: number;
  currency: string;
}

/** Currencies offered in the pickers. Any valid ISO code from Intl also works. */
export const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'MAD', 'MXN', 'BRL', 'ARS', 'COP', 'CLP', 'PEN',
  'JPY', 'CNY', 'INR', 'ZAR', 'NGN', 'EGP', 'TND', 'DZD', 'XOF', 'XAF', 'AED', 'SAR', 'TRY',
  'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'NZD', 'SGD', 'HKD', 'KRW',
] as const;

/** Region → currency for a sensible default during onboarding. */
const REGION_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD', CH: 'CHF', MA: 'MAD', MX: 'MXN', BR: 'BRL',
  AR: 'ARS', CO: 'COP', CL: 'CLP', PE: 'PEN', JP: 'JPY', CN: 'CNY', IN: 'INR', ZA: 'ZAR', NG: 'NGN',
  EG: 'EGP', TN: 'TND', DZ: 'DZD', SN: 'XOF', CI: 'XOF', CM: 'XAF', AE: 'AED', SA: 'SAR', TR: 'TRY',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', SG: 'SGD', HK: 'HKD', KR: 'KRW',
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', BE: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR',
  FI: 'EUR', GR: 'EUR', LU: 'EUR',
};

export function currencyForRegion(region: string | null | undefined, fallback = 'USD'): string {
  return (region && REGION_CURRENCY[region.toUpperCase()]) || fallback;
}

export function isCurrencyCode(code: unknown): code is string {
  if (typeof code !== 'string' || !/^[A-Z]{3}$/.test(code)) return false;
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: code });
    return true;
  } catch {
    return false;
  }
}

/** Number of minor-unit digits (JPY 0, USD 2, TND 3). */
export function currencyDigits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Parses user input ("1 234,56", "1,234.56", "12.5") into minor units.
 * Returns null for empty/invalid/negative input. The last "," or "." followed by
 * 1–3 digits is the decimal separator; other separators are grouping.
 */
export function parseAmount(input: string, currency: string): number | null {
  const raw = input.replace(/[\s  ']/g, '');
  if (!raw) return null;
  if (!/^\d[\d.,]*$/.test(raw) && !/^[.,]\d+$/.test(raw)) return null;
  const digits = currencyDigits(currency);
  const lastSep = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'));
  let intPart = raw;
  let fracPart = '';
  if (lastSep >= 0) {
    const sep = raw[lastSep] as string;
    const tail = raw.slice(lastSep + 1);
    const mixed = raw.includes(',') && raw.includes('.');
    const repeated = raw.split(sep).length - 1 > 1;
    // With both separators the last one is the decimal mark ("1.234,56", "1,234.56").
    // A single kind repeated is grouping ("1.234.567"). A single "x.123" is grouping
    // unless the currency uses 3 decimals (TND, KWD…).
    const isDecimal = mixed || (!repeated && !(tail.length === 3 && digits < 3));
    if (isDecimal) {
      intPart = raw.slice(0, lastSep);
      fracPart = tail;
    }
  }
  if (/[.,]/.test(fracPart)) return null;
  intPart = intPart.replace(/[.,]/g, '') || '0';
  if (fracPart.length > digits) fracPart = fracPart.slice(0, digits); // truncate extra precision
  const minor = Number(intPart) * 10 ** digits + Number((fracPart + '0'.repeat(digits)).slice(0, digits) || '0');
  return Number.isSafeInteger(minor) && minor >= 0 ? minor : null;
}

export function toMajor(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** currencyDigits(currency);
}

export function formatMoney(m: Money, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: m.currency }).format(toMajor(m.amountMinor, m.currency));
  } catch {
    return `${toMajor(m.amountMinor, m.currency).toFixed(2)} ${m.currency}`;
  }
}

/** Value to prefill an amount input (no grouping, locale decimal separator). */
export function amountInputValue(amountMinor: number | null | undefined, currency: string, locale: string): string {
  if (amountMinor == null) return '';
  const digits = currencyDigits(currency);
  return new Intl.NumberFormat(locale, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: digits }).format(toMajor(amountMinor, currency));
}

/** Sums amounts per currency. The result is sorted with `preferred` first, then by amount. */
export function sumByCurrency(items: readonly Money[], preferred?: string): Money[] {
  const totals = new Map<string, number>();
  for (const it of items) {
    if (!Number.isFinite(it.amountMinor)) continue;
    totals.set(it.currency, (totals.get(it.currency) ?? 0) + it.amountMinor);
  }
  return [...totals.entries()]
    .map(([currency, amountMinor]) => ({ currency, amountMinor }))
    .sort((a, b) => (a.currency === preferred ? -1 : b.currency === preferred ? 1 : b.amountMinor - a.amountMinor));
}

/** Adds two amounts; throws if currencies differ (guards against accidental mixing). */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Cannot add ${a.currency} and ${b.currency} without an explicit conversion`);
  return { currency: a.currency, amountMinor: a.amountMinor + b.amountMinor };
}

/**
 * Explicit conversion with a user-supplied rate (1 `from` = rate `to`). This is the only
 * way amounts in different currencies can be combined.
 */
export function convert(m: Money, to: string, rate: number): Money {
  if (!(rate > 0) || !Number.isFinite(rate)) throw new Error('Invalid exchange rate');
  if (m.currency === to) return m;
  const major = toMajor(m.amountMinor, m.currency) * rate;
  return { currency: to, amountMinor: Math.round(major * 10 ** currencyDigits(to)) };
}
