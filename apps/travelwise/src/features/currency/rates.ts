import type { CurrencyRate, LocalDate } from '@/types/models';
import { convertMinor } from '@/utils/money';

/**
 * Exchange-rate abstraction. The MVP only ships the manual provider (rates typed by the
 * user, with their date). A future provider (an external API) can implement the same
 * interface; it must report its source and date, and the UI always reminds users that
 * the rate actually applied by a bank or card may differ.
 */
export interface RateQuote {
  base: string;
  quote: string;
  /** 1 base = rate quote. */
  rate: number;
  rateDate: LocalDate;
  /** 'manual' for user-entered rates, a provider name otherwise. */
  source: string;
  /** True when the rate was derived by inverting a stored quote→base rate. */
  inverted: boolean;
}

export interface RateProvider {
  readonly id: string;
  /** Whether this provider needs a network connection (manual never does). */
  readonly online: boolean;
  getRate(base: string, quote: string, opts?: { tripId?: string | null }): Promise<RateQuote | null>;
}

/** Picks the best stored rate for a pair: trip-specific first, then most recent; inverse pair as fallback. */
export function pickRate(rates: CurrencyRate[], base: string, quote: string, tripId?: string | null): RateQuote | null {
  if (base === quote) return { base, quote, rate: 1, rateDate: '', source: 'identity', inverted: false };
  const score = (r: CurrencyRate) => [r.tripId && r.tripId === tripId ? 1 : 0, r.capturedAt] as const;
  const better = (a: CurrencyRate, b: CurrencyRate) => {
    const [ta, ca] = score(a);
    const [tb, cb] = score(b);
    return ta !== tb ? tb - ta : cb.localeCompare(ca);
  };
  const usable = rates.filter((r) => !r.tripId || r.tripId === tripId);
  const direct = usable.filter((r) => r.base === base && r.quote === quote).sort(better)[0];
  if (direct) return { base, quote, rate: direct.rate, rateDate: direct.rateDate, source: direct.source, inverted: false };
  const inverse = usable.filter((r) => r.base === quote && r.quote === base).sort(better)[0];
  if (inverse) return { base, quote, rate: 1 / inverse.rate, rateDate: inverse.rateDate, source: inverse.source, inverted: true };
  return null;
}

export function convertWithQuote(amountMinor: number, q: RateQuote): number {
  return convertMinor(amountMinor, q.base, q.quote, q.rate);
}

/** Formats a rate for display with enough significant digits (1 EUR = 10.8456 MAD, 1 JPY = 0.006159 EUR). */
export function formatRate(rate: number, locale: string): string {
  const digits = rate >= 100 ? 2 : rate >= 1 ? 4 : 6;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: Math.min(2, digits) }).format(rate);
}
