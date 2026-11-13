import { Decimal } from 'decimal.js';

/**
 * Arbitrary-precision decimal arithmetic for every CalcWise computation.
 *
 * Why: JavaScript numbers are binary floating point (0.1 + 0.2 = 0.30000000000000004).
 * All calculators work on `Dec` values and only convert to text at the display edge.
 *
 * - 50 significant digits internally (far more than the 15 shown), so rounding
 *   happens once, at display time, with ROUND_HALF_UP ("commercial" rounding).
 * - Money is rounded to the currency's minor unit with `roundMoney` (half-up).
 */
export const Dec = Decimal.clone({
  precision: 50,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -60,
  toExpPos: 60,
  maxE: 9e15,
  minE: -9e15,
});
// Intentional value/type pair: `Dec` is both the configured constructor and its instance type.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Dec = Decimal;

export const ZERO = new Dec(0);
export const ONE = new Dec(1);
export const HUNDRED = new Dec(100);

/** π and e at the working precision. */
export const PI = Dec.acos(-1);
export const E = Dec.exp(1);

export function dec(value: Decimal.Value): Dec {
  return new Dec(value);
}

export function isFiniteDec(value: Dec): boolean {
  return value.isFinite() && !value.isNaN();
}

/** Rounds a money amount to `fractionDigits` (2 for most currencies), half-up. */
export function roundMoney(value: Dec, fractionDigits = 2): Dec {
  return value.toDecimalPlaces(fractionDigits, Decimal.ROUND_HALF_UP);
}

/** Rounds up to the next multiple of `step` (e.g. 0.05, 1). */
export function ceilToStep(value: Dec, step: Dec): Dec {
  if (step.lte(0)) return value;
  return value.div(step).toDecimalPlaces(0, Decimal.ROUND_CEIL).times(step);
}

export function sum(values: readonly Dec[]): Dec {
  return values.reduce<Dec>((acc, v) => acc.plus(v), ZERO);
}

export { Decimal };
