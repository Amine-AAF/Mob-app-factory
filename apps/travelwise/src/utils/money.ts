import { currencyDecimals } from '@/constants/currencies';

/**
 * Money helpers. Amounts are integers in minor units; rounding is "half away from
 * zero", applied once, at the boundary (user input → minor units, conversion result).
 */
export function roundHalfAwayFromZero(value: number): number {
  // Scale-aware epsilon fixes binary artefacts such as 1.005 * 100 = 100.49999…
  const r = Math.round(Math.abs(value) * (1 + Number.EPSILON));
  return value < 0 ? -r : r;
}

export function toMinor(amount: number, currency: string): number {
  return roundHalfAwayFromZero(amount * 10 ** currencyDecimals(currency));
}

export function fromMinor(minor: number, currency: string): number {
  return minor / 10 ** currencyDecimals(currency);
}

/**
 * Parses a user-typed, non-negative amount: "1234.5", "1234,5", "1 234,50",
 * "1,234.50", "1.234,50". The last separator is decimal, except when it is followed
 * by exactly 3 digits and only one kind of separator is used ("1,234", "1.000.000"):
 * those are read as thousands groupings. Ambiguity note: "1,234" means 1234.
 * Returns minor units, or null when the input is not a valid amount.
 */
export function parseAmount(input: string, currency: string): number | null {
  const raw = input.replace(/[\s  ]/g, '');
  if (!/^(\d[\d.,]*|[.,]\d+)$/.test(raw)) return null;
  const lastSep = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'));
  let normalized = raw;
  if (lastSep !== -1) {
    const head = raw.slice(0, lastSep);
    const frac = raw.slice(lastSep + 1);
    const intPart = head.replace(/[.,]/g, '');
    const sep = raw[lastSep];
    const other = sep === ',' ? '.' : ',';
    // "1,234" / "1.000.000" → grouping only; "0.005" and "1.234,567" keep a decimal separator.
    const isThousands = frac.length === 3 && !head.includes(other) && /^[1-9]/.test(head);
    if (frac.length === 0) return null;
    normalized = isThousands ? `${intPart}${frac}` : `${intPart || '0'}.${frac}`;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return toMinor(value, currency);
}

/** Converts minor units of `from` into minor units of `to`, where 1 `from` = `rate` `to`. */
export function convertMinor(minor: number, from: string, to: string, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) throw new RangeError('Rate must be a positive number');
  if (from === to) return minor;
  return toMinor(fromMinor(minor, from) * rate, to);
}

/** Inverse rate, for displaying both "1 EUR = x USD" and "1 USD = y EUR". */
export function invertRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) throw new RangeError('Rate must be a positive number');
  return 1 / rate;
}

/** Parses a typed exchange rate ("1,0845" or "1.0845"). Null unless strictly positive. */
export function parseRate(input: string): number | null {
  const raw = input.trim().replace(',', '.');
  if (!/^\d*\.?\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value > 0 && Number.isFinite(value) ? value : null;
}

export function formatMoney(minor: number, currency: string, locale: string): string {
  const decimals = currencyDecimals(currency);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
      fromMinor(minor, currency),
    );
  } catch {
    return `${fromMinor(minor, currency).toFixed(decimals)} ${currency}`;
  }
}

/** Ratio spent / planned (≥ 0, may exceed 1); null when no budget is planned. */
export function budgetRatio(spentMinor: number, plannedMinor: number | null): number | null {
  if (!plannedMinor || plannedMinor <= 0) return null;
  return Math.max(0, spentMinor / plannedMinor);
}
