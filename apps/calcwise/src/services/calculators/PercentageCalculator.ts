import { Dec, HUNDRED, ONE } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * PercentageCalculator — every formula works on decimals; p is a percentage (15 = 15 %).
 *
 *   percentOf(p, x)              = x × p / 100
 *   increase(x, p)               = x × (1 + p/100)
 *   decrease(x, p)               = x × (1 − p/100)
 *   change(from, to)             = (to − from) / |from| × 100
 *   ratio(part, whole)           = part / whole × 100
 *   originalBeforeDecrease(f, p) = f / (1 − p/100)          p < 100
 *   originalBeforeIncrease(f, p) = f / (1 + p/100)          p > −100
 *   margin(cost, price)          = (price − cost) / price × 100
 *   markup(cost, price)          = (price − cost) / cost × 100
 *   priceFromMargin(cost, m)     = cost / (1 − m/100)        m < 100
 *   priceFromMarkup(cost, m)     = cost × (1 + m/100)
 */
const pct = (p: Dec) => p.div(HUNDRED);

export function percentOf(p: Dec, x: Dec): CalcResult<Dec> {
  return ok(x.times(pct(p)));
}

export function increase(x: Dec, p: Dec): CalcResult<{ result: Dec; delta: Dec }> {
  const delta = x.times(pct(p));
  return ok({ result: x.plus(delta), delta });
}

export function decrease(x: Dec, p: Dec): CalcResult<{ result: Dec; delta: Dec }> {
  const delta = x.times(pct(p));
  return ok({ result: x.minus(delta), delta });
}

export function change(from: Dec, to: Dec): CalcResult<{ percent: Dec; delta: Dec }> {
  if (from.isZero()) return fail('zero_division', 'from');
  const delta = to.minus(from);
  return ok({ percent: delta.div(from.abs()).times(HUNDRED), delta });
}

export function ratio(part: Dec, whole: Dec): CalcResult<Dec> {
  if (whole.isZero()) return fail('zero_division', 'whole');
  return ok(part.div(whole).times(HUNDRED));
}

export function originalBeforeDecrease(final: Dec, p: Dec): CalcResult<{ original: Dec; delta: Dec }> {
  if (p.gte(100)) return fail('percent_range', 'percent');
  const original = final.div(ONE.minus(pct(p)));
  return ok({ original, delta: original.minus(final) });
}

export function originalBeforeIncrease(final: Dec, p: Dec): CalcResult<{ original: Dec; delta: Dec }> {
  if (p.lte(-100)) return fail('percent_range', 'percent');
  const original = final.div(ONE.plus(pct(p)));
  return ok({ original, delta: final.minus(original) });
}

export interface MarginResult {
  profit: Dec;
  /** Profit as a share of the selling price. */
  marginPercent: Dec | null;
  /** Profit as a share of the cost. */
  markupPercent: Dec | null;
}

export function marginFromPrices(cost: Dec, price: Dec): CalcResult<MarginResult> {
  if (cost.isNegative()) return fail('negative', 'cost');
  if (price.isNegative()) return fail('negative', 'price');
  if (cost.isZero() && price.isZero()) return fail('zero_division', 'price');
  const profit = price.minus(cost);
  return ok({
    profit,
    marginPercent: price.isZero() ? null : profit.div(price).times(HUNDRED),
    markupPercent: cost.isZero() ? null : profit.div(cost).times(HUNDRED),
  });
}

export function priceFromMargin(cost: Dec, marginPercent: Dec): CalcResult<{ price: Dec; profit: Dec; markupPercent: Dec | null }> {
  if (cost.isNegative()) return fail('negative', 'cost');
  if (marginPercent.gte(100)) return fail('percent_range', 'percent');
  const price = cost.div(ONE.minus(pct(marginPercent)));
  const profit = price.minus(cost);
  return ok({ price, profit, markupPercent: cost.isZero() ? null : profit.div(cost).times(HUNDRED) });
}

export function priceFromMarkup(cost: Dec, markupPercent: Dec): CalcResult<{ price: Dec; profit: Dec; marginPercent: Dec | null }> {
  if (cost.isNegative()) return fail('negative', 'cost');
  const price = cost.times(ONE.plus(pct(markupPercent)));
  const profit = price.minus(cost);
  return ok({ price, profit, marginPercent: price.isZero() ? null : profit.div(price).times(HUNDRED) });
}
