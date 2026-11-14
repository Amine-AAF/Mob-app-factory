/**
 * Money representation used everywhere in SpendWise.
 *
 * STRATEGY (documented in docs/financial-calculations.md):
 * - Amounts are stored as INTEGER minor units ("cents") together with an ISO 4217 code.
 *   The number of minor digits comes from the ISO table below (JPY = 0, USD = 2, KWD = 3…).
 * - Parsing user input is done on the decimal STRING, never through parseFloat.
 * - Every multiplication/division (rates, normalisation, interest) goes through BigInt
 *   rationals and is rounded exactly once, half away from zero.
 * - Amounts of different currencies are never added together; see `sumByCurrency`.
 */

export interface CurrencyInfo {
  code: string;
  /** ISO 4217 minor unit exponent. */
  digits: 0 | 2 | 3;
}

/** Common ISO 4217 currencies. Order = order shown in the picker. */
export const CURRENCIES: readonly CurrencyInfo[] = [
  { code: 'USD', digits: 2 },
  { code: 'EUR', digits: 2 },
  { code: 'GBP', digits: 2 },
  { code: 'MAD', digits: 2 },
  { code: 'CAD', digits: 2 },
  { code: 'AUD', digits: 2 },
  { code: 'CHF', digits: 2 },
  { code: 'JPY', digits: 0 },
  { code: 'CNY', digits: 2 },
  { code: 'INR', digits: 2 },
  { code: 'BRL', digits: 2 },
  { code: 'MXN', digits: 2 },
  { code: 'ARS', digits: 2 },
  { code: 'CLP', digits: 0 },
  { code: 'COP', digits: 2 },
  { code: 'PEN', digits: 2 },
  { code: 'ZAR', digits: 2 },
  { code: 'NGN', digits: 2 },
  { code: 'KES', digits: 2 },
  { code: 'EGP', digits: 2 },
  { code: 'TND', digits: 3 },
  { code: 'DZD', digits: 2 },
  { code: 'XOF', digits: 0 },
  { code: 'XAF', digits: 0 },
  { code: 'AED', digits: 2 },
  { code: 'SAR', digits: 2 },
  { code: 'QAR', digits: 2 },
  { code: 'KWD', digits: 3 },
  { code: 'BHD', digits: 3 },
  { code: 'OMR', digits: 3 },
  { code: 'JOD', digits: 3 },
  { code: 'TRY', digits: 2 },
  { code: 'ILS', digits: 2 },
  { code: 'SEK', digits: 2 },
  { code: 'NOK', digits: 2 },
  { code: 'DKK', digits: 2 },
  { code: 'PLN', digits: 2 },
  { code: 'CZK', digits: 2 },
  { code: 'HUF', digits: 2 },
  { code: 'RON', digits: 2 },
  { code: 'RUB', digits: 2 },
  { code: 'UAH', digits: 2 },
  { code: 'SGD', digits: 2 },
  { code: 'HKD', digits: 2 },
  { code: 'NZD', digits: 2 },
  { code: 'KRW', digits: 0 },
  { code: 'THB', digits: 2 },
  { code: 'MYR', digits: 2 },
  { code: 'IDR', digits: 2 },
  { code: 'PHP', digits: 2 },
  { code: 'VND', digits: 0 },
  { code: 'PKR', digits: 2 },
  { code: 'BDT', digits: 2 },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function isSupportedCurrency(code: string): boolean {
  return BY_CODE.has(code);
}

export function currencyDigits(code: string): number {
  const info = BY_CODE.get(code);
  if (!info) throw new Error(`Unsupported currency: ${code}`);
  return info.digits;
}

/**
 * Upper bound for a single stored amount, in minor units. Keeps every sum of
 * up to ~90 000 such amounts below Number.MAX_SAFE_INTEGER.
 */
export const MAX_MINOR = 100_000_000_000_00; // 100 billion with 2 digits

export type ParseError = 'empty' | 'invalid' | 'too_many_decimals' | 'too_large' | 'negative';
export type ParseResult = { ok: true; minor: number } | { ok: false; error: ParseError };

/**
 * Parses a user-typed amount into minor units without floating point.
 * Accepts "1234.5", "1 234,50", "1,234.50", "1.234,50", "-12" (if allowed).
 */
export function parseAmount(input: string, currency: string, opts: { allowNegative?: boolean } = {}): ParseResult {
  const digits = currencyDigits(currency);
  let s = input.trim().replace(/[\s  '’]/g, '');
  if (s === '') return { ok: false, error: 'empty' };
  let negative = false;
  if (s.startsWith('-') || s.startsWith('−')) {
    negative = true;
    s = s.slice(1);
  } else if (s.startsWith('+')) s = s.slice(1);
  if (!/^[0-9.,]+$/.test(s) || !/[0-9]/.test(s)) return { ok: false, error: 'invalid' };

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let intPart = s;
  let fracPart = '';
  if (lastDot >= 0 && lastComma >= 0) {
    // Both present: the right-most one is the decimal separator.
    const decIdx = Math.max(lastDot, lastComma);
    const thousands = decIdx === lastDot ? ',' : '.';
    intPart = s.slice(0, decIdx);
    fracPart = s.slice(decIdx + 1);
    if (intPart.includes(s[decIdx]!)) return { ok: false, error: 'invalid' };
    intPart = intPart.split(thousands).join('');
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? '.' : ',';
    const parts = s.split(sep);
    const tail = parts[parts.length - 1] ?? '';
    // A single "." is always decimal ("12.345" is too precise for USD, not 12 345).
    // A single "," followed by exactly 3 digits is a thousands separator ("1,000"), except for 3-digit currencies.
    const isThousands = parts.length > 2 || (sep === ',' && tail.length === 3 && digits < 3 && (parts[0] ?? '').length > 0);
    if (isThousands) {
      if (parts.slice(1).some((p) => p.length !== 3)) return { ok: false, error: 'invalid' };
      intPart = parts.join('');
    } else {
      intPart = parts[0] ?? '';
      fracPart = tail;
    }
  }
  if (!/^[0-9]*$/.test(intPart) || !/^[0-9]*$/.test(fracPart)) return { ok: false, error: 'invalid' };
  if (intPart === '' && fracPart === '') return { ok: false, error: 'invalid' };
  if (fracPart.length > digits) {
    // Allow trailing zeros beyond precision ("10.500" for USD), reject real extra precision.
    if (/[1-9]/.test(fracPart.slice(digits))) return { ok: false, error: 'too_many_decimals' };
    fracPart = fracPart.slice(0, digits);
  }
  const normalized = (intPart.replace(/^0+(?=\d)/, '') || '0') + fracPart.padEnd(digits, '0');
  if (normalized.length > 16) return { ok: false, error: 'too_large' };
  const minor = Number(normalized);
  if (!Number.isSafeInteger(minor) || minor > MAX_MINOR) return { ok: false, error: 'too_large' };
  if (negative && minor !== 0 && !opts.allowNegative) return { ok: false, error: 'negative' };
  return { ok: true, minor: negative ? -minor : minor };
}

/** Exact decimal string of a minor amount: 12345 USD -> "123.45". */
export function minorToDecimalString(minor: number, currency: string): string {
  const digits = currencyDigits(currency);
  const neg = minor < 0;
  const abs = String(Math.abs(Math.trunc(minor))).padStart(digits + 1, '0');
  const intPart = digits ? abs.slice(0, -digits) : abs;
  const frac = digits ? abs.slice(-digits) : '';
  return `${neg ? '-' : ''}${intPart}${frac ? `.${frac}` : ''}`;
}

/** Value to pre-fill an input field when editing an amount. */
export function minorToInput(minor: number, currency: string): string {
  return minorToDecimalString(minor, currency);
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, currency: string, compact: boolean): Intl.NumberFormat {
  const key = `${locale}|${currency}|${compact}`;
  let nf = formatterCache.get(key);
  if (!nf) {
    const digits = currencyDigits(currency);
    nf = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: compact ? 0 : digits,
      maximumFractionDigits: compact ? 0 : digits,
    });
    formatterCache.set(key, nf);
  }
  return nf;
}

/**
 * Locale-aware currency formatting that never loses precision: the integer part is
 * formatted by Intl (exact for safe integers) and the fraction digits are injected
 * from the exact decimal string.
 */
export function formatMoney(
  minor: number,
  currency: string,
  locale: string,
  opts: { signed?: boolean; compact?: boolean } = {},
): string {
  const digits = currencyDigits(currency);
  const neg = minor < 0;
  const abs = Math.abs(minor);
  const divisor = 10 ** digits;
  const major = Math.floor(abs / divisor);
  const frac = String(abs % divisor).padStart(digits, '0');
  const sign = neg ? '-' : opts.signed && minor > 0 ? '+' : '';
  try {
    if (opts.compact) {
      const rounded = Math.round(abs / divisor);
      return sign + formatter(locale, currency, true).format(rounded);
    }
    const parts = formatter(locale, currency, false).formatToParts(major);
    const out = parts
      .filter((p) => p.type !== 'minusSign' && p.type !== 'plusSign')
      .map((p) => (p.type === 'fraction' ? frac : p.value))
      .join('');
    return sign + out;
  } catch {
    return `${sign}${minorToDecimalString(abs, currency)} ${currency}`;
  }
}

/** Masked representation used by privacy mode. Same for every amount (no length leak). */
export const MASKED_AMOUNT = '•••••';

/* ------------------------------------------------------------------ Arithmetic */

/** Integer division of BigInts rounded half away from zero. */
export function roundDiv(num: bigint, den: bigint): bigint {
  if (den === 0n) throw new Error('Division by zero');
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const neg = num < 0n;
  const a = neg ? -num : num;
  const q = a / den;
  const r = a % den;
  const rounded = r * 2n >= den ? q + 1n : q;
  return neg ? -rounded : rounded;
}

/** Parses a positive decimal string ("10.8125") into an exact rational. */
export function parseDecimal(input: string): { num: bigint; den: bigint } | null {
  const s = input.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [i, f = ''] = s.split('.');
  const num = BigInt((i ?? '0') + f);
  const den = 10n ** BigInt(f.length);
  return { num, den };
}

/** amount * num / den, rounded once. */
export function mulRatio(minor: number, num: bigint, den: bigint): number {
  return Number(roundDiv(BigInt(minor) * num, den));
}

/**
 * Converts between currencies with a user-provided rate (units of `to` for one unit of `from`).
 * Handles different minor-unit exponents (e.g. USD -> JPY).
 */
export function convertMinor(minor: number, from: string, to: string, rate: string): number | null {
  if (from === to) return minor;
  const r = parseDecimal(rate);
  if (!r || r.num === 0n) return null;
  const shift = currencyDigits(to) - currencyDigits(from);
  const num = r.num * (shift >= 0 ? 10n ** BigInt(shift) : 1n);
  const den = r.den * (shift < 0 ? 10n ** BigInt(-shift) : 1n);
  return mulRatio(minor, num, den);
}

/** Percentage of `part` over `whole` as a number in [0, ∞), safe for whole = 0. */
export function ratio(part: number, whole: number): number {
  if (whole <= 0) return part > 0 ? 1 : 0;
  return part / whole;
}

/**
 * Splits `total` into parts proportional to integer `weights`, distributing the
 * remainder cent by cent (largest remainder) so the parts always sum to `total`.
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  if (weights.length === 0) return [];
  if (weights.some((w) => !Number.isInteger(w) || w < 0)) throw new Error('Weights must be non-negative integers');
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW === 0) return weights.map(() => 0);
  const T = BigInt(total);
  const W = BigInt(sumW);
  const sign = T < 0n ? -1n : 1n;
  const absT = T * sign;
  const base = weights.map((w) => (absT * BigInt(w)) / W);
  const rema = weights.map((w, i) => ({ i, r: (absT * BigInt(w)) % W }));
  let left = absT - base.reduce((a, b) => a + b, 0n);
  rema.sort((a, b) => (b.r > a.r ? 1 : b.r < a.r ? -1 : a.i - b.i));
  for (const { i } of rema) {
    if (left <= 0n) break;
    base[i] = base[i]! + 1n;
    left--;
  }
  return base.map((b) => Number(b * sign));
}

/** Sums amounts grouped by currency. Never mixes currencies. */
export function sumByCurrency(items: readonly { amount: number; currency: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) out[it.currency] = (out[it.currency] ?? 0) + it.amount;
  return out;
}
