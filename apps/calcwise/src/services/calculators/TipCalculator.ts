import { Dec, HUNDRED, ZERO, ceilToStep, roundMoney } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * Tip & bill split.
 *
 *   tip      = bill × tip% / 100
 *   total    = bill + tip + extra
 *   share    = total / people
 *
 * Rounding: with "round up per person", each share is rounded UP to the chosen step
 * (0.05, 0.10, 0.50, 1…) and the difference is shown as a rounding surplus.
 * Without rounding, the total is split to the cent and leftover cents are given to
 * the first people, so the shares always add up exactly to the total
 * (100.00 / 3 → 33.34 + 33.33 + 33.33).
 */
export interface TipInput {
  bill: Dec;
  tipPercent: Dec;
  people: number;
  /** Fixed extra amount (delivery, service fee…) added before splitting. */
  extra: Dec;
  /** null = split to the cent. */
  roundStep: Dec | null;
  /** Minor-unit digits of the currency (2 for EUR/USD, 0 for JPY). */
  fractionDigits: number;
}

export interface TipResult {
  tip: Dec;
  total: Dec;
  /** Exact share before any rounding. */
  exactShare: Dec;
  /** Amounts people actually pay, grouped: [{ amount, count }]. */
  shares: { amount: Dec; count: number }[];
  /** Sum actually collected (≥ total when rounding up). */
  collected: Dec;
  roundingSurplus: Dec;
}

export const MAX_PEOPLE = 100;

export function splitBill(input: TipInput): CalcResult<TipResult> {
  const { bill, tipPercent, people, extra, roundStep, fractionDigits } = input;
  if (bill.isNegative()) return fail('negative', 'bill');
  if (tipPercent.isNegative() || tipPercent.gt(100)) return fail('percent_range', 'tip');
  if (extra.isNegative()) return fail('negative', 'extra');
  if (!Number.isInteger(people) || people < 1) return fail('not_positive', 'people');
  if (people > MAX_PEOPLE) return fail('too_large', 'people');

  const tip = roundMoney(bill.times(tipPercent).div(HUNDRED), fractionDigits);
  const total = roundMoney(bill.plus(tip).plus(extra), fractionDigits);
  const exactShare = total.div(people);

  if (roundStep && roundStep.gt(0)) {
    const amount = roundMoney(ceilToStep(exactShare, roundStep), fractionDigits);
    const collected = amount.times(people);
    return ok({ tip, total, exactShare, shares: [{ amount, count: people }], collected, roundingSurplus: collected.minus(total) });
  }

  // Exact split in minor units; distribute the remainder one unit at a time.
  const unit = new Dec(10).pow(-fractionDigits);
  const minor = total.div(unit).toDecimalPlaces(0);
  const base = minor.divToInt(people);
  const remainder = minor.minus(base.times(people)).toNumber();
  const low = base.times(unit);
  const high = low.plus(unit);
  const shares = remainder > 0 ? [{ amount: high, count: remainder }, ...(people - remainder > 0 ? [{ amount: low, count: people - remainder }] : [])] : [{ amount: low, count: people }];
  return ok({ tip, total, exactShare, shares, collected: total, roundingSurplus: ZERO });
}
