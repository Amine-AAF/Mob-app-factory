import type { SqlDatabase } from '@factory/storage';

import { isCurrencyCode } from '@/constants/currencies';
import { pickRate, type RateProvider, type RateQuote } from '@/features/currency/rates';
import type { CurrencyConversion, CurrencyRate, Id, LocalDate } from '@/types/models';
import { clock } from '@/utils/clock';
import { isValidDate } from '@/utils/dates';
import { createId } from '@/utils/ids';
import { convertMinor } from '@/utils/money';

export type CurrencyValidationCode = 'invalid_currency' | 'same_currency' | 'invalid_rate' | 'invalid_date' | 'invalid_amount';

export class CurrencyValidationError extends Error {
  constructor(public readonly code: CurrencyValidationCode) {
    super(`Invalid currency data: ${code}`);
    this.name = 'CurrencyValidationError';
  }
}

interface RateRow {
  id: string;
  trip_id: string | null;
  base: string;
  quote: string;
  rate: number;
  rate_date: string;
  source: string;
  captured_at: string;
}

interface ConversionRow {
  id: string;
  base: string;
  quote: string;
  amount_minor: number;
  result_minor: number;
  rate: number;
  rate_date: string;
  source: string;
  created_at: string;
}

const toRate = (r: RateRow): CurrencyRate => ({ id: r.id, tripId: r.trip_id, base: r.base, quote: r.quote, rate: r.rate, rateDate: r.rate_date, source: r.source, capturedAt: r.captured_at });
const toConversion = (r: ConversionRow): CurrencyConversion => ({
  id: r.id,
  base: r.base,
  quote: r.quote,
  amountMinor: r.amount_minor,
  resultMinor: r.result_minor,
  rate: r.rate,
  rateDate: r.rate_date,
  source: r.source,
  createdAt: r.created_at,
});

const HISTORY_LIMIT = 50;

export function createCurrencyRepository(db: SqlDatabase) {
  const repo = {
    /** Saves a user-entered rate ("1 base = rate quote", valid on rateDate), optionally for one trip. */
    async saveRate(input: { base: string; quote: string; rate: number; rateDate: LocalDate; tripId?: Id | null }): Promise<CurrencyRate> {
      if (!isCurrencyCode(input.base) || !isCurrencyCode(input.quote)) throw new CurrencyValidationError('invalid_currency');
      if (input.base === input.quote) throw new CurrencyValidationError('same_currency');
      if (!Number.isFinite(input.rate) || input.rate <= 0) throw new CurrencyValidationError('invalid_rate');
      if (!isValidDate(input.rateDate)) throw new CurrencyValidationError('invalid_date');
      const id = createId();
      await db.runAsync('INSERT INTO currency_rates (id, trip_id, base, quote, rate, rate_date, source, captured_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        input.tripId ?? null,
        input.base,
        input.quote,
        input.rate,
        input.rateDate,
        'manual',
        clock.instant(),
      ]);
      return toRate((await db.getFirstAsync<RateRow>('SELECT * FROM currency_rates WHERE id = ?', [id]))!);
    },

    async listRates(tripId?: Id | null): Promise<CurrencyRate[]> {
      const rows = tripId
        ? await db.getAllAsync<RateRow>('SELECT * FROM currency_rates WHERE trip_id IS NULL OR trip_id = ? ORDER BY captured_at DESC', [tripId])
        : await db.getAllAsync<RateRow>('SELECT * FROM currency_rates ORDER BY captured_at DESC', []);
      return rows.map(toRate);
    },

    async deleteRate(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM currency_rates WHERE id = ?', [id]);
    },

    /** Best stored rate for a pair (trip-specific first, most recent, inverse as fallback). */
    async findRate(base: string, quote: string, tripId?: Id | null): Promise<RateQuote | null> {
      return pickRate(await repo.listRates(tripId), base, quote, tripId);
    },

    /** Converts and records the conversion in the history (kept to the last 50). */
    async convert(amountMinor: number, quote: RateQuote): Promise<CurrencyConversion> {
      if (!Number.isInteger(amountMinor) || amountMinor < 0) throw new CurrencyValidationError('invalid_amount');
      const result = convertMinor(amountMinor, quote.base, quote.quote, quote.rate);
      const id = createId();
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO currency_conversions (id, base, quote, amount_minor, result_minor, rate, rate_date, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          id,
          quote.base,
          quote.quote,
          amountMinor,
          result,
          quote.rate,
          quote.rateDate,
          quote.source,
          clock.instant(),
        ]);
        await db.runAsync(`DELETE FROM currency_conversions WHERE id NOT IN (SELECT id FROM currency_conversions ORDER BY created_at DESC, rowid DESC LIMIT ${HISTORY_LIMIT})`, []);
      });
      return toConversion((await db.getFirstAsync<ConversionRow>('SELECT * FROM currency_conversions WHERE id = ?', [id]))!);
    },

    async history(): Promise<CurrencyConversion[]> {
      const rows = await db.getAllAsync<ConversionRow>('SELECT * FROM currency_conversions ORDER BY created_at DESC, rowid DESC', []);
      return rows.map(toConversion);
    },

    async clearHistory(): Promise<void> {
      await db.runAsync('DELETE FROM currency_conversions', []);
    },
  };
  return repo;
}

/** The only provider shipped in the MVP: rates typed by the user, fully offline. */
export function createManualRateProvider(currency: ReturnType<typeof createCurrencyRepository>): RateProvider {
  return { id: 'manual', online: false, getRate: (base, quote, opts) => currency.findRate(base, quote, opts?.tripId) };
}
