/**
 * Supported currencies (ISO 4217). `decimals` is the number of minor units:
 * amounts are stored as integers in minor units (cents, centimes, yen…) to avoid
 * floating-point drift in budgets and shared-expense balances.
 */
export const CURRENCIES = {
  USD: { decimals: 2 },
  EUR: { decimals: 2 },
  GBP: { decimals: 2 },
  MAD: { decimals: 2 },
  CAD: { decimals: 2 },
  AUD: { decimals: 2 },
  CHF: { decimals: 2 },
  JPY: { decimals: 0 },
  CNY: { decimals: 2 },
  AED: { decimals: 2 },
  SAR: { decimals: 2 },
} as const satisfies Record<string, { decimals: number }>;

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return !!value && Object.prototype.hasOwnProperty.call(CURRENCIES, value);
}

export function currencyDecimals(code: string): number {
  return isCurrencyCode(code) ? CURRENCIES[code].decimals : 2;
}
