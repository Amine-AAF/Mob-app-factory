import { Dec, ONE, ZERO } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * SavingsCalculator — compound growth with regular monthly deposits (estimate).
 *
 * Assumptions (all visible and editable in the app):
 * - The annual rate is constant and is an estimate, not a guaranteed return.
 * - Compounding frequency: monthly (i = r/12), quarterly or annually. For quarterly and
 *   annual compounding, deposits are monthly, so the equivalent monthly rate is used:
 *   i = (1 + r/m)^(m/12) − 1  (m = 4 or 1). This gives the same yearly growth as the bank's
 *   compounding without inventing intra-period rules.
 * - Deposits at the END of each month (ordinary annuity) by default, or at the start.
 * - No taxes, fees or inflation. Values are computed exactly; rounding happens for display.
 *
 * Closed form used in tests:  FV = C0·(1+i)^n + c·((1+i)^n − 1)/i  (×(1+i) for start-of-month).
 */
export type Compounding = 'monthly' | 'quarterly' | 'annually';
export type DepositTiming = 'end' | 'start';

export interface SavingsInput {
  initial: Dec;
  monthly: Dec;
  annualRate: Dec;
  months: number;
  compounding: Compounding;
  timing: DepositTiming;
}

export interface SavingsYear {
  year: number;
  deposited: Dec;
  interest: Dec;
  balance: Dec;
}

export interface SavingsResult {
  finalBalance: Dec;
  totalDeposited: Dec;
  totalInterest: Dec;
  monthlyRate: Dec;
  years: SavingsYear[];
}

export const MAX_SAVINGS_MONTHS = 1200; // 100 years

export function equivalentMonthlyRate(annualRate: Dec, compounding: Compounding): Dec {
  const r = annualRate.div(100);
  if (compounding === 'monthly') return r.div(12);
  const m = compounding === 'quarterly' ? 4 : 1;
  return ONE.plus(r.div(m)).pow(new Dec(m).div(12)).minus(ONE);
}

export function calculateSavings(input: SavingsInput): CalcResult<SavingsResult> {
  if (input.initial.isNegative()) return fail('negative', 'initial');
  if (input.monthly.isNegative()) return fail('negative', 'monthly');
  if (input.annualRate.lt(-50) || input.annualRate.gt(100)) return fail('percent_range', 'rate');
  if (!Number.isInteger(input.months) || input.months < 1) return fail('not_integer', 'duration');
  if (input.months > MAX_SAVINGS_MONTHS) return fail('too_large', 'duration');

  const i = equivalentMonthlyRate(input.annualRate, input.compounding);
  let balance = input.initial;
  let deposited = input.initial;
  const years: SavingsYear[] = [];
  let yearDeposited = ZERO;
  let yearInterest = ZERO;

  for (let month = 1; month <= input.months; month++) {
    if (input.timing === 'start') {
      balance = balance.plus(input.monthly);
      deposited = deposited.plus(input.monthly);
      yearDeposited = yearDeposited.plus(input.monthly);
    }
    const interest = balance.times(i);
    balance = balance.plus(interest);
    yearInterest = yearInterest.plus(interest);
    if (input.timing === 'end') {
      balance = balance.plus(input.monthly);
      deposited = deposited.plus(input.monthly);
      yearDeposited = yearDeposited.plus(input.monthly);
    }
    if (month % 12 === 0 || month === input.months) {
      years.push({ year: Math.ceil(month / 12), deposited: yearDeposited, interest: yearInterest, balance });
      yearDeposited = ZERO;
      yearInterest = ZERO;
    }
  }

  return ok({ finalBalance: balance, totalDeposited: deposited, totalInterest: balance.minus(deposited), monthlyRate: i, years });
}

/** Closed-form future value (used to cross-check the month-by-month simulation). */
export function futureValueClosedForm(input: SavingsInput): Dec {
  const i = equivalentMonthlyRate(input.annualRate, input.compounding);
  const n = input.months;
  if (i.isZero()) return input.initial.plus(input.monthly.times(n));
  const growth = ONE.plus(i).pow(n);
  const annuity = input.monthly.times(growth.minus(ONE)).div(i);
  return input.initial.times(growth).plus(input.timing === 'start' ? annuity.times(ONE.plus(i)) : annuity);
}
