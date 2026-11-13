import { Dec, HUNDRED, ONE, ZERO } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * DiscountCalculator — shopping maths.
 *
 * Successive discounts multiply: price × (1 − d1) × (1 − d2)…  (20 % then 10 % = 28 %, not 30 %).
 * VAT: gross = net × (1 + r);  net = gross / (1 + r);  vat = gross − net.
 * Unit price: price / quantity, converted to a base unit (kg, L or piece) so offers
 * with different pack sizes compare fairly. Values are exact decimals; rounding to
 * cents happens only for display.
 */

export interface DiscountStep {
  percent: Dec;
  priceBefore: Dec;
  saved: Dec;
  priceAfter: Dec;
}

export interface DiscountResult {
  original: Dec;
  final: Dec;
  saved: Dec;
  /** Overall equivalent discount, in percent. */
  effectivePercent: Dec;
  steps: DiscountStep[];
}

export const MAX_DISCOUNTS = 5;

export function applyDiscounts(price: Dec, discounts: readonly Dec[]): CalcResult<DiscountResult> {
  if (price.isNegative()) return fail('negative', 'price');
  if (discounts.length > MAX_DISCOUNTS) return fail('too_large', 'discounts');
  const steps: DiscountStep[] = [];
  let current = price;
  for (const [index, d] of discounts.entries()) {
    if (d.isNegative() || d.gt(100)) return fail('percent_range', `discount${index}`);
    const saved = current.times(d).div(HUNDRED);
    steps.push({ percent: d, priceBefore: current, saved, priceAfter: current.minus(saved) });
    current = current.minus(saved);
  }
  const saved = price.minus(current);
  return ok({
    original: price,
    final: current,
    saved,
    effectivePercent: price.isZero() ? ZERO : saved.div(price).times(HUNDRED),
    steps,
  });
}

export interface VatResult {
  net: Dec;
  vat: Dec;
  gross: Dec;
}

/** From a price before tax (HT / net). */
export function vatFromNet(net: Dec, ratePercent: Dec): CalcResult<VatResult> {
  if (ratePercent.isNegative() || ratePercent.gt(100)) return fail('percent_range', 'rate');
  const vat = net.times(ratePercent).div(HUNDRED);
  return ok({ net, vat, gross: net.plus(vat) });
}

/** From a price including tax (TTC / gross). */
export function vatFromGross(gross: Dec, ratePercent: Dec): CalcResult<VatResult> {
  if (ratePercent.isNegative() || ratePercent.gt(100)) return fail('percent_range', 'rate');
  const net = gross.div(ONE.plus(ratePercent.div(HUNDRED)));
  return ok({ net, vat: gross.minus(net), gross });
}

/* ------------------------------------------------------------- Unit price */

export type QuantityUnit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'cl' | 'l' | 'floz' | 'gal' | 'piece';
export type QuantityDimension = 'mass' | 'volume' | 'count';

/** Factor to the base unit of the dimension (kg, L, piece). Exact international definitions. */
export const QUANTITY_UNITS: Record<QuantityUnit, { dimension: QuantityDimension; toBase: string }> = {
  g: { dimension: 'mass', toBase: '0.001' },
  kg: { dimension: 'mass', toBase: '1' },
  oz: { dimension: 'mass', toBase: '0.028349523125' },
  lb: { dimension: 'mass', toBase: '0.45359237' },
  ml: { dimension: 'volume', toBase: '0.001' },
  cl: { dimension: 'volume', toBase: '0.01' },
  l: { dimension: 'volume', toBase: '1' },
  floz: { dimension: 'volume', toBase: '0.0295735295625' }, // US fluid ounce
  gal: { dimension: 'volume', toBase: '3.785411784' }, // US gallon
  piece: { dimension: 'count', toBase: '1' },
};

export const BASE_UNIT: Record<QuantityDimension, QuantityUnit> = { mass: 'kg', volume: 'l', count: 'piece' };

export interface Offer {
  price: Dec;
  quantity: Dec;
  unit: QuantityUnit;
}

export interface UnitPriceResult {
  /** Price per base unit (per kg, per L or per piece). */
  perBase: Dec;
  dimension: QuantityDimension;
}

export function unitPrice(offer: Offer, field = 'offer'): CalcResult<UnitPriceResult> {
  if (offer.price.isNegative()) return fail('negative', `${field}.price`);
  if (offer.quantity.lte(0)) return fail('not_positive', `${field}.quantity`);
  const def = QUANTITY_UNITS[offer.unit];
  const baseQuantity = offer.quantity.times(def.toBase);
  return ok({ perBase: offer.price.div(baseQuantity), dimension: def.dimension });
}

export interface OfferComparison {
  a: UnitPriceResult;
  b: UnitPriceResult;
  cheaper: 'a' | 'b' | 'equal';
  /** How much more expensive the other offer is, per base unit, in percent. */
  differencePercent: Dec;
  /** Saving per base unit when choosing the cheaper offer. */
  savingPerBase: Dec;
}

export function compareOffers(a: Offer, b: Offer): CalcResult<OfferComparison> {
  const ra = unitPrice(a, 'a');
  if (!ra.ok) return ra;
  const rb = unitPrice(b, 'b');
  if (!rb.ok) return rb;
  if (ra.value.dimension !== rb.value.dimension) return fail('incompatible_units', 'b.unit');
  const pa = ra.value.perBase;
  const pb = rb.value.perBase;
  const cmp = pa.comparedTo(pb);
  const cheaper = cmp === 0 ? 'equal' : cmp < 0 ? 'a' : 'b';
  const low = Dec.min(pa, pb);
  const high = Dec.max(pa, pb);
  return ok({
    a: ra.value,
    b: rb.value,
    cheaper,
    differencePercent: low.isZero() ? ZERO : high.minus(low).div(low).times(HUNDRED),
    savingPerBase: high.minus(low),
  });
}
