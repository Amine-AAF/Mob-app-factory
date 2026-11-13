import { Dec, Decimal } from './decimal';

/**
 * Locale-aware number display and parsing.
 *
 * Results are computed as decimals and rounded ONCE here, half-up.
 * Separators come from Intl for the chosen locale tag (device locale by default,
 * or a preset chosen in Settings), so "1,234.5", "1 234,5" and "1.234,5" are all supported.
 */
export interface Separators {
  decimal: string;
  group: string;
}

const cache = new Map<string, Separators>();

export function getSeparators(localeTag: string): Separators {
  const hit = cache.get(localeTag);
  if (hit) return hit;
  let result: Separators = { decimal: '.', group: ',' };
  try {
    const sample = new Intl.NumberFormat(localeTag, { useGrouping: true, minimumFractionDigits: 1 }).format(12345.6);
    // "12,345.6" | "12 345,6" | "12.345,6" | "12’345.6"
    const decimal = sample.charAt(sample.length - 2);
    const group = sample.replace(/[0-9]/g, '').replace(decimal, '').charAt(0);
    if (decimal && !/[0-9]/.test(decimal)) result = { decimal, group: group || '' };
  } catch {
    // Fall back to the en-US convention.
  }
  cache.set(localeTag, result);
  return result;
}

function groupDigits(int: string, group: string): string {
  if (!group || int.length <= 3) return int;
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

export interface FormatOptions {
  /** Maximum significant digits shown (default 15, the reliable precision of a display). */
  significant?: number;
  /** Fixed number of decimals (money, tables). Overrides `significant` for the fraction. */
  fractionDigits?: number;
  /** Minimum decimals kept (e.g. 2 for money). */
  minFractionDigits?: number;
  /** Switch to scientific notation from this power of ten (default 15). */
  sciAbove?: number;
  /** Switch to scientific notation below 10^-sciBelow (default 9). */
  sciBelow?: number;
  grouping?: boolean;
}

/** Formats a decimal for display. Large/small magnitudes use "1.23 × 10²⁰". */
export function formatDecimal(value: Dec, localeTag: string, opts: FormatOptions = {}): string {
  if (value.isNaN()) return '—';
  const { decimal, group } = getSeparators(localeTag);
  const significant = opts.significant ?? 15;
  const sciAbove = opts.sciAbove ?? 15;
  const sciBelow = opts.sciBelow ?? 9;

  let v = opts.fractionDigits !== undefined ? value.toDecimalPlaces(opts.fractionDigits, Decimal.ROUND_HALF_UP) : value.toSignificantDigits(significant, Decimal.ROUND_HALF_UP);
  if (v.isZero()) v = new Dec(0); // drop "-0"

  const exponent = v.isZero() ? 0 : v.e;
  if (!v.isZero() && (exponent >= sciAbove || exponent < -sciBelow)) {
    const sig = v.toSignificantDigits(Math.min(significant, 10), Decimal.ROUND_HALF_UP);
    const [mantissa = '0', exp = '0'] = sig.toExponential().split('e');
    const m = mantissa.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '').replace('.', decimal).replace(/^-/, '−');
    const e = exp.replace('+', '').split('').map((c) => SUPERSCRIPT[c] ?? c).join('');
    return `${m} × 10${e}`;
  }

  let fixed = v.toFixed(opts.fractionDigits);
  if (opts.minFractionDigits !== undefined && opts.fractionDigits === undefined) {
    const [, frac = ''] = fixed.split('.');
    if (frac.length < opts.minFractionDigits) fixed = v.toFixed(opts.minFractionDigits);
  }
  const negative = fixed.startsWith('-');
  const [int = '0', frac] = (negative ? fixed.slice(1) : fixed).split('.');
  const body = (opts.grouping === false ? int : groupDigits(int, group)) + (frac ? decimal + frac : '');
  return negative ? `−${body}` : body;
}

/** Minor-unit digits of a currency (2 for EUR/USD, 0 for JPY…). */
export function currencyDigits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/** Money with the currency symbol, rounded half-up to the currency's minor unit. */
export function formatMoney(value: Dec, currency: string, localeTag: string): string {
  const digits = currencyDigits(currency);
  const rounded = value.toDecimalPlaces(digits, Decimal.ROUND_HALF_UP);
  // Intl takes JS numbers: exact up to 15 significant digits. Beyond, keep decimal formatting.
  if (rounded.abs().lt('1e13')) {
    try {
      return new Intl.NumberFormat(localeTag, { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(rounded.toNumber());
    } catch {
      // Unknown currency code: fall through.
    }
  }
  return `${formatDecimal(rounded, localeTag, { fractionDigits: digits })} ${currency}`;
}

export function formatPercentValue(percent: Dec, localeTag: string, fractionDigits = 2): string {
  const text = formatDecimal(percent.toDecimalPlaces(fractionDigits, Decimal.ROUND_HALF_UP), localeTag, { significant: 15 });
  // English writes "12.5%"; French, Spanish and German put a (non-breaking) space before the sign.
  return localeTag.toLowerCase().startsWith('en') ? `${text}%` : `${text} %`;
}

/**
 * Parses a number typed by the user. Accepts the locale's decimal separator,
 * "." as a universal decimal point, and the locale's grouping separator.
 * Returns null for anything ambiguous or invalid — never a guessed value.
 */
export function parseLocalizedNumber(raw: string, localeTag: string): Dec | null {
  const { decimal, group } = getSeparators(localeTag);
  let s = raw.trim().replace(/[\s  ']/g, '').replace(/^−/, '-');
  if (!s) return null;
  const commas = (s.match(/,/g) ?? []).length;
  const dots = (s.match(/\./g) ?? []).length;

  if (commas && dots) {
    // Both present: the last one is the decimal separator.
    const decimalChar = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
    const groupChar = decimalChar === ',' ? '.' : ',';
    if ((s.match(new RegExp(`\\${decimalChar}`, 'g')) ?? []).length > 1) return null;
    s = s.split(groupChar).join('').replace(decimalChar, '.');
  } else if (commas || dots) {
    const char = commas ? ',' : '.';
    const count = commas || dots;
    if (char === decimal) {
      if (count > 1) return null;
      s = s.replace(char, '.');
    } else if (char === group) {
      // "1,000" in en / "1.000" in de: grouping only if every group has 3 digits.
      if (!new RegExp(`^-?\\d{1,3}(\\${char}\\d{3})+$`).test(s)) return null;
      s = s.split(char).join('');
    } else {
      // A foreign separator (e.g. "." with a French keyboard): a single one is a decimal point.
      if (count > 1) return null;
      s = s.replace(char, '.');
    }
  }
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  try {
    return new Dec(s);
  } catch {
    return null;
  }
}

/** Localizes a canonical expression for display: decimal point, operators, argument separator. */
export function displayExpression(expression: string, localeTag: string): string {
  const { decimal, group } = getSeparators(localeTag);
  return expression
    .replace(/\d+(\.\d*)?/g, (num) => {
      const [int = '', frac] = num.split('.');
      return groupDigits(int, group) + (frac !== undefined ? decimal + frac : '');
    })
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−')
    .replace(/pi/g, 'π')
    .replace(/sqrt\(/g, '√(');
}
