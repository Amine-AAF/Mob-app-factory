import { Dec, Decimal, ZERO, roundMoney, sum } from '@/utils/decimal';

import { fail, ok, type CalcResult } from './result';

/**
 * LoanCalculator — fixed-rate amortizing loan (French/annuity amortization), informative only.
 *
 * Assumptions (shown in the app):
 * - Nominal annual rate, compounded monthly: i = annualRate / 12 / 100.
 * - Constant monthly payment  M = P·i / (1 − (1 + i)^−n);  M = P / n when i = 0.
 * - The payment is rounded UP to the cent, so the adjusted final payment is never larger
 *   than the regular one. Each month's interest is rounded half-up to the cent; the final
 *   payment clears the remaining balance, so the balance ends at exactly 0.
 *   Therefore Σ principal = P exactly, and total interest = Σ payments − P.
 * - Insurance, fees (except the optional upfront fees), taxes and prepayment penalties
 *   are not modelled. The result is an estimate, not a credit offer.
 */
export interface LoanInput {
  principal: Dec;
  /** Nominal annual interest rate in percent (4.5 = 4.5 %). */
  annualRate: Dec;
  months: number;
  /** Optional upfront fees added to the total cost. */
  fees?: Dec;
  fractionDigits?: number;
}

export interface AmortizationRow {
  month: number;
  payment: Dec;
  interest: Dec;
  principal: Dec;
  balance: Dec;
}

export interface YearSummary {
  year: number;
  payments: Dec;
  interest: Dec;
  principal: Dec;
  endBalance: Dec;
}

export interface LoanResult {
  monthlyPayment: Dec;
  months: number;
  totalPaid: Dec;
  totalInterest: Dec;
  /** Interest + upfront fees. */
  totalCost: Dec;
  schedule: AmortizationRow[];
  years: YearSummary[];
}

export const MAX_MONTHS = 600; // 50 years

const ceilCents = (v: Dec, digits: number) => v.toDecimalPlaces(digits, Decimal.ROUND_UP);
const MAX_PRINCIPAL = new Dec('1e12');

export function validateLoan(input: LoanInput): CalcResult<true> {
  if (input.principal.lte(0)) return fail('not_positive', 'principal');
  if (input.principal.gt(MAX_PRINCIPAL)) return fail('too_large', 'principal');
  if (input.annualRate.isNegative() || input.annualRate.gt(100)) return fail('percent_range', 'rate');
  if (!Number.isInteger(input.months) || input.months < 1) return fail('not_integer', 'duration');
  if (input.months > MAX_MONTHS) return fail('too_large', 'duration');
  if (input.fees?.isNegative()) return fail('negative', 'fees');
  return ok(true);
}

export function monthlyRate(annualRate: Dec): Dec {
  return annualRate.div(1200);
}

/** Exact (unrounded) annuity payment. */
export function annuityPayment(principal: Dec, i: Dec, months: number): Dec {
  if (i.isZero()) return principal.div(months);
  return principal.times(i).div(new Dec(1).minus(new Dec(1).plus(i).pow(-months)));
}

interface RunOptions {
  balance: Dec;
  i: Dec;
  payment: Dec;
  digits: number;
  startMonth: number;
  /** Number of periods; the last one clears the balance. Omit to run until repaid. */
  periods?: number;
}

function run(opts: RunOptions): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = opts.balance;
  const limit = opts.periods ?? MAX_MONTHS * 2;
  for (let k = 0; k < limit && balance.gt(0); k++) {
    const month = opts.startMonth + k;
    const interest = roundMoney(balance.times(opts.i), opts.digits);
    let principal = opts.payment.minus(interest);
    const last = opts.periods !== undefined && k === opts.periods - 1;
    if (last || principal.gte(balance)) principal = balance;
    if (principal.lte(0)) break; // payment doesn't cover interest: guarded by callers
    const payment = principal.plus(interest);
    balance = balance.minus(principal);
    rows.push({ month, payment, interest, principal, balance });
  }
  return rows;
}

function summarize(schedule: AmortizationRow[], principal: Dec, fees: Dec): Omit<LoanResult, 'monthlyPayment' | 'schedule'> {
  const totalPaid = sum(schedule.map((r) => r.payment));
  const totalInterest = totalPaid.minus(principal);
  const years: YearSummary[] = [];
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    let y = years[years.length - 1];
    if (!y || y.year !== year) {
      y = { year, payments: ZERO, interest: ZERO, principal: ZERO, endBalance: ZERO };
      years.push(y);
    }
    y.payments = y.payments.plus(row.payment);
    y.interest = y.interest.plus(row.interest);
    y.principal = y.principal.plus(row.principal);
    y.endBalance = row.balance;
  }
  return { months: schedule.length, totalPaid, totalInterest, totalCost: totalInterest.plus(fees), years };
}

export function calculateLoan(input: LoanInput): CalcResult<LoanResult> {
  const valid = validateLoan(input);
  if (!valid.ok) return valid;
  const digits = input.fractionDigits ?? 2;
  const i = monthlyRate(input.annualRate);
  const payment = ceilCents(annuityPayment(input.principal, i, input.months), digits);
  const schedule = run({ balance: input.principal, i, payment, digits, startMonth: 1, periods: input.months });
  return ok({ monthlyPayment: payment, schedule, ...summarize(schedule, input.principal, input.fees ?? ZERO) });
}

/* ------------------------------------------------------------- Early repayment */

export type PrepaymentMode = 'reduce_term' | 'reduce_payment';

export interface PrepaymentInput {
  /** Month after which the lump sum is paid (1 … months − 1). */
  afterMonth: number;
  amount: Dec;
  mode: PrepaymentMode;
}

export interface PrepaymentResult {
  base: LoanResult;
  /** Schedule including the lump sum (added to the row of `afterMonth`). */
  withPrepayment: LoanResult;
  newMonthlyPayment: Dec;
  interestSaved: Dec;
  monthsSaved: number;
}

export function simulatePrepayment(input: LoanInput, pre: PrepaymentInput): CalcResult<PrepaymentResult> {
  const baseResult = calculateLoan(input);
  if (!baseResult.ok) return baseResult;
  const base = baseResult.value;
  const digits = input.fractionDigits ?? 2;
  if (!Number.isInteger(pre.afterMonth) || pre.afterMonth < 1 || pre.afterMonth >= base.months) return fail('not_integer', 'afterMonth');
  if (pre.amount.lte(0)) return fail('not_positive', 'amount');

  const before = base.schedule.slice(0, pre.afterMonth).map((r) => ({ ...r }));
  const last = before[before.length - 1] as AmortizationRow;
  const lump = Dec.min(pre.amount, last.balance);
  last.payment = last.payment.plus(lump);
  last.principal = last.principal.plus(lump);
  last.balance = last.balance.minus(lump);

  const i = monthlyRate(input.annualRate);
  const remainingMonths = input.months - pre.afterMonth;
  let newPayment = base.monthlyPayment;
  let after: AmortizationRow[] = [];
  if (last.balance.gt(0)) {
    if (pre.mode === 'reduce_payment') {
      newPayment = ceilCents(annuityPayment(last.balance, i, remainingMonths), digits);
      after = run({ balance: last.balance, i, payment: newPayment, digits, startMonth: pre.afterMonth + 1, periods: remainingMonths });
    } else {
      after = run({ balance: last.balance, i, payment: base.monthlyPayment, digits, startMonth: pre.afterMonth + 1 });
    }
  } else {
    newPayment = ZERO;
  }
  const schedule = [...before, ...after];
  const withPrepayment: LoanResult = { monthlyPayment: newPayment, schedule, ...summarize(schedule, input.principal, input.fees ?? ZERO) };
  return ok({
    base,
    withPrepayment,
    newMonthlyPayment: newPayment,
    interestSaved: base.totalInterest.minus(withPrepayment.totalInterest),
    monthsSaved: base.months - withPrepayment.months,
  });
}

/* ------------------------------------------------------------- Comparison */

export interface LoanComparison {
  a: LoanResult;
  b: LoanResult;
  /** b − a */
  paymentDifference: Dec;
  interestDifference: Dec;
  costDifference: Dec;
}

export function compareLoans(a: LoanInput, b: LoanInput): CalcResult<LoanComparison> {
  const ra = calculateLoan(a);
  if (!ra.ok) return { ...ra, field: `a.${ra.field ?? ''}` };
  const rb = calculateLoan(b);
  if (!rb.ok) return { ...rb, field: `b.${rb.field ?? ''}` };
  return ok({
    a: ra.value,
    b: rb.value,
    paymentDifference: rb.value.monthlyPayment.minus(ra.value.monthlyPayment),
    interestDifference: rb.value.totalInterest.minus(ra.value.totalInterest),
    costDifference: rb.value.totalCost.minus(ra.value.totalCost),
  });
}
